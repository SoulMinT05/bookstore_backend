const router = require('express').Router();
const NhanVienController = require('../controllers/NhanVienController');
const { verifyAccessToken } = require('../middlewares/verifyTokenMiddleware');

router.post('/register', NhanVienController.register);
router.post('/login', NhanVienController.login);
router.get('/getCurrentUser', verifyAccessToken, NhanVienController.getCurrentUser);
router.post('/refreshCreateNewAccessToken', NhanVienController.refreshCreateNewAccessToken);
router.get('/logout', NhanVienController.logout);
router.get('/forgotPassword', NhanVienController.forgotPassword);
router.put('/resetPassword', NhanVienController.resetPassword);

module.exports = router;
