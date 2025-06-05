// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/") // Utilities middleware
const accountController = require("../controllers/accountController") 
const regValidate = require("../utilities/account-validation")

// Default account management view (protegida con JWT + login)
router.get(
  "/", 
  utilities.checkJWTToken, 
  utilities.checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)


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

  // Process the login attempt
  router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )

// Export the router
module.exports = router
