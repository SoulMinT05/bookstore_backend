const nhanVienRouter = require('./NhanVienRouter');
const sachRouter = require('./SachRouter');
const nhaXuatBanRouter = require('./NhaXuatBanRouter');
const { notFound, errorHandler } = require('../middlewares/errorHandlerMiddleware');

const route = (app) => {
    app.use('/api/user', nhanVienRouter);
    app.use('/api/book', sachRouter);
    app.use('/api/publisher', nhaXuatBanRouter);

    app.use(notFound);
    app.use(errorHandler);
};

module.exports = route;
