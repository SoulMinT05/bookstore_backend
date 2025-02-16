const router = require('express').Router();
const SachController = require('../controllers/SachController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');
const upload = require('../config/cloudinary.config');

router.post(
    '/createProduct',
    [verifyAccessToken, checkAdminOrStaff],
    upload.array('HinhAnhSach', 10),
    SachController.createProduct,
);
router.get('/relatedProducts', SachController.getProductSimilarPublisher);
router.get('/getAllProducts', SachController.getAllProducts);
router.put('/ratingProduct', verifyAccessToken, SachController.ratingProduct);

router.get('/auto-publishers', SachController.getProductsByAutoPublisher);
router.get('/search', verifyAccessToken, SachController.searchBook);
router.get('/getSearchHistory', verifyAccessToken, SachController.getSearchHistory);

router.put(
    '/uploadImagesProduct/:productId',
    [verifyAccessToken, checkAdminOrStaff],
    upload.array('HinhAnhSach', 10),
    SachController.uploadImagesProduct,
);
router.get('/:slug', SachController.getDetailProduct);
router.put(
    '/:productId',
    upload.array('HinhAnhSach', 10),
    [verifyAccessToken, checkAdminOrStaff],
    SachController.updateProduct,
);
router.delete('/:productId', [verifyAccessToken, checkAdminOrStaff], SachController.deleteProduct);

module.exports = router;
