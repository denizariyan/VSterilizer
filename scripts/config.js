const express = require('express');
const fs = require("fs");
const os = require("os");
const app = express();
const bodyParser = require('body-parser');

const port = 8080;
const quarantinePath = "/usr/VSterilizer/infected/";

/**
 * Find the line for the given key and splice it to replace with the new value
 * @param  {string} key - Key for the given env variable
 * @param  {string} newValue - New value for the given key
 */
async function changeParam(key, newValue) {
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));
    ENV_VARS.splice(target, 1, `${key}=${newValue}`);
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

/**
 * Handle the option changes when a change request comes to the API endpoint
 * It is safe to call parameter changer with every new request without checking
 * if the given new option is the same with the old one since the watcher function
 * which restarts the scanner for changes checks the MD5 hash of the file to ensure
 * that there is an actual change in the file
 * @param  {request} req - The option change request
 * @param  {response} res - Passed to the function to enable sending responses in the handler function itself
 */
async function optionHandler(req, res) {
    if (req.body.quarantineInfected) {
        await changeParam("quarantineInfected", quarantinePath);
        await changeParam("removeInfected", "False");
        res.send("Processed new option changes. Scanner will quarantine infected files.")
    } else if (req.body.removeInfected) {
        await changeParam("removeInfected", "True");
        await changeParam("quarantineInfected", "False");
        res.send("Processed new option changes. Scanner will remove infected files.")
    }
}

app.use(bodyParser.json());

/**
 * @param  {string} '/options' - API endpoint
 * @param  {request} req
 * @param  {response} res
 */
app.post('/options', (req, res) => {
    optionHandler(req, res);
});

app.listen(port, () => console.log(`Listening on port ${port}!`))
app.on("exit", () => server.close())
