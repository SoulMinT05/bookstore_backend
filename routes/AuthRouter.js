const router = require('express').Router();
const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwtMiddleware');
const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');

router.post('/google-login', async (req, res) => {
    try {
        const { email, Ho, Ten, picture } = req.body;
        console.log('req.bodyBE: ', req.body);

        let user = await DocGia.findOne({ email });
        if (!user) {
            user = new DocGia({ email, Ho, Ten, avatar: picture });
            await user.save();
        } else {
            await DocGia.findByIdAndUpdate(user._id, { avatar: picture }, { new: true });
        }

        const accessToken = generateAccessToken(user._id, user.isAdmin, user.ChucVu);
        const newRefreshToken = generateRefreshToken(user._id);
        await DocGia.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });
        // Save refreshToken to cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: '/',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, //time expires in seconds
        });
        console.log('accessToken--login: ', accessToken);
        console.log('user--login: ', user);
        const { password, refreshToken, ...userData } = user._doc;

        res.json({
            success: true,
            message: 'Login successfully',
            accessToken,
            userData: {
                ...userData,
                isAdmin: user.isAdmin, // Thêm lại isAdmin
                ChucVu: user.ChucVu, // Thêm lại ChucVu
            },
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(401).json({ message: 'Xác thực Google thất bại!' });
    }
});

module.exports = router;
