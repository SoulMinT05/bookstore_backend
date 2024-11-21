const User = require('../models/NhanVienModel');
const Product = require('../models/SachModel');
const Publisher = require('../models/NhaXuatBanModel');
const Order = require('../models/TheoDoiMuonSachModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const getStatisticsByWeek = async (req, res) => {
    try {
        const now = new Date();
        const weekCount = 4; // Số tuần để bao gồm trong báo cáo
        const statisticsWeek = []; // Mảng để lưu trữ thống kê theo tuần

        // Hàm tính tỷ lệ tăng trưởng
        const calculateGrowthRate = (current, last) =>
            current + last > 0 ? ((current - last) / (current + last)) * 100 : 0;

        // Lấy tuần hiện tại (từ 4/11 đến 10/11)
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1); // Ngày đầu tuần (Thứ Hai)
        const endOfWeek = new Date(now.getFullYear(), now.getMonth(), startOfWeek.getDate() + 6); // Ngày cuối tuần (Chủ Nhật)

        for (let i = 0; i < weekCount; i++) {
            // Tính toán các mốc thời gian cho tuần hiện tại và tuần trước đó
            const currentStartOfWeek = new Date(startOfWeek);
            const currentEndOfWeek = new Date(endOfWeek);
            const previousStartOfWeek = new Date(startOfWeek);
            const previousEndOfWeek = new Date(endOfWeek);

            // Nếu là tuần đầu tiên (hiện tại), sử dụng dữ liệu của tuần này
            if (i === 0) {
                // Lấy dữ liệu cho tuần hiện tại
                // (Bỏ qua logic tính toán trong mã gốc và thêm logic lấy dữ liệu ở đây)
            } else {
                // Thay thế tuần tiếp theo bằng dữ liệu tuần trước
                currentStartOfWeek.setDate(currentStartOfWeek.getDate() - 7 * i);
                currentEndOfWeek.setDate(currentEndOfWeek.getDate() - 7 * i);
            }

            // Lấy thống kê cho tuần
            const userCountCurrent = await User.countDocuments({
                createdAt: { $gte: currentStartOfWeek, $lt: currentEndOfWeek },
            });
            const productCountCurrent = await Product.countDocuments({
                createdAt: { $gte: currentStartOfWeek, $lt: currentEndOfWeek },
            });
            const orderCountCurrent = await Order.countDocuments({
                createdAt: { $gte: currentStartOfWeek, $lt: currentEndOfWeek },
            });
            const populateOrders = await Order.find({
                createdAt: { $gte: currentStartOfWeek, $lt: currentEndOfWeek },
            }).populate('MaDocGia');
            const publisherCountCurrent = await Publisher.countDocuments({
                createdAt: { $gte: currentStartOfWeek, $lt: currentEndOfWeek },
            });

            // Thay thế bằng dữ liệu trước đó cho các tuần sau
            statisticsWeek.push({
                week: `${currentStartOfWeek.toLocaleDateString('vi-VN')} - ${currentEndOfWeek.toLocaleDateString(
                    'vi-VN',
                )}`,
                users: {
                    title: 'Người dùng',
                    count: userCountCurrent,
                    growthRate: calculateGrowthRate(userCountCurrent, 0), // Sử dụng 0 cho tuần trước nếu không có dữ liệu
                },
                products: {
                    title: 'Sản phẩm',
                    count: productCountCurrent,
                    growthRate: calculateGrowthRate(productCountCurrent, 0),
                },
                orders: {
                    title: 'Đơn mượn',
                    count: orderCountCurrent,
                    growthRate: calculateGrowthRate(orderCountCurrent, 0),
                    populateOrders,
                },
                publishers: {
                    title: 'Nhà xuất bản',
                    count: publisherCountCurrent,
                    growthRate: calculateGrowthRate(publisherCountCurrent, 0),
                },
            });
        }

        return res.status(200).json({
            success: true,
            statisticsWeek,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message + ' Lỗi' });
    }
};

const getStatisticsByMonth = async (req, res) => {
    try {
        const now = new Date();
        const monthCount = 12; // Number of months to include in the report
        const statisticsMonth = []; // Array to store statisticsMonth for each month

        // Function to calculate growth rate
        const calculateGrowthRate = (current, last) =>
            current + last > 0 ? ((current - last) / (current + last)) * 100 : 0;

        // Loop through each month and retrieve statisticsMonth
        for (let i = 0; i < monthCount; i++) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const previousStartOfMonth = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
            const previousEndOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);

            // Get counts for the current and previous month
            const userCountCurrent = await User.countDocuments({ createdAt: { $gte: startOfMonth, $lt: endOfMonth } });
            const userCountLast = await User.countDocuments({
                createdAt: { $gte: previousStartOfMonth, $lt: previousEndOfMonth },
            });

            const productCountCurrent = await Product.countDocuments({
                createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            });
            const productCountLast = await Product.countDocuments({
                createdAt: { $gte: previousStartOfMonth, $lt: previousEndOfMonth },
            });

            const orderCountCurrent = await Order.countDocuments({
                createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            });
            const orderCountLast = await Order.countDocuments({
                createdAt: { $gte: previousStartOfMonth, $lt: previousEndOfMonth },
            });
            const populateOrders = await Order.find({
                createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            }).populate('MaDocGia');

            const publisherCountCurrent = await Publisher.countDocuments({
                createdAt: { $gte: startOfMonth, $lt: endOfMonth },
            });
            const publisherCountLast = await Publisher.countDocuments({
                createdAt: { $gte: previousStartOfMonth, $lt: previousEndOfMonth },
            });

            // Store statisticsMonth with growth rates
            statisticsMonth.push({
                month: startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' }), // e.g., "October 2024"
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
                    growthRate: calculateGrowthRate(orderCountCurrent, orderCountLast),
                    populateOrders,
                },
                publishers: {
                    title: 'Nhà xuất bản',
                    count: publisherCountCurrent,
                    growthRate: calculateGrowthRate(publisherCountCurrent, publisherCountLast),
                },
            });
        }

        return res.status(200).json({
            success: true,
            statisticsMonth,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message + ' Lỗi' });
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
            .populate('MaDocGia') // Thay đổi đây tùy thuộc vào mối quan hệ của bạn
            .populate('MaSach.product'); // Nếu sản phẩm cũng cần được populate

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
        const { NgayMuon, NgayTra } = req.query;

        // Chuyển đổi ngày từ chuỗi sang đối tượng Date
        // Nếu không có NgayMuon, sử dụng mặc định là 30 ngày trước
        const start = NgayMuon ? new Date(NgayMuon) : new Date(new Date().setDate(new Date().getDate() - 30));
        // Nếu không có NgayTra, sử dụng mặc định là ngày hiện tại
        const end = NgayTra ? new Date(NgayTra) : new Date();

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
        const { NgayMuon, NgayTra } = req.query;
        // Nếu không có NgayMuon, sử dụng mặc định là 30 ngày trước
        const start = NgayMuon ? new Date(NgayMuon) : new Date(new Date().setDate(new Date().getDate() - 30));
        // Nếu không có NgayTra, sử dụng mặc định là ngày hiện tại
        const end = NgayTra ? new Date(NgayTra) : new Date();
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
        const { NgayMuon, NgayTra } = req.query;

        // Thiết lập thời gian mặc định nếu không có từ người dùng
        const start = NgayMuon ? new Date(NgayMuon) : new Date(new Date().setDate(new Date().getDate() - 30));
        const end = NgayTra ? new Date(NgayTra) : new Date();

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
            .populate('MaDocGia') // Thay 'customer' bằng trường bạn muốn populate
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
        const { NgayMuon, NgayTra } = req.query;
        // Nếu không có NgayMuon, sử dụng mặc định là 30 ngày trước
        const start = NgayMuon ? new Date(NgayMuon) : new Date(new Date().setDate(new Date().getDate() - 30));
        // Nếu không có NgayTra, sử dụng mặc định là ngày hiện tại
        const end = NgayTra ? new Date(NgayTra) : new Date();

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
    getStatisticsByWeek,
    getStatisticsByMonth,
    getStatisticsByYear,
    getUserStatisticsByDateRange,
    getProductStatisticsByDateRange,
    getOrderStatisticsByDateRange,
    getPublisherStatisticsByDateRange,
};
