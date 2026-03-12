const express = require('express');
const { isVerifiedUser } = require('../middlewares/tokenVerification');
const { addCategory, getCategories, removeCategory } = require('../controllers/categoryController')

const router = express.Router();

router.route('/').post( addCategory)
router.route('/').get(isVerifiedUser, getCategories)
router.route('/remove').post(isVerifiedUser, removeCategory)


module.exports = router;