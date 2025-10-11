const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classificationId);
        if (isNaN(classification_id)) {
            throw new Error("Invalid classification ID");
        }

        const data = await invModel.getInventoryByClassificationId(classification_id);

        if (!data || data.length === 0) {
            let nav = await utilities.getNav();
            return res.render("./inventory/classification", {
                title: "No vehicles found",
                nav,
                grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>',
            });
        }

        const className = data[0].classification_name;
        let nav = await utilities.getNav();
        const grid = await utilities.buildClassificationGrid(data);

        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        });
    } catch (err) {
        console.error("Error in buildByClassificationId:", err.message);
        next(err);
    }
};


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

    // Build classification select list for filtering inventory
    const classificationSelect = await utilities.buildClassificationList()

    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        messages,
        classificationSelect
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


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id)
        let nav = await utilities.getNav()
        const itemData = await invModel.getInventoryById(inv_id)

        if (!itemData) {
            req.flash("notice", "Vehicle not found.")
            return res.redirect("/inv/")
        }

        const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
        const itemName = `${itemData.inv_make} ${itemData.inv_model}`

        res.render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            errors: null,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_description: itemData.inv_description,
            inv_image: itemData.inv_image,
            inv_thumbnail: itemData.inv_thumbnail,
            inv_price: itemData.inv_price,
            inv_miles: itemData.inv_miles,
            inv_color: itemData.inv_color,
            classification_id: itemData.classification_id
        })
    } catch (error) {
        console.error("Error loading edit view:", error)
        next(error)
    }
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;

    try {
        const updateResult = await invModel.updateInventory(
            inv_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        );

        if (updateResult) {
            const itemName = updateResult.inv_make + " " + updateResult.inv_model;
            req.flash("notice", `The ${itemName} was successfully updated.`);
            return res.redirect("/inv/");
        } else {
            const classificationSelect = await utilities.buildClassificationList(classification_id);
            const itemName = `${inv_make} ${inv_model}`;
            req.flash("notice", "Sorry, the update failed.");
            return res.status(501).render("inventory/edit-inventory", {
                title: "Edit " + itemName,
                nav,
                classificationSelect,
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_year,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                classification_id
            });
        }
    } catch (error) {
        console.error("Controller error: " + error);
        next(error);
    }
};


module.exports = invCont