const Order = require('../models/TheoDoiMuonSachModel');
const NhanVien = require('../models/NhanVienModel');
const asyncHandler = require('express-async-handler');

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userCart = await NhanVien.findById(_id);

    return res.status(200).json({
        success: userCart ? true : false,
        userCart: userCart ? userCart : 'Create userCart failed',
    });
});

module.exports = {
    createOrder,
};
