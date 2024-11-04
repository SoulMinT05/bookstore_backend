const router = require('express').Router();
const StatisticController = require('../controllers/StatisticController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.get('/week', [verifyAccessToken, checkIsAdmin], StatisticController.getStatisticsByWeek);
router.get('/month', [verifyAccessToken, checkIsAdmin], StatisticController.getStatisticsByMonth);
router.get('/year', [verifyAccessToken, checkIsAdmin], StatisticController.getStatisticsByYear);

router.get('/users', [verifyAccessToken, checkIsAdmin], StatisticController.getUserStatisticsByDateRange);
router.get('/products', [verifyAccessToken, checkIsAdmin], StatisticController.getProductStatisticsByDateRange);
router.get('/orders', [verifyAccessToken, checkIsAdmin], StatisticController.getOrderStatisticsByDateRange);
router.get('/publishers', [verifyAccessToken, checkIsAdmin], StatisticController.getPublisherStatisticsByDateRange);

module.exports = router;
