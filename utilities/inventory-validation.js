const utilities = require("./");

function newInventoryRules() {
    return (req, res, next) => {
        const { inv_make, inv_model, inv_year, inv_price } = req.body;
        let errors = [];

        if (!inv_make || inv_make.trim() === "") errors.push("Please provide a make.");
        if (!inv_model || inv_model.trim() === "") errors.push("Please provide a model.");
        if (!inv_year || isNaN(Number(inv_year))) errors.push("Please provide a valid year.");
        if (!inv_price || isNaN(Number(inv_price))) errors.push("Please provide a valid price.");

        if (errors.length > 0) {
            req.flash("errors", errors);
            return res.redirect("back");
        }

        next();
    };
}

/* ****************************************
 *  Middleware: Check updated inventory data
 *  Used for updating inventory items
 **************************************** */
async function checkUpdateData(req, res, next) {
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

    let errors = [];

    if (!inv_make || inv_make.trim() === "") errors.push("Please provide a make.");
    if (!inv_model || inv_model.trim() === "") errors.push("Please provide a model.");
    if (!inv_year || isNaN(Number(inv_year))) errors.push("Please provide a valid year.");
    if (!inv_price || isNaN(Number(inv_price))) errors.push("Please provide a valid price.");

    if (errors.length > 0) {
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        const itemName = `${inv_make} ${inv_model}`;
        return res.status(400).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav: req.nav,
            classificationSelect,
            errors,
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

    next();
}

module.exports = { newInventoryRules, checkUpdateData };
