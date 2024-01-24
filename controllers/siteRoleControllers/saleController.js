const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const PDFDocument = require('pdfkit');
const { SaleRecord, SaleDetail } = require('../../models/invoices/salerecord');
const { FixRecord, FixDetail } = require('../../models/invoices/fixrecord');
const User = require('../../models/user');

module.exports = {
    getDashboard: tryCatch(async (req, res) => {
        res.render('RoleView/sale/dashboard', { nameOfUser: req.session.passport.user.nameOfUser, title: 'DashBoard', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css' });
    }),
    getReportPage: tryCatch(async (req, res) => {

        const filePath = path.join(appDir, 'report.pdf');
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        const logoPath = path.join(appDir, 'public', 'car.png'); // Điền đúng đường dẫn của logo
        doc.image(logoPath, 350, 150, { width: 200 }); // Thay đổi vị trí và kích thước theo yêu cầu


        doc.fontSize(20).text('BUSINESS REPORT', { align: 'center' });
        doc.moveDown();

        // Business Information
        doc.fontSize(16).text('1. Business Information:', { underline: true });
        doc.moveDown();
        doc.text('Business Name: Sai Gon Xanh');
        doc.text('Address: Dinh An, Go Quao, Kien Giang');
        doc.text('Report Date: ' + new Date().toLocaleDateString());
        doc.moveDown();

        // Display Business Data (adjust as needed)
        doc.fontSize(16).text('2. Business Data:', { underline: true });
        doc.moveDown();
        doc.text(`Sales Revenue: $${await SaleRecord.getTotalPriceByDateByCus() + await FixRecord.getTotalPriceByDateByPay()}`);
        doc.text(`Number of Employees: ${(await User.countEmployee()).count}`);
        doc.moveDown();

        // Owner Information
        doc.fontSize(16).text('3. Owner Information:', { underline: true });
        doc.moveDown();
        doc.text('Owner Name: Nguyen Pham Phu Xuan');

        // Conclusion and Notes
        doc.moveDown();
        doc.fontSize(16).text('4. Conclusion and Notes:', { underline: true });
        doc.moveDown();
        doc.text('The business is steadily growing and has potential for further expansion.');
        doc.text('This is the result of the efforts of the team and effective business strategies.');

        // Signature
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(16).text('Nguyen Pham Phu Xuan', { align: 'right' });
        doc.moveDown();
        doc.moveDown();
        doc.text('Signature: _____________________', { align: 'right' });
        doc.end();

        stream.on('finish', () => {
            const data = fs.readFileSync(filePath);
            const base64data = Buffer.from(data).toString('base64');

            res.render('RoleView/sale/report', { pdfData: base64data, nameOfUser: req.session.passport.user.nameOfUser, title: 'Report', jsFile: 'saleReport.js', cssFile: 'saleDashboard.css' });
        });
    }),
    getSaleInvoices: tryCatch(async (req, res) => {
        let invoices = await SaleRecord.getJoinWithCustomer();

        res.render('RoleView/sale/saleInvoice', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoices', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', invoices });
    }),
    getSaleDetails: tryCatch(async (req, res) => {
        let invoiceId = req.query.invoiceId;

        let details = await SaleRecord.getAllDetailFull(invoiceId);
        res.render('RoleView/sale/saleDetail', { invoiceId, nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Details', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', details });
    }),
    getFixInvoices: tryCatch(async (req, res) => {
        let invoices = await FixRecord.getJoinWithCustomerPay();
        res.render('RoleView/sale/fixInvoice', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoices', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', invoices });
    }),
    getFixDetails: tryCatch(async (req, res) => {
        let invoiceId = req.query.invoiceId;
        let details = await FixRecord.getAllDetailFull(invoiceId);
        res.render('RoleView/sale/fixDetail', { invoiceId, nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoices', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', details });
    }),
    getSaleInvoicePdf: tryCatch(async (req, res) => {

        let invoice = await SaleRecord.getJoinWithCustomerById(req.query.invoiceId);
        let details = await SaleRecord.getAllDetailFull(req.query.invoiceId);

        console.log(req.query.invoiceId);
        console.log(invoice);

        const filePath = path.join(appDir, 'saleInvoice.pdf');
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(20).text('Sale Invoice', { align: 'center' });
        doc.moveDown();

        // Business Information
        doc.fontSize(16).text('1. Business Information:', { underline: true });
        doc.moveDown();
        doc.text('Business Name: Sai Gon Xanh');
        doc.text('Address: Dinh An, Go Quao, Kien Giang');
        doc.text('Report Date: ' + new Date().toLocaleDateString());
        doc.moveDown();

        doc.fontSize(16).text('2. Customer Infomation:', { underline: true });
        doc.text(`Name: ${removeVietnameseTones(invoice.lastname)} ${removeVietnameseTones(invoice.firstname)}`);

        // Display Business Data (adjust as needed)
        doc.moveDown();
        doc.fontSize(16).text('3. Invoice Details:', { underline: true });
        details.forEach(e => {
            doc.text(`Name of Car: ${e.car_name}`);
            doc.text(`Quantity: ${e.quantity}`);
            doc.moveDown();
        });
        doc.moveDown();

        doc.fontSize(16).text('4. Total:', { underline: true });
        doc.text(`Total: $${invoice.total_price}`);

        // Signature
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(16).text('Nguyen Pham Phu Xuan', { align: 'right' });
        doc.moveDown();
        doc.moveDown();
        doc.text('Signature: _____________________', { align: 'right' });
        doc.end();

        stream.on('finish', () => {
            const data = fs.readFileSync(filePath);
            const base64data = Buffer.from(data).toString('base64');

            res.render('RoleView/sale/saleInvoicePdf', { pdfData: base64data, nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoice', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css' });
        });
    }),
    getFixInvoicePdf: tryCatch(async (req, res) => {

        let invoice = await FixRecord.getJoinWithCustomerById(req.query.invoiceId);
        let details = await FixRecord.getAllDetailFull(req.query.invoiceId);

        console.log(req.query.invoiceId);
        console.log(invoice);

        const filePath = path.join(appDir, 'saleInvoice.pdf');
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        doc.fontSize(20).text('Fix Invoice', { align: 'center' });
        doc.moveDown();

        // Business Information
        doc.fontSize(16).text('1. Business Information:', { underline: true });
        doc.moveDown();
        doc.text('Business Name: Sai Gon Xanh');
        doc.text('Address: Dinh An, Go Quao, Kien Giang');
        doc.text('Report Date: ' + new Date().toLocaleDateString());
        doc.moveDown();

        doc.fontSize(16).text('2. Customer Infomation:', { underline: true });
        doc.text(`Name: ${removeVietnameseTones(invoice.lastname)} ${removeVietnameseTones(invoice.firstname)}`);

        // Display Business Data (adjust as needed)
        doc.moveDown();
        doc.fontSize(16).text('3. Invoice Details:', { underline: true });
        details.forEach(e => {
            doc.text(`Name of Auto Part: ${e.name}`);
            doc.text(`Price: $${e.price}`);
            doc.text(`Quantity: ${e.quantity}`);
            doc.text(`Mechanic Name: ${removeVietnameseTones(e.lastname)} ${removeVietnameseTones(e.firstname)}`);
            doc.text(`Total: $${e.total}`);

            doc.moveDown();
        });
        doc.moveDown();

        doc.fontSize(16).text('4. Total:', { underline: true });
        doc.text(`Total: $${invoice.total_price}`);

        // Signature
        doc.moveDown();
        doc.moveDown();
        doc.fontSize(16).text('Nguyen Pham Phu Xuan', { align: 'right' });
        doc.moveDown();
        doc.moveDown();
        doc.text('Signature: _____________________', { align: 'right' });
        doc.end();

        stream.on('finish', () => {
            const data = fs.readFileSync(filePath);
            const base64data = Buffer.from(data).toString('base64');

            res.render('RoleView/sale/fixInvoicePdf', { pdfData: base64data, nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoice', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css' });
        });
    })
}

function removeVietnameseTones(str) {
    if (str != null) {

        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
        str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
        str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
        str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
        str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
        str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
        str = str.replace(/Đ/g, "D");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
        // Remove extra spaces
        // Bỏ các khoảng trắng liền nhau
        str = str.replace(/ + /g, " ");
        str = str.trim();
        // Remove punctuations
        // Bỏ dấu câu, kí tự đặc biệt
        return str;
    }
    else {
        return '';
    }
}