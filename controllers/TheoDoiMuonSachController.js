const Order = require('../models/TheoDoiMuonSachModel');
const Product = require('../models/SachModel');
const NhanVien = require('../models/NhanVienModel');
const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');
const moment = require('moment-timezone');

const createOrder = asyncHandler(async (req, res) => {
    const { orderedProductIds, NgayMuon } = req.body;
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
        MaSach: productsToOrder,
        SoQuyen: totalQuantity,
        MaDocGia: currentUser,
        // NgayMuon: parsedNgayMuon,
        NgayMuon,
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
            path: 'MaDocGia',
            select: 'Ho Ten DiaChi email',
        })
        .populate({
            path: 'MaSach.product',
            select: 'TenSach HinhAnhSach',
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
            path: 'MaDocGia', // Populate thông tin của MaDocGia
            select: 'Ho Ten DiaChi email', // Chỉ lấy trường name của user
        })
        .populate({
            path: 'MaSach.product', // Populate thông tin của từng sản phẩm trong mảng products
            select: 'TenSach HinhAnhSach SoQuyen', // Lấy các trường name và HinhAnhSach của sản phẩm
        });
    return res.status(200).json({
        success: orders ? true : false,
        orders: orders ? orders : 'Get orders failed',
    });
});

const getUserOrderFromUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const order = await Order.find({ MaDocGia: _id }).populate('MaSach.product');
    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Get order user failed',
    });
});

const updateStatusOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { TinhTrang } = req.body;
    if (!TinhTrang) throw new Error('Missing input TinhTrang order');

    const cancelOrder = await Order.findById(orderId)
        .populate({
            path: 'MaDocGia', // Populate thông tin người đặt hàng
            select: 'Ho Ten DiaChi email', // Chỉ lấy các trường name và email
        })
        .populate({
            path: 'MaSach.product', // Populate thông tin sản phẩm trong đơn hàng
            select: 'TenSach HinhAnhSach SoQuyen', // Chỉ lấy các trường name, HinhAnhSach, và SoQuyen
        });

    if (!cancelOrder) {
        return res.status(404).json({
            success: false,
            message: 'Đơn hàng không tồn tại',
        });
    }

    if (cancelOrder.TinhTrang === 'cancel') {
        return res.status(400).json({
            success: false,
            message: 'Không thể thay đổi trạng thái vì đã huỷ đơn',
        });
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            TinhTrang,
        },
        {
            new: true,
        },
    )
        .populate({
            path: 'MaDocGia', // Populate lại thông tin người đặt hàng
            select: 'Ho Ten DiaChi email',
        })
        .populate({
            path: 'MaSach.product', // Populate lại thông tin sản phẩm
            select: 'TenSach HinhAnhSach SoQuyen',
        });
    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Update TinhTrang order failed',
    });
});

const cancelOrderFromUser = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) throw new Error('Order ID is invalid');
    const order = await Order.findById(orderId)
        .populate({
            path: 'MaDocGia', // Populate thông tin của người đặt hàng
            select: 'Ho Ten DiaChi email', // Chỉ lấy các trường name và email
        })
        .populate({
            path: 'MaSach.product', // Populate thông tin sản phẩm trong đơn hàng
            select: 'TenSach HinhAnhSach SoQuyen', // Chỉ lấy các trường name, HinhAnhSach, và SoQuyen
        });

    if (order.TinhTrang !== 'pending') {
        return res.status(400).json({
            success: false,
            message: 'Không thể huỷ bỏ đơn',
        });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            TinhTrang: 'cancel',
        },
        {
            new: true,
        },
    )
        .populate({
            path: 'MaDocGia', // Populate lại thông tin người đặt hàng
            select: 'Ho Ten DiaChi email',
        })
        .populate({
            path: 'MaSach.product', // Populate lại thông tin sản phẩm
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
