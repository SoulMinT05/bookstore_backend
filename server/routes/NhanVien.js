const router = require('express').Router();
const NhanVienController = require('../controllers/NhanVienController');
const { verifyAccessToken } = require('../middlewares/verifyTokenMiddleware');

router.post('/register', NhanVienController.register);
router.post('/login', NhanVienController.login);
router.get('/getCurrentUser', verifyAccessToken, NhanVienController.getCurrentUser);

module.exports = router;
