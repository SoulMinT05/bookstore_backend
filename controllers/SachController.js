const Sach = require('../models/SachModel');
const DocGia = require('../models/DocGiaModel');
const Publisher = require('../models/NhaXuatBanModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const cloudinary = require('cloudinary').v2;

const getAllProducts = asyncHandler(async (req, res, next) => {
    const queriesObj = { ...req.query };

    // Loại bỏ các trường không cần thiết từ query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((element) => delete queriesObj[element]);

    // Định dạng đúng cú pháp cho Mongoose
    let queryString = JSON.stringify(queriesObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const formattedQueries = JSON.parse(queryString);

    // Tìm kiếm theo tên sản phẩm (không phân biệt chữ hoa và chữ thường)
    if (queriesObj?.TenSach) {
        formattedQueries.TenSach = {
            $regex: queriesObj.TenSach,
            $options: 'i', // Không phân biệt chữ hoa và chữ thường
        };
    }

    // Thực hiện truy vấn
    let queryCommand = Sach.find(formattedQueries).populate('MaNXB', 'TenNXB'); // Populate để lấy TenSach của publisher
    // Sắp xếp
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        queryCommand = queryCommand.sort(sortBy);
        console.log('sortBy: ', sortBy);
    }

    // Lọc trường dữ liệu
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queryCommand = queryCommand.select(fields);
    }

    // Phân trang
    // const page = +req.query.page || 1;
    // const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
    // const skip = (page - 1) * limit;
    // queryCommand = queryCommand.skip(skip).limit(limit);

    // Thực hiện truy vấn và trả về kết quả
    Promise.all([queryCommand.exec(), Sach.find(formattedQueries).countDocuments()])
        .then(([response, counts]) => {
            res.status(200).json({
                success: response ? true : false,
                counts,
                products: response
                    ? response.map((product) => ({
                          ...product._doc,
                          publisherName: product.MaNXB ? product.MaNXB.TenNXB : null,
                      }))
                    : 'Get products failed',
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Error: ' + err.message,
            });
        });
});

const createProduct = asyncHandler(async (req, res, next) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const images = req.files?.map((element) => element.path);
    if (req.body && req.body.TenSach) {
        req.body.slug = slugify(req.body.TenSach);
    }

    const publisher = await Publisher.findOne({ TenNXB: req.body.publisher });
    console.log('publisher: ', publisher);

    if (!publisher) {
        throw new Error('Publisher not found');
    }
    req.body.MaNXB = publisher._id;

    if (images) req.body.HinhAnhSach = images;

    let newProduct = await Sach.create(req.body);
    newProduct = await newProduct.populate('MaNXB', 'TenNXB');
    console.log('newProduct: ', newProduct);
    console.log('images: ', images);
    return res.status(200).json({
        success: newProduct ? true : false,
        newProduct: newProduct ? newProduct : 'Create product failed',
    });
});

const getDetailProduct = asyncHandler(async (req, res, next) => {
    // const { productId } = req.params;
    // const product = await Sach.findById(productId);
    const { slug } = req.params; // Lấy slug từ params
    const product = await Sach.findOne({ slug: slug }).populate('MaNXB', 'TenNXB');
    return res.status(200).json({
        success: product ? true : false,
        product: product ? product : 'Get detail product failed',
    });
});

const getProductSimilarPublisher = async (req, res, next) => {
    const { MaNXB } = req.query;
    try {
        const relatedProducts = await Sach.find({
            MaNXB,
            _id: { $ne: MaNXB }, // Loại trừ sản phẩm hiện tại
        }).limit(6); // Giới hạn số sản phẩm trả về (tùy nhu cầu)
        return res.status(200).json({
            success: relatedProducts ? true : false,
            relatedProducts,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const updateProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    if (req.body && req.body.TenSach) {
        req.body.slug = slugify(req.body.TenSach);
    }

    if (req.body.publisherName) {
        // Tìm nhà xuất bản dựa vào tên
        const publisher = await Publisher.findOne({ TenNXB: req.body.publisherName });
        console.log('publisher: ', publisher);

        if (!publisher) {
            throw new Error('Publisher not found');
        }
        // Gán MaNXB vào req.body
        req.body.MaNXB = publisher._id;
    }
    // Delete image
    const deleteImages = req.body.deleteImage ? JSON.parse(req.body.deleteImage) : [];
    if (deleteImages.length > 0) {
        await Sach.updateOne(
            { _id: productId },
            { $pull: { HinhAnhSach: { $in: deleteImages } } }, // Xóa tất cả hình ảnh trong mảng deleteImages
        );
    }
    // Add new image
    const newImages = req.files?.map((element) => element.path);
    if (newImages && newImages.length > 0) {
        await Sach.updateOne(
            { _id: productId },
            { $push: { HinhAnhSach: { $each: newImages } } }, // Sử dụng $push để thêm nhiều hình ảnh
        );
    }
    const product = await Sach.findByIdAndUpdate(productId, req.body, { new: true });
    const populatedProduct = await product.populate('MaNXB', 'TenNXB');

    console.log('populatedProduct: ', populatedProduct);
    return res.status(200).json({
        success: populatedProduct ? true : false,
        updatedProduct: populatedProduct ? populatedProduct : 'Update product failed',
    });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Sach.findByIdAndDelete(productId);
    return res.status(200).json({
        success: product ? true : false,
        deletedProduct: product ? product : 'Delete product failed',
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
                HinhAnhSach: {
                    $each: req.files.map((item) => item.path),
                },
            },
        },
        { new: true },
    );

    console.log('req.files: ', req.files);
    return res.status(200).json({
        success: response ? true : false,
        uploadedImages: response ? response : 'Upload images product failed',
    });
});

const getProductsByAutoPublisher = asyncHandler(async (req, res, next) => {
    try {
        const publishers = await Publisher.find({}, '_id TenNXB');

        // Tạo map ID -> TenNXB
        const publisherMap = publishers.reduce((acc, pub) => {
            acc[pub._id.toString()] = pub.TenNXB;
            return acc;
        }, {});

        const publisherIds = Object.keys(publisherMap);

        // Lấy danh sách sản phẩm
        const products = await Sach.find({ MaNXB: { $in: publisherIds } });

        // Nhóm sản phẩm theo TenNXB
        const groupedProducts = products.reduce((acc, product) => {
            const publisherId = product.MaNXB.toString();
            const publisherName = publisherMap[publisherId] || 'Unknown products by auto publishers';

            if (!acc[publisherName]) {
                acc[publisherName] = [];
            }
            acc[publisherName].push(product);
            return acc;
        }, {});

        res.status(200).json({ success: true, data: groupedProducts });
    } catch (error) {
        console.log('err: ', error);
    }
});

const searchBook = asyncHandler(async (req, res, next) => {
    const { keyword } = req.query; // Lấy từ khóa từ query params
    const userId = req.user._id; // Lấy user từ req (giả sử đã có middleware xác thực)

    if (!keyword) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập từ khóa tìm kiếm.',
        });
    }

    // Tìm sách có tên hoặc tác giả chứa từ khóa (không phân biệt hoa thường)
    const books = await Sach.find({
        $or: [{ TenSach: { $regex: keyword, $options: 'i' } }, { TacGia: { $regex: keyword, $options: 'i' } }],
    });

    // Cập nhật lịch sử tìm kiếm của người dùng
    await DocGia.findByIdAndUpdate(userId, {
        $push: { searchHistory: { $each: [keyword], $position: 0 } }, // Đưa từ khóa lên đầu mảng
        $slice: { searchHistory: 10 }, // Giữ tối đa 10 từ khóa gần nhất
    });

    return res.status(200).json({
        success: true,
        message: 'Kết quả tìm kiếm',
        books,
    });
});

// Lấy lịch sử tìm kiếm của người dùng
const getSearchHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Lấy user từ req (giả sử đã có middleware xác thực)

    // Lấy user từ DB và chỉ lấy trường search
    const user = await DocGia.findById(userId).select('searchHistory');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy người dùng.',
        });
    }

    const lastSearch = user.searchHistory?.slice(0, 12) || [];

    console.log('lastSearch: ', lastSearch);

    return res.status(200).json({
        success: true,
        message: 'Lịch sử tìm kiếm',
        searchHistory: lastSearch || [], // Trả về danh sách tìm kiếm hoặc mảng rỗng
    });
});

module.exports = {
    createProduct,
    getDetailProduct,
    getProductSimilarPublisher,
    getAllProducts,
    updateProduct,
    deleteProduct,
    ratingProduct,
    uploadImagesProduct,
    getProductsByAutoPublisher,
    searchBook,
    getSearchHistory,
};
