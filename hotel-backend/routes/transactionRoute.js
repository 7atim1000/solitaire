const express = require('express');
const { addTransaction, getTransactions, removeTransaction, updateTransaction } = require('../controllers/transactionController');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

const router = express.Router();


router.post('/add-transaction', isVerifiedUser, addTransaction)
router.post('/get-transactions', isVerifiedUser, getTransactions)
router.post('/remove', isVerifiedUser, removeTransaction)
router.put('/:id', isVerifiedUser, isVerifiedUser, updateTransaction);

module.exports = router; 