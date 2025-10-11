const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
            [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}


async function getAccountById(account_id) {
    const sql = "SELECT * FROM public.accounts WHERE account_id=$1";
    const data = await pool.query(sql, [account_id]);
    return data.rows[0];
}


async function updateAccount(account_id, firstname, lastname, email) {
    const sql = "UPDATE public.accounts SET firstname=$1, lastname=$2, email=$3 WHERE account_id=$4 RETURNING *";
    const data = await pool.query(sql, [firstname, lastname, email, account_id]);
    return data.rows[0];
}


async function updatePassword(account_id, hashedPassword) {
    const sql = "UPDATE public.accounts SET password=$1 WHERE account_id=$2 RETURNING *";
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rows[0];
}

module.exports = { registerAccount, getAccountByEmail, checkExistingEmail, getAccountById, updateAccount, updatePassword };
