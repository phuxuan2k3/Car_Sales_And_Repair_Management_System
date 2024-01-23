const express = require('express');
const router = express.Router();
const apiController = require('../../controllers/apiControllers/admin.api.c');

router.get('/all', apiController.getAll);
router.get('/custom', apiController.getByUsernameSearchByPermissionByPage);
router.get('/count-custom', apiController.getCountByUsernameSearchByPermission);
router.get('/single', apiController.getById);

router.post('/insert', apiController.insertUser);
router.post('/update', apiController.updateUser);
router.post('/delete', apiController.deleteUser);
router.post('/check-username', apiController.checkUsernameExists)

module.exports = { router };