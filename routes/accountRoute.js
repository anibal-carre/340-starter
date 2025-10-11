const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const { checkAccountUpdate, checkPasswordUpdate } = require('../utilities/account-validation');

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Register POST Route 
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)



router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))
router.get('/update/:account_id', accountController.buildUpdateAccountView);
router.post('/update', checkAccountUpdate, accountController.updateAccount);
router.post('/update-password', checkPasswordUpdate, accountController.updatePassword);

router.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/');
});

module.exports = router