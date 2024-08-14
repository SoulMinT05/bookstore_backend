const router = require('express').Router();
const NhanVienController = require('../controllers/NhanVienController');

router.post('/register', NhanVienController.register);
router.post('/login', NhanVienController.login);

module.exports = router;
