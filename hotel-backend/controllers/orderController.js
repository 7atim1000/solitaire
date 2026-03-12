// addToset pull push [array operators]
// https://www.youtube.com/watch?v=M5MVeivZ0gA   adding object in array

const createHttpError = require('http-errors');
const Order = require('../models/orderModel');
const { mongoose } = require('mongoose');


const moment = require('moment');

    // const extraOrder = async (req, res, next) => {
    //         const orderId = req.params.id;
    //         //const {newItem} = req.body;

    //         const order = await Order.findById(orderId);
            
    //         const  newItem  =  req.body ;

    //     //const extra = {...req.body, items: [...order.items, newItem]};
    //         const extra = {...req.body, items: [...order.items, newItem]};

    //         const addExtra = await Order.findByIdAndUpdate(
    //             orderId,
    //             extra,

    //             {
    //                 new: true
    //             }

    //         )


    //         res.status(201).json({ success: true, message: 'Order Created!', data :addExtra });
    //     } 


    const extraOrder = async (req, res, next) => {

    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    const newItems = req.body; // Assuming newItems is an array

    // Merge arrays (flatten if needed)
    const updatedItems = [...order.items, ...newItems]; 

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { items: updatedItems },
        { new: true }
    );

    res.status(201).json({ 
        success: true, 
        message: 'Items added to order!', 
        data: updatedOrder 
    });
};




    // controller code 
    // const updateTotals = async(req, res, next) => {

    //     try {

    //         const { total, totalWithTax } = req.body;
    //         const { id } = req.params;

      
    //         const order = await Order.findByIdAndUpdate(
    //             id,
    //             {
    //                 $set: {
    //                     "bills.total" : total,
    //                     "bills.totalWithTax" : totalWithTax
    //                 }
    //             }, 

    //             { new: true, runValidators: true }
    //         );


    //         if (!order) {
    //             const error = createHttpError(404, 'order is not Exist!');
    //             return error;
    //         }

    //         res.status(200).json({ success: true, message: 'Order totals updated successfully..', data: order })

    //     } catch (error) {
        
    //     }
    // };

//     const updateTotals = async(req, res, next) => {
//     try {
//         const { total, totalWithTax } = req.body;
//         const { id } = req.params;

//         // Add validation for the numbers
//         if (typeof total !== 'number' || typeof totalWithTax !== 'number') {
//             return next(createHttpError(400, 'Total values must be numbers'));
//         }

//         // Debugging log
//         console.log(`Updating order ${id} with totals:`, { total, totalWithTax });

//         const order = await Order.findByIdAndUpdate(
//             id,
//             {
//                 $set: {
//                     "bills.total": total,
//                     "bills.totalWithTax": totalWithTax
//                 }
//             },
//             { 
//                 new: true,
//                 runValidators: true
//             }
//         );

//         if (!order) {
//             return next(createHttpError(404, 'Order does not exist!'));
//         }

//         // Debugging log
//         console.log('Updated order:', order);

//         return res.status(200).json({ 
//             success: true, 
//             message: 'Order totals updated successfully', 
//             data: order 
//         });

//     } catch (error) {
//         // Important: Pass errors to Express error handler
//         console.error('Update error:', error);
//         next(error);
//     }
// };


// Enhanced Controller with Debugging

const updateTotals = async(req, res, next) => {
    try {
        
        console.log('Received request body:', req.body); // Debugging
        
        const { total, totalWithTax, payed, balance, tax } = req.body;
        const { id } = req.params;

        // Validate input
        if (isNaN(total) || isNaN(totalWithTax) || isNaN(payed) || isNaN(balance) || isNaN(tax)) {
            return next(createHttpError(400, 'Totals must be valid numbers'));
        }

        const update = { 
            $set: { 

                "bills.total": Number(total),
                "bills.totalWithTax": Number(totalWithTax),

                "bills.payed": Number(payed),
                "bills.balance": Number(balance),
                "bills.tax": Number(tax),
            } 
        };

        console.log('Update operation:', update); // Debugging

        const order = await Order.findByIdAndUpdate(
           
            id , // Handle both param and body ID
            update,
            { 
                new: true,
                runValidators: true,
                lean: true
            }
        );

        if (!order) {
            console.error('Order not found with ID:', id);
            return next(createHttpError(404, 'Order not found'));
        }

        console.log('Successfully updated order:', order); // Debugging
        
        return res.status(200).json({ 
            success: true, 
            data: order,
            message: 'Bills updated successfully'
        });

    } catch (error) {
        console.error('Update failed:', error);
        next(error);
    }
};


 
const addOrder = async (req, res, next) => {
   
    function getCurrentShift() {
        const hour = new Date().getHours();
        // Example: morning = 6:00-17:59, evening = 18:00-5:59
        return (hour >= 6 && hour < 18) ? 'Morning' : 'Evening';
    }


    try {

        const order = new Order(
            {
            ...req.body,
            shift : getCurrentShift(),
            }
        );

        await order.save();
        res.status(201).json({ success: true, message: 'Order Created!', data: order });

    } catch (error) {   
        next(error);
   }

};


// const getOrders = async (req, res, next ) => {
    
//     try {
        
//         const { frequency ,orderStatus , orderType ,shift, sort ='-createdAt', search, page = 1, limit = 10 } = req.body ;

//         const query = {
//             orderDate: {
//                 $gt: moment().subtract(Number(frequency), "d").toDate(),
//             },
//             ...(orderStatus && orderStatus !== 'all' && { orderStatus }),
//             ...(orderType && orderType !== 'all' && { orderType }),
//             ...(shift && shift !== 'all' && { shift }),

//             //To search on nested fields like customerDetails.name, you need to use dot notation in your MongoDB
//             ...(search && {
//                 $or: [
//                     { shift: { $regex: search, $options: 'i' } },
//                     { orderNo: { $regex: search, $options: 'i' } },
//                     { 'customerDetails.name': { $regex: search, $options: 'i' } },
//                     { 'customerDetails.email': { $regex: search, $options: 'i' } },
//                 ]
//             })

//         };
        
//         // In your backend (getEmployees function)
//         let sortOption = {};
//         if (sort === '-createdAt') {
//             sortOption = { createdAt: -1 }; // Newest first
//         } else if (sort === 'createdAt') {
//             sortOption = { createdAt: 1 }; // Oldest first

//         } else if (sort === 'orderStatus') {
//             sortOption = { type: 1 }; // A-Z
//         } else if (sort === '-orderStatus') {
//             sortOption = { type: -1 }; // Z-A
//         } 

        
//         // Calculate pagination values
//         const startIndex = (page - 1) * limit;
//         // const endIndex = page * limit;
//         const total = await Order.countDocuments(query) .populate([
//                 {
//                     path: "room",
//                     select: "roomNo",
//                 },
//                 {
//                     path: "user",
//                     select: "name",
//                 },
//             ])

//         // Get paginated results
//         const orders = await Order.find(query) .populate([
//                 {
//                     path: "room",
//                     select: "roomNo",
//                 },
//                 {
//                     path: "user",
//                     select: "name",
//                 },
//             ])
//             .sort(sortOption)
//             .skip(startIndex)
//             .limit(limit);

//         res.status(200).json({
//             message: 'All orders fetched successfully',
//             success: true,
//             data: orders,
//             orders,

//             pagination: {
//                 currentPage: Number(page),
//                 limit: Number(limit),
//                 total,
//                 totalPages: Math.ceil(total / limit)
//             }
//         });
        

//     } catch (error) {
//         next(error)
//     }
// };

const getOrders = async (req, res, next) => {
    try {
        const { frequency, orderStatus, orderType, shift, sort = '-createdAt', search, page = 1, limit = 10 } = req.body;

        // Build query object
        const query = {
            orderDate: {
                $gt: moment().subtract(Number(frequency), "d").toDate(),
            }
        };

        // Add optional filters - only if they're provided and not 'all' or empty
        if (orderStatus && orderStatus !== 'all' && orderStatus.trim() !== '') {
            query.orderStatus = orderStatus;
        }
        
        if (orderType && orderType !== 'all' && orderType.trim() !== '') {
            query.orderType = orderType;
        }
        
        if (shift && shift !== 'all' && shift.trim() !== '') {
            query.shift = shift;
        }

        // Search functionality
        if (search && search.trim() !== '') {
            query.$or = [
                { shift: { $regex: search, $options: 'i' } },
                { orderNo: { $regex: search, $options: 'i' } },
                { 'customerDetails.name': { $regex: search, $options: 'i' } },
                { 'customerDetails.email': { $regex: search, $options: 'i' } },
                { 'room.roomNo': { $regex: search, $options: 'i' } } // Added room number search
            ];
        }

        // Sort options
        let sortOption = {};
        if (sort === '-createdAt') {
            sortOption = { createdAt: -1 };
        } else if (sort === 'createdAt') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'orderStatus') {
            sortOption = { orderStatus: 1 };
        } else if (sort === '-orderStatus') {
            sortOption = { orderStatus: -1 };
        } else if (sort === 'bills.totalWithTax') {
            sortOption = { 'bills.totalWithTax': 1 };
        } else if (sort === '-bills.totalWithTax') {
            sortOption = { 'bills.totalWithTax': -1 };
        }

        // Calculate pagination - FIXED: countDocuments doesn't take populate
        const total = await Order.countDocuments(query);

        // Calculate start index
        const startIndex = (page - 1) * limit;

        // Get paginated results with population
        const orders = await Order.find(query)
            .populate([
                {
                    path: "room",
                    select: "roomNo floor seats",
                },
                {
                    path: "user",
                    select: "name email",
                },
                {
                    path: "customer",
                    select: "customerName balance",
                },
            ])
            .sort(sortOption)
            .skip(startIndex)
            .limit(Number(limit));

        res.status(200).json({
            message: 'All orders fetched successfully',
            success: true,
            data: orders,
            orders: orders, // Keep both for backward compatibility
            total,
            pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        next(error);
    }
};


const getOrderById = async (req, res, next) => {
    
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, 'Invalid ID !');
            return next(error);
        }
    
        const order = await Order.findById(id);

        if (!order){
           const error = createHttpError(404, 'Order not found');
           return next(error);
        }

        res.status(200).json({ success: true, data: order})
    } catch (error) {
        next(error)
    }
}



const updateOrder = async (req, res, next) => {
    
    try {
        const { orderStatus, bills } = req.body;
        const {id} = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, 'Invalid ID !');
            return next(error);
        }

        const order = await Order.findByIdAndUpdate(
           // req.params.id,
           id,  
           {orderStatus, bills},
            {new: true}
        );
        
        if(! order){
            const error = createHttpError(404, 'Order not found to update!');
            return next(error);
        }
        res.status(200).json({ success: true, message: 'Order updated', data: order })

    } catch (error) {
        next(error)
    }
};


// const getOrderCustomer = async (req, res) => {

//     try {
//         const { customer } = req.body;

//         const order = await Order.find({
//             // customer: customer
            
//         });

//         res.status(200).json(order);

//     } catch (error) {
//         console.log(error)
//         res.status(500).json(error)

//     }

// };

const getOrderCustomer = async (req, res) => {
    try {
        const { customer } = req.body;

        // Validate customer ID
        if (!customer) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required"
            });
        }

        // Find orders for this specific customer
        const orders = await Order.find({
            customer: customer
        }).sort({ createdAt: -1 }); // Optional: sort by newest first

        // Return success response
        res.status(200).json({
            success: true,
            message: "Customer orders fetched successfully",
            data: orders,
            count: orders.length
        });

    } catch (error) {
        console.log("Error fetching customer orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


module.exports = { addOrder, getOrderById, getOrders, updateOrder, extraOrder ,updateTotals, getOrderCustomer }