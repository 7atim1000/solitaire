const mongoose = require('mongoose')
const config = require('./config')
require('colors')

const connectDB = async () => {
    
    try {
        //const conn = await mongoose.connect(process.env.MONGODB_URI)
        const conn = await mongoose.connect(config.databaseURI);
        console.log(`MongoDB Connected With Solitaire DB: ${conn.connection.host}` .bgMagenta);
    } catch (error) {
       console.log(`Error: ${error.message}`.bgRed)
       process.exit();
    }
}


module.exports = connectDB;