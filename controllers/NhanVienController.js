const NhanVien = require('../models/NhanVienModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const { generateAccessToken, generateRefreshToken } = require('../middlewares/jwtMiddleware');
const sendMail = require('../utils/sendMail');

const register = asyncHandler(async (req, res, next) => {
    const { email, password, Ho, Ten, DienThoai } = req.body;
    if (!email || !password || !Ho || !Ten) {
        return res.status(400).json({
            success: false,
            message: 'Missing input register',
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password))
        throw new Error('Mật khẩu phải gồm kí tự in hoa, kí tự thường, số và kí tự đặc biệt');

    if (!/^(09|03|07|08|05)\d{8}$/.test(DienThoai)) {
        return res
            .status(400)
            .json({ message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 09, 03, 07, 08 hoặc 05.' });
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
            message: 'Cần nhập email và password',
        });
    }
    const user = await NhanVien.findOne({ email });

    if (user.isLocked) throw new Error(`Nguời dùng có email ${user.email} đã bị khoá`);

    if (user && (await user.isCorrectPassword(password))) {
        const { password, isAdmin, ChucVu, refreshToken, ...userData } = user._doc;
        // Add accessToken, refreshToken
        const accessToken = generateAccessToken(userData._id, isAdmin, ChucVu);
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
            userData: {
                ...userData,
                isAdmin, // Adding isAdmin back to the userData
                ChucVu, // Adding ChucVu back to the userData
            },
        });
    } else {
        throw new Error('Có lỗi khi đăng nhập!');
    }
});

const getDetailUser = asyncHandler(async (req, res, next) => {
    // const { _id } = req.user;
    const { userId } = req.params;
    const user = await NhanVien.findById(userId).select('-refreshToken -password');
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
    const user = await NhanVien.findOne({ _id: isCheckRefreshToken._id, refreshToken: cookie.refreshToken });
    return res.status(200).json({
        success: user ? true : false,
        newAccessToken: user ? generateAccessToken(user._id, user.isAdmin, user.ChucVu) : 'Refresh token not matched',
    });
});

const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    // if (!cookie || !cookie.refreshToken) throw new Error('Not found refresh token in cookies');
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

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await NhanVien.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!newPassword || !currentPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' });
    }

    // Check the current password
    const isMatchPassword = await user.isCorrectPassword(currentPassword);
    if (!isMatchPassword) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword))
        throw new Error('Mật khẩu phải gồm kí tự in hoa, kí tự thường, số và kí tự đặc biệt');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await NhanVien.findOneAndUpdate(
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
    const user = await NhanVien.findOne({ email });
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
    const user = await NhanVien.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } });
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
    const users = await NhanVien.find().select('-refreshToken -password -passwordChangedAt ');
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
    const currentUser = req.user; // Giả sử thông tin người dùng đang đăng nhập nằm trong req.user
    if (currentUser.ChucVu !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xoá người dùng',
        });
    }

    const deletedUser = await NhanVien.findById(userId);
    if (!deletedUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    if (currentUser.ChucVu === 'admin' && deletedUser.ChucVu === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xoá người cùng chức vụ',
        });
    }

    const user = await NhanVien.findByIdAndDelete(userId);
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
    if (!/^(09|03|07|08|05)\d{8}$/.test(req.body.DienThoai)) {
        return res
            .status(400)
            .json({ message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 09, 03, 07, 08 hoặc 05.' });
    }
    const user = await NhanVien.findByIdAndUpdate(_id, req.body, { new: true }).select('-password -refreshToken');
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

    if (!/^(09|03|07|08|05)\d{8}$/.test(req.body.DienThoai)) {
        return res
            .status(400)
            .json({ message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 09, 03, 07, 08 hoặc 05.' });
    }

    const currentUser = req.user;
    const updatedUser = await NhanVien.findById(userId);
    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    if (updatedUser.ChucVu === currentUser.ChucVu) {
        return res.status(403).json({
            success: false,
            message: 'Không được sửa thông tin người cùng chức vụ',
        });
    }

    if (currentUser.ChucVu === 'staff' && req.body.ChucVu !== 'user') {
        return res.status(403).json({
            success: false,
            message: 'Nhân viên không được phép thay đổi vai trò của người khác',
        });
    }

    if (currentUser.ChucVu === 'staff' && updatedUser.ChucVu === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Nhân viên không được sửa thông tin quản lý',
        });
    }

    if (currentUser.ChucVu === 'admin' && req.body.ChucVu && !['user', 'staff'].includes(req.body.ChucVu)) {
        return res.status(403).json({
            success: false,
            message: 'Quản lý chỉ có thể thay đổi vai trò thành user hoặc staff',
        });
    }

    const user = await NhanVien.findByIdAndUpdate(userId, req.body, { new: true }).select('-password -refreshToken');
    return res.status(200).json({
        success: user ? true : false,
        updatedUser: user ? user : 'Update info user from admin failed',
    });
});

const createUserFromAdmin = asyncHandler(async (req, res) => {
    const { Ho, Ten, email, password, ChucVu = 'staff' } = req.body;

    const passwordUser = password || '123456';

    // Kiểm tra các trường bắt buộc
    if (!Ho || !Ten || !email) {
        throw new Error('Missing input: Ho, Ten, or email');
    }

    // Kiểm tra xem người dùng hiện tại có phải admin hay không
    const currentUser = req.user;
    if (currentUser.ChucVu !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ quản trị viên (admin) mới có quyền tạo người dùng mới.',
        });
    }

    // Kiểm tra xem email đã tồn tại hay chưa
    const existingUser = await NhanVien.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: `Người dùng với email ${email} đã tồn tại.`,
        });
    }

    // Kiểm tra định dạng số điện thoại
    if (!/^(09|03|07|08|05)\d{8}$/.test(req.body.DienThoai)) {
        return res.status(400).json({
            success: false,
            message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 09, 03, 07, 08 hoặc 05.',
        });
    }

    // Đảm bảo chỉ cho phép ChucVu là 'staff' hoặc 'user'
    if (ChucVu !== 'staff' && ChucVu !== 'user') {
        return res.status(400).json({
            success: false,
            message: 'Vai trò chỉ được phép là nhân viên (staff) hoặc người dùng (user).',
        });
    }

    // Tạo người dùng mới
    const newUser = await NhanVien.create({
        ...req.body,
        password: passwordUser,
    });

    // Phản hồi kết quả
    return res.status(200).json({
        success: !!newUser,
        newUser: newUser || 'Không thể tạo tài khoản người dùng mới.',
    });
});

const updateAddressUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    if (!req.body.DiaChi) throw new Error('Miss input DiaChi');
    const user = await NhanVien.findByIdAndUpdate(
        _id,
        {
            DiaChi: req.body.DiaChi,
        },
        { new: true },
    ).select('-password -refreshToken');

    return res.status(200).json({
        success: user ? true : false,
        message: user ? user : 'Updated DiaChi user failed',
    });
});

const lockedUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUser = req.user;

    const user = await NhanVien.findById(userId);
    if (!user) throw new Error('User not found!');

    // Kiểm tra nếu admin cố gắng khóa tài khoản của chính mình
    if (currentUser._id === userId) {
        return res.status(403).json({
            success: false,
            message: 'Không được khoá/mở khoá chính mình.',
        });
    }
    console.log('currentUser: ', currentUser);
    console.log('user: ', user);
    if (currentUser.ChucVu === user.ChucVu) {
        return res.status(403).json({
            success: false,
            message: 'Không được khoá/mở khoá người cùng chức vụ.',
        });
    }

    if (currentUser.ChucVu === 'staff' && user.ChucVu === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Nhân viên không được khoá/mở khoá quản lý.',
        });
    }

    user.isLocked = !user.isLocked;
    await user.save();
    return res.status(200).json({
        success: true,
        message: user.isLocked ? 'Khoá tài khoản thành công' : 'Mở khoá tài khoản thành công',
        user,
    });
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
    createUserFromAdmin,
    lockedUser,
    changePassword,
};
