const request = require('supertest');
const app = require("../../src");

async function createNewWallet(amount) {
    const response = await request(app)
        .post(`/wallet`)
        .set('accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
            name: "Savings Pot",
            balance: amount,
        });
    return response.body;
}

module.exports = {createNewWallet};
