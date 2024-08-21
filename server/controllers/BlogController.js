const Blog = require('../models/BlogModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createBlog = asyncHandler(async (req, res) => {
    const blog = await Blog.create(req.body);
    return res.status(200).json({
        success: blog ? true : false,
        blog: blog ? blog : 'Create blog failed',
    });
});

const getAllBlogs = asyncHandler(async (req, res) => {
    const blogs = await Blog.find();
    return res.status(200).json({
        success: blogs ? true : false,
        blogs: blogs ? blogs : 'Get all blogs failed',
    });
});

const updateBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const blog = await Blog.findByIdAndUpdate(blogId, req.body, {
        new: true,
    });
    return res.status(200).json({
        success: blog ? true : false,
        blog: blog ? blog : 'Update blog failed',
    });
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const blog = await Blog.findByIdAndDelete(blogId);
    return res.status(200).json({
        success: blog ? true : false,
        blog: blog ? blog : 'Delete blog failed',
    });
});

module.exports = {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog,
};
