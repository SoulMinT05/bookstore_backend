const router = require('express').Router();
const BlogController = require('../controllers/BlogController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createBlog', [verifyAccessToken, checkIsAdmin], BlogController.createBlog);
router.get('/getAllBlogs', BlogController.getAllBlogs);
router.put('/:blogId', [verifyAccessToken, checkIsAdmin], BlogController.updateBlog);
router.delete('/:blogId', [verifyAccessToken, checkIsAdmin], BlogController.deleteBlog);

module.exports = router;
