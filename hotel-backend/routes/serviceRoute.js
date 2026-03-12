const express = require('express');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { addService, getServices, removeService ,updateBuyQuantities ,updateSaleQuantities} = require('../controllers/serviceController');


const router = express.Router();

router.route('/').post( addService)
// router.route('/').get(isVerifiedUser, getServices)
router.route('/fetch').post(isVerifiedUser, getServices);
router.route('/remove').post(isVerifiedUser, removeService)
router.route('/update-buyquantities').post(isVerifiedUser, updateBuyQuantities);
router.route('/update-salequantities').post(isVerifiedUser, updateSaleQuantities);


module.exports = router;

