const config = require('../scripts/config');

test('Enable quarantine mode', async () => {
    let testReturn = await config.changeParam("quarantineInfected", "/usr/VSterilizer/infected/", "./tests/sources/.test.env")
    expect(testReturn).toBe("quarantineInfected mode enabled");
});

test('Enable remove mode', async () => {
    let testReturn = await config.changeParam("removeInfected", "True", "./tests/sources/.test.env")
    expect(testReturn).toBe("removeInfected mode enabled");
});

afterAll(() => {
    config.server.close();
});
