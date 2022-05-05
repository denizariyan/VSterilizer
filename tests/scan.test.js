const scan = require('../scripts/scan');

/**
 * Parse the test log file to try getting the name of the infected file
 * This tests both the parser function and the generation of the scan results
 */
test('Parse log file to test getting file name of infected file', async () => {
    let parseTest = await scan.parseLog("/home/deari/Downloads/", "./tests/sources/test.log")
    expect(parseTest[0].filename).toBe("eicar.com");
});

/**
 * Parse the test log file to try getting the name of the virus
 * that the test file is infected with. This tests both the parser function
 * and the generation of the scan results
 */
test('Parse log file to test getting virus name', async () => {
    let parseTest = await scan.parseLog("/home/deari/Downloads/", "./tests/sources/test.log")
    expect(parseTest[0].virus).toBe("Win.Test.EICAR_HDB-1");
});