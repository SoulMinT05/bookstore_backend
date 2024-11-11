const router = require('express').Router();
const DocGiaController = require('../controllers/DocGiaController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');

// Admin locked account
router.put('/locked/:userId', [verifyAccessToken, checkAdminOrStaff], DocGiaController.lockedUser);
router.put(
    '/updateInfoFromAdmin/:userId',
    [verifyAccessToken, checkAdminOrStaff],
    DocGiaController.updateInfoFromAdmin,
);
router.put('/updateAddressUser', [verifyAccessToken, checkAdminOrStaff], DocGiaController.updateAddressUser);

router.post('/register', DocGiaController.register);
router.post('/login', DocGiaController.login);
router.get('/getDetailUser/:userId', [verifyAccessToken], DocGiaController.getDetailUser);
router.post('/refreshCreateNewAccessToken', DocGiaController.refreshCreateNewAccessToken);
router.post('/logout', [verifyAccessToken], DocGiaController.logout);
router.post('/forgotPassword', DocGiaController.forgotPassword);
router.put('/resetPassword', DocGiaController.resetPassword);
router.put('/updateInfoFromUser', [verifyAccessToken], DocGiaController.updateInfoFromUser);
router.get('/getAllUsers', [verifyAccessToken, checkAdminOrStaff], DocGiaController.getAllUsers);
router.post('/createUserFromAdmin', [verifyAccessToken, checkAdminOrStaff], DocGiaController.createUserFromAdmin);
router.post('/changePassword', [verifyAccessToken], DocGiaController.changePassword);
router.post('/updateCart', [verifyAccessToken], DocGiaController.updateCart);
router.delete('/:userId', [verifyAccessToken, checkAdminOrStaff], DocGiaController.deleteUser);

module.exports = router;
