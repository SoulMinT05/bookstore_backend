const router = require('express').Router();
const SachController = require('../controllers/SachController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');
const upload = require('../config/cloudinary.config');

router.post(
    '/createProduct',
    [verifyAccessToken, checkIsAdmin],
    upload.array('images', 10),
    SachController.createProduct,
);
router.get('/getAllProducts', SachController.getAllProducts);
router.put('/ratingProduct', verifyAccessToken, SachController.ratingProduct);

router.put(
    '/uploadImagesProduct/:productId',
    [verifyAccessToken, checkIsAdmin],
    upload.array('images', 10),
    SachController.uploadImagesProduct,
);
router.get('/:productId', SachController.getDetailProduct);
router.put('/:productId', [verifyAccessToken, checkIsAdmin], SachController.updateProduct);
router.delete('/:productId', [verifyAccessToken, checkIsAdmin], SachController.deleteProduct);
module.exports = router;
