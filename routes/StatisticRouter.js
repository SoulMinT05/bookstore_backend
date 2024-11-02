const router = require('express').Router();
const StatisticController = require('../controllers/StatisticController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.get('/month/user', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthUserStatistics);
router.get('/month/product', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthProductStatistics);
router.get('/month/order', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthOrderStatistics);
router.get('/month/publisher', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthPublisherStatistics);

router.get('/month', [verifyAccessToken, checkIsAdmin], StatisticController.getStatisticsByMonth);

router.get('/users', [verifyAccessToken, checkIsAdmin], StatisticController.getUserStatisticsByDateRange);
router.get('/products', [verifyAccessToken, checkIsAdmin], StatisticController.getProductStatisticsByDateRange);
router.get('/orders', [verifyAccessToken, checkIsAdmin], StatisticController.getOrderStatisticsByDateRange);
router.get('/publishers', [verifyAccessToken, checkIsAdmin], StatisticController.getPublisherStatisticsByDateRange);

module.exports = router;
