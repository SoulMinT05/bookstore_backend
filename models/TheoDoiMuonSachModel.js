const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        orderBy: {
            type: mongoose.Types.ObjectId,
            ref: 'DocGia',
            // required: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Product',
                },
                count: Number,
            },
        ],
        // coupon: {
        //     type: mongoose.Types.ObjectId,
        //     ref: 'Coupon',
        // },
        address: {
            type: String,
            // required: true,
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: true,
            default: function () {
                return new Date(this.startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            },
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed'],
            default: 'pending',
        },
        quantity: {
            type: Number,
            // required: true,
        },
    },
    {
        // _id: false,
        timestamps: true,
    },
);

const Order = mongoose.model('TheoDoiMuonSach', orderSchema);

module.exports = Order;
