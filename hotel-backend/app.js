//require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

const config = require("./config/config");
const globalErrorHandler = require('./middlewares/globalErrorHandler');
//const createHttpError = require('http-errors');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const app = express();

require('colors')
const connectCloudinary = require('./config/cloudinary');

//const PORT = process.env.PORT;
const PORT = config.port;

connectDB();
connectCloudinary();

// cors policy to unblock response
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173']
 }))
 
//Middleware Parse incoming request in json format and cookie parser for cookies and token 
app.use(express.json()); 
// to activate middleware (cookieParser)
app.use(cookieParser());


// endPoint Route
app.get('/', (req, res) => {
    //const err = createHttpError(404, "something went wrong!");
    //throw err;
    res.json({message: 'Hellow from Solitaire Server'})
}) 


app.use('/api/user', require('./routes/userRoute'));
app.use('/api/rate', require('./routes/rateRoute'));
app.use('/api/order', require('./routes/orderRoute'));
app.use('/api/taxes', require('./routes/taxRoute'));
app.use('/api/table', require('./routes/tableRoute'));
app.use('/api/payment', require('./routes/paymentRoute'));

app.use('/api/room', require('./routes/roomRoute'));
app.use('/api/floor', require('./routes/floorRoute'));

app.use('/api/customers', require('./routes/customerRoute'));
app.use('/api/company', require('./routes/companyRoute'));
app.use('/api/transactions', require('./routes/transactionRoute'));
app.use('/api/expenses', require('./routes/expenseRoute'));
app.use('/api/incomes', require('./routes/incomeRoute'));

app.use('/api/category', require('./routes/categoryRoute'));
app.use('/api/service', require('./routes/serviceRoute'));
app.use('/api/unit', require('./routes/unitRoute'));


// global Error Handler 
app.use(globalErrorHandler)



app.listen(PORT, () => {
    console.log(`POS server is listening on port ${PORT}` .bgCyan); 
})