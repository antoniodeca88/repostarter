const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

/* ***************************
 *  Public Inventory Views
 *  (Accessible to all visitors)
 * ***************************/

// View inventory by classification ID
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// View inventory item details by inventory ID
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInventoryId)
)

/* ***************************
 *  Administrative Views
 *  (Restricted to Employee or Admin only)
 * ***************************/

// Inventory management dashboard
router.get(
  "/",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildManagementView)
)

// View to edit an existing inventory item
router.get(
  "/edit/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

// Process update to an inventory item
router.post(
  "/update/",
  utilities.checkAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// View to confirm deletion of an inventory item
router.get(
  "/delete/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildDeleteInventoryView)
)

// Process deletion of an inventory item
router.post(
  "/delete",
  utilities.checkAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
)

/* ***************************
 *  Add Classification Routes
 * ***************************/

// Display form to add a new classification
router.get(
  "/add-classification",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

// Handle submission of new classification
router.post(
  "/add-classification",
  utilities.checkAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

/* ***************************
 *  Add Inventory Routes
 * ***************************/

// Display form to add a new inventory item
router.get(
  "/add-inventory",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

// Handle submission of new inventory item
router.post(
  "/add-inventory",
  utilities.checkAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* ***************************
 *  AJAX Inventory Retrieval
 * ***************************/

// Get inventory items by classification ID (for AJAX)
router.get(
  "/getInventory/:classification_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.getInventoryJSON)
)

module.exports = router
