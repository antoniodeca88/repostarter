const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")
const validate = {}

/* ***************************
 * Classification Rules
 * ************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 }).withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9\s]+$/).withMessage("Only letters, numbers and spaces are allowed.")
  ]
}

validate.checkClassData = async (req, res, next) => {
  const errors = validationResult(req)
  const nav = await utilities.getNav()

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array()
    })
  }

  next()
}

/* ***************************
 * Inventory Rules
 * ************************** */
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 }).withMessage("Make is required."),
    body("inv_model")
      .trim()
      .isLength({ min: 1 }).withMessage("Model is required."),
    body("inv_year")
      .notEmpty().withMessage("Year is required.")
      .isInt({ min: 1900 }).withMessage("Year must be a valid number."),
    body("inv_description")
      .trim()
      .isLength({ min: 1 }).withMessage("Description is required."),
    body("inv_image")
      .trim()
      .isLength({ min: 1 }).withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 }).withMessage("Thumbnail path is required."),
    body("inv_price")
      .notEmpty().withMessage("Price is required.")
      .isFloat({ min: 0 }).withMessage("Price must be a valid number."),
    body("inv_miles")
      .notEmpty().withMessage("Miles is required.")
      .isInt({ min: 0 }).withMessage("Miles must be a valid number."),
    body("inv_color")
      .trim()
      .isLength({ min: 1 }).withMessage("Color is required."),
    body("classification_id")
      .notEmpty().withMessage("Classification is required.")
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, ...rest } = req.body
  const errors = validationResult(req)
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(classification_id)

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      ...rest,
      classification_id
    })
  }

  next()
}

module.exports = validate
