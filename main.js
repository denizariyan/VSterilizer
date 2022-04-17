const scan = require("./scripts/scan");
const fs = require('fs');
const md5 = require('md5');
const env = './.env';

let md5Previous = md5(fs.readFileSync(env));

fs.watch(env, (event, filename) => {
    if (filename) {
        const md5Current = md5(fs.readFileSync(env));
        if (md5Current === md5Previous) {
            return;
        }
        md5Previous = md5Current;
        scan("start");
        scan("stop");
        console.log(`${filename} file changed.`);
    }
});


// Wait for something here such as "fs.watch" watching for changes on env file and stop and start the scanner process again.
scan("start");
//scan("stop");
