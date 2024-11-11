const router = require('express').Router();
const StatisticController = require('../controllers/StatisticController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');

router.get('/week', [verifyAccessToken, checkAdminOrStaff], StatisticController.getStatisticsByWeek);
router.get('/month', [verifyAccessToken, checkAdminOrStaff], StatisticController.getStatisticsByMonth);
router.get('/year', [verifyAccessToken, checkAdminOrStaff], StatisticController.getStatisticsByYear);

router.get('/users', [verifyAccessToken, checkAdminOrStaff], StatisticController.getUserStatisticsByDateRange);
router.get('/products', [verifyAccessToken, checkAdminOrStaff], StatisticController.getProductStatisticsByDateRange);
router.get('/orders', [verifyAccessToken, checkAdminOrStaff], StatisticController.getOrderStatisticsByDateRange);
router.get(
    '/publishers',
    [verifyAccessToken, checkAdminOrStaff],
    StatisticController.getPublisherStatisticsByDateRange,
);

module.exports = router;
