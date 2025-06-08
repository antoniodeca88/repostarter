// account-validation.js
const { body, validationResult } = require("express-validator");
const utilities = require("./"); // para getNav()

const regValidate = {};

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
    body("account_password2")
      .trim()
      .notEmpty().withMessage("Confirm password is required.")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
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
    body("account_password2")
      .trim()
      .notEmpty().withMessage("Confirm password is required.")
      .custom((value, { req }) => {
        if (value !== req.body.account_password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
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
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(400).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      accountData: req.body,
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
