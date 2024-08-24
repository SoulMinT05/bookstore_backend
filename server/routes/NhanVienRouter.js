const router = require('express').Router();
const NhanVienController = require('../controllers/NhanVienController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/register', NhanVienController.register);
router.post('/login', NhanVienController.login);
router.get('/getCurrentUser', verifyAccessToken, NhanVienController.getCurrentUser);
router.post('/refreshCreateNewAccessToken', NhanVienController.refreshCreateNewAccessToken);
router.get('/logout', NhanVienController.logout);
router.get('/forgotPassword', NhanVienController.forgotPassword);
router.put('/resetPassword', NhanVienController.resetPassword);
router.get('/getAllUsers', [verifyAccessToken, checkIsAdmin], NhanVienController.getAllUsers);
router.delete('/', [verifyAccessToken, checkIsAdmin], NhanVienController.deleteUser);
router.put('/updateAddressUser', [verifyAccessToken], NhanVienController.updateAddressUser);

// User update info of user, but not admin
router.put('/updateInfoFromUser', [verifyAccessToken], NhanVienController.updateInfoFromUser);
router.put('/updateInfoFromAdmin/:userId', [verifyAccessToken, checkIsAdmin], NhanVienController.updateInfoFromAdmin);

module.exports = router;
