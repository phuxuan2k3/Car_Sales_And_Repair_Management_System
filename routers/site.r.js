const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site.c');
const authenticate = require('../middlewares/authentication');
const loginUser = require('../middlewares/login');
const registerUser = require('../middlewares/register');
const logoutUser = require('../middlewares/logout');
const authorize = require('../middlewares/authorizationFactory');


//no authenticate need
router.get('/', siteController.getIndex);
router.get('/login', siteController.getLoginPage);
router.post('/login', loginUser);
router.get('/register', siteController.getRegisterPage);
router.post('/register', registerUser);
router.post('/logout', logoutUser);

router.use(authenticate, authorize);

module.exports = router;