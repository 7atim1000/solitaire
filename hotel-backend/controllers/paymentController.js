const Razorpay = require('razorpay');
const config = require('../config/config');
const crypto = require('crypto');
const Payment = require('../models/paymentModel');

const createHttpError = require('http-errors');

const createOrder = async (req, res, next) => {
    
    try {
        //const razorpay = new Razorpay({
        //    key_id: config.razorpayKeyId,
        //    key_secret: config.razorpaySecretKey,
            //secret%123
        //});
        /*
        const { amount } = req.body;
        const options = {
            amount: amount * 100,
            currency: 'UAE',
            receipt: `receipt_${Date.now()}`,
        };
    
        //const order = await razorpay.orders.create(options);
        const payment = await options.save();
        */
           
        /*
        const payment = new Payment(req.body);
        await payment.save();
        res.status(200).json({success: true, payment})
        */
        const body = json.stringify(req.body)
        const payment = req.body.payload.payment.entity;

        const newPayment  = new Payment({
            paymentId: payment.id,
            orderId : payment.order_id,
            amount: payment.amount/100,
            currency: payment.currency,
            status: payment.status,
            method: payment.method,
            email: payment.email,
            contact: payment.contact,
            createdAt: new Data(payment.created_at * 1000)
        })
        await newPayment.save();

        } catch (error) {
        next(error)
    }
};




const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const expectedSignature = crypto
        .createHmac("sha256", config.razorpaySecreKey)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: "Payment verified successfully!"})
        } else {
            const error = createHttpError(400, "Payment verification failed!");
            return next(error);
        }

    } catch (error) {
        next(error);
    }

}


module.exports = { createOrder, verifyPayment };