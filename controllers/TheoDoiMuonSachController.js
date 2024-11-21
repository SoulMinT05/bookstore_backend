const Order = require('../models/TheoDoiMuonSachModel');
const Product = require('../models/SachModel');
const NhanVien = require('../models/NhanVienModel');
const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');
const moment = require('moment-timezone');

const createOrder = asyncHandler(async (req, res) => {
    const { orderedProductIds, startDate } = req.body;
    const currentUser = req.user._id;

    // Lấy thông tin người dùng từ database
    const user = await DocGia.findById(currentUser)
        .select('Ho Ten email DiaChi cart')
        .populate('cart.product', 'HinhAnhSach TenSach DonGia');

    // Kiểm tra nếu người dùng chưa có thông tin cá nhân cần thiết
    if (!user.Ho || !user.Ten || !user.email || !user.DiaChi) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập đầy đủ thông tin cá nhân trước khi đặt hàng.',
        });
    }

    // Kiểm tra nếu giỏ hàng trống
    if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.',
        });
    }

    // Xử lý ngày bắt đầu (startDate)
    // let parsedStartDate = startDate
    //     ? moment(startDate).tz('Asia/Ho_Chi_Minh', true).startOf('day').toDate()
    //     : moment.tz('Asia/Ho_Chi_Minh').startOf('day').toDate();

    // if (!parsedStartDate) {
    //     return res.status(400).json({
    //         success: false,
    //         message: 'Ngày đặt hàng không hợp lệ.',
    //     });
    // }

    // Lấy danh sách sản phẩm từ giỏ hàng
    const products = user.cart.map((item) => ({
        product: item.product,
        count: item.quantityCart,
    }));
    console.log('products: ', products);

    // Lọc ra những sản phẩm được đặt hàng từ giỏ hàng
    const productsToOrder = products.filter((item) => orderedProductIds.includes(item.product._id.toString()));
    console.log('productsToOrder: ', productsToOrder);
    if (productsToOrder.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Không tìm thấy sản phẩm nào trong giỏ hàng để đặt hàng.',
        });
    }

    const totalQuantity = productsToOrder.reduce((acc, current) => acc + current.count, 0);
    console.log('totalQuantity: ', totalQuantity);

    // Tạo đơn hàng mới
    const newOrder = await Order.create({
        products: productsToOrder,
        SoQuyen: totalQuantity,
        orderBy: currentUser,
        // startDate: parsedStartDate,
        startDate,
    });

    // Lưu đơn hàng
    await newOrder.save();

    // Xóa các sản phẩm đã được order khỏi giỏ hàng của user
    const updatedCart = user.cart.filter((item) => !orderedProductIds.includes(item.product._id.toString()));
    await DocGia.findByIdAndUpdate(currentUser, { cart: updatedCart });

    // Trừ số lượng sản phẩm đã order trong ProductModel
    const bulkOperations = productsToOrder.map((item) => ({
        updateOne: {
            filter: { _id: item.product },
            update: { $inc: { SoQuyen: -item.count } },
        },
    }));
    await Product.bulkWrite(bulkOperations);

    return res.status(200).json({
        success: true,
        message: 'Tạo đơn hàng thành công.',
        newOrder,
    });
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate({
            path: 'orderBy', // Populate thông tin của orderBy
            select: 'Ho Ten DiaChi email', // Chỉ lấy trường name của user
        })
        .populate({
            path: 'products.product', // Populate thông tin của từng sản phẩm trong mảng products
            select: 'TenSach HinhAnhSach', // Lấy các trường name và HinhAnhSach của sản phẩm
        });
    return res.status(200).json({
        success: orders ? true : false,
        orders: orders ? orders : 'Get orders failed',
    });
});

const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const orders = await Order.findById(orderId)
        .populate({
            path: 'orderBy', // Populate thông tin của orderBy
            select: 'Ho Ten DiaChi email', // Chỉ lấy trường name của user
        })
        .populate({
            path: 'products.product', // Populate thông tin của từng sản phẩm trong mảng products
            select: 'TenSach HinhAnhSach SoQuyen', // Lấy các trường name và HinhAnhSach của sản phẩm
        });
    return res.status(200).json({
        success: orders ? true : false,
        orders: orders ? orders : 'Get orders failed',
    });
});

const getUserOrderFromUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const order = await Order.find({ orderBy: _id }).populate('products.product');
    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Get order user failed',
    });
});

const updateStatusOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) throw new Error('Missing input status order');

    const cancelOrder = await Order.findById(orderId)
        .populate({
            path: 'orderBy', // Populate thông tin người đặt hàng
            select: 'Ho Ten DiaChi email', // Chỉ lấy các trường name và email
        })
        .populate({
            path: 'products.product', // Populate thông tin sản phẩm trong đơn hàng
            select: 'TenSach HinhAnhSach SoQuyen', // Chỉ lấy các trường name, HinhAnhSach, và SoQuyen
        });

    if (!cancelOrder) {
        return res.status(404).json({
            success: false,
            message: 'Đơn hàng không tồn tại',
        });
    }

    if (cancelOrder.status === 'cancel') {
        return res.status(400).json({
            success: false,
            message: 'Không thể thay đổi trạng thái vì đã huỷ đơn',
        });
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            status,
        },
        {
            new: true,
        },
    )
        .populate({
            path: 'orderBy', // Populate lại thông tin người đặt hàng
            select: 'Ho Ten DiaChi email',
        })
        .populate({
            path: 'products.product', // Populate lại thông tin sản phẩm
            select: 'TenSach HinhAnhSach SoQuyen',
        });
    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Update status order failed',
    });
});

const cancelOrderFromUser = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) throw new Error('Order ID is invalid');
    const order = await Order.findById(orderId)
        .populate({
            path: 'orderBy', // Populate thông tin của người đặt hàng
            select: 'Ho Ten DiaChi email', // Chỉ lấy các trường name và email
        })
        .populate({
            path: 'products.product', // Populate thông tin sản phẩm trong đơn hàng
            select: 'TenSach HinhAnhSach SoQuyen', // Chỉ lấy các trường name, HinhAnhSach, và SoQuyen
        });

    if (order.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: 'Không thể huỷ bỏ đơn',
        });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'cancel',
        },
        {
            new: true,
        },
    )
        .populate({
            path: 'orderBy', // Populate lại thông tin người đặt hàng
            select: 'Ho Ten DiaChi email',
        })
        .populate({
            path: 'products.product', // Populate lại thông tin sản phẩm
            select: 'TenSach HinhAnhSach SoQuyen',
        });
    return res.status(200).json({
        success: updatedOrder ? true : false,
        message: 'Huỷ đơn thành công',
        updatedOrder,
    });
});

const deleteOrder = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    return res.status(200).json({
        success: order ? true : false,
        deletedOrder: order ? order : 'Delete order failed',
    });
});

module.exports = {
    createOrder,
    getAllOrders,
    getUserOrderFromUser,
    getOrderDetails,
    updateStatusOrder,
    // cancelOrderFromAdmin,
    cancelOrderFromUser,
    deleteOrder,
};
