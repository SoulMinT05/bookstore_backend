const nhanVienRoute = require('./NhanVienRouter');
const sachRoute = require('./SachRouter');
const { notFound, errorHandler } = require('../middlewares/errorHandlerMiddleware');

const route = (app) => {
    app.use('/api/nhanVien', nhanVienRoute);
    app.use('/api/sach', sachRoute);

    app.use(notFound);
    app.use(errorHandler);
};

module.exports = route;
