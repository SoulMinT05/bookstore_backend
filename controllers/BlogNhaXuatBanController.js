const BlogPublisher = require('../models/BlogNhaXuatBanModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createBlogPublisher = asyncHandler(async (req, res) => {
    const blogPublisher = await BlogPublisher.create(req.body);
    return res.status(200).json({
        success: blogPublisher ? true : false,
        blogPublisher: blogPublisher ? blogPublisher : 'Create blogPublisher failed',
    });
});

const getAllBlogPublishers = asyncHandler(async (req, res) => {
    const blogPublishers = await BlogPublisher.find();
    return res.status(200).json({
        success: blogPublishers ? true : false,
        blogPublishers: blogPublishers ? blogPublishers : 'Get all blogPublishers failed',
    });
});

const updateBlogPublisher = asyncHandler(async (req, res) => {
    const { blogPublisherId } = req.params;
    const blogPublisher = await BlogPublisher.findByIdAndUpdate(blogPublisherId, req.body, {
        new: true,
    });
    return res.status(200).json({
        success: blogPublisher ? true : false,
        blogPublisher: blogPublisher ? blogPublisher : 'Update blogPublisher failed',
    });
});

const deleteBlogPublisher = asyncHandler(async (req, res) => {
    const { blogPublisherId } = req.params;
    const blogPublisher = await BlogPublisher.findByIdAndDelete(blogPublisherId);
    console.log('blogPublisher: ', blogPublisher);
    return res.status(200).json({
        success: blogPublisher ? true : false,
        blogPublisher: blogPublisher ? blogPublisher : 'Delete blogPublisher failed',
    });
});

module.exports = {
    createBlogPublisher,
    getAllBlogPublishers,
    updateBlogPublisher,
    deleteBlogPublisher,
};
