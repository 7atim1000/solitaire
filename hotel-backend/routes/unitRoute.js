const express = require('express');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { addUnit, getUnits, removeUnit } = require('../controllers/unitController')

const router = express.Router();

router.route('/').post( addUnit)
router.route('/').get(isVerifiedUser, getUnits)
router.route('/remove').post(isVerifiedUser, removeUnit)


module.exports = router;