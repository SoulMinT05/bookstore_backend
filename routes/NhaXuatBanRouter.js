const router = require('express').Router();
const NhaXuatBanController = require('../controllers/NhaXuatBanController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');

router.post('/createPublisher', [verifyAccessToken, checkAdminOrStaff], NhaXuatBanController.createPublisher);
router.get('/getAllPublishers', [verifyAccessToken], NhaXuatBanController.getAllPublishers);
router.put('/:publisherId', [verifyAccessToken, checkAdminOrStaff], NhaXuatBanController.updatePublisher);
router.delete('/:publisherId', [verifyAccessToken, checkAdminOrStaff], NhaXuatBanController.deletePublisher);

module.exports = router;
