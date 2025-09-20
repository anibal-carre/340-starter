// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Inventory detail by item id
router.get("/detail/:inv_id", invController.buildDetailView)

// Intentional 500 error
router.get("/error", invController.triggerError)

module.exports = router;