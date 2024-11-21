const router = require('express').Router();
const BlogNhaXuatBanController = require('../controllers/BlogNhaXuatBanController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createBlogPublisher', [verifyAccessToken, checkIsAdmin], BlogNhaXuatBanController.createBlogPublisher);
router.get('/getAllBlogPublishers', BlogNhaXuatBanController.getAllBlogPublishers);
router.put('/:blogMaNXB', [verifyAccessToken, checkIsAdmin], BlogNhaXuatBanController.updateBlogPublisher);
router.delete('/:blogMaNXB', [verifyAccessToken, checkIsAdmin], BlogNhaXuatBanController.deleteBlogPublisher);

module.exports = router;
