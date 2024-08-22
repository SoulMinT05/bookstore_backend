const nhanVienRouter = require('./NhanVienRouter');
const sachRouter = require('./SachRouter');
const nhaXuatBanRouter = require('./NhaXuatBanRouter');
const blogNhaXuatBanRouter = require('./BlogNhaXuatBanRouter');
const blogRouter = require('./BlogRouter');
const supplierRouter = require('./SupplierRouter');
const { notFound, errorHandler } = require('../middlewares/errorHandlerMiddleware');

const route = (app) => {
    app.use('/api/user', nhanVienRouter);
    app.use('/api/book', sachRouter);
    app.use('/api/publisher', nhaXuatBanRouter);
    app.use('/api/blogPublisher', blogNhaXuatBanRouter);
    app.use('/api/blog', blogRouter);
    app.use('/api/supplier', supplierRouter);

    app.use(notFound);
    app.use(errorHandler);
};

module.exports = route;
