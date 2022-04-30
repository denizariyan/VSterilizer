const NodeClam = require('clamscan');
const USBWatch = require('usb-detection');
const axios = require('axios');
const child_process = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
require('dotenv').config();

options =
{
    removeInfected: process.env.removeInfected, // If true, removes infected files
    quarantineInfected: process.env.quarantineInfected, // False: Don't quarantine, Path: Moves files to this place.
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

// Send every bad file one by one
async function sendResults(badFileList = null) {
    if (badFileList === null) {
        sendStatus("Scan completed, no infected files has been detected.")
    } else {
        for (element of badFileList) {
            let payload = { badFile: element.filename, virus: element.virus };
            let res = await axios.post('http://httpbin.org/post', payload);
            let data = res.data;
            console.log(data);
        };
        sendStatus("Scan completed, check infected file list!")
    }
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
        clamscan.scanDir(path, async function (err, goodFiles, badFiles, viruses) {
            if (badFiles.length > 0) {
                let badFileList = await parseLog(path);
                sendResults(badFileList);
            } else {
                sendResults(null);
            }
        });
    } catch (err) {
        console.log(err);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// Parse log file to find file of interest (foi) 
async function parseLog(parser) {
    let badFiles = [];
    let file = fs.readFileSync(options.scanLog, "utf8");
    let arr = file.split(/\r?\n/);
    arr.forEach((line, idx) => {
        if (line.includes("FOUND")) {
            line = line.split(/[ ]+/);
            let fname = line[0].split(parser);
            fname = fname.pop().slice(0, -1);
            let badFileEntry = {
                filename: fname,
                virus: line[1]
            };
            badFiles.push(badFileEntry);
        }
    });
    return badFiles;
}

// To reload env vars have a script that the config file editor API one kill and re-start this one
async function getMountPoint(serialNumber) {
    sendStatus("Accessing the USB Device...");
    await sleep(5000); // Wait for device to be mounted by kernel
    let out = child_process.spawnSync('/home/deari/projects/VSterilizer/getMountPoint.sh', [serialNumber]);
    let length = out.stdout.toString('utf8').split("\n")[0].length;
    // Use this to check if the found addy ends with number try other one if doesnt
    mount(out.stdout.toString('utf8').split("\n")[0]);
}

function mount(source) {
    let uuid = uuidv4();
    child_process.execSync(`mkdir -p /media/VSterilizer/${uuid}`);
    child_process.execSync(`mount ${source} /media/VSterilizer/${uuid}`);
    console.log(`/media/VSterilizer/${uuid}`);
    // Remove Windows specific un-usable files which should never been generated anyways. Windows Search service bug causes this file
    fs.rmSync(`/media/VSterilizer/${uuid}/System\ Volume\ Information/`, { recursive: true, force: true });
    scanDirectory(`/media/VSterilizer/${uuid}/`);
}

// Send this to helper script
USBWatch.on('add', function (device) {
    getMountPoint(device.serialNumber);
});

function start() {
    fs.writeFileSync(options.scanLog, ''); // Clear the logs
    console.log("Started to monitor for USB inserts!");
    USBWatch.startMonitoring();
    //getMountPoint("C03FD5F2F334F15109A501FD"); // For testing
    //scanDirectory("/home/deari/Downloads/"); // Enable for testing
}

function endWatch() {
    USBWatch.stopMonitoring();
}

module.exports = function (request) {
    if (request == "start") {
        start();
    } else if (request == "stop") {
        endWatch();
    }
}
