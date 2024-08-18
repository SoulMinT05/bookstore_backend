const Sach = require('../models/SachModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res, next) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    if (req.body && req.body.name) {
        req.body.slug = slugify(req.body.name);
    }
    const newProduct = await Sach.create(req.body);
    return res.status(200).json({
        success: newProduct ? true : false,
        newProduct: newProduct ? newProduct : 'Create product failed',
    });
});

const getDetailProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Sach.findById(productId);
    return res.status(200).json({
        success: product ? true : false,
        product: product ? product : 'Get detail product failed',
    });
});

const getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await Sach.find();
    return res.status(200).json({
        success: products ? true : false,
        products: products ? products : 'Get all products failed',
    });
});

const updateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    if (req.body && req.body.name) req.body.slug = slugify(req.body.name);
    const product = await Sach.findByIdAndUpdate(productId, req.body, { new: true });
    return res.status(200).json({
        success: product ? true : false,
        product: product ? product : 'Update product failed',
    });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Sach.findByIdAndDelete(productId);
    return res.status(200).json({
        success: product ? true : false,
        product: product ? product : 'Delete product failed',
    });
});

module.exports = {
    createProduct,
    getDetailProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
};
