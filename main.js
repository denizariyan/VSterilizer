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
        scan("stop");
        scan("start");
        console.log(`${filename} file changed.`);
    }
});

scan("start");