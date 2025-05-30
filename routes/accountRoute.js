// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/") // Utilities middleware
const accountController = require("../controllers/accountController") 
const regValidate = require("../utilities/account-validation")

// Route to build login view when "My Account" is clicked
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//Route to build the registration
router.get("/register", utilities.handleErrors(accountController.buildRegister))


router.post(
    "/register",
    regValidate.registrationRules(),      //  Validaciones
    regValidate.checkRegData,             //  Validar resultados
    utilities.handleErrors(accountController.registerAccount)
  )

// Export the router
module.exports = router
