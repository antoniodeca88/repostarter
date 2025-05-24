const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")

router.get("/trigger-error", errorController.triggerError)

module.exports = router
