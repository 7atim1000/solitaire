const { mongoose } = require('mongoose');
const Service = require('../models/serviceModel')


const addService = async(req, res, next) => {
    try {

        const { category, serviceName, price, qty, unit } = req.body ;
         if (!category || !serviceName || !price  ||!unit) {
        res.status(400).json({ status: false, message: 'Please privide all fields' })
        }

        const isServicePresent = await Service.findOne({ serviceName });
        if (isServicePresent) {
          res.status(400).json({ status: false, message: 'Service is already exist' });
        
        } else {
          
          const service = { category, serviceName, price, qty, unit };

          const newService = Service(service);
          await newService.save();

          res.status(201).json({ success: true, message: 'New Item added Successfully', data: newService });

        }

  
        
    } catch (error) {
        next(error)
    }
} 




const getServices = async (req, res, next) => {
    
    try {
            
      const { category, serviceName, search, sort = '-createdAt', page = 1, limit = 10 } = req.body;

      const query = {
        ...(category && category !== 'all' && { category }),
        ...(serviceName && serviceName !== 'all' && { serviceName }),
        

        ...(search && {
          $or: [
            { category: { $regex: search, $options: 'i' } },
            { serviceName: { $regex: search, $options: 'i' } }
          ]
        })
      };

      let sortOption = {};
      if (sort === '-createdAt') {
        sortOption = { createdAt: -1 }; // Newest first
      } else if (sort === 'createdAt') {
        sortOption = { createdAt: 1 }; // Oldest first

      } else if (sort === 'serviceName') {
        sortOption = { serviceName: 1 }; // A-Z
      } else if (sort === 'serviceName') {
        sortOption = { serviceName: -1 }; // Z-A

      } else if (sort === 'category') {
        sortOption = { category: 1 }; // A-Z
      }

      // Calculate pagination values
      const startIndex = (page - 1) * limit;
      // const endIndex = page * limit;
      const total = await Service.countDocuments(query);

      // Get paginated results
      const services = await Service.find(query)

        .sort(sortOption)
        .skip(startIndex)
        .limit(limit)

      res.status(200).json({
        message: 'All services fetched successfully',
        success: true,
        data: services,
        services,

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


const removeService = async(req, res, next) => {
    try {

        await Service.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Selected item removed Successfully' })
    
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message });
    }

}



//exports.updateQuantities = async (req, res) => {
const updateBuyQuantities = async(req, res) => {  
    try {
    const { items } = req.body;
    for (const { id, quantity } of items) {
      await Service.findByIdAndUpdate(id, { $inc: { qty: +quantity } }); // subtract purchased qty
    }
    res.status(200).json({ success: true, message: 'Quantities updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSaleQuantities = async(req, res) => {  
    try {
    const { items } = req.body;
    for (const { id, quantity } of items) {
      await Service.findByIdAndUpdate(id, { $inc: { qty: -quantity } }); // subtract purchased qty
    }
    res.status(200).json({ success: true, message: 'Quantities updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = { addService, getServices, removeService, updateBuyQuantities, updateSaleQuantities }