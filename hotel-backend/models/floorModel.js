const mongoose = require('mongoose')

const floorSchema = new mongoose.Schema({
    floorName :{ type: String, rquired : true },
    description : { type : String }
});


module.exports = mongoose.model('Floor', floorSchema)