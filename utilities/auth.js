function checkEmployee(req, res, next) {
    const account = req.account;
    if (account && (account.account_type === 'Employee' || account.account_type === 'Admin')) {
        return next();
    } else {
        req.flash('notice', 'You must be logged in as Employee or Admin to access this page.');
        return res.redirect('/auth/login');
    }
}
module.exports = { checkEmployee };
