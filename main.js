const NodeClam = require('clamscan');
const USBWatch = require('usb-detection');
const axios = require('axios');
const child_process = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

options =
{
    removeInfected: false, // If true, removes infected files
    quarantineInfected: "/usr/VSterilizer/infected/", // False: Don't quarantine, Path: Moves files to this place.
    scanLog: '/usr/VSterilizer/log/scan.log', // Path to a writeable log file to write scan results into
    debugMode: false, // Whether or not to log info/debug/error msgs to the console
    fileList: null, // path to file containing list of files to scan (for scanFiles method)
    scanRecursively: true, // If true, deep scan folders recursively
    clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary on your server
        db: null, // Path to a custom virus definition database
        scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
        active: false // If true, this module will consider using the clamscan binary
    },
    clamdscan: {
        socket: false, // Socket file for connecting via TCP
        host: false, // IP of host to connect to TCP interface
        port: false, // Port of host to use when connecting via TCP interface
        timeout: 60000, // Timeout for scanning files
        localFallback: true, // Use local preferred binary to scan if socket/tcp fails
        path: '/usr/bin/clamdscan', // Path to the clamdscan binary on your server
        configFile: null, // Specify config file if it's in an unusual place
        multiscan: true, // Scan using all available cores! Yay!
        reloadDb: false, // If true, will re-load the DB on every call (slow)
        active: true, // If true, this module will consider using the clamdscan binary
        bypassTest: false, // Check to see if socket is available when applicable
    },
    preference: 'clamdscan' // If clamdscan is found and active, it will be used by default
}

async function sendResults(goodFiles, badFiles, viruses) {
    let payload = { goodFiles: goodFiles.join(', '), badFiles: badFiles.join(', '), viruses: viruses.join(', ') };
    let res = await axios.post('http://httpbin.org/post', payload);
    let data = res.data;
    console.log(data);
    sendStatus("Scan completed.")
}

async function sendStatus(status) {
    let payload = { status: status };
    let res = await axios.post('http://httpbin.org/post', payload);
    let data = res.data;
    console.log(data);
}

async function scanDirectory(path) {
    // Get instance by resolving ClamScan promise object
    const clamscan = await new NodeClam().init(options);
    try {
        // TODO: Replace hard-coded path with path var it is here for faster testing
        await clamscan.scanDir("/home/deari/Downloads", async function (err, goodFiles, badFiles, viruses) {
            if (badFiles.length > 0) {
                let foi = await parseLog();

                sendResults(goodFiles, badFiles, viruses);
            } else {
                sendResults(goodFiles, badFiles, viruses);
            }
        });
    } catch (err) {
        // Handle any errors raised by the code in the try block
        console.log(err);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// Parse log file to find file of interest (foi) 
// TODO: parse the line and get the filename for the foi
// and return it so it can be added to bad files list. Do we even need good files list? 
// maybe search for FOUND so we can parse the filename and the virus in it. How to handle multiple of these?
// For handling multiple: the search returns all so split it by end of line to get each as an array element using "file.split(/\r?\n/);"
// Split by blank space. For filename: remove everything until end of our generated UUID to get filename
// For virus just get the [1] of the split
async function parseLog() {
    let file = fs.readFileSync(options.scanLog, "utf8");
    let arr = file.split(/\r?\n/);
    arr.forEach((line, idx) => {
        if (line.includes("moved")) {
            console.log((idx + 1) + ':' + line);
        }
    });
}

async function getMountPoint(serialNumber) {
    sendStatus("Accessing the USB Device...");
    await sleep(5000); // Wait for device to be mounted by kernel
    let out = child_process.spawnSync('/home/deari/projects/VSterilizer/getMountPoint.sh', [serialNumber]);
    console.log(out.stdout.toString('utf8').split("\n")[0]); // What we need to mount
    let length = out.stdout.toString('utf8').split("\n")[0].length;
    // Use this to check if the found addy ends with number try other one if doesnt
    console.log(Number.isInteger(parseInt(out.stdout.toString('utf8').split("\n")[0].charAt(length - 1))));
    mount(out.stdout.toString('utf8').split("\n")[0]);
}

function mount(source) {
    const uuid = uuidv4();
    child_process.execSync(`mkdir -p /media/VSterilizer/${uuid}`);
    child_process.execSync(`mount ${source} /media/VSterilizer/${uuid}`);
    console.log(`/media/VSterilizer/${uuid}`);
    // Remove Windows specific un-usable files which should never been generated anyways. Windows Search service bug causes this file
    fs.rmSync(`/media/VSterilizer/${uuid}/System\ Volume\ Information/`, { recursive: true, force: true });
    scanDirectory(`/media/VSterilizer/${uuid}/`);
}

// Send this to helper script
USBWatch.on('add', function (device) {
    console.log(device.serialNumber);
    getMountPoint(device.serialNumber);
});

function start() {
    fs.writeFileSync(options.scanLog, ''); // Clear the logs
    console.log("Started to monitor for USB inserts!");
    USBWatch.startMonitoring();
    //getMountPoint("C03FD5F2F334F15109A501FD"); // For testing
    //scanFile('/home/deari/Downloads/eicar.com');
}

start();