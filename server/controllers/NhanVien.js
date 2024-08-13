const NhanVien = require('../models/NhanVien');
const asyncHandler = require('express-async-handler');

const register = async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            message: 'Missing input',
        });
    }
    const newNhanVien = new NhanVien({
        ...req.body,
        // password: hash,
    });
    newNhanVien.save();
    // const newNhanVien = await NhanVien.create(req.body);
    console.log('newNhanVien: ', newNhanVien);
    return res.status(200).json({
        success: newNhanVien ? true : false,
        message: newNhanVien,
    });
};

module.exports = {
    register,
};
