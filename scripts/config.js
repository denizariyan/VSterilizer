const express = require('express');
const fs = require("fs");
const os = require("os");
const app = express();
const bodyParser = require('body-parser');

const port = 8080;
const quarantinePath = "/usr/VSterilizer/infected/";

/**
 * Find the line for the given key and splice it to replace with the new value
 * Time Complexity: O(n): Depends on which option is being changed 
 * @param  {string} key - Key for the given env variable
 * @param  {string} newValue - New value for the given key
 * @param  {string} env - path to the environment file. Defaults to the project supplied one
 */
async function changeParam(key, newValue, env = "./.env") {
    const ENV_VARS = fs.readFileSync(env, "utf8").split(os.EOL);
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));
    ENV_VARS.splice(target, 1, `${key}=${newValue}`);
    fs.writeFileSync(env, ENV_VARS.join(os.EOL));
    return `${key} mode enabled`;
}

/**
 * Handle the option changes when a change request comes to the API endpoint
 * It is safe to call parameter changer with every new request without checking
 * if the given new option is the same with the old one since the watcher function
 * which restarts the scanner for changes checks the MD5 hash of the file to ensure
 * that there is an actual change in the file
 * Time Complexity: O(1): Static time complexity, input doesn't change the operations only changes the outcome
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

/**
 * Parse incoming requests body as JSON
 * Time Complexity: O(n): Depends on the size of the body of the incoming request
 * @param  {function} - JSON parser
 */
app.use(bodyParser.json());

/**
 * Listen for incoming post requests to the given endpoint
 * Time Complexity: O(1): Async event listener, static time
 * @param  {string} '/options' - API endpoint
 * @param  {request} req - Incoming post request
 * @param  {response} res - Response to be sent
 */
app.post('/options', (req, res) => {
    optionHandler(req, res);
});

/**
 * Launch the server instance
 * Time Complexity: O(1): The target port doesn't change the time, only the outcome
 * @param  {integer} port - Port to launch the server on. Default: 8080
 */
const server = app.listen(port, () => console.log(`Listening on port ${port}!`))

/**
 * Close the server when an exit event is emited
 * Time Complexity: O(1): No variable input
 * @param  {string} "exit" - Event name
 */
app.on("exit", () => server.close())

module.exports.changeParam = changeParam;
module.exports.server = server;
