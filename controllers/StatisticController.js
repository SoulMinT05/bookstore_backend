const User = require('../models/DocGiaModel');
const Product = require('../models/SachModel');
const Publisher = require('../models/NhaXuatBanModel');
const Order = require('../models/TheoDoiMuonSachModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const getMonthUserStatistics = async (req, res) => {
    try {
        // Tổng số user
        const totalUsers = await User.countDocuments();
        console.log('totalUsers: ', totalUsers);
        // Số lượng user mới tháng này
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        console.log('startOfMonth: ', startOfMonth);
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth },
        });
        // Số lượng user mới tháng trước
        const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newUsersLastMonth = await User.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });

        // Tính tỷ lệ tăng trưởng
        const growthRate =
            newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            totalUsers,
            newUsersThisMonth,
            newUsersLastMonth,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getMonthProductStatistics = async (req, res) => {
    try {
        // Tổng số sản phẩm
        const totalProducts = await Product.countDocuments();
        console.log('totalProducts: ', totalProducts);

        // Số lượng sản phẩm mới tháng này
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        console.log('startOfMonth: ', startOfMonth);
        const newProductsThisMonth = await Product.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // Số lượng sản phẩm mới tháng trước
        const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newProductsLastMonth = await Product.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });

        // Tính tỷ lệ tăng trưởng
        const growthRate =
            newProductsLastMonth > 0 ? ((newProductsThisMonth - newProductsLastMonth) / newProductsLastMonth) * 100 : 0;

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            totalProducts,
            newProductsThisMonth,
            newProductsLastMonth,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getMonthOrderStatistics = async (req, res) => {
    try {
        // Tổng số đơn hàng
        const totalOrders = await Order.countDocuments();
        console.log('totalOrders: ', totalOrders);

        // Số lượng đơn hàng mới tháng này
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        console.log('startOfMonth: ', startOfMonth);
        const newOrdersThisMonth = await Order.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // Số lượng đơn hàng mới tháng trước
        const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newOrdersLastMonth = await Order.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });

        // Tính tỷ lệ tăng trưởng
        const growthRate =
            newOrdersLastMonth > 0 ? ((newOrdersThisMonth - newOrdersLastMonth) / newOrdersLastMonth) * 100 : 0;

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            totalOrders,
            newOrdersThisMonth,
            newOrdersLastMonth,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getMonthPublisherStatistics = async (req, res) => {
    try {
        // Tổng số nhà xuất bản
        const totalPublishers = await Publisher.countDocuments();
        console.log('totalPublishers: ', totalPublishers);

        // Số lượng nhà xuất bản mới tháng này
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        console.log('startOfMonth: ', startOfMonth);
        const newPublishersThisMonth = await Publisher.countDocuments({
            createdAt: { $gte: startOfMonth },
        });

        // Số lượng nhà xuất bản mới tháng trước
        const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newPublishersLastMonth = await Publisher.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });

        // Tính tỷ lệ tăng trưởng
        const growthRate =
            newPublishersLastMonth > 0
                ? ((newPublishersThisMonth - newPublishersLastMonth) / newPublishersLastMonth) * 100
                : 0;

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            totalPublishers,
            newPublishersThisMonth,
            newPublishersLastMonth,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getMonthUserStatistics,
    getMonthProductStatistics,
    getMonthOrderStatistics,
    getMonthPublisherStatistics,
};
