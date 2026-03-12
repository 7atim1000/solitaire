const express = require('express')
const upload = require('../middlewares/multer')

const { addRoom, getRooms, updateRoomStatus, updateRoom, removeRoom } = require('../controllers/roomController');
const  { isVerifiedUser }  = require("../middlewares/tokenVerification");

const router = express.Router();

// router.route('/').post(addRoom);
router.route('/').post( upload.single('image'), isVerifiedUser, addRoom);
router.route('/fetch').post(isVerifiedUser, getRooms);
router.route('/:id').put(isVerifiedUser, updateRoomStatus);

router.put('/update/:id', upload.single('image'), isVerifiedUser, updateRoom);
router.route('/remove').post(removeRoom)





module.exports = router;