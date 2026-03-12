const express = require('express')
const { addTable, getTables, updateTable, insertTable } = require('../controllers/tableController')
const  { isVerifiedUser }  = require("../middlewares/tokenVerification");
const router = express.Router()

router.route('/').post(isVerifiedUser, insertTable);
router.route('/').get(isVerifiedUser, getTables);
router.route('/:id').put(isVerifiedUser, updateTable)

module.exports = router;