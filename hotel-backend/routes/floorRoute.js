const express = require('express');
const { addFloor, getFloors, removeFloor } = require('../controllers/floorController');
const  { isVerifiedUser }  = require("../middlewares/tokenVerification");

const router = express.Router() ;

router.route('/').post(isVerifiedUser, addFloor);
router.route('/').get(isVerifiedUser, getFloors);
router.route('/remove').post(isVerifiedUser, removeFloor);


module.exports = router ;
