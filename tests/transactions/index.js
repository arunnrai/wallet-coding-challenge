const request = require('supertest');
const app = require("../../src");
const {createNewWallet} = require("../helpers/utils");

describe("POST /wallet/{walletId}/transactions", () => {

    describe("When wallet exists", () => {
        describe("when amount field contain non valid number like string", () => {
            it('should respond with 400 status code, Content-Type = json, an json object that contains message', async () => {
                const testAmt = 50.00;
                const {id: walletId} = await createNewWallet(testAmt);
                await request(app)
                    .post(`/wallet/${walletId}/transactions`)
                    .set('accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send({
                        "amount": "invalid-transaction-amount",
                        "description": "Payment"
                    })
                    .expect("Content-Type", /json/)
                    .expect(400) // Expect response http code 201
                    .then((data) => {
                        expect(data.body.message).toBeDefined();
                        expect(typeof data.body.message).toBe('string');
                    });
            })
        })

        describe("deposit 10.00", () => {
            it('should respond with 201 status code, Content-Type = json, an object that contains require fields with valid data type', async () => {
                /* Create New wallet */
                const testAmt = 10.00;
                const {id: walletId} = await createNewWallet(testAmt);
                await request(app)
                    .post(`/wallet/${walletId}/transactions`)
                    .set('accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send({
                        "amount": testAmt,
                        "description": "Payment"
                    })
                    .expect("Content-Type", /json/)
                    .expect(201) // Expect response http code 201
                    .then((data) => {
                        const {id, walletId, amount, balance, description, createdDate} = data.body;
                        expect(id).toBeDefined();
                        expect(id).toHaveLength(36);
                        expect(walletId).toBeDefined();
                        expect(walletId).toHaveLength(36);
                        expect(amount).toBeDefined();
                        expect(amount).toBe(testAmt);
                        expect(balance).toBeDefined();
                        expect(balance).toBe(testAmt * 2);
                        expect(description).toBeDefined();
                        expect(createdDate).toBeDefined();
                        expect(typeof id).toBe('string');
                        expect(typeof walletId).toBe('string');
                        expect(typeof amount).toBe('number');
                        expect(typeof balance).toBe('number');
                        expect(typeof description).toBe('string');
                        expect(typeof createdDate).toBe('string');
                    });
            })

         it('10.00 should be added to the previous balance', async () => {
             /* Create New Wallet */
             const testAmt = 10.00;
             const {id: walletId} = await createNewWallet(testAmt);
             /* Create New Transaction  */
             await request(app)
                 .post(`/wallet/${walletId}/transactions`)
                 .set('accept', 'application/json')
                 .set('Content-Type', 'application/json')
                 .send({
                     "amount": testAmt,
                     "description": "Payment"
                 })
                 .expect("Content-Type", /json/)
                 .expect(201) // Expect response http code 200

            /* Check Previous balance */
            await request(app)
                .get(`/wallet/${walletId}`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect("Content-Type", /json/)
                .expect(200) // Expect response http code 200
                .then((data) => {
                    expect(data.body.balance).toBe(testAmt + testAmt);
                });
            })
        })

        describe("wallet exists with a balance of 50.00", () => {
            describe("When the customer creates a transaction to withdraw 49.99 for that wallet", () => {
                it('should respond with 201 status code, Content-Type = json, an object that contains require fields with valid data type', async () => {

                    const testAmt = 50.00;
                    const {id: walletId} = await createNewWallet(testAmt);
                    await request(app)
                        .post(`/wallet/${walletId}/transactions`)
                        .set('accept', 'application/json')
                        .set('Content-Type', 'application/json')
                        .send({
                            "amount": -49.99,
                            "description": "Payment"
                        })
                        .expect("Content-Type", /json/)
                        .expect(201) // Expect response http code 201
                        .then((data) => {
                            const {id, walletId, amount, balance, description, createdDate} = data.body;
                            expect(id).toBeDefined();
                            expect(id).toHaveLength(36);
                            expect(walletId).toBeDefined();
                            expect(walletId).toHaveLength(36);
                            expect(amount).toBeDefined();
                            expect(amount).toBe(-49.99);
                            expect(balance).toBeDefined();
                            expect(balance).toBe(0.01);
                            expect(description).toBeDefined();
                            expect(createdDate).toBeDefined();
                            expect(typeof id).toBe('string');
                            expect(typeof walletId).toBe('string');
                            expect(typeof amount).toBe('number');
                            expect(typeof balance).toBe('number');
                            expect(typeof description).toBe('string');
                            expect(typeof createdDate).toBe('string');
                        });
                })


                it('49.99 should be subtracted from the previous balance', async () => {
                    /* Create New Wallet */
                    const testAmt = 50.00;
                    const {id: walletId} = await createNewWallet(testAmt);
                    /* Create New Transaction  */
                    await request(app)
                        .post(`/wallet/${walletId}/transactions`)
                        .set('accept', 'application/json')
                        .set('Content-Type', 'application/json')
                        .send({
                            "amount": -49.99,
                            "description": "Payment"
                        })
                        .expect("Content-Type", /json/)
                        .expect(201) // Expect response http code 200

                    /* Check Previous balance */
                    await request(app)
                        .get(`/wallet/${walletId}`)
                        .set('accept', 'application/json')
                        .set('Content-Type', 'application/json')
                        .expect("Content-Type", /json/)
                        .expect(200) // Expect response http code 200
                        .then((data) => {
                            expect(data.body.balance).toBe(0.01);
                        });
                })
            })

            describe("When the customer creates a transaction to withdraw 50.01 for that wallet", () => {
                it('should respond with a 400 status code and content type must be an json object that contains message', async () => {
                    /* Create New Wallet */
                    const testAmt = 50.00;
                    const {id: walletId} = await createNewWallet(testAmt);
                    /* Create New Transaction  */
                    await request(app)
                        .post(`/wallet/${walletId}/transactions`)
                        .set('accept', 'application/json')
                        .set('Content-Type', 'application/json')
                        .send({
                            "amount": -50.01,
                            "description": "Payment"
                        })
                        .expect("Content-Type", /json/)
                        .expect(400)
                        .then((data) => {
                            expect(data.body.message).toBeDefined();
                            expect(typeof data.body.message).toBe('string');
                        });
                })
            })
        })
    })

    describe("When wallet does not exists", () => {
        it('should respond with 400 status code, Content-Type = json, an json object that contains message', async () => {
            const walletId = 'invalid-wallet-id';
            const testAmt = 10.00;
            await request(app)
                .post(`/wallet/${walletId}/transactions`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send({
                    "amount": testAmt,
                    "description": "Payment"
                })
                .expect("Content-Type", /json/)
                .expect(400) // Expect response http code 201
                .then((data) => {
                    expect(data.body.message).toBeDefined();
                    expect(typeof data.body.message).toBe('string');
                });
        })
    })
})



describe("GET /wallet/{walletId}/transactions", () => {
    describe("when passed a valid walletId but there is no transaction yet", () => {
        it('should respond with 200 status code, Content-Type = json, with empty array', async () => {
            /* Create New Wallet */
            const testAmt = 10.00;
            const {id: walletId} = await createNewWallet(testAmt);
            await request(app)
                .get(`/wallet/${walletId}/transactions`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect("Content-Type", /json/)
                .expect(200) // Expect response http code 200
                .then((data) => {
                    expect(data.body).toHaveLength(0);
                });
        })
    })

    describe("when passed a valid walletId, and have some transactions", () => {
        it('should respond with 200 status code, Content-Type = json, list of transactions(desc order) that contains require fields with valid data type', async () => {
            /* Create New Wallet */
            const testAmt = 10.00;
            const {id: walletId} = await createNewWallet(testAmt);
            /* enter some transactions */
            for (let i=0; i<3; i++) {
                await request(app)
                    .post(`/wallet/${walletId}/transactions`)
                    .set('accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send({
                        "amount": 50.00,
                        "description": "Payment"
                    })
                    .expect("Content-Type", /json/)
                    .expect(201) // Expect response http code 200
            }

            await request(app)
                .get(`/wallet/${walletId}/transactions`)
                .set('accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect("Content-Type", /json/)
                .expect(200) // Expect response http code 200
                .then((data) => {
                    expect(data.body).toHaveLength(3);
                    const [first] = data.body;
                    expect(first.id).toBeDefined();
                    expect(first.id).toHaveLength(36);
                    expect(first.walletId).toBeDefined();
                    expect(first.walletId).toHaveLength(36);
                    expect(first.amount).toBeDefined();
                    expect(first.balance).toBeDefined();
                    expect(first.description).toBeDefined();
                    expect(first.createdDate).toBeDefined();
                    expect(typeof first.id).toBe('string');
                    expect(typeof first.walletId).toBe('string');
                    expect(typeof first.amount).toBe('number');
                    expect(typeof first.balance).toBe('number');
                    expect(typeof first.description).toBe('string');
                    expect(typeof first.createdDate).toBe('string');
                });
        })
    })

   describe("when passed a invalid walletId", () => {
        it('should respond with a 400 status code and content type must be an json object that contains message', async () => {
            const walletId = 'invalid-wallet-id';
            await request(app)
                .get(`/wallet/${walletId}/transactions`)
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