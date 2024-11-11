const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwtMiddleware');
const sendMail = require('../utils/sendMail');

const register = asyncHandler(async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            message: 'Missing input register',
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password))
        throw new Error(
            'Password must be at least 8 characters long, contain one letter, one number, and one special character',
        );

    const user = await DocGia.findOne({ email });
    if (user) {
        throw new Error(`User with email ${user.email} has already existed`);
    } else {
        const newDocGia = await DocGia.create(req.body);
        console.log('newDocGia: ', newDocGia);
        return res.status(200).json({
            success: newDocGia ? true : false,
            message: newDocGia ? 'Register successfully' : 'Register failed. Something went wrong',
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
    const user = await DocGia.findOne({ email });

    if (user.isLocked) throw new Error(`Nguời dùng có email ${user.email} đã bị khoá`);

    if (user && (await user.isCorrectPassword(password))) {
        const { password, isAdmin, role, refreshToken, ...userData } = user._doc;
        // Add accessToken, refreshToken
        const accessToken = generateAccessToken(userData._id, isAdmin, role);
        const newRefreshToken = generateRefreshToken(userData._id);
        // Save refreshToken to DB
        await DocGia.findByIdAndUpdate(userData._id, { refreshToken: newRefreshToken }, { new: true });
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
            userData: {
                ...userData,
                isAdmin, // Adding isAdmin back to the userData
                role, // Adding role back to the userData
            },
        });
    } else {
        throw new Error('Error in email and password when logging in!');
    }
});

const getDetailUser = asyncHandler(async (req, res, next) => {
    // const { _id } = req.user;
    const { userId } = req.params;
    const user = await DocGia.findById(userId).select('-refreshToken -password');
    return res.status(200).json({
        success: user ? true : false,
        result: user ? user : 'Get detail user failed',
    });
});

const refreshCreateNewAccessToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie && !cookie.refreshToken) throw new Error('No refresh token in cookies');

    // If isCheckRefreshToken error => it stops and returns immediately
    const isCheckRefreshToken = await jwt.verify(cookie.refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
    const user = await DocGia.findOne({ _id: isCheckRefreshToken._id, refreshToken: cookie.refreshToken });
    return res.status(200).json({
        success: user ? true : false,
        newAccessToken: user ? generateAccessToken(user._id, user.isAdmin, user.role) : 'Refresh token not matched',
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    // if (!cookie || !cookie.refreshToken) throw new Error('Not found refresh token in cookies');
    // Delete refreshToken in DB
    await DocGia.findOneAndUpdate(
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

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await DocGia.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check the current password
    const isMatchPassword = await user.isCorrectPassword(currentPassword);
    if (!isMatchPassword) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await DocGia.findOneAndUpdate(
        { _id: userId },
        {
            password: hashedPassword,
            passwordChangedAt: Date.now(),
        },
        { new: true },
    );

    return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        user: updatedUser,
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
    const user = await DocGia.findOne({ email });
    if (!user) throw new Error('User not found');

    const resetToken = user.createPasswordChangeToken();
    await user.save();

    const html = `
    Vui lòng nhấp vào link dưới đây để thay đổi mật khẩu của bạn. 
    Link này sẽ hết hạn sau 5 phút kể từ bây giờ. <a href=${process.env.URI_CLIENT}/resetPassword/${resetToken}>Nhấp vào đây</a>
`;

    const data = {
        email,
        html,
    };
    const infoMailUser = await sendMail(data);
    return res.status(200).json({
        success: infoMailUser?.response?.includes('OK') ? true : false,
        message: infoMailUser?.response?.includes('OK') ? 'Check mail to do a next step' : 'Error, please try again',
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const { password, token } = req.body;
    if (!password || !token) throw new Error('Missing password or token');
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    // gt: higher than, lt: lower than
    const user = await DocGia.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } });
    if (!user) throw new Error('Invalid reset token. Please try again forgot password');
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    return res.status(200).json({
        success: user ? true : false,
        message: user ? 'Reset password successfully. Please login your account' : 'Failed update password',
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await DocGia.find().select('-refreshToken -password -passwordChangedAt ');
    return res.status(200).json({
        success: users ? true : false,
        users,
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new Error('User not found');
    }
    const user = await DocGia.findByIdAndDelete(userId);
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
    const user = await DocGia.findByIdAndUpdate(_id, req.body, { new: true }).select('-password -refreshToken');
    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : 'Updated user failed',
    });
});

const updateInfoFromAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (Object.keys(req.body).length === 0) throw new Error('You need to type at least one field to update ');
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await DocGia.findByIdAndUpdate(userId, req.body, { new: true }).select('-password -refreshToken');
    return res.status(200).json({
        success: user ? true : false,
        updatedUser: user ? user : 'Update info user from admin failed',
    });
});

const createUserFromAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const passwordUser = password || '123456';
    if (!firstName || !lastName || !email) throw new Error('Missing input create user from admin');
    const user = await DocGia.findOne({ email });
    if (user) {
        throw new Error(`User with firstName ${firstName} and email ${email} has already existed`);
    } else {
        const newUser = await DocGia.create({ ...req.body, password: passwordUser });
        return res.status(200).json({
            success: newUser ? true : false,
            newUser: newUser ? newUser : 'Create user account from admin failed',
        });
    }
});

const updateAddressUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    if (!req.body.address) throw new Error('Miss input address');
    const user = await DocGia.findByIdAndUpdate(
        _id,
        {
            // $push: { address: req.body.address },
            address: req.body.address,
        },
        { new: true },
    ).select('-password -refreshToken');

    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : 'Updated address user failed',
    });
});

const updateCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId, quantityCart } = req.body;
    if (!productId || !quantityCart) throw new Error('Missing input productId or quantityCart');

    const user = await DocGia.findById(_id);
    const alreadyProduct = user?.cart.find((item) => {
        return item.product.toString() === productId;
    });

    if (alreadyProduct) {
        // if has another property like color: black, red --> if (alreadyProduct.color === color) --> code below
        // else push cart like else alreadyProduct

        // Change quantity
        const response = await DocGia.updateOne(
            {
                cart: { $elemMatch: alreadyProduct },
            },
            {
                $set: { 'cart.$.quantityCart': quantityCart },
            },
            {
                new: true,
            },
        );
        return res.status(200).json({
            success: response ? true : false,
            response: response ? response : 'Upload cart product failed',
        });
    } else {
        // Create new cart
        const response = await DocGia.findByIdAndUpdate(
            _id,
            {
                $push: {
                    cart: {
                        product: productId,
                        quantityCart,
                    },
                },
            },
            { new: true },
        );
        console.log('response: ', response);
        return res.status(200).json({
            success: response ? true : false,
            response: response ? response : 'Upload cart product failed',
        });
    }
});

const lockedUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUser = req.user;

    const user = await DocGia.findById(userId);
    if (!user) throw new Error('User not found!');

    // Không được khoá nếu ko phải admin
    if (currentUser.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Only admin can lock or unlock users.',
        });
    }
    // Kiểm tra nếu admin cố gắng khóa tài khoản của chính mình
    if (currentUser._id === userId) {
        return res.status(403).json({
            success: false,
            message: 'Admin cannot lock their own account.',
        });
    }

    if (currentUser.role === 'admin' || currentUser.isAdmin === true) {
        user.isLocked = !user.isLocked;
        await user.save();
        return res.status(200).json({
            success: true,
            message: user.isLocked ? 'Lock user successfully' : 'Unlock user successfully',
            user,
        });
    }
});

module.exports = {
    register,
    login,
    getDetailUser,
    refreshCreateNewAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateInfoFromUser,
    updateInfoFromAdmin,
    updateAddressUser,
    updateCart,
    createUserFromAdmin,
    lockedUser,
    changePassword,
};
