const conn = require("../src/db");
jest.setTimeout(10000)
afterAll(() => {
    conn.end()
});

require('./wallet')
require('./transactions')
