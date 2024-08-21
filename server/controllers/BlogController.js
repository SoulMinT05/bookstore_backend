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

// 1. Check if user disliked blog --> cancel disliked
// 2. Check if user liked blog --> cancel like, and insert like again
const likeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { blogId } = req.params;
    if (!blogId) throw new Error('Missing blog Id');
    const blog = await Blog.findById(blogId);
    const isLiked = blog?.likes.find((element) => element.toString() === _id);
    // 1. Check if user disliked blog
    const isDisliked = blog?.dislikes.find((element) => element.toString() === _id);
    if (isDisliked) {
        const response = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: _id },
                $push: { likes: _id },
            },
            { new: true },
        );
        return res.json({
            success: response ? true : false,
            response,
        });
    }
    // 2. Check if user liked blog
    if (isLiked) {
        const response = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: _id },
            },
            { new: true },
        );
        return res.json({
            success: response ? true : false,
            response,
        });
    } else {
        const response = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: _id },
            },
            { new: true },
        );
        return res.json({
            success: response ? true : false,
            response,
        });
    }
});

const dislikeBlog = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { blogId } = req.params;
    if (!blogId) throw new Error('Missing blog Id');
    const blog = await Blog.findById(blogId);
    const isDisLiked = blog?.dislikes.find((element) => element.toString() === _id);
    // 1. Check if user liked blog
    const isLiked = blog?.likes.find((element) => element.toString() === _id);
    if (isLiked) {
        const response = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: _id },
                $push: { dislikes: _id },
            },
            { new: true },
        );
        return res.json({
            success: response ? true : false,
            response,
        });
    }
    // 2. Check if user disliked blog

    if (isDisLiked) {
        const response = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: _id },
            },
            { new: true },
        );
        return res.json({
            success: response ? true : false,
            response,
        });
    } else {
        const response = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: _id },
            },
            { new: true },
        );
        return res.json({
            success: response ? true : false,
            response,
        });
    }
});

const excludedFields = 'firstName lastName email createdAt updatedAt';
const getDetailBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
            $inc: { numberViews: 1 },
        },
        { new: true },
    )
        .populate('likes', excludedFields)
        .populate('dislikes', excludedFields);
    return res.status(200).json({
        success: blog ? true : false,
        blog: blog ? blog : 'Get detail blog failed',
    });
});

module.exports = {
    createBlog,
    getAllBlogs,
    updateBlog,
    deleteBlog,
    likeBlog,
    dislikeBlog,
    getDetailBlog,
};
