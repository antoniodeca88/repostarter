// utilities/account-validation.js

const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}


const accountModel = require("../models/account-model")

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
    return [
      // First name
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty().withMessage("First name is required.")
        .bail()
        .isLength({ min: 2 }).withMessage("First name must be at least 2 characters."),
  
      // Last name
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty().withMessage("Last name is required.")
        .bail()
        .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),
  
      //  Email
      body("account_email")
        .trim()
        .escape()
        .notEmpty().withMessage("Email is required.")
        .bail()
        .isEmail().withMessage("Please enter a valid email address.")
        .normalizeEmail()
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
              throw new Error("Email exists. Please log in or use different email")
            }
          }),
  
      //  Password
      body("account_password")
        .trim()
        .notEmpty().withMessage("Password is required.")
        .bail()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }).withMessage(
          "Password must be at least 12 characters and include 1 uppercase letter, 1 number, and 1 special character."
        )
    ]
  }
  

/* ******************************
 * Check data and return errors
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req)
  console.log("Errores de validación:", errors.array())

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
    return
  }
  next()
}

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
      body("account_email")
        .trim()
        .escape()
        .notEmpty().withMessage("Email is required.")
        .bail()
        .isEmail().withMessage("Please enter a valid email address.")
        .normalizeEmail(),
  
      body("account_password")
        .trim()
        .notEmpty().withMessage("Password is required.")
    ]
  }
  
  /* ******************************
 * Check login data and return errors if any
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav()
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: errors.array(),
        account_email: req.body.account_email
      })
    }
    next()
  }
  

module.exports = validate
