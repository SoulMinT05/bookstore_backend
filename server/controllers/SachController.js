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
    const queriesObj = { ...req.query };
    // Get field out of the query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((element) => delete queriesObj[element]);

    // Format for the correct syntax of mongoose
    let queryString = JSON.stringify(queriesObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const formattedQueries = JSON.parse(queryString);

    // Filtering --> Search by word, only have any one word --> search
    if (queriesObj?.name) {
        formattedQueries.name = {
            $regex: queriesObj.name,
            $options: 'i', // not distinguish between uppercase and lowercase words
        };
    }
    let queryCommand = Sach.find(formattedQueries); // no use await, it's pending status, when have request, it's still execute

    // Sorting --> abc def --> [abc,def] --> abc def
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
        console.log('sortBy: ', sortBy);
    }

    // Executing query

    // queryCommand.exec(async(err, response) => {
    //     if (err) throw new Error('err.message: ', err.message);
    //     // Number products that meet condition (counts) !== Number products returned once according to api (formattedQueries)
    //     const counts = await Sach.find(formattedQueries).countDocuments()
    //     return res.status(200).json({
    //         success: response ? true : false,
    //         products: response ? response : 'Get products failed',
    //         counts
    //     });
    // });

    Promise.all([queryCommand.exec(), Sach.find(formattedQueries).countDocuments()])
        .then(([response, counts]) => {
            res.status(200).json({
                success: response ? true : false,
                products: response ? response : 'Get products failed',
                counts,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Error: ' + err.message,
            });
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
