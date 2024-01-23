const tryCatch = require('../../utils/tryCatch');
require('dotenv').config();
const ENV = process.env;
const Car = require('../../models/car');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const PDFDocument = require('pdfkit');

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
        doc.text('Sales Revenue: $1,000,000');
        doc.text('Number of Employees: 100');
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
        //get all invoices
        let invoices;
        res.render('RoleView/sale/saleInvoice', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoices', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', invoices });
    }),
    getSaleDetails: tryCatch(async (req, res) => {
        // req.query.invoiceId
        //get all details
        let details;
        res.render('RoleView/sale/saleDetail', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Details', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', details });
    }),
    getFixInvoices: tryCatch(async (req, res) => {
        //get all invoices
        let invoices;
        res.render('RoleView/sale/fixInvoice', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoices', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', invoices });
    }),
    getFixDetails: tryCatch(async (req, res) => {
        // req.query.invoiceId
        //get all details
        res.render('RoleView/sale/fixDetail', { nameOfUser: req.session.passport.user.nameOfUser, title: 'Sale Invoices', jsFile: 'saleDashboard.js', cssFile: 'saleDashboard.css', details });
    }),
    getSaleInvoicePdf: tryCatch(async (req, res) => {

        const filePath = path.join(appDir, 'saleInvoice.pdf');
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        const logoPath = path.join(appDir, 'public', 'car.png'); // Điền đúng đường dẫn của logo
        doc.image(logoPath, 350, 150, { width: 200 }); // Thay đổi vị trí và kích thước theo yêu cầu


        doc.fontSize(20).text('Sale Invoice', { align: 'center' });
        doc.moveDown();

        // Business Information
        doc.fontSize(16).text('1. Business Information:', { underline: true });
        doc.moveDown();
        doc.text('Business Name: Sai Gon Xanh');
        doc.text('Address: Dinh An, Go Quao, Kien Giang');
        doc.text('Report Date: ' + new Date().toLocaleDateString());
        doc.moveDown();

        // Display Business Data (adjust as needed)
        doc.fontSize(16).text('2. Invoice Details:', { underline: true });
        doc.moveDown();

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
}