const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

const Util = require("../utilities/")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = Util.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  } )
})

/* ***************************
 *  Build detail view for a specific vehicle
 * ************************** */
invCont.buildByInventoryId = Util.handleErrors(async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const data = await invModel.getInventoryItemById(inv_id)
  const html = await utilities.buildDetailView(data)
  const nav = await utilities.getNav()

  res.render("inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    html,
  })
})

module.exports = invCont