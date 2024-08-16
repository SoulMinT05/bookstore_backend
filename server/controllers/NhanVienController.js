const NhanVien = require('../models/NhanVien');
const asyncHandler = require('express-async-handler');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwtMiddleware');

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
            message: newNhanVien ? 'Register successfully' : 'Register failed. Something went wrong',
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
        // Add accessToken, refreshToken
        const accessToken = generateAccessToken(userData._id, isAdmin, role);
        const refreshToken = generateRefreshToken(userData._id);
        // Save refreshToken to DB
        await NhanVien.findByIdAndUpdate(userData._id, { refreshToken }, { new: true });
        // Save refreshToken to cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            path: '/',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, //time expires in seconds
        });

        return res.status(200).json({
            success: true,
            message: 'Login successfully',
            accessToken,
            userData,
        });
    } else {
        throw new Error('Error in email and password when logging in!');
    }
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    console.log('req.user: ', req.user);
    const user = await NhanVien.findById(_id).select('-refreshToken -role -isAdmin -password');
    return res.status(200).json({
        success: true,
        result: user ? user : 'User not found',
    });
});

module.exports = {
    register,
    login,
    getCurrentUser,
};
