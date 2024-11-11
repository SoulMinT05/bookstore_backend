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
    upload.array('images', 10),
    SachController.createProduct,
);
router.get('/getAllProducts', SachController.getAllProducts);
router.put('/ratingProduct', verifyAccessToken, SachController.ratingProduct);

router.put(
    '/uploadImagesProduct/:productId',
    [verifyAccessToken, checkAdminOrStaff],
    upload.array('images', 10),
    SachController.uploadImagesProduct,
);
router.get('/:productId', SachController.getDetailProduct);
router.put(
    '/:productId',
    upload.array('images', 10),
    [verifyAccessToken, checkAdminOrStaff],
    SachController.updateProduct,
);
router.delete('/:productId', [verifyAccessToken, checkAdminOrStaff], SachController.deleteProduct);
module.exports = router;
