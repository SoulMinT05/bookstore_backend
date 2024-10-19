const router = require('express').Router();
const StatisticController = require('../controllers/StatisticController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.get('/month/user', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthUserStatistics);
router.get('/month/product', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthProductStatistics);
router.get('/month/order', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthOrderStatistics);
router.get('/month/publisher', [verifyAccessToken, checkIsAdmin], StatisticController.getMonthPublisherStatistics);

module.exports = router;
