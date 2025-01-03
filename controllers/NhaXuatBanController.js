const NhaXuatBan = require('../models/NhaXuatBanModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createPublisher = asyncHandler(async (req, res) => {
    const publisher = await NhaXuatBan.create(req.body);
    return res.status(200).json({
        success: publisher ? true : false,
        newPublisher: publisher ? publisher : 'Create publisher failed',
    });
});

const getAllPublishers = asyncHandler(async (req, res) => {
    const publishers = await NhaXuatBan.find();
    return res.status(200).json({
        success: publishers ? true : false,
        publishers: publishers ? publishers : 'Get all publishers failed',
    });
});

const updatePublisher = asyncHandler(async (req, res) => {
    const { MaNXB } = req.params;
    const publisher = await NhaXuatBan.findByIdAndUpdate(MaNXB, req.body, {
        new: true,
    });
    return res.status(200).json({
        success: publisher ? true : false,
        updatedPublisher: publisher ? publisher : 'Update publisher failed',
    });
});

const deletePublisher = asyncHandler(async (req, res) => {
    const { MaNXB } = req.params;
    const publisher = await NhaXuatBan.findByIdAndDelete(MaNXB);
    return res.status(200).json({
        success: publisher ? true : false,
        publisher: publisher ? publisher : 'Delete publisher failed',
    });
});

module.exports = {
    createPublisher,
    getAllPublishers,
    updatePublisher,
    deletePublisher,
};
