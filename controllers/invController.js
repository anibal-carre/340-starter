const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
    const inv_id = req.params.inv_id
    const vehicle = await invModel.getInventoryItemById(inv_id)
    const detail = await utilities.buildVehicleDetail(vehicle)
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
        title: vehicle.inv_year + " " + vehicle.inv_make + " " + vehicle.inv_model,
        nav,
        detail,
    })
}

/* ***************************
 *  Intentional 500 Error route
 * ************************** */
invCont.triggerError = async function (req, res, next) {
    try {
        throw new Error("Intentional 500 error triggered")
    } catch (err) {
        next(err)
    }
}

module.exports = invCont