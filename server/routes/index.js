const nhanVienRoute = require('./NhanVien');

const route = (app) => {
    app.use('/api/nhanVien', nhanVienRoute);
};

module.exports = route;
