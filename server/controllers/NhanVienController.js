const NhanVien = require('../models/NhanVien');
const asyncHandler = require('express-async-handler');

const register = asyncHandler(async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            message: 'Missing input',
        });
    }
    const user = await NhanVien.findOne({ email });
    if (user) {
        throw new Error(`User with email ${user.email} has already existed`);
    } else {
        const newNhanVien = await NhanVien.create(req.body);
        console.log('newNhanVien: ', newNhanVien);
        return res.status(200).json({
            success: newNhanVien ? true : false,
            message: newNhanVien ? 'Register successfully' : 'Something went wrong',
        });
    }
});

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Missing input',
        });
    }
    const user = await NhanVien.findOne({ email });
    if (user && (await user.isCorrectPassword(password))) {
        const { password, isAdmin, role, ...userData } = user._doc;
        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            userData,
        });
    } else {
        throw new Error('Error in email and password when logging in!');
    }
});

module.exports = {
    register,
    login,
};
