function addAccountToLocals(req, res, next) {
    res.locals.accountData = req.session.accountData || null
    next()
  }
  module.exports = addAccountToLocals
  