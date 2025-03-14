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
        DiaChi: {
            type: String,
            // required: true,
        },
        daysToBorrow: {
            type: Number, // Số ngày mượn sách, admin có thể CRUD
            enum: [7, 14, 21, 30, 60], // Các giá trị mà admin có thể chọn
            required: true,
        },
        NgayTao: {
            type: Date,
            default: Date.now,
        },
        NgayMuon: {
            type: Date,
            required: true,
        },
        NgayTra: {
            type: Date,
            required: true,
            default: function () {
                return this.NgayMuon
                    ? new Date(this.NgayMuon.getTime() + this.daysToBorrow * 24 * 60 * 60 * 1000)
                    : null;
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
