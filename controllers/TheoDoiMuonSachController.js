const Order = require('../models/TheoDoiMuonSachModel');
const Product = require('../models/SachModel');
const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');
const moment = require('moment-timezone');

// const createOrder = asyncHandler(async (req, res) => {
//     const currentUser = req.user._id;
//     const { orderedProductIds } = req.body;
//     let { startDate } = req.body;

//     if (!startDate) {
//         startDate = moment.tz('Asia/Ho_Chi_Minh').startOf('day').toDate();
//         console.log('startDate: ', startDate);

//         // return res.status(400).json({
//         //     success: false,
//         //     message: 'Phải nhập ngày mượn sách',
//         // });
//     }

//     // let parsedStartDate = new Date(startDate);
//     let parsedStartDate = moment.tz(startDate, 'YYYY-MM-DD', 'Asia/Ho_Chi_Minh').startOf('day').toDate();
//     console.log('parsedStartDate: ', parsedStartDate);
//     if (!parsedStartDate) {
//         // Nếu startDate không hợp lệ (ví dụ không phải là ngày hợp lệ), trả về lỗi
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid start date format.',
//         });
//     }

//     // Đảm bảo thời gian của startDate là 00:00:00
//     // parsedStartDate.setHours(0, 0, 0, 0);

//     const userCart = await DocGia.findById(currentUser).select('cart').populate('cart.product', 'images name price'); // --> product
//     // cart: [
//     //     {
//     //       product: [Object],
//     //       quantityCart: 18,
//     //       currentUser: new ObjectId('66c98f4e3332ec89d8296591')
//     //     }
//     //   ]

//     if (!userCart || userCart.cart.length === 0) {
//         return res.status(400).json({
//             success: false,
//             message: 'Cần có sản phẩm trong giỏ hàng.',
//         });
//     }

//     const products = userCart?.cart?.map((item) => ({
//         product: item.product,
//         count: item.quantityCart,
//     }));

//     // Lọc ra những sản phẩm được đặt hàng từ giỏ hàng
//     const productsToOrder = products.filter((item) => orderedProductIds.includes(item.product.toString()));
//     console.log('productsToOrder: ', productsToOrder);
//     // if (productsToOrder.length === 0) {
//     //     return res.status(400).json({
//     //         success: false,
//     //         message: 'Chưa có sản phẩm nào trong giỏ.',
//     //     });
//     // }

//     // Tính tổng số lượng của các sản phẩm được đặt hàng
//     const totalQuantity = productsToOrder.reduce((acc, current) => acc + current.count, 0);

//     // Tạo đơn hàng mới
//     const newOrder = await Order.create({
//         products: productsToOrder,
//         quantity: totalQuantity,
//         orderBy: currentUser,
//         startDate: parsedStartDate,
//     });
//     await newOrder.save();
//     console.log('newOrder: ', newOrder);

//     // Xóa các sản phẩm đã được order khỏi giỏ hàng của user
//     const updatedCart = userCart.cart.filter((item) => !orderedProductIds.includes(item.product.toString()));
//     await DocGia.findByIdAndUpdate(currentUser, { cart: updatedCart });

//     // Trừ số lượng sản phẩm đã order trong ProductModel
//     const bulkOperations = productsToOrder.map((item) => ({
//         updateOne: {
//             filter: { _id: item.product },
//             update: { $inc: { quantity: -item.count } }, // Trừ đi số lượng
//         },
//     }));
//     await Product.bulkWrite(bulkOperations);

//     return res.status(200).json({
//         success: newOrder ? true : false,
//         message: 'Mượn sách thành công',
//         newOrder,
//     });
// });

const createOrder = asyncHandler(async (req, res) => {
    const { orderedProductIds, startDate } = req.body;
    const currentUser = req.user._id;

    // Lấy thông tin người dùng từ database
    const user = await DocGia.findById(currentUser)
        .select('firstName lastName email address cart')
        .populate('cart.product', 'images name price');

    // Kiểm tra nếu người dùng chưa có thông tin cá nhân cần thiết
    if (!user.firstName || !user.lastName || !user.email || !user.address) {
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
        quantity: totalQuantity,
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
            update: { $inc: { quantity: -item.count } },
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

const getOrderDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const orders = await Order.findById(orderId)
        .populate({
            path: 'orderBy', // Populate thông tin của orderBy
            select: 'firstName lastName address email', // Chỉ lấy trường name của user
        })
        .populate({
            path: 'products.product', // Populate thông tin của từng sản phẩm trong mảng products
            select: 'name images quantity', // Lấy các trường name và images của sản phẩm
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

    const cancelOrder = await Order.findById(orderId);

    if (cancelOrder.status === 'cancel') {
        return res.status(400).json({
            success: false,
            message: 'Không thể thay đổi vì người dùng huỷ đơn',
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
    );
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
            select: 'firstName lastName address email', // Chỉ lấy các trường name và email
        })
        .populate({
            path: 'products.product', // Populate thông tin sản phẩm trong đơn hàng
            select: 'name images quantity', // Chỉ lấy các trường name, images, và quantity
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
            select: 'firstName lastName address email',
        })
        .populate({
            path: 'products.product', // Populate lại thông tin sản phẩm
            select: 'name images quantity',
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
