const conn = require("./db");
const uuid = require("uuid");

class CustomError extends Error {
    constructor(message) {
        super(message);
        this.name = "CustomError";
    }
}


async function createNewWallet(name, balance) {
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
    const sql_exits = 'SELECT 1 FROM wallet WHERE id = ? limit 1';
    const values_ex = [walletId];
    const rows = await conn.query(sql_exits, values_ex);
    if (rows.length < 1) {
        return true;
    }
    return false;
}

async function fetchWalletById(walletId) {
    const sql_exits = 'SELECT id, name, balance, createdDate FROM wallet WHERE id = ? limit 1';
    const values_ex = [walletId];
    const rows = await conn.query(sql_exits, values_ex);
    if (rows.length > 0) {
        return rows[0];
    }
    return false;
}

async function updateWalletBalance(walletId, newBalance) {
    const sql_exits = 'UPDATE wallet SET balance = ? WHERE id = ? limit 1';
    const values_ex = [newBalance, walletId];
    const rows = await conn.query(sql_exits, values_ex);
    if (rows.affectedRows > 0) {
        return true
    }
    return false;
}

async function getWalletTransactions(walletId) {
    const sql_exits = 'SELECT * FROM transactions WHERE walletId = ? order by createdDate desc';
    const values_ex = [walletId];
    const rows = await conn.query(sql_exits, values_ex);
    if (rows.length > 0) {
        return rows;
    }
    throw new CustomError('Wallet Not Found');
}

async function createTransaction(walletId, amount, description ) {
    if (isNaN(Math.sign(amount))){
        throw new CustomError('please enter correct value');
    }

    const guid = uuid.v4() // generate a new guid
    const wallet = await fetchWalletById(walletId);
    if (!wallet) {
        throw new CustomError('Wallet not found');
    }
    let balance = wallet.balance;
    amount = parseFloat(amount).toFixed(2)
    balance = parseFloat(balance).toFixed(2);
    const newBalance = (parseFloat(balance) + parseFloat(amount)).toFixed(2);

    if (newBalance < 0){
        throw new CustomError('Balance could not go below 0');
    }

    const sql = 'INSERT INTO transactions SET id = ?, walletId = ?, amount = ?, balance = ?, description = ?';
    const values = [guid, walletId, amount, newBalance, description];
    const result = await conn.query(sql, values);
    if (result.affectedRows > 0) {
        await updateWalletBalance(walletId, newBalance);
    }
    return {guid, newBalance};
}

module.exports = { createNewWallet, isWalletExists, fetchWalletById, getWalletTransactions, createTransaction, CustomError};
