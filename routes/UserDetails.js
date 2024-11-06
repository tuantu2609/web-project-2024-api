const { default: axios, get } = require("axios");
const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const { getUserDetail } = require("../controllers/usersController");

router.get("/details", validateToken, getUserDetail);

module.exports = router;