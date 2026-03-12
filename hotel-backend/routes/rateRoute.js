const express = require('express');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { addRate, getRates, updateRate } = require('../controllers/rateController')

const router = express.Router();

router.route('/').post( addRate);
router.route('/').get(isVerifiedUser, getRates);
router.route('/:id').put(isVerifiedUser, updateRate);


module.exports = router;