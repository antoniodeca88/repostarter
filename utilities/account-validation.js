// account-validation.js
const { body, validationResult } = require("express-validator");
const utilities = require("./"); // para getNav()
const regValidate = {};
const accountModel = require("../models/account-model"); 


// Validación para registro de cuenta
regValidate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty().withMessage("First name is required.")
      .isLength({ min: 2 }).withMessage("First name must be at least 2 characters."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty().withMessage("Last name is required.")
      .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }).withMessage("Password must be at least 12 characters and include 1 uppercase letter, 1 number, and 1 special character."),
    
  ];
};

// Validación para login
regValidate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required."),
  ];
};

// Validación para actualizar cuenta
regValidate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty().withMessage("First name is required.")
      .isLength({ min: 2 }).withMessage("First name must be at least 2 characters."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty().withMessage("Last name is required.")
      .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),
    body("account_email")
      .trim()
      .escape()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Please enter a valid email address.")
      .normalizeEmail(),
  ];
};

// Validación para cambio de contraseña
regValidate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }).withMessage("Password must be at least 12 characters and include 1 uppercase letter, 1 number, and 1 special character."),
    
  ];
};

// Middleware para checar errores en registro
regValidate.checkRegData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      accountData: req.body,
    });
  }
  next();
};

// Middleware para checar errores en login
regValidate.checkLoginData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email,
    });
  }
  next();
};

// Middleware para checar errores en actualización de cuenta
regValidate.checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req);
  const { account_id, account_email } = req.body;
  let nav = await utilities.getNav();

  // Validación de correo duplicado si no hay errores de formato
  if (errors.isEmpty()) {
    try {
      const existingAccount = await accountModel.getAccountByEmail(account_email);

      // Si existe y no es el mismo usuario que está actualizando
      if (existingAccount && existingAccount.account_id != account_id) {
        errors.errors.push({
          param: "account_email",
          msg: "The email is already registered. Please use a different one.",
        });
      }
    } catch (err) {
      console.error("Error checking duplicate email:", err);
      return res.status(500).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: [{ msg: "Server error during email validation." }],
        accountData: req.body,
        flash: req.flash(),

      });
    }
  }

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: req.body,
      flash: req.flash(),
    });
  }

  next();
};

// Middleware para checar errores en cambio de contraseña
regValidate.checkPasswordChange = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render("account/account-management", {
      title: "Account Management",
      nav,
      errors: errors.array(),
      accountData: req.body,
    });
  }
  next();
};

module.exports = regValidate;
