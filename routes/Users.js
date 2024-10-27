const { default: axios, get } = require("axios");
const express = require("express");
const router = express.Router();
const { getAllUsers, createUser } = require("../controllers/usersController");

router.get("/", getAllUsers);

router.post("/", createUser);

module.exports = router;
