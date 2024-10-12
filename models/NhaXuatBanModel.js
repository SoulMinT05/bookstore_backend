const mongoose = require('mongoose');

const PublisherSchema = new mongoose.Schema(
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

const Publisher = mongoose.model('NHAXUATBAN', PublisherSchema);

module.exports = Publisher;
