const express = require("express")
const router = express.Router()
const commentController = require("../controllers/commentController")
const utilities = require("../utilities")

router.post("/", utilities.checkLogin, commentController.saveComment)

module.exports = router
