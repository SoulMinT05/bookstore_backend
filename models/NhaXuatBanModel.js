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

        // add further than
        // image: {
        //     type: String,
        //     required: false,
        // },
    },
    {
        timestamps: true,
    },
);

const Publisher = mongoose.model('NhaXuatBan', PublisherSchema);

module.exports = Publisher;
