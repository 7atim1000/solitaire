const express = require('express');
const { addIncome, getIncomes, removeIncome } = require('../controllers/incomeController');

const router = express.Router();

router.route('/').post(addIncome);
router.route('/').get(getIncomes);
router.route('/remove').post(removeIncome)

module.exports = router ;