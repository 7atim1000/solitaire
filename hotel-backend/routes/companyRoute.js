const express = require('express');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { addCompany, getCompanies, removeCompany, updateCompanyBalance } = require('../controllers/companyController');


const router = express.Router();

router.route('/').post(isVerifiedUser, addCompany)
router.route('/fetch').post(isVerifiedUser, getCompanies);
router.route('/remove').post(removeCompany);

router.route('/:id').put(isVerifiedUser, updateCompanyBalance);

module.exports = router ;

