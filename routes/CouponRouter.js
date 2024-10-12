const router = require('express').Router();
const CouponController = require('../controllers/CouponController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createCoupon', [verifyAccessToken, checkIsAdmin], CouponController.createCoupon);
router.get('/getAllCoupons', CouponController.getAllCoupons);

router.put('/:couponId', [verifyAccessToken, checkIsAdmin], CouponController.updateCoupon);
router.delete('/:couponId', [verifyAccessToken, checkIsAdmin], CouponController.deleteCoupon);

module.exports = router;
