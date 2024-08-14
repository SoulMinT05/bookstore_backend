const router = require('express').Router();
const NhanVienController = require('../controllers/NhanVienController');

router.post('/register', NhanVienController.register);

module.exports = router;
