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
    let queryCommand = Sach.find(formattedQueries); // not use await, it's pending status, when have request, it's still execute

    // Sorting --> abc def --> [abc,def] --> abc def
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
        console.log('sortBy: ', sortBy);
    }

    // Field limiting --> only get fields to want select
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }

    // Pagination
    // limit: Number object that get from DB --> limit: 2 --> get: 1,2
    // skip: Number object that skip from DB --> skip: 2 --> skip: 1,2 and start with: 3
    // page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30 page 3 --> skip: 10

    // a = '2' --> +a --> Number
    // a = 'bc' --> +a --> NaN
    const page = +req.query.page || 1;
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
    const skip = (page - 1) * limit;
    queryCommand = queryCommand.skip(skip).limit(limit);

    // Executing query
    Promise.all([queryCommand.exec(), Sach.find(formattedQueries).countDocuments()])
        .then(([response, counts]) => {
            res.status(200).json({
                success: response ? true : false,
                counts,
                products: response ? response : 'Get products failed',
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

const ratingProduct = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    const { star, comment, productId } = req.body;
    if (!star || !productId) throw new Error('Missing star or forgot choose product');
    const product = await Sach.findById(productId);
    const alreadyRating = product?.ratings?.find((element) => element?.postedBy.toString() === _id);
    // Update star and comment
    if (alreadyRating) {
        await Sach.updateOne(
            {
                // Check alreadyRating is matched ratings?
                ratings: { $elemMatch: alreadyRating },
            },
            {
                $set: {
                    // $: Object inside array ratings matched alreadyRating
                    'ratings.$.star': star,
                    'ratings.$.comment': comment,
                },
            },
            { new: true },
        );
    } else {
        // Add star and comment
        await Sach.findByIdAndUpdate(
            productId,
            {
                $push: { ratings: { star, comment, postedBy: _id } },
            },
            { new: true },
        );
    }

    // Total ratings
    const updatedProduct = await Sach.findById(productId);
    const countRating = updatedProduct.ratings.length;
    const sumRating = updatedProduct.ratings.reduce((sum, currentRating) => {
        console.log('typeof currentRating: ', typeof currentRating.star);
        return sum + +currentRating.star;
    }, 0);
    updatedProduct.totalRatings = Math.round((sumRating * 10) / countRating) / 10;
    await updatedProduct.save();

    return res.status(200).json({
        status: true,
        updatedProduct,
    });
});

const uploadImagesProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!req.files) throw new Error('Missing req.files');
    const response = await Sach.findByIdAndUpdate(
        productId,
        {
            $push: {
                images: {
                    $each: req.files.map((item) => item.path),
                },
            },
        },
        { new: true },
    );

    console.log('req.files: ', req.files);
    return res.status(200).json({
        success: response ? true : false,
        response: response ? response : 'Upload images product failed',
    });
});

module.exports = {
    createProduct,
    getDetailProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    ratingProduct,
    uploadImagesProduct,
};
