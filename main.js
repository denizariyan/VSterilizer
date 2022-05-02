const scan = require("./scripts/scan");
require("./scripts/config");
const fs = require('fs');
const md5 = require('md5');
const env = './.env';

let md5Previous = md5(fs.readFileSync(env));

/**
 * Watch the .env file for changes and restart the scanner with new options if there is any change
 * @param  {string} env - Path to the .env file
 * @param  {} event - A filesystem event
 * @param  {} filename - Name of the file for the filesystem event
 */
fs.watch(env, (event, filename) => {
    if (filename) {
        const md5Current = md5(fs.readFileSync(env));
        if (md5Current === md5Previous) {
            return;
        }
        md5Previous = md5Current;
        scan.stop();
        scan.start();
        console.log(`${filename} file changed.`);
    }
});

/**
 * Start the scanner when the main script is called
 * @param  {string} "start"
 */
scan.start();