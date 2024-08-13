const router = require('express').Router();
const NhanVien = require('../controllers/NhanVien');

router.post('/register', NhanVien.register);

module.exports = router;
