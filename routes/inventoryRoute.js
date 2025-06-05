// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

/* ***************************
 *  Inventory Routes
 * ************************** */

// View inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// View detail for specific vehicle
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
)

// Inventory management dashboard
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
)

/* ***************************
 *  Add Classification Routes
 * ************************** */

// Show form to add classification
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

// Handle submission to add classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

/* ***************************
 *  Add Inventory Routes
 * ************************** */

// Show form to add inventory item
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
)

// Handle submission to add inventory item
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Get inventory items by classification id (AJAX)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

module.exports = router
