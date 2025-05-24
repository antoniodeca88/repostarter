const errorController = {}


errorController.triggerError = (req, res, next) => {
  const err = new Error("This is an intentional 500 error triggered for testing.")
  err.status = 500 
  next(err)
}

module.exports = errorController
