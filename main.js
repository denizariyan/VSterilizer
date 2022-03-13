const NodeClam = require('clamscan');
const axios = require('axios');
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
            sendResults(file, isInfected, viruses);
            if (isInfected) console.log(`${file} is infected with ${viruses.join(', ')}.`);
        }).catch(err => {
            console.error(err);
        })
    }).catch(err => {
        console.error(err);
    });
}

scanFile('/home/deari/Downloads/eicar.com');