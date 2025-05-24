const errorController = {}

errorController.triggerError = (req, res, next) => {
  try {
    // Lanza un error intencional
    throw new Error("This is an intentional 500 error triggered for testing.")
  } catch (error) {
    next(error) // Lo pasa al middleware de error
  }
}

module.exports = errorController
