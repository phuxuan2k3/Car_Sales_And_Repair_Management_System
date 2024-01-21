const express = require('express');
const router = express.Router();
const controller = require('../../controllers/apiControllers/admin.api.c');

router.get('/all', controller.getAllUser);

module.exports = { router };