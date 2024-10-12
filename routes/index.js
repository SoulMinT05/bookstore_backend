const nhanVienRouter = require('./NhanVienRouter');
const sachRouter = require('./SachRouter');
const theoDoiMuonSachRouter = require('./TheoDoiMuonSachRouter');
const nhaXuatBanRouter = require('./NhaXuatBanRouter');
const blogNhaXuatBanRouter = require('./BlogNhaXuatBanRouter');
const blogRouter = require('./BlogRouter');
const supplierRouter = require('./SupplierRouter');
const couponRouter = require('./CouponRouter');

const { notFound, errorHandler } = require('../middlewares/errorHandlerMiddleware');

const route = (app) => {
    app.use('/api/staff', nhanVienRouter);
    app.use('/api/book', sachRouter);
    app.use('/api/order', theoDoiMuonSachRouter);
    app.use('/api/publisher', nhaXuatBanRouter);
    app.use('/api/blogPublisher', blogNhaXuatBanRouter);
    app.use('/api/blog', blogRouter);
    app.use('/api/supplier', supplierRouter);
    app.use('/api/coupon', couponRouter);

    app.use(notFound);
    app.use(errorHandler);
};

module.exports = route;