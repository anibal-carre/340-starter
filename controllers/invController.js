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


/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    let messages = req.flash("notice")
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        messages
    })
}

/* ***************************
 *  Deliver Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: null,
        errors: null,
        classification_name: ""
    })
}

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body
    let nav = await utilities.getNav()

    try {
        const result = await invModel.addClassification(classification_name)
        if (result) {
            req.flash("notice", `Classification "${classification_name}" added successfully.`)
            nav = await utilities.getNav()
            res.render("./inventory/management", {
                title: "Inventory Management",
                nav,
                messages: req.flash("notice"),
            })
        } else {
            req.flash("notice", "Failed to add classification.")
            res.render("./inventory/add-classification", {
                title: "Add Classification",
                nav,
                messages: req.flash("notice"),
                errors: null,
                classification_name
            })
        }
    } catch (error) {
        console.error(error)
        req.flash("notice", "An error occurred while adding classification.")
        res.render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            messages: req.flash("notice"),
            errors: null,
            classification_name
        })
    }
}

/* ***************************
 *  Deliver Add Inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        messages: null,
        errors: null,
        classificationList,
    })
}

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_image, inv_thumbnail } = req.body
    const classificationList = await utilities.buildClassificationList(classification_id)

    try {
        const result = await invModel.addInventory({
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_image,
            inv_thumbnail,
        })

        if (result) {
            req.flash("notice", `Vehicle ${inv_make} ${inv_model} added successfully.`)
            nav = await utilities.getNav()
            res.render("./inventory/management", {
                title: "Inventory Management",
                nav,
                messages: req.flash("notice")
            })
        } else {
            req.flash("notice", "Failed to add vehicle.")
            res.render("./inventory/add-inventory", {
                title: "Add Inventory",
                nav,
                messages: req.flash("notice"),
                errors: null,
                classificationList,
                ...req.body
            })
        }
    } catch (error) {
        console.error(error)
        req.flash("notice", "An error occurred while adding vehicle.")
        res.render("./inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            messages: req.flash("notice"),
            errors: null,
            classificationList,
            ...req.body
        })
    }
}


module.exports = invCont