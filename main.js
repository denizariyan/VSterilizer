const NodeClam = require('clamscan');
const USBWatch = require('usb-detection');
const axios = require('axios');
const child_process = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

options =
{
    removeInfected: false, // If true, removes infected files
    quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
    scanLog: null, // Path to a writeable log file to write scan results into
    debugMode: false, // Whether or not to log info/debug/error msgs to the console
    fileList: null, // path to file containing list of files to scan (for scanFiles method)
    scanRecursively: true, // If true, deep scan folders recursively
    clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary on your server
        db: null, // Path to a custom virus definition database
        scanArchives: false, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
        active: true // If true, this module will consider using the clamscan binary
    },
    preference: 'clamscan' // If clamdscan is found and active, it will be used by default
}
const ClamScan = new NodeClam().init(options);

async function sendResults(file, isInfected, viruses) {
    let payload = { file: file, isInfected: isInfected, viruses: viruses.join(', ') };
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
function scanFile(path) {
    ClamScan.then(async clamscan => {
        sendStatus("Scan in progress...")
        clamscan.isInfected(path).then(result => {
            const { file, isInfected, viruses } = result;
            //sendResults(file, isInfected, viruses); Instead of sending directly, store the results for each file and send it as a big package
            if (isInfected) console.log(`${file} is infected with ${viruses.join(', ')}.`);
        }).catch(err => {
            console.error(err);
        })
    }).catch(err => {
        console.error(err);
    });
}

// Currently non-recursive, do we want it to be recursive?
function getFiles(path) {
    let filePaths = [];
    fs.readdirSync(path).forEach(file => {
        filePaths.push(file);
    });
    filePaths.forEach(filePath => {
        console.log(path + "/" + filePath);
        //scanFile(path);
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
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
    getFiles(`/media/VSterilizer/${uuid}`);
}

// Send this to helper script
USBWatch.on('add', function (device) {
    console.log(device.serialNumber);
    getMountPoint(device.serialNumber);
});

function start() {
    USBWatch.startMonitoring();
    //getMountPoint("C03FD5F2F334F15109A501FD"); // For testing
    //scanFile('/home/deari/Downloads/eicar.com');
}

start();