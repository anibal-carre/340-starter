const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const accountModel = require("../models/account-model")
const utilities = require("../utilities/")



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    let messages = req.flash('loginMessage');
    res.render("account/login", {
        title: "Login",
        nav,
        messages: messages || []
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    let messages = req.flash('registerMessage');
    res.render("account/register", {
        title: "Register",
        nav,
        messages: messages || [],
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(account_password, 10)
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        )

        if (regResult) {
            req.flash(
                "notice",
                `Congratulations ${account_firstname}, you are registered! Please log in.`
            )
            return res.redirect("/account/login")
        } else {
            req.flash("notice", "Registration failed. Email may already exist.")
            return res.redirect("/account/register")
        }
    } catch (error) {
        console.error("Registration error:", error)
        req.flash("notice", "An unexpected error occurred. Please try again.")
        return res.redirect("/account/register")
    }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            messages: req.flash("notice"),
            errors: null,
            account_email,
        })
    }

    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(
                accountData,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "1h" }
            )

            res.cookie("jwt", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 3600000,
            })

            req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
            return res.redirect("/account/")
            req.flash("notice", "Please check your credentials and try again.")
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                messages: req.flash("notice"),
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        console.error("Login error:", error)
        req.flash("notice", "An unexpected error occurred. Please try again.")
        res.redirect("/account/login")
    }
}

/* ****************************************
*  Deliver Account Management View
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    let messages = req.flash("notice")
    res.render("account/management", {
        title: "Account Management",
        nav,
        messages,
        errors: null,
    })
}


/* ****************************************
*  Deliver Update Account View
* *************************************** */
async function buildUpdateAccountView(req, res, next) {
    const account_id = parseInt(req.params.account_id);
    const account = await accountModel.getAccountById(account_id);
    res.render('account/update-account', {
        title: 'Update Account',
        account,
        errors: null,
        message: null
    });
}

/* ****************************************
*  Update Account Info
* *************************************** */
async function updateAccount(req, res, next) {
    const { account_id, firstname, lastname, email } = req.body;
    const result = await accountModel.updateAccount(account_id, firstname, lastname, email);
    if (result) {
        req.flash('notice', 'Account updated successfully');
        res.redirect('/account/');
    } else {
        res.status(500).render('account/update-account', {
            title: 'Update Account',
            errors: ['Update failed'],
            account: req.body
        });
    }
}

/* ****************************************
*  Update Account Password
* *************************************** */
async function updatePassword(req, res, next) {
    const { account_id, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await accountModel.updatePassword(account_id, hashedPassword);
    if (result) {
        req.flash('notice', 'Password updated successfully');
        res.redirect('/account/');
    } else {
        res.status(500).render('account/update-account', {
            title: 'Update Account',
            errors: ['Password update failed'],
            account: { account_id }
        });
    }
}
module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccountManagement,
    buildUpdateAccountView,
    updateAccount,
    updatePassword
}