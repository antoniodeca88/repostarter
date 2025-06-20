const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}
const commentModel = require("../models/comment-model") // asegúrate de tener este archivo


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
})

/* ***************************
 *  Build detail view for a specific vehicle
 * ************************** */
invCont.buildByInventoryId = utilities.handleErrors(async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const data = await invModel.getInventoryItemById(inv_id)
  const html = await utilities.buildDetailView(data)
  const nav = await utilities.getNav()

  // Obtener comentarios
  const comments = await commentModel.getCommentsByVehicleId(inv_id)

  res.render("inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    html,
    comments,
    item: data,
    accountData: req.session.accountData,
  })
})

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  const messages = req.flash() 
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
    messages, 
  })
}


/* ***************************
 *  Build add classification form
 * ************************** */
invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async (req, res) => {
  const nav = await utilities.getNav()
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", `${classification_name} added successfully.`)
    res.redirect("/inv")
   
  } else {
    req.flash("notice", "Failed to add classification.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Build add inventory form
 * ************************** */
invCont.buildAddInventory = async (req, res) => {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body?.classification_id)

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      classification_id: req.body?.classification_id || "",
      errors: [],
      ...req.body,
      message: null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('errors/error', { error, title: "Server Error" })
  }
}


/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async (req, res) => {
  try {
    const nav = await utilities.getNav()
    const inventoryData = req.body
    const result = await invModel.addInventory(inventoryData)

    if (result) {
      req.flash("notice", "Inventory item added successfully.")
      res.redirect("/inv") 
    } else {
      // Si falla, reconstruye el classificationList para la vista y renderiza con errores
      const classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
      res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        classification_id: String(inventoryData.classification_id || ""),
        errors: [],
        message: null,
        ...inventoryData,
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).render("errors/500", { error, title: "Server Error" })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData && invData.length > 0 && invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}
/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async (req, res) => {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryItemById(inv_id)

    if (!itemData) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/inv")
    }

    const classificationList = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
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
      classification_id: itemData.classification_id,
    })
  } catch (error) {
    console.error(error)
    res.status(500).render("errors/500", { error, title: "Server Error" })
  }
}

invCont.updateInventory = async function (req, res) {
  try {
    console.log("Update inventory data received:", req.body)  // Log para debug

    const updateResult = await invModel.updateInventory(req.body)

    if (updateResult) {
      req.flash("notice", `${req.body.inv_make} ${req.body.inv_model} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      const classificationList = await utilities.buildClassificationList(req.body.classification_id)
      const itemName = `${req.body.inv_make} ${req.body.inv_model}`
      req.flash("notice", "Sorry, the update failed.")
      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        classificationList,
        errors: null,
        ...req.body,
      })
    }
  } catch (error) {
    console.error("Error updating inventory:", error)
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    const itemName = `${req.body.inv_make} ${req.body.inv_model}`
    req.flash("notice", "Sorry, the update failed due to a server error.")
    return res.status(500).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      classificationList,
      errors: null,
      ...req.body,
    })
  }
}
/* ***************************
 * Deliver Delete Confirmation View
 * *************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryItemById(inv_id)
  const name = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 * Process Delete
 * *************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)
  if (deleteResult.rowCount) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}


module.exports = invCont
