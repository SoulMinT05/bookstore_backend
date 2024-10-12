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
        likes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'DocGia',
            },
        ],
        dislikes: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'DocGia',
            },
        ],
        image: {
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
