const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const ProductSchema = new mongoose.Schema(
    {
        TenSach: {
            type: String,
            required: true,
            trim: true,
        },
        TacGia: {
            type: String,
            required: true,
        },
        DonGia: {
            type: Number,
            required: true,
        },
        SoQuyen: {
            type: Number,
            default: 0,
            required: true,
        },
        NamXuatBan: {
            type: String,
            required: false,
        },

        // brand: {
        //     type: String,
        //     required: true,
        // },
        MaNXB: {
            type: mongoose.Types.ObjectId,
            ref: 'NhaXuatBan',
            // required: true,
        },
        // add further than
        HinhAnhSach: { type: [String], default: [] },
        description: {
            type: String,
            // required: true,
        },
        slug: {
            type: String,
            // required: true,
            unique: true,
            lowercase: true,
        },
        borrowed: {
            type: Number,
            default: 0,
        },
        // color: {
        //     type: String,
        //     enum: ['Black', 'Blue', 'Green'],
        // },
        ratings: [
            {
                star: { type: Number },
                postedBy: {
                    type: mongoose.Types.ObjectId,
                    ref: 'DocGia',
                },
                comment: { type: String },
            },
        ],
        totalRatings: {
            type: Number,
            default: 0,
        },
    },
    {
        // _id: false,
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Product', ProductSchema);
