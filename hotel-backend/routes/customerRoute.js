const express = require('express');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { addCustomer, getCustomers, removeCustomer, updateCustomerBalance } = require('../controllers/customerController');


const router = express.Router();

router.route('/').post(isVerifiedUser, addCustomer)
router.route('/fetch').post(isVerifiedUser, getCustomers);
router.route('/remove').post(removeCustomer);

router.route('/:id').put(isVerifiedUser, updateCustomerBalance);

module.exports = router ;

