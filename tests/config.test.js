const config = require('../scripts/config');
const { tcpPingPort } = require("tcp-ping-port")

/**
 * Test enabling the quarantine mode using the configuration manager
 * This tests both launching the configuration server and the configuration changer function
 */
test('Enable quarantine mode', async () => {
    let testReturn = await config.changeParam("quarantineInfected", "/usr/VSterilizer/infected/", "./tests/sources/.test.env")
    expect(testReturn).toBe("quarantineInfected mode enabled");
});

/**
 * Test enabling the removal mode using the configuration manager
 * This tests both launching the configuration server and the configuration changer function
 */
test('Enable remove mode', async () => {
    let testReturn = await config.changeParam("removeInfected", "True", "./tests/sources/.test.env")
    expect(testReturn).toBe("removeInfected mode enabled");
});

/**
 * Test the reachability of the configuration changing API endpoint
 * This tests both launching the configuration server and the reachability of it
 */
test('Check server reachability', async () => {
    let res = await tcpPingPort("0.0.0.0", 8080).then(status => {
        return status.online;
    })
    expect(res).toBe(true);
});

/**
 * Close the configuration server after all tests are complete
 * This tests exiting from the server and creates a graceful exit opportunity
 */
afterAll(() => {
    config.server.close();
});
