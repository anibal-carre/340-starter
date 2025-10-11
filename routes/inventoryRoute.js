// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const classValidate = require("../utilities/classification-validation")
const { newInventoryRules, checkUpdateData } = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Inventory detail by item id
router.get("/detail/:inv_id", invController.buildDetailView)

// Intentional 500 error
router.get("/error", invController.triggerError)

// Management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Edit Inventory View Route
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventoryView))


// Add Classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))
router.post(
    "/add-classification",
    classValidate.classificationRules(),
    classValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Update inventory
router.post("/update", newInventoryRules(), checkUpdateData, invController.updateInventory);


// Add Inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post("/add-inventory", utilities.handleErrors(invController.addInventory))


router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;