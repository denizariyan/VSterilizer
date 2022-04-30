const express = require('express');
const fs = require("fs");
const os = require("os");
const app = express();
const bodyParser = require('body-parser')

const port = 8080;
const quarantinePath = "/usr/VSterilizer/infected/";

async function changeParam(key, newValue) {
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));
    ENV_VARS.splice(target, 1, `${key}=${newValue}`);
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));
}

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

app.post('/options', (req, res) => {
    optionHandler(req, res);
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
app.on("exit", () => server.close())
