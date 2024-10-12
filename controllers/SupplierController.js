const Supplier = require('../models/SupplierModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createSupplier = asyncHandler(async (req, res) => {
    const supplier = await Supplier.create(req.body);
    return res.status(200).json({
        success: supplier ? true : false,
        supplier: supplier ? supplier : 'Create supplier failed',
    });
});

const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find();
    return res.status(200).json({
        success: suppliers ? true : false,
        suppliers: suppliers ? suppliers : 'Get all suppliers failed',
    });
});

const updateSupplier = asyncHandler(async (req, res) => {
    const { supplierId } = req.params;
    const supplier = await Supplier.findByIdAndUpdate(supplierId, req.body, {
        new: true,
    });
    return res.status(200).json({
        success: supplier ? true : false,
        supplier: supplier ? supplier : 'Update supplier failed',
    });
});

const deleteSupplier = asyncHandler(async (req, res) => {
    const { supplierId } = req.params;
    const supplier = await Supplier.findByIdAndDelete(supplierId);
    return res.status(200).json({
        success: supplier ? true : false,
        supplier: supplier ? supplier : 'Delete supplier failed',
    });
});

module.exports = {
    createSupplier,
    getAllSuppliers,
    updateSupplier,
    deleteSupplier,
};
