const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice"),
      errors: []
    })
  }
  
//Register View
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }
  
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    console.log("Datos recibidos:", account_firstname, account_lastname, account_email)
  
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.redirect("/account/login")
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      req.session.accountData = {
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type
      }
      req.session.loggedin = true;

      console.log("Sesión después de login:", req.session);


      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    accountData: res.locals.accountData,
    errors: null,
    flash: req.flash(),
  })
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("jwt")
    res.redirect("/")
  })
}

/* Mostrar vista para actualizar datos */
async function buildUpdateAccount(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  try {
    const accountData = await accountModel.getAccountById(account_id)
    if (!accountData) {
      const error = new Error("Account not found.")
      error.status = 404
      throw error
    }

    const nav = await utilities.getNav()
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData,
      errors: null,
      flash: req.flash()
    })
  } catch (error) {
    next(error)  
  }
}
/* Actualizar datos */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email, account_password } = req.body;
  const nav = await utilities.getNav();

  try {
    // Get current account data
    const currentAccount = await accountModel.getAccountById(account_id);
    if (!currentAccount) {
      req.flash("notice", "Account not found.");
      return res.status(404).render("account/account-management", {
        title: "Account Management",
        nav,
        accountData: {},
        errors: null,
        flash: req.flash(),
      });
    }

    // Check if email has changed and already exists
    if (account_email !== currentAccount.account_email) {
      const existingEmail = await accountModel.checkExistingEmail(account_email);
      if (existingEmail) {
        req.flash("notice", "That email already exists. Please use a different one.");
        return res.status(400).render("account/update-account", {
          title: "Update Account",
          nav,
          accountData: req.body,
          errors: null
        });
      }
    }

    let updateResult;

    if (account_password && account_password.trim() !== "") {
      // Validate password length
      if (account_password.length < 12 || !/\d/.test(account_password) || !/[A-Z]/.test(account_password) || !/[a-z]/.test(account_password) || !/[!@#$%^&*]/.test(account_password)) {
        req.flash("notice", "Password must be at least 12 characters and include a number, uppercase, lowercase, and special character.");
        return res.status(400).render("account/update-account", {
          title: "Update Account",
          nav,
          accountData: req.body,
          errors: null
        });
      }

      const hashedPassword = await bcrypt.hash(account_password, 10);
      updateResult = await accountModel.updateAccountWithPassword(
        account_id,
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
      );
    } else {
      updateResult = await accountModel.updateAccount(
        account_id,
        account_firstname,
        account_lastname,
        account_email
      );
    }

    if (updateResult) {
      // Refresh session data if email was changed
      const updatedAccount = await accountModel.getAccountById(account_id);
      req.session.accountData = {
        account_id: updatedAccount.account_id,
        account_firstname: updatedAccount.account_firstname,
        account_lastname: updatedAccount.account_lastname,
        account_email: updatedAccount.account_email,
        account_type: updatedAccount.account_type
      };
      req.flash("notice", "Account updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("notice", "Account update failed.");
      return res.status(500).render("account/account-management", {
        title: "Account Management",
        nav,
        accountData: currentAccount,
        errors: null,
        flash: req.flash()
      });
    }

  } catch (error) {
    console.error("Update Error:", error);
    req.flash("notice", "An unexpected error occurred.");
    res.status(500).render("account/account-management", {
      title: "Account Management",
      nav,
      accountData: req.body,
      errors: null,
      flash: req.flash()
    });
  }
}


/* Cambiar contraseña */
async function changePassword(req, res) {
  const { account_password, account_id } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", "Password changed successfully.")
  } else {
    req.flash("notice", "Password change failed.")
  }

  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
    messages: req.flash("notice") || []
  })
}

  module.exports = { buildLogin, 
    buildRegister, 
    registerAccount, 
    accountLogin, buildAccountManagement,
    logout,
    buildUpdateAccount,
    updateAccount,
    changePassword }