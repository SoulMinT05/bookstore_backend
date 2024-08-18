const router = require('express').Router();
const SachController = require('../controllers/SachController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createProduct', [verifyAccessToken, checkIsAdmin], SachController.createProduct);
router.get('/getAllProducts', SachController.getAllProducts);

router.get('/:productId', SachController.getDetailProduct);
module.exports = router;
