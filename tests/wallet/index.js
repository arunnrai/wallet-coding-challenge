const request = require('supertest');
const app = require("../../src");

describe("POST /wallet", () => {
    describe("when passed a valid input", () => {
        it('should respond with 201 status code, Content-Type = json, an object that contains require fields with valid data type', async () => {
            await request(app)
                .post(`/wallet`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    name: "Savings Pot",
                    balance: 10.10,
                })
                .expect("Content-Type", /json/)
                .expect(201) // Expect response http code 200
                .then((data) => {
                    const {id, name, balance, createdDate} = data.body;
                    expect(id).toBeDefined();
                    expect(name).toBeDefined();
                    expect(balance).toBeDefined();
                    expect(balance).toBe(10.10);
                    expect(createdDate).toBeDefined();
                    expect(typeof id).toBe('string');
                    expect(typeof name).toBe('string');
                    expect(typeof balance).toBe('number');
                    expect(typeof createdDate).toBe('string');
                    expect(id).toHaveLength(36);
                });
        })
    })

    describe("when balance is not specified", () => {
        it('should respond with 400 status code, Content-Type = json, an json object that contains message', async () => {
            await request(app)
                .post(`/wallet`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    name: "Savings Pot",
                    balance_invalid_param: 10.10,
                })
                .expect("Content-Type", /json/)
                .expect(400) // Expect response http code 200
                .then((data) => {
                    expect(data.body.message).toBeDefined();
                    expect(typeof data.body.message).toBe('string');
                });
        })
    })

    describe("when negative opening balance", () => {
        it('should respond with 400 status code, Content-Type = json, an json object that contains message', async () => {
            await request(app)
                .post(`/wallet`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    name: "Savings Pot",
                    balance: -10.10,
                })
                .expect("Content-Type", /json/)
                .expect(400) // Expect response http code 200
                .then((data) => {
                    expect(data.body.message).toBeDefined();
                    expect(typeof data.body.message).toBe('string');
                });
        })
    })

    describe("when balance field contain non valid number like string", () => {
        it('should respond with 400 status code, Content-Type = json, an json object that contains message', async () => {
            await request(app)
                .post(`/wallet`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    name: "Savings Pot",
                    balance: "invalid number",
                })
                .expect("Content-Type", /json/)
                .expect(400) // Expect response http code 200
                .then((data) => {
                    expect(data.body.message).toBeDefined();
                    expect(typeof data.body.message).toBe('string');
                });
        })
    })
})

describe("GET /wallet/{walletId}", () => {
    describe("when passed a valid walletId", () => {
        it('should respond with 200 status code, Content-Type = json, an object that contains require fields with valid data type', async () => {
            const response = await request(app)
                .post(`/wallet`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    name: "Savings Pot",
                    balance: 10.10,
                });
            const walletId = response.body.id;
            await request(app)
                .get(`/wallet/${walletId}`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect("Content-Type", /json/)
                .expect(200) // Expect response http code 200
                .then((data) => {
                    const {id, name, balance, createdDate} = data.body;
                    expect(id).toBeDefined();
                    expect(name).toBeDefined();
                    expect(balance).toBeDefined();
                    expect(createdDate).toBeDefined();
                    expect(typeof id).toBe('string');
                    expect(typeof name).toBe('string');
                    expect(typeof balance).toBe('number');
                    expect(typeof createdDate).toBe('string');
                    expect(id).toHaveLength(36);
                });
        })
    })

    describe("when passed a invalid walletId", () => {
        it('should respond with 404 status code, Content-Type = json, an json object that contains message', async () => {
            await request(app)
                .get(`/wallet/invalid-guid`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect("Content-Type", /json/)
                .expect(404) // Expect response http code 200
                .then((data) => {
                    expect(data.body.message).toBeDefined();
                    expect(typeof data.body.message).toBe('string');
                });
        })
    })
})

