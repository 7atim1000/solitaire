const express = require('express');
const router = express.Router();
const {
    addTax,
    fetchTaxes,
    getTaxById,
    updateTax,
    deleteTax,
    getTaxSummary
} = require('../controllers/taxController');
const  { isVerifiedUser }  = require("../middlewares/tokenVerification");

// All routes are protected
router.use(isVerifiedUser);

// GET /api/taxes/summary - Get tax summary
router.get('/summary', getTaxSummary);

// GET /api/taxes - Fetch all taxes with filters
router.get('/', fetchTaxes);

// POST /api/taxes - Add new tax
router.post('/', addTax);

// GET /api/taxes/:id - Get single tax
router.get('/:id', getTaxById);

// PUT /api/taxes/:id - Update tax
router.put('/:id', updateTax);

// DELETE /api/taxes/:id - Delete tax
router.delete('/:id', deleteTax);

module.exports = router;