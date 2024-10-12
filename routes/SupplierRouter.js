const router = require('express').Router();
const SupplierController = require('../controllers/SupplierController');
const { verifyAccessToken, checkIsStaff, checkIsAdmin } = require('../middlewares/verifyTokenMiddleware');

router.post('/createSupplier', [verifyAccessToken, checkIsAdmin], SupplierController.createSupplier);
router.get('/getAllSuppliers', SupplierController.getAllSuppliers);

router.put('/:supplierId', [verifyAccessToken, checkIsAdmin], SupplierController.updateSupplier);
router.delete('/:supplierId', [verifyAccessToken, checkIsAdmin], SupplierController.deleteSupplier);

module.exports = router;
