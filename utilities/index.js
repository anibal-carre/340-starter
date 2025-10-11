const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")
const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}


Util.buildVehicleDetail = async function (vehicle) {
    let detail = ""
    if (vehicle) {
        detail += '<section id="inv-detail">'
        detail += '<img src="' + vehicle.inv_image + '" alt="Full image of '
            + vehicle.inv_make + ' ' + vehicle.inv_model + '" />'
        detail += '<div class="detail-info">'
        detail += '<h1>' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>'
        detail += '<h2>Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</h2>'
        detail += '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>'
        detail += '<p><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</p>'
        detail += '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
        detail += '</div>'
        detail += '</section>'
    } else {
        detail = '<p class="notice">Vehicle details not available.</p>'
    }
    return detail
}

Util.handle404 = function (req, res, next) {
    res.status(404).render("errors/404", {
        title: "404 - Not Found",
        message: "Sorry, the page you are looking for does not exist.",
        nav: req.nav
    })
}

Util.handle500 = function (err, req, res, next) {
    console.error("500 Error:", err)
    res.status(500).render("errors/500", {
        title: "500 - Server Error",
        message: "Something went wrong on our side.",
        nav: req.nav
    })
}

Util.checkLogin = function (req, res, next) {
    if (req.session && req.session.user) {
        next()
    } else {
        return res.redirect("/account/login")
    }
}

Util.verifyToken = function (req, res, next) {
    const token = req.headers["authorization"]
    if (!token) return res.status(403).send("Access denied")

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        req.user = verified
        next()
    } catch (err) {
        res.status(401).send("Invalid Token")
    }
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    try {
        if (req.cookies && req.cookies.jwt) {
            jwt.verify(
                req.cookies.jwt,
                process.env.ACCESS_TOKEN_SECRET,
                function (err, accountData) {
                    if (err) {
                        console.error("JWT verification error:", err.message)
                        req.flash("notice", "Your session has expired. Please log in again.")
                        res.clearCookie("jwt")
                        return res.redirect("/account/login")
                    }
                    res.locals.accountData = accountData
                    res.locals.loggedin = true
                    next()
                }
            )
        } else {
            res.locals.loggedin = false
            next()
        }
    } catch (error) {
        console.error("checkJWTToken error:", error)
        req.flash("notice", "Authentication error. Please log in again.")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
    }
}


Util.handleErrors = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

/* ****************************************
 *  Build classification select list
 * **************************************** */
Util.buildClassificationList = async function (selectedClassificationId = null) {
    const data = await invModel.getClassifications()
    let list = '<select name="classification_id" id="classification_id" required>'
    list += '<option value="">Choose a Classification</option>'
    data.rows.forEach((row) => {
        list += `<option value="${row.classification_id}" ${selectedClassificationId == row.classification_id ? "selected" : ""
            }>${row.classification_name}</option>`
    })
    list += "</select>"
    return list
}

module.exports = Util