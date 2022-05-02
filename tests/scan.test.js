const scan = require('../scripts/scan');

test('Parse log file to test getting file name of infected file', async () => {
    let parseTest = await scan.parseLog("/home/deari/Downloads/", "./tests/sources/test.log")
    expect(parseTest[0].filename).toBe("eicar.com");
});

test('Parse log file to test getting virus name', async () => {
    let parseTest = await scan.parseLog("/home/deari/Downloads/", "./tests/sources/test.log")
    expect(parseTest[0].virus).toBe("Win.Test.EICAR_HDB-1");
});