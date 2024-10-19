const router = require('express').Router();
const TheoDoiMuonSachController = require('../controllers/TheoDoiMuonSachController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');


router.put('/updateStatus/:orderId', [verifyAccessToken, checkIsAdmin], TheoDoiMuonSachController.updateStatusOrder);
router.put(
    '/cancelOrderFromAdmin/:orderId',
    [verifyAccessToken, checkIsAdmin],
    TheoDoiMuonSachController.cancelOrderFromAdmin,
);
router.put('/cancelOrderFromUser/:orderId', [verifyAccessToken], TheoDoiMuonSachController.cancelOrderFromUser);
router.post('/createOrder', verifyAccessToken, TheoDoiMuonSachController.createOrder);
router.get('/getAllOrders', [verifyAccessToken, checkIsAdmin], TheoDoiMuonSachController.getAllOrders);
router.get('/getUserOrderFromUser', [verifyAccessToken], TheoDoiMuonSachController.getUserOrderFromUser);
router.delete('/:orderId', [verifyAccessToken], TheoDoiMuonSachController.deleteOrder);

module.exports = router;
