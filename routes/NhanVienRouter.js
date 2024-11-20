const router = require('express').Router();
const NhanVienController = require('../controllers/NhanVienController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');

// Admin locked account
router.put('/locked/:userId', [verifyAccessToken, checkAdminOrStaff], NhanVienController.lockedUser);
router.put(
    '/updateInfoFromAdmin/:userId',
    [verifyAccessToken, checkAdminOrStaff],
    NhanVienController.updateInfoFromAdmin,
);
router.put('/updateAddressUser', [verifyAccessToken, checkAdminOrStaff], NhanVienController.updateAddressUser);

router.post('/register', NhanVienController.register);
router.post('/login', NhanVienController.login);
router.get('/getDetailUser/:userId', [verifyAccessToken], NhanVienController.getDetailUser);
router.post('/refreshCreateNewAccessToken', NhanVienController.refreshCreateNewAccessToken);
router.post('/logout', [verifyAccessToken], NhanVienController.logout);
router.post('/forgotPassword', NhanVienController.forgotPassword);
router.put('/resetPassword', NhanVienController.resetPassword);
router.put('/updateInfoFromUser', [verifyAccessToken], NhanVienController.updateInfoFromUser);
router.get('/getAllUsers', [verifyAccessToken, checkAdminOrStaff], NhanVienController.getAllUsers);
router.post('/createUserFromAdmin', [verifyAccessToken, checkAdminOrStaff], NhanVienController.createUserFromAdmin);
router.post('/changePassword', [verifyAccessToken], NhanVienController.changePassword);

router.delete('/:userId', [verifyAccessToken, checkAdminOrStaff], NhanVienController.deleteUser);

module.exports = router;
