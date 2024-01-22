const express = require('express');
const router = express.Router();
const controller = require('../../controllers/apiControllers/admin.api.c');

router.get('/all', controller.getAllUser);
router.get('/custom', controller.getByUsernameSearchByPermissionByPage);

module.exports = { router };