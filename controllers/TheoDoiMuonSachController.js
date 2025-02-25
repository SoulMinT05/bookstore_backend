const Order = require('../models/TheoDoiMuonSachModel');
const Product = require('../models/SachModel');
const NhanVien = require('../models/NhanVienModel');
const DocGia = require('../models/DocGiaModel');
const asyncHandler = require('express-async-handler');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');

const createOrder = asyncHandler(async (req, res) => {
    const { orderedProductIds, NgayMuon, daysToBorrow } = req.body;
    const currentUser = req.user._id;

    // Kiểm tra nếu NgayMuon cách ngày hiện tại ít nhất 5 ngày
    const currentDate = new Date();
    const minimumDate = new Date(currentDate.setDate(currentDate.getDate() + 6));

    if (!daysToBorrow) {
        return res.status(400).json({
            success: false,
            message: 'Cần nhập số ngày mượn.',
        });
    }

    if (new Date(NgayMuon) < minimumDate) {
        return res.status(400).json({
            success: false,
            message: 'Ngày mượn phải cách ngày hiện tại ít nhất 7 ngày.',
        });
    }

    // Lấy thông tin người dùng từ database
    const user = await DocGia.findById(currentUser)
        .select('Ho Ten email DiaChi cart')
        .populate('cart.product', 'HinhAnhSach TenSach DonGia');

    // Kiểm tra nếu người dùng chưa có thông tin cá nhân cần thiết
    if (!user.Ho || !user.Ten || !user.email) {
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

    const NgayTra = new Date(new Date(NgayMuon).getTime() + daysToBorrow * 24 * 60 * 60 * 1000);
    console.log('12');
    // Tạo đơn hàng mới
    const newOrder = await Order.create({
        MaSach: productsToOrder,
        SoQuyen: totalQuantity,
        MaDocGia: currentUser,
        // NgayMuon: parsedNgayMuon,
        NgayMuon,
        NgayTra,
        daysToBorrow,
    });

    console.log('newOrder: ', newOrder);

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

    // **Gửi email xác nhận đơn hàng**
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    const formattedSendRequestDate = new Date(newOrder.NgayTao).toLocaleDateString('vi-VN');
    const formattedStartDate = new Date(newOrder.NgayMuon).toLocaleDateString('vi-VN');
    const formattedEndDate = new Date(newOrder.NgayTra).toLocaleDateString('vi-VN');

    // Tạo nội dung email
    const mailOptions = {
        from: '"SoulBook" <no-reply@soulbook.com>', //
        to: user.email,
        subject: 'Xác nhận yêu cầu mượn sách tại SoulBook',
        html: `
            <h2>Xin chào ${user.Ho} ${user.Ten},</h2>
            <p>Bạn đã gửi yêu cầu mượn sách thành công. Dưới đây là chi tiết đơn hàng của bạn:</p>
            <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th style="text-align: left;">Hình ảnh</th>
                    <th style="text-align: left;">Tên sách</th>
                    <th style="text-align: left;">Số lượng</th>
                    <th style="text-align: left;">Giá</th>
                </tr>
            </thead>
            <tbody>
                ${productsToOrder
                    .map(
                        (item) =>
                            `
                    <tr>
                        <td>
                            <img src="${item.product.HinhAnhSach[0]}" alt="${item.product.TenSach}" width="80">
                        </td>
                        <td>${item.product.TenSach}</td>
                        <td>${item.count}</td>
                        <td>${item.product.DonGia.toLocaleString()} VND</td>
                    </tr>
                `,
                    )
                    .join('')}
            </tbody>
        </table>
            <p><strong>Tổng số lượng:</strong> ${totalQuantity}</p>
            <p><strong>Ngày gửi yêu cầu mượn:</strong> ${formattedSendRequestDate}</p>
            <p><strong>Ngày bắt đầu mượn:</strong> ${formattedStartDate}</p>
            <p><strong>Ngày hết hạn:</strong> ${formattedEndDate}</p>
            <p><strong>Trạng thái:</strong> Đang xử lý</p>
            <p><i>Đơn hàng sẽ được duyệt trong 3 ngày không tính ngày cuối tuần. Sau đó, bạn có thể nhận sách ở quầy.</p>
            <p><i>Lưu ý ngày hết hạn để trả sách đúng hạn.</p>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        `,
    };

    // Gửi email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Lỗi gửi email:', error);
        } else {
            console.log('Email đã được gửi:', info.response);
        }
    });

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

    const updatedOrder = await Order.findById(orderId)
        .populate({
            path: 'MaDocGia', // Populate thông tin người đặt hàng
            select: 'Ho Ten DiaChi email', // Chỉ lấy các trường name và email
        })
        .populate({
            path: 'MaSach.product', // Populate thông tin sản phẩm trong đơn hàng
            select: 'TenSach HinhAnhSach SoQuyen', // Chỉ lấy các trường name, HinhAnhSach, và SoQuyen
        });

    if (!updatedOrder) {
        return res.status(404).json({
            success: false,
            message: 'Đơn hàng không tồn tại',
        });
    }

    if (updatedOrder.TinhTrang === 'cancel') {
        return res.status(400).json({
            success: false,
            message: 'Không thể thay đổi trạng thái vì đã huỷ đơn',
        });
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            TinhTrang,
            // NgayBatDauMuon: updatedOrder.NgayBatDauMuon,
            // NgayTra: updatedOrder.NgayTra,
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

    // **Gửi email xác nhận đơn hàng**
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    console.log('updatedOrder: ', updatedOrder);
    console.log('order: ', order);

    const formattedSendRequestDate = new Date(updatedOrder.NgayTao).toLocaleDateString('vi-VN');
    const formattedStartDate = new Date(updatedOrder.NgayMuon).toLocaleDateString('vi-VN');
    const formattedEndDate = new Date(updatedOrder.NgayTra).toLocaleDateString('vi-VN');

    // Tạo nội dung email
    // const mailOptions = {
    //     from: '"SoulBook" <no-reply@soulbook.com>', //
    //     to: updatedOrder.MaDocGia.email,
    //     subject: 'Xác nhận lại yêu cầu mượn sách tại SoulBook',
    //     html: `
    //         <h2>Xin chào ${updatedOrder.MaDocGia.Ho} ${updatedOrder.MaDocGia.Ten},</h2>
    //         <p>Bạn đã gửi yêu cầu mượn sách thành công. Dưới đây là chi tiết đơn hàng của bạn:</p>
    //         <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    //         <thead>
    //             <tr>
    //                 <th style="text-align: left;">Hình ảnh</th>
    //                 <th style="text-align: left;">Tên sách</th>
    //                 <th style="text-align: left;">Số lượng</th>
    //                 <th style="text-align: left;">Giá</th>
    //             </tr>
    //         </thead>
    //         <tbody>
    //             ${updatedOrder
    //                 .map(
    //                     (item) =>
    //                         `
    //                 <tr>
    //                     <td>
    //                         <img src="${item.product.HinhAnhSach[0]}" alt="${item.product.TenSach}" width="80">
    //                     </td>
    //                     <td>${item.product.TenSach}</td>
    //                     <td>${item.count}</td>
    //                     <td>${item.product.DonGia.toLocaleString()} VND</td>
    //                 </tr>
    //             `,
    //                 )
    //                 .join('')}
    //         </tbody>
    //     </table>
    //         <p><strong>Tổng số lượng:</strong> ${totalQuantity}</p>
    //         <p><strong>Ngày gửi yêu cầu mượn:</strong> ${formattedSendRequestDate}</p>
    //         <p><strong>Ngày bắt đầu mượn:</strong> ${formattedStartDate}</p>
    //         <p><strong>Ngày hết hạn:</strong> ${formattedEndDate}</p>
    //         <p><strong>Trạng thái:</strong> Đang xử lý</p>
    //         <p><i>Đơn hàng sẽ được duyệt trong 3 ngày không tính ngày cuối tuần. Sau đó, bạn có thể nhận sách ở quầy.</p>
    //         <p><i>Lưu ý ngày hết hạn để trả sách đúng hạn.</p>
    //         <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    //     `,
    // };

    // // Gửi email
    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.error('Lỗi gửi email:', error);
    //     } else {
    //         console.log('Email đã được gửi:', info.response);
    //     }
    // });

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
