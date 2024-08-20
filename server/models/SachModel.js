const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
            required: true,
        },
        yearOfPublication: {
            type: String,
            required: false,
        },
        images: { type: Array },
        brand: {
            type: String,
            required: true,
        },
        publisher: {
            type: mongoose.Types.ObjectId,
            ref: 'NhaXuatBan',
            // required: true,
        },
        description: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
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
                    ref: 'NhanVien',
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
