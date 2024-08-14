const nhanVienRoute = require('./NhanVien');
const { notFound, errorHandler } = require('../middlewares/errorHandler');

const route = (app) => {
    app.use('/api/nhanVien', nhanVienRoute);

    app.use(notFound);
    app.use(errorHandler);
};

module.exports = route;
