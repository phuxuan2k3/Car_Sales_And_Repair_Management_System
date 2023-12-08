const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site.c');
const session = require('../middlewares/session');
const authenticate = require('../middlewares/authentication');

// LƯU Ý VỀ BẢN CHẤT
// CÁC XÁC THỰC PHÂN QUYỀN PHẢI CÀI ĐẶT TRONG MIDDLEWARE RIÊNG ROUTER REQUIRE VÀO ĐỂ DÙNG
// GIA HẠN COOKIES KHÔNG PHẢI LÚC NÀO CŨNG GIA HẠN, PHẢI GIA HẠN TRONG CONTROLLER KHÔNG PHẢI ROUTER
// DATABASE CHỈ ĐƯỢC GỌI Ở CONTROLLER ROUTER CHỈ CÓ CHỨC NĂNG DUY NHẤT LÀ ĐỊNH TUYẾN

router.use(session);
router.get('/', authenticate.auth, siteController.getIndex);
router.get('/login', siteController.getLoginPage);

module.exports = router;