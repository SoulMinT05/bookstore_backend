const NhanVien = require('../models/NhanVienModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwtMiddleware');
const sendMail = require('../utils/sendMail');

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
        const { password, isAdmin, role, refreshToken, ...userData } = user._doc;
        // Add accessToken, refreshToken
        const accessToken = generateAccessToken(userData._id, isAdmin, role);
        const newRefreshToken = generateRefreshToken(userData._id);
        // Save refreshToken to DB
        await NhanVien.findByIdAndUpdate(userData._id, { refreshToken: newRefreshToken }, { new: true });
        // Save refreshToken to cookie
        res.cookie('refreshToken', newRefreshToken, {
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
        success: user ? true : false,
        result: user ? user : 'User not found',
    });
});

const refreshCreateNewAccessToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies');

    // If isCheckRefreshToken error => it stops and returns immediately
    const isCheckRefreshToken = await jwt.verify(cookie.refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    const user = await NhanVien.findOne({ _id: isCheckRefreshToken._id, refreshToken: cookie.refreshToken });
    return res.status(200).json({
        success: user ? true : false,
        newAccessToken: user ? generateAccessToken(user._id, user.isAdmin, user.role) : 'Refresh token not matched',
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie || !cookie.refreshToken) throw new Error('Not found refresh token in cookies');
    // Delete refreshToken in DB
    await NhanVien.findOneAndUpdate(
        { refreshToken: cookie.refreshToken },
        {
            refreshToken: '',
        },
        { new: true },
    );
    // Delete refreshToken in cookies
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.status(200).json({
        success: true,
        message: 'Logout successfully',
    });
});

// Client send mail
// Server check mail is valid? => send mail + with link (password change token)
// Client check mail => click link
// Client send api with token
// Check token is same with token of server send mail?
// Change password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) throw new Error('Email not found');
    const user = await NhanVien.findOne({ email });
    if (!user) throw new Error('User not found');

    const resetToken = user.createPasswordChangeToken();
    await user.save();

    const html = `
        Vui lòng nhấp vào link dưới đây để thay đổi mật khẩu của bạn. 
        Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.URL_SERVER}/api/nhanVien/resetPassword/${resetToken}>Nhấp vào đây</a>
    `;

    const data = {
        email,
        html,
    };
    const infoMailUser = await sendMail(data);
    return res.status(200).json({
        success: true,
        infoMailUser,
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;
    if (!password || !token) throw new Error('Missing password or token');
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    // gt: higher than, lt: lower than
    const user = await NhanVien.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) throw new Error('Invalid reset token');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    return res.status(200).json({
        success: user ? true : false,
        message: user ? 'Updated password successfully' : 'Failed update password',
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await NhanVien.find().select('-refreshToken -role -isAdmin -password');
    return res.status(200).json({
        success: users ? true : false,
        users,
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query;
    if (!_id) {
        throw new Error('User not found');
    }
    const user = await NhanVien.findByIdAndDelete(_id);
    return res.status(200).json({
        success: user ? true : false,
        message: user ? `Deleted user with ${user.email} successfully` : 'Deleted user failed ',
    });
});

const updateInfoFromUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    if (!_id || Object.keys(req.body).length === 0) {
        throw new Error('Miss input');
    }
    const user = await NhanVien.findByIdAndUpdate(_id, req.body, { new: true }).select(
        '-password -refreshToken -isAdmin -role',
    );
    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : 'Updated user failed',
    });
});

const updateInfoFromAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (Object.keys(req.body).length === 0) {
        throw new Error('Miss input');
    }
    const user = await NhanVien.findByIdAndUpdate(userId, req.body, { new: true }).select(
        '-password -refreshToken -isAdmin -role',
    );
    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : 'Updated user failed',
    });
});

const updateAddressUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    if (!req.body.address) {
        throw new Error('Miss input address');
    }
    const user = await NhanVien.findByIdAndUpdate(
        _id,
        {
            // $push: { address: req.body.address },
            address: req.body.address,
        },
        { new: true },
    ).select('-password -refreshToken -isAdmin -role');

    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : 'Updated address user failed',
    });
});

module.exports = {
    register,
    login,
    getCurrentUser,
    refreshCreateNewAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateInfoFromUser,
    updateInfoFromAdmin,
    updateAddressUser,
};
