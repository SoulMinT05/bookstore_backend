const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization;
    if (req?.headers?.authorization.startsWith('Bearer')) {
        const accessToken = token.split(' ')[1];
        jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid access token',
                });
            }
            req.user = user;
            console.log('req.user: ', req.user);
            next();
        });
    } else {
        return res.status(401).json({
            success: false,
            message: 'Not verify access token. Require authentication',
        });
    }
});

const checkIsStaff = asyncHandler(async (req, res, next) => {
    const { isAdmin, ChucVu } = req.user;
    if (ChucVu !== 'staff') {
        res.status(401).json({
            success: false,
            message: 'Require admin ChucVu',
        });
    }
    next();
});

const checkIsAdmin = asyncHandler(async (req, res, next) => {
    const { isAdmin, ChucVu } = req.user;
    if (isAdmin === false && ChucVu !== 'admin') {
        res.status(401).json({
            success: false,
            message: 'Require admin ChucVu',
        });
    }
    if (isAdmin === true || ChucVu === 'admin') next();
});

const checkAdminOrStaff = (req, res, next) => {
    const { ChucVu } = req.user;

    if (ChucVu === 'admin' || ChucVu === 'staff') {
        next();
    } else {
        // Nếu không phải, trả về thông báo truy cập bị từ chối
        return res.status(403).json({ message: 'Bạn không có quyền để truy cập vào.' });
    }
};

module.exports = { verifyAccessToken, checkIsStaff, checkIsAdmin, checkAdminOrStaff };
