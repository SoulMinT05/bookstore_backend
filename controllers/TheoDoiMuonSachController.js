const Order = require('../models/TheoDoiMuonSachModel');
const Book = require('../models/SachModel');
const NhanVien = require('../models/NhanVienModel');
const asyncHandler = require('express-async-handler');

const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const userCart = await NhanVien.findById(_id).select('cart').populate('cart.product', 'name price'); // --> product
    // cart: [
    //     {
    //       product: [Object],
    //       quantityCart: 18,
    //       _id: new ObjectId('66c98f4e3332ec89d8296591')
    //     }
    //   ]

    const products = userCart?.cart?.map((item) => ({
        product: item.product._id,
        count: item.quantityCart,
    }));
    //products:  [ { product: new ObjectId('66c1b9fd03d81e939cced631'), count: 18 } ]
    console.log('userCart: ', userCart);
    console.log('products: ', products);

    const totalQuantity = products.reduce((accumulator, current) => accumulator + current.count, 0);

    // const quantityAfterOrder = products.map((product) => {
    //     const cartItem = userCart.cart.find((item) => item.product.equals(product.product));
    //     if (cartItem) {
    //         return { ...product, count: product.count - cartItem.count };
    //     }
    //     return product;
    // });

    const newOrder = await Order.create({ products, quantity: totalQuantity, orderBy: _id });
    await newOrder.save();
    console.log('newOrder: ', newOrder);
    return res.status(200).json({
        success: newOrder ? true : false,
        newOrder: newOrder ? newOrder : 'Create newOrder failed',
    });
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find();
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

const cancelOrder = asyncHandler(async (req, res) => {
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
        order: order ? order : 'Cancel order failed',
    });
});

module.exports = {
    createOrder,
    getAllOrders,
    getUserOrderFromUser,
    updateStatusOrder,
    cancelOrder,
};
