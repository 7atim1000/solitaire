const express = require('express');
const { addExpense, getExpenses, removeExpense } = require('../controllers/expenseController');

const router = express.Router();

router.route('/').post(addExpense);
router.route('/').get(getExpenses);
router.route('/remove').post(removeExpense)

module.exports = router ;