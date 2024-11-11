const router = require('express').Router();
const BlogController = require('../controllers/BlogController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');
const upload = require('../config/cloudinary.config');

router.post('/createBlog', [verifyAccessToken, checkAdminOrStaff], BlogController.createBlog);
router.get('/getAllBlogs', BlogController.getAllBlogs);
router.put('/likeBlog/:blogId', [verifyAccessToken], BlogController.likeBlog);
router.put('/dislikeBlog/:blogId', [verifyAccessToken], BlogController.dislikeBlog);

router.put(
    '/uploadImageBlog/:blogId',
    [verifyAccessToken, checkAdminOrStaff],
    upload.single('image'),
    BlogController.uploadImageBlog,
);

router.get('/:blogId', BlogController.getDetailBlog);
router.put('/:blogId', [verifyAccessToken, checkAdminOrStaff], BlogController.updateBlog);
router.delete('/:blogId', [verifyAccessToken, checkAdminOrStaff], BlogController.deleteBlog);

module.exports = router;
