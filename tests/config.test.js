const config = require('../scripts/config');
const { tcpPingPort } = require("tcp-ping-port")

test('Enable quarantine mode', async () => {
    let testReturn = await config.changeParam("quarantineInfected", "/usr/VSterilizer/infected/", "./tests/sources/.test.env")
    expect(testReturn).toBe("quarantineInfected mode enabled");
});

test('Enable remove mode', async () => {
    let testReturn = await config.changeParam("removeInfected", "True", "./tests/sources/.test.env")
    expect(testReturn).toBe("removeInfected mode enabled");
});

test('Check server reachability', async () => {
    let res = await tcpPingPort("0.0.0.0", 8080).then(status => {
        return status.online;
    })
    expect(res).toBe(true);
});

afterAll(() => {
    config.server.close();
});
