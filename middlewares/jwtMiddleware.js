const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, isAdmin, ChucVu) => {
    return jwt.sign({ _id: userId, isAdmin, ChucVu }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '3d' });
};
const generateRefreshToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};
