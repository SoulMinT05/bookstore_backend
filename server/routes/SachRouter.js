const router = require('express').Router();
const SachController = require('../controllers/SachController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createProduct', [verifyAccessToken, checkIsAdmin], SachController.createProduct);
router.get('/getAllProducts', SachController.getAllProducts);
router.put('/ratingProduct', verifyAccessToken, SachController.ratingProduct);

router.get('/:productId', SachController.getDetailProduct);
router.put('/:productId', [verifyAccessToken, checkIsAdmin], SachController.updateProduct);
router.delete('/:productId', [verifyAccessToken, checkIsAdmin], SachController.deleteProduct);
module.exports = router;
