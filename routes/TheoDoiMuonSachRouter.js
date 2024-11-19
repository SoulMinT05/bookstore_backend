const router = require('express').Router();
const TheoDoiMuonSachController = require('../controllers/TheoDoiMuonSachController');
const {
    verifyAccessToken,
    checkIsStaff,
    checkIsAdmin,
    checkAdminOrStaff,
} = require('../middlewares/verifyTokenMiddleware');

router.put(
    '/updateStatus/:orderId',
    [verifyAccessToken, checkAdminOrStaff],
    TheoDoiMuonSachController.updateStatusOrder,
);
// router.put(
//     '/cancelOrderFromAdmin/:orderId',
//     [verifyAccessToken, checkAdminOrStaff],
//     TheoDoiMuonSachController.cancelOrderFromAdmin,
// );
router.put('/cancelOrderFromUser/:orderId', [verifyAccessToken], TheoDoiMuonSachController.cancelOrderFromUser);
router.post('/createOrder', verifyAccessToken, TheoDoiMuonSachController.createOrder);
router.get('/getAllOrders', [verifyAccessToken], TheoDoiMuonSachController.getAllOrders);
router.get('/getUserOrderFromUser', [verifyAccessToken], TheoDoiMuonSachController.getUserOrderFromUser);
router.get('/:orderId', [verifyAccessToken], TheoDoiMuonSachController.getOrderDetails);
router.delete('/:orderId', [verifyAccessToken], TheoDoiMuonSachController.deleteOrder);

module.exports = router;
