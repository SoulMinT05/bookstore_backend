const router = require('express').Router();
const NhaXuatBanController = require('../controllers/NhaXuatBanController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');

router.post('/createPublisher', [verifyAccessToken, checkAdminOrStaff], NhaXuatBanController.createPublisher);
router.get('/getAllPublishers', NhaXuatBanController.getAllPublishers);
router.put('/:MaNXB', [verifyAccessToken, checkAdminOrStaff], NhaXuatBanController.updatePublisher);
router.delete('/:MaNXB', [verifyAccessToken, checkAdminOrStaff], NhaXuatBanController.deletePublisher);

module.exports = router;
