const router = require('express').Router();
const TheoDoiMuonSachController = require('../controllers/TheoDoiMuonSachController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createOrder', verifyAccessToken, TheoDoiMuonSachController.createOrder);

module.exports = router;
