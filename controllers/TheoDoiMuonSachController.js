const Order = require('../models/TheoDoiMuonSachModel');
const Product = require('../models/SachModel');
const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');

const createOrder = asyncHandler(async (req, res) => {
    const currentUser = req.user._id;
    const userCart = await DocGia.findById(currentUser).select('cart').populate('cart.product', 'name price'); // --> product
    // cart: [
    //     {
    //       product: [Object],
    //       quantityCart: 18,
    //       currentUser: new ObjectId('66c98f4e3332ec89d8296591')
    //     }
    //   ]

    const products = userCart?.cart?.map((item) => ({
        product: item.product,
        count: item.quantityCart,
    }));

    const { orderedProductIds } = req.body; // Array chứa các productId của sản phẩm được order
    // Lọc ra những sản phẩm được đặt hàng từ giỏ hàng
    const productsToOrder = products.filter((item) => orderedProductIds.includes(item.product.toString()));

    // Tính tổng số lượng của các sản phẩm được đặt hàng
    const totalQuantity = productsToOrder.reduce((acc, current) => acc + current.count, 0);

    // Tạo đơn hàng mới
    const newOrder = await Order.create({ products: productsToOrder, quantity: totalQuantity, orderBy: currentUser });
    await newOrder.save();
    console.log('newOrder: ', newOrder);

    // Xóa các sản phẩm đã được order khỏi giỏ hàng của user
    const updatedCart = userCart.cart.filter((item) => !orderedProductIds.includes(item.product.toString()));
    await DocGia.findByIdAndUpdate(currentUser, { cart: updatedCart });

    // Trừ số lượng sản phẩm đã order trong ProductModel
    const bulkOperations = productsToOrder.map((item) => ({
        updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: -item.count } }, // Trừ đi số lượng
        },
    }));
    await Product.bulkWrite(bulkOperations);

    return res.status(200).json({
        success: newOrder ? true : false,
        newOrder: newOrder ? 'Create new order successfully' : 'Create newOrder failed',
    });
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate({
            path: 'orderBy', // Populate thông tin của orderBy
            select: 'firstName lastName address email', // Chỉ lấy trường name của user
        })
        .populate({
            path: 'products.product', // Populate thông tin của từng sản phẩm trong mảng products
            select: 'name images', // Lấy các trường name và images của sản phẩm
        });
    return res.status(200).json({
        success: orders ? true : false,
        orders: orders ? orders : 'Get orders failed',
    });
});

const getUserOrderFromUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const order = await Order.find({ orderBy: _id });
    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Get order user failed',
    });
});

const updateStatusOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    if (!status) throw new Error('Missing input status order');
    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            status,
        },
        {
            new: true,
        },
    );
    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Update status order failed',
    });
});

const cancelOrderFromAdmin = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) throw new Error('Order ID is invalid');

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'rejected',
        },
        {
            new: true,
        },
    );
    return res.status(200).json({
        success: order ? true : false,
        order: order ? 'Cancel order successfully' : 'Cancel order failed',
    });
});

const cancelOrderFromUser = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) throw new Error('Order ID is invalid');

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            status: 'rejected',
        },
        {
            new: true,
        },
    );
    return res.status(200).json({
        success: order ? true : false,
        order: order ? 'Cancel order successfully' : 'Cancel order failed',
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
    updateStatusOrder,
    cancelOrderFromAdmin,
    cancelOrderFromUser,
    deleteOrder,
};
