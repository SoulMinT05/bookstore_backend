const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        numberViews: {
            type: Number,
            default: 0,
        },
        isLiked: {
            type: Boolean,
            default: false,
        },
        isDisliked: {
            type: Boolean,
            default: false,
        },
        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'NhanVien',
            },
        ],
        dislikes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'NhanVien',
            },
        ],
        images: {
            type: String,
            default: 'https://wallpapers.com/images/hd/work-desk-blogging-backdrop-ij7yb6kjl1y3kmg1.jpg',
        },
        author: {
            type: String,
            default: 'Admin',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

module.exports = mongoose.model('Blog', BlogSchema);
