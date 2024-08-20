const router = require('express').Router();
const NhaXuatBanController = require('../controllers/NhaXuatBanController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createPublisher', [verifyAccessToken, checkIsAdmin], NhaXuatBanController.createPublisher);
router.get('/getAllPublishers', NhaXuatBanController.getAllPublishers);
router.put('/:publisherId', [verifyAccessToken, checkIsAdmin], NhaXuatBanController.updatePublisher);
router.delete('/:publisherId', [verifyAccessToken, checkIsAdmin], NhaXuatBanController.deletePublisher);

module.exports = router;
