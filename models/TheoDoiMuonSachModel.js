const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        MaDocGia: {
            type: mongoose.Types.ObjectId,
            ref: 'DocGia',
            // required: true,
        },
        MaSach: [
            {
                product: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Sach',
                },
                count: Number,
            },
        ],
        // coupon: {
        //     type: mongoose.Types.ObjectId,
        //     ref: 'Coupon',
        // },
        DiaChi: {
            type: String,
            // required: true,
        },
        NgayMuon: {
            type: Date,
            required: true,
            default: Date.now,
        },
        NgayTra: {
            type: Date,
            required: true,
            default: function () {
                return new Date(this.NgayMuon.getTime() + 30 * 24 * 60 * 60 * 1000);
            },
        },
        TinhTrang: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'completed', 'cancel'],
            default: 'pending',
        },
        SoQuyen: {
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
