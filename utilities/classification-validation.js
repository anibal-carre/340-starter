const { body, validationResult } = require("express-validator")
const utilities = require(".")

const classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name.")
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage("Classification name cannot contain spaces or special characters.")
    ]
}

const checkClassificationData = async (req, res, next) => {
    let nav = await utilities.getNav()
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            messages: null,
            errors: errors.array(),
            classification_name: req.body.classification_name
        })
        return
    }
    next()
}

module.exports = { classificationRules, checkClassificationData }
