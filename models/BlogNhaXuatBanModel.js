const mongoose = require('mongoose');

const BlogPublisherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        DiaChi: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('BlogNhaXuatBan', BlogPublisherSchema);
