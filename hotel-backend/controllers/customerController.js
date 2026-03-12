const Customers = require('../models/customerModel');
const {mongoose} = require('mongoose') ;
const createHttpError = require('http-errors');

const addCustomer = async(req, res, next) => {
    
    try {
        const { customerName , email, contactNo, address ,Idnumber, balance } = req.body ;
        const customer = { customerName , email, contactNo, address ,Idnumber, balance } ;
        
        const newCustomer = Customers(customer);
        await newCustomer.save();

        res.status(201).json({ success: true, message: 'New customer added Successfully', data: newCustomer });

    } catch (error) {
        next(error)
    }
}


const getCustomers = async (req, res, next) => {
    try {

        const { search, sort = '-createdAt', page = 1, limit = 10 } = req.body;
        const query = {
            ...(search && {
                or: [
                    { customerName: { $regex: search, $options: 'i' } },
                    { contactNo: { $regex: search, $options: 'i' } },
                    { Idnumber: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } },
                  
                    { email: { $regex: search, $options: 'i' } },
                ]
            })
        };

        let sortOption = {};
        if (sort === '-createdAt') {
            sortOption = { createdAt: -1 }; // Newest first
        } else if (sort === 'createdAt') {
            sortOption = { createdAt: 1 }; // Oldest first
        };


        // Calculate pagination values
        const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        const total = await Customers.countDocuments(query);

        // Get paginated results
        const customers = await Customers.find(query)
            .sort(sortOption)
            .skip(startIndex)
            .limit(limit)

        // response
        res.status(200).json({
            message: 'All customers fetched successfully',
            success: true,
            data: customers,
            customers,

            pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error)
    }

};

const removeCustomer = async(req, res, next) => {
    try {
        
        await Customers.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Selected customer removed Successfully .' })
        
    } catch (error) {
        
    }
}



const updateCustomerBalance = async (req, res, next) => {
   
    try {

        const { balance } = req.body;
        const { id } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid Id");
            return next(error);
        };

        const customer = await Customers.findByIdAndUpdate(
            id,
            
            { balance },
            { new : true }
        );

       
        if (!customer) {
            const error = createHttpError(404, 'Customer is not Exist!');
            return error;
        }

        res.status(200).json({ success: true, message: 'Customer balance updated successfully..', data: customer })
        
    } catch (error) {
        next(error)
    }

};


module.exports = { addCustomer, getCustomers, removeCustomer, updateCustomerBalance }
