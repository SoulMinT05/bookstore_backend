const Coupon = require('../models/CouponModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createCoupon = asyncHandler(async (req, res) => {
    const { name, discount, expiry } = req.body;
    const coupon = await Coupon.create({
        ...req.body,
        expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
        success: coupon ? true : false,
        coupon: coupon ? coupon : 'Create coupon failed',
    });
});

const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find();
    return res.status(200).json({
        success: coupons ? true : false,
        coupons: coupons ? coupons : 'Get all coupons failed',
    });
});

const updateCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;
    const { name, discount, expiry } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        {
            ...req.body,
            expiry: Date.now() + +expiry * 24 * 60 * 60 * 1000,
        },
        {
            new: true,
        },
    );
    return res.status(200).json({
        success: coupon ? true : false,
        coupon: coupon ? coupon : 'Update coupon failed',
    });
});

const deleteCoupon = asyncHandler(async (req, res) => {
    const { couponId } = req.params;
    const coupon = await Coupon.findByIdAndDelete(couponId);
    return res.status(200).json({
        success: coupon ? true : false,
        coupon: coupon ? coupon : 'Delete coupon failed',
    });
});

module.exports = {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
};
