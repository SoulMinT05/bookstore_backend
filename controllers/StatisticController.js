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
        // const growthRate = newUsersThisMonth - newUsersLastMonth;

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

const getStatisticsByMonth = async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Tính tổng số lượng từng thực thể trong tháng hiện tại và tháng trước
        const userCountCurrent = await User.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const userCountLast = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth } });
        const productCountCurrent = await Product.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const productCountLast = await Product.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });
        const orderCountCurrent = await Order.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const orderCountLast = await Order.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });
        const populateOrders = await Order.find({ createdAt: { $gte: startOfCurrentMonth } })
            .populate('orderBy') // Thay đổi đây tùy thuộc vào mối quan hệ của bạn
            .populate('products.product'); // Nếu sản phẩm cũng cần được populate

        const publisherCountCurrent = await Publisher.countDocuments({ createdAt: { $gte: startOfCurrentMonth } });
        const publisherCountLast = await Publisher.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lt: endOfLastMonth },
        });

        const calculateGrowthRate = (current, last) =>
            current + last > 0 ? ((current - last) / (current + last)) * 100 : 0;
        console.log('calculateGrowthRate: ', calculateGrowthRate);

        return res.status(200).json({
            success: true,
            users: {
                title: 'Người dùng',
                count: userCountCurrent,
                growthRate: calculateGrowthRate(userCountCurrent, userCountLast),
            },
            products: {
                title: 'Sản phẩm',
                count: productCountCurrent,
                growthRate: calculateGrowthRate(productCountCurrent, productCountLast),
            },
            orders: {
                title: 'Đơn mượn',
                count: orderCountCurrent,
                populateOrders,
                growthRate: calculateGrowthRate(orderCountCurrent, orderCountLast),
            },
            publishers: {
                title: 'Nhà xuất bản',
                count: publisherCountCurrent,
                growthRate: calculateGrowthRate(publisherCountCurrent, publisherCountLast),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message + 'Lỗi' });
    }
};

const getStatisticsByYear = async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentYear = new Date(now.getFullYear(), 0, 1); // Bắt đầu năm hiện tại
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1); // Bắt đầu năm trước
        const endOfLastYear = new Date(now.getFullYear(), 0, 1); // Kết thúc năm trước

        // Tính tổng số lượng từng thực thể trong năm hiện tại và năm trước
        const userCountCurrent = await User.countDocuments({ createdAt: { $gte: startOfCurrentYear } });
        const userCountLast = await User.countDocuments({ createdAt: { $gte: startOfLastYear, $lt: endOfLastYear } });
        const productCountCurrent = await Product.countDocuments({ createdAt: { $gte: startOfCurrentYear } });
        const productCountLast = await Product.countDocuments({
            createdAt: { $gte: startOfLastYear, $lt: endOfLastYear },
        });
        const orderCountCurrent = await Order.countDocuments({ createdAt: { $gte: startOfCurrentYear } });
        const orderCountLast = await Order.countDocuments({
            createdAt: { $gte: startOfLastYear, $lt: endOfLastYear },
        });
        const populateOrders = await Order.find({ createdAt: { $gte: startOfCurrentYear } })
            .populate('orderBy') // Thay đổi đây tùy thuộc vào mối quan hệ của bạn
            .populate('products.product'); // Nếu sản phẩm cũng cần được populate

        const publisherCountCurrent = await Publisher.countDocuments({ createdAt: { $gte: startOfCurrentYear } });
        const publisherCountLast = await Publisher.countDocuments({
            createdAt: { $gte: startOfLastYear, $lt: endOfLastYear },
        });

        const calculateGrowthRate = (current, last) =>
            current + last > 0 ? ((current - last) / (current + last)) * 100 : 0;

        return res.status(200).json({
            success: true,
            users: {
                title: 'Người dùng',
                count: userCountCurrent,
                growthRate: calculateGrowthRate(userCountCurrent, userCountLast),
            },
            products: {
                title: 'Sản phẩm',
                count: productCountCurrent,
                growthRate: calculateGrowthRate(productCountCurrent, productCountLast),
            },
            orders: {
                title: 'Đơn mượn',
                count: orderCountCurrent,
                populateOrders,
                growthRate: calculateGrowthRate(orderCountCurrent, orderCountLast),
            },
            publishers: {
                title: 'Nhà xuất bản',
                count: publisherCountCurrent,
                growthRate: calculateGrowthRate(publisherCountCurrent, publisherCountLast),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message + 'Lỗi' });
    }
};

const getUserStatisticsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Chuyển đổi ngày từ chuỗi sang đối tượng Date
        // Nếu không có startDate, sử dụng mặc định là 30 ngày trước
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        // Nếu không có endDate, sử dụng mặc định là ngày hiện tại
        const end = endDate ? new Date(endDate) : new Date();

        // Tổng số user trong khoảng thời gian
        const totalUsers = await User.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        // Số lượng user mới trong khoảng thời gian
        const newUsers = await User.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        // Tính toán tỷ lệ tăng trưởng nếu cần
        const growthRate = newUsers > 0 ? (newUsers / totalUsers) * 100 : 0;

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            totalUsers,
            newUsers,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getProductStatisticsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Nếu không có startDate, sử dụng mặc định là 30 ngày trước
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        // Nếu không có endDate, sử dụng mặc định là ngày hiện tại
        const end = endDate ? new Date(endDate) : new Date();
        // Tổng số sản phẩm trong khoảng thời gian
        const totalProducts = await Product.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        // Số lượng sản phẩm mới trong khoảng thời gian
        const newProducts = await Product.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        const growthRate = newProducts > 0 ? (newProducts / totalProducts) * 100 : 0;

        return res.status(200).json({
            success: true,
            totalProducts,
            newProducts,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getOrderStatisticsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Thiết lập thời gian mặc định nếu không có từ người dùng
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = endDate ? new Date(endDate) : new Date();

        // Tổng số đơn hàng trong khoảng thời gian
        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        // Thiết lập thời gian cho khoảng thời gian trước đó
        const startPrevious = new Date(start);
        startPrevious.setMonth(startPrevious.getMonth() - 1); // Lấy 1 tháng trước
        const endPrevious = new Date(end);
        endPrevious.setMonth(endPrevious.getMonth() - 1); // Lấy 1 tháng trước

        // Số lượng đơn hàng trong khoảng thời gian trước
        const totalOrdersPrevious = await Order.countDocuments({
            createdAt: { $gte: startPrevious, $lt: endPrevious },
        });

        // Tính tỷ lệ tăng trưởng
        const growthRate =
            totalOrdersPrevious > 0 ? ((totalOrders - totalOrdersPrevious) / totalOrdersPrevious) * 100 : 0;

        // Lấy ra danh sách đơn hàng trong khoảng thời gian
        const newOrders = await Order.find({
            createdAt: { $gte: start, $lt: end },
        })
            .populate('orderBy') // Thay 'customer' bằng trường bạn muốn populate
            .exec();

        return res.status(200).json({
            success: true,
            totalOrders,
            newOrders,
            growthRate,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPublisherStatisticsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        // Nếu không có startDate, sử dụng mặc định là 30 ngày trước
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        // Nếu không có endDate, sử dụng mặc định là ngày hiện tại
        const end = endDate ? new Date(endDate) : new Date();

        // Tổng số nhà xuất bản trong khoảng thời gian
        const totalPublishers = await Publisher.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        // Số lượng nhà xuất bản mới trong khoảng thời gian
        const newPublishers = await Publisher.countDocuments({
            createdAt: { $gte: start, $lt: end },
        });

        const growthRate = newPublishers > 0 ? (newPublishers / totalPublishers) * 100 : 0;
        return res.status(200).json({
            success: true,
            totalPublishers,
            newPublishers,
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
    getStatisticsByMonth,
    getStatisticsByYear,
    getUserStatisticsByDateRange,
    getProductStatisticsByDateRange,
    getOrderStatisticsByDateRange,
    getPublisherStatisticsByDateRange,
};
