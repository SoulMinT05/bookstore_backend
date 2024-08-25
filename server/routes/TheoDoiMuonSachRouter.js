const router = require('express').Router();
const TheoDoiMuonSachController = require('../controllers/TheoDoiMuonSachController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createOrder', verifyAccessToken, TheoDoiMuonSachController.createOrder);
router.put('/updateStatus/:orderId', [verifyAccessToken, checkIsAdmin], TheoDoiMuonSachController.updateStatusOrder);
router.put('/cancelOrder/:orderId', [verifyAccessToken, checkIsAdmin], TheoDoiMuonSachController.cancelOrder);

module.exports = router;
