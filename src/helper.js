const conn = require("./db");
const uuid = require("uuid");

class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = "CustomError";
    }
}

function formatAmount(amount) {
    //Need float amount in 2 decimal places
    return parseFloat(parseFloat(amount).toFixed(2));
}

async function createNewWallet(name, balance) {
    balance = formatAmount(balance);
    const guid = uuid.v4() // generate a new guid
    const sql = 'INSERT INTO wallet SET id = ?, name = ?, balance = ?';
    const values = [guid, name, balance];
    const result = await conn.query(sql, values);
    if (result.affectedRows > 0) {
        return guid;
    }
    throw new CustomError('DB error');
}

async function isWalletExists(walletId) {
    const sql = 'SELECT 1 FROM wallet WHERE id = ? limit 1';
    const values = [walletId];
    const rows = await conn.query(sql, values);
    if (rows.length < 1) {
        return true;
    }
    return false;
}

async function fetchWalletById(walletId) {
    const sql = 'SELECT id, name, balance, createdDate FROM wallet WHERE id = ? limit 1';
    const values = [walletId];
    const rows = await conn.query(sql, values);
    if (rows.length > 0) {
        return rows[0];
    }
    return false;
}

async function updateWalletBalance(walletId, newBalance) {
    newBalance = formatAmount(newBalance);
    const sql = 'UPDATE wallet SET balance = ? WHERE id = ? limit 1';
    const values = [newBalance, walletId];
    const rows = await conn.query(sql, values);
    if (rows.affectedRows > 0) {
        return true
    }
    return false;
}

async function getWalletTransactions(walletId) {
    if (!isWalletExists()) {
        throw new CustomError('Wallet Not Found');
    }
    const sql_exits = 'SELECT * FROM transactions WHERE walletId = ? order by createdDate desc';
    const values_ex = [walletId];
    const rows = await conn.query(sql_exits, values_ex);
    if (rows.length > 0) {
        // convert amount, and balance to float before returning, by default it return string
        return rows.map(object => {
            return {...object, amount: parseFloat(object.amount), balance: parseFloat(object.balance)};
        });
    }
    return []; //no transactions of user
}

async function createTransaction(walletId, amount, description ) {
    const amountSign = Math.sign(amount);
    //check amount is invalid or 0
    if (isNaN(amountSign) || amountSign === 0) {
        throw new CustomError('please enter correct value');
    }

    const guid = uuid.v4() // generate a new guid
    const wallet = await fetchWalletById(walletId);
    if (!wallet) {
        throw new CustomError('Wallet not found');
    }
    let balance = wallet.balance;
    amount = formatAmount(amount);
    balance = formatAmount(balance);
    const newBalance = formatAmount(balance + amount);
    // oh! Request for withdrawal
    if (amountSign === -1) {
        // check user has sufficient balance
        if (Math.abs(amount) > balance) {
            throw new CustomError('Invalid amount, you don\'t have sufficient balance' );
        }
    }

    /*
        Extra precautions
        in any case, Make sure new balance must be positive or zero,
        By the way db only accept positive value for wallet balance
    */
    if (newBalance < 0) {
        throw new CustomError('Invalid Request' );
    }

    const sql = 'INSERT INTO transactions SET id = ?, walletId = ?, amount = ?, balance = ?, description = ?';
    const values = [guid, walletId, amount, newBalance, description];
    const result = await conn.query(sql, values);
    if (result.affectedRows > 0) {
        await updateWalletBalance(walletId, newBalance);
    }
    return {guid, newBalance};
}

module.exports = { createNewWallet, isWalletExists, fetchWalletById, getWalletTransactions, createTransaction, CustomError, formatAmount};
