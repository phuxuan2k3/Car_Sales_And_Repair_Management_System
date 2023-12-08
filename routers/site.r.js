const express = require('express');
const router = express.Router();
const siteController = require('../controllers/site.c');

// LƯU Ý VỀ BẢN CHẤT
// CÁC XÁC THỰC PHÂN QUYỀN PHẢI CÀI ĐẶT TRONG MIDDLEWARE RIÊNG ROUTER REQUIRE VÀO ĐỂ DÙNG
// GIA HẠNG COOKIES KHÔNG PHẢI LÚC NÀO CŨNG GIA HẠN, PHẢI GIA HẠNG TRONG CONTROLLER KHÔNG PHẢI ROUTER
// DATABASE CHỈ ĐƯỢC GỌI Ở CONTROLLER ROUTER CHỈ CÓ CHỨC NĂNG DUY NHẤT LÀ ĐỊNH TUYẾN 

router.get('/',siteController.getIndex);



module.exports = router;