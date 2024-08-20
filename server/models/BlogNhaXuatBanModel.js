const mongoose = require('mongoose');

const BlogPublisherSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
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

const Publisher = mongoose.model('BlogNhaXuatBan', BlogPublisherSchema);

module.exports = Publisher;
