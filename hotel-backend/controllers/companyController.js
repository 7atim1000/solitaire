const Company = require('../models/companyModel');
const {mongoose} = require('mongoose') ;
const createHttpError = require('http-errors');

const addCompany = async(req, res, next) => {
    
    try {
        const { companyName , email, contactNo, address ,balance } = req.body ;
        const company = { companyName , email, contactNo, address , balance } ;
        
        const newCompany = Company(company);
        await newCompany.save();

        res.status(201).json({ success: true, message: 'New company added Successfully', data: newCompany });

    } catch (error) {
        next(error)
    }
};

const getCompanies = async (req, res, next) => {
    try {

        const { search, sort = '-createdAt', page = 1, limit = 10 } = req.body;
        const query = {
            ...(search && {
                or: [
                    { companyName: { $regex: search, $options: 'i' } },
                    { contactNo: { $regex: search, $options: 'i' } },
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
        const total = await Company.countDocuments(query);

        // Get paginated results
        const companies = await Company.find(query)
            .sort(sortOption)
            .skip(startIndex)
            .limit(limit)

        // response
        res.status(200).json({
            message: 'All companies fetched successfully',
            success: true,
            data: companies,
            companies,

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

const removeCompany = async(req, res, next) => {
    try {
        
        await Company.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Selected company removed Successfully .' })
        
    } catch (error) {
        
    }
}


const updateCompanyBalance = async (req, res, next) => {
   
    try {

        const { balance } = req.body;
        const { id } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid Id");
            return next(error);
        };

        const company = await Company.findByIdAndUpdate(
            id,
            
            { balance },
            { new : true }
        );

       
        if (!company) {
            const error = createHttpError(404, 'Company is not Exist!');
            return error;
        }

        res.status(200).json({ success: true, message: 'Company balance updated successfully..', data: company })
        
    } catch (error) {
        next(error)
    }

};

module.exports = { addCompany, getCompanies, removeCompany, updateCompanyBalance }


