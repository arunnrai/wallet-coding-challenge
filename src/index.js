const express = require("express");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./openapi.yaml");
const bodyParser = require('body-parser');
const currency =  require('currency.js');

const app = express();
//app.use(express.json());
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));
const {createNewWallet, fetchWalletById, createTransaction, getWalletTransactions, isWalletExists, CustomError} = require('./helper');
// parse application/json
app.use(bodyParser.json()); //no need to parse json request body, accept json request

app.use((err, req, res, next) => {
  // This check makes sure this is a JSON parsing issue, but it might be
  // coming from any middleware, not just body-parser:

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(err);
    return res.status(400).json({message: 'Invalid request body supplied'}); // Bad request
  }

  next();
});

app.get("/", async (req, res) => {
  const html = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Wallet Coding Challenge</title>
                </head>
                <body>
                    <h1>Wallet Coding Challenge</h1>
                    <a href="/api-docs/">Open</a> SwaggerUi to test apis
                    
                </body>
                </html>`;
  return res.status(200).send(html);
});

//app.use(express.json())
app.post('/wallet', async (req, res) => {
  try {
    let { name, balance } = req.body;
    if (!name || !balance) {
      return res.status(400).json({ message: 'Invalid request body. name and balance are required fields' });
    }
    //check amount is invalid or 0
    if (isNaN(balance) || balance === 0) {
      return res.status(400).json({ message: 'please enter correct value' });
    }
    balance = currency(balance).value;
    const numberSign = Math.sign(balance);
    if (isNaN(numberSign) || numberSign < 0) {
      return res.status(400).json({ message: 'Enter valid amount, Negative value is not allowed' });
    }

    const guid =  await createNewWallet(name, balance);
    return res.status(201).json({
      "id": guid,
      "name": name,
      "balance": balance,
      "createdDate": new Date().toISOString().slice(0, 19)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error Occurred' });
  }
});

// Fetch wallet by ID

app.get("/wallet/:fetchWalletById", async (req, res) => {
  try {
    const walletId = req.params.fetchWalletById;
    const wallet = await fetchWalletById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found'});
    }
    return res.status(200).json({
      id : wallet.id,
      name: wallet.name,
      balance: currency(wallet.balance).value,
      createdDate: wallet.createdDate
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error Occurred' });
  }
});


// Create transaction on wallet
app.post("/wallet/:fetchWalletById/transactions", async (req, res) => {
  try {
    let { amount, description } = req.body;
    if (!amount || !description) {
      return res.status(400).json({ message: 'Invalid request body. amount and description are required fields' });
    }
    const walletId = req.params.fetchWalletById;
    const {guid, newBalance} = await createTransaction(walletId, amount, description);

    return res.status(201).json({
      "id": guid,
      "walletId": walletId,
      "amount": currency(amount).value,
      "balance": currency(newBalance).value,
      "description": description,
      "createdDate": new Date().toISOString().slice(0, 19)
    });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(400).json({ message: err.message });
    } else {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error Occurred' });
    }
  }
})

// Fetch transaction on wallet
app.get("/wallet/:fetchWalletById/transactions", async (req, res) => {
  const walletId = req.params.fetchWalletById;
  /* check wallet exits */
  if (await isWalletExists(walletId)) {
    return res.status(404).json({ message: 'Wallet not found' });
  }
  const transcations = await getWalletTransactions(walletId);
  res.status(200).send(transcations);
});

module.exports = app;
