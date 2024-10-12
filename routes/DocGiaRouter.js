const router = require('express').Router();
const DocGiaController = require('../controllers/DocGiaController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/register', DocGiaController.register);
router.post('/login', DocGiaController.login);
router.get('/getDetailUser', [verifyAccessToken], DocGiaController.getDetailUser);
router.post('/refreshCreateNewAccessToken', DocGiaController.refreshCreateNewAccessToken);
router.post('/logout', DocGiaController.logout);
router.post('/forgotPassword', DocGiaController.forgotPassword);
router.put('/resetPassword', DocGiaController.resetPassword);
router.put('/updateInfoFromUser', [verifyAccessToken], DocGiaController.updateInfoFromUser);
router.get('/getAllUsers', [verifyAccessToken, checkIsAdmin], DocGiaController.getAllUsers);
router.post('/createUserFromAdmin', [verifyAccessToken, checkIsAdmin], DocGiaController.createUserFromAdmin);

// Admin locked account
router.put('/locked/:userId', [verifyAccessToken, checkIsAdmin], DocGiaController.lockedUser);

router.put('/updateInfoFromAdmin/:userId', [verifyAccessToken, checkIsAdmin], DocGiaController.updateInfoFromAdmin);
router.post('/changePassword', [verifyAccessToken], DocGiaController.changePassword);
router.delete('/:userId', [verifyAccessToken, checkIsAdmin], DocGiaController.deleteUser);

module.exports = router;
