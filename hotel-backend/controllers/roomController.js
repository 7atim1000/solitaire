const createHttpError = require('http-errors');
const Room = require('../models/roomModel');
const cloudinary = require('cloudinary').v2;

const { mongoose } = require('mongoose');

const addRoom = async (req, res, next) => {
    try {
        const { 
            roomNo, 
            status, 
            category, 
            floor, 
            dolPriceOne, 
            dolPriceTow, 
            rate, 
            priceOne, 
            priceTow, 
            description 
        } = req.body;
        
        const imageFile = req.file; // This is now optional

        // Validate required fields
        if (!roomNo || !status || !category || !floor || 
            !dolPriceOne || !dolPriceTow || !rate || 
            !priceOne || !priceTow || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate numeric fields
        // if (isNaN(seats) || parseInt(seats) <= 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Please provide a valid number of seats'
        //     });
        // }

        if (isNaN(dolPriceOne) || parseFloat(dolPriceOne) <= 0 ||
            isNaN(dolPriceTow) || parseFloat(dolPriceTow) <= 0 ||
            isNaN(rate) || parseFloat(rate) <= 0 ||
            isNaN(priceOne) || parseFloat(priceOne) <= 0 ||
            isNaN(priceTow) || parseFloat(priceTow) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid numeric values for prices and rate'
            });
        }

        // Check if room already exists by room number
        const existingRoom = await Room.findOne({ roomNo });
        if (existingRoom) {
            return res.status(400).json({ 
                success: false, 
                message: 'This room number already exists' 
            });
        }

        // Default image URL (you can set a default room image)
        const defaultRoomImage = "https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOJOx8l21CWrTIZSUBwmxpEXbPd7Ve56iJuMjg";
        
        let imageUrl = defaultRoomImage;
        let cloudinaryId = null;

        // Upload image to Cloudinary only if provided
        if (imageFile) {
            try {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: "image",
                    folder: "room_images",
                    // Optional: Add transformations
                    transformation: [
                        { width: 800, height: 600, crop: "fill" },
                        { quality: "auto" }
                    ]
                });

                imageUrl = imageUpload.secure_url;
                cloudinaryId = imageUpload.public_id;
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                
                // Option 1: Continue with default image
                console.log('Using default image due to upload error');
                imageUrl = defaultRoomImage;
                cloudinaryId = null;
                
                // Option 2: Return error (uncomment if you want to fail on image upload error)
                // return res.status(500).json({
                //     success: false,
                //     message: 'Error uploading image. Please try again or use default image.'
                // });
            }
        }

        // Create new room with optional image
        const newRoom = new Room({
            roomNo: roomNo.trim(),
            // status: "Available",
            category: category.trim(),
            floor: floor.trim(),
            status: status.trim(),
            dolPriceOne: parseFloat(dolPriceOne),
            dolPriceTow: parseFloat(dolPriceTow),
            rate: parseFloat(rate),
            priceOne: parseFloat(priceOne),
            priceTow: parseFloat(priceTow),
            description: description.trim(),
            image: imageUrl,
            cloudinaryId: cloudinaryId,
            hasImage: !!imageFile // Optional: track if image was uploaded
        });

        await newRoom.save();

        res.status(201).json({
            success: true,
            message: imageFile ? 'Room added successfully with image' : 'Room added successfully (using default image)',
            data: {
                _id: newRoom._id,
                roomNo: newRoom.roomNo,
                status: newRoom.status,
                category: newRoom.category,
                floor: newRoom.floor,
                dolPriceOne: newRoom.dolPriceOne,
                dolPriceTow: newRoom.dolPriceTow,
                rate: newRoom.rate,
                priceOne: newRoom.priceOne,
                priceTow: newRoom.priceTow,
                description: newRoom.description,
                image: newRoom.image,
                hasImage: newRoom.hasImage,
                createdAt: newRoom.createdAt
            }
        });

    } catch (error) {
        console.error('Error in addRoom:', error);
        
        // Handle specific errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({
                success: false,
                message: 'Room number already exists'
            });
        }
        
        // Generic error handler
        next(error);
    }
};



const updateRoom = async(req, res, next) => {
    try {
        const { id } = req.params;
        const {  roomNo, category, floor, dolPriceOne, dolPriceTow, rate, priceOne, priceTow, status, description } = req.body;
        let imageUrl;

        if( !roomNo || !category || !floor || !dolPriceOne || !dolPriceTow || !rate || !priceOne || !priceTow || !status || !description){
            return res.json({ success: false, message: 'Missing Details' });
        }

        // If a new image was uploaded
        if(req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {resource_type: "image"});
            imageUrl = imageUpload.secure_url;
        }

        const updateData = {
            roomNo,
            category,
            floor,
            dolPriceOne,
            dolPriceTow,
            rate,
            priceOne,
            priceTow,
            floor,
            status,
            description,
        };

        // Only add image to update if a new one was uploaded
        if(imageUrl) {
            updateData.image = imageUrl;
        }

        const updatedRoom = await Room.findByIdAndUpdate(id, updateData, { new: true });

        if(!updatedRoom) {
            return res.json({ success: false, message: 'Room not found' });
        }

        res.json({ success: true, message: 'Room updated', room: updatedRoom });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};



const getRooms = async (req, res, next) => {
    
    try {
            
        const {floor, roomNo, status, search, sort = '-createdAt', page = 1, limit = 10 } = req.body ;
    
        const query = {
            ...(floor && floor !== 'all' && { floor }),
           
            ...(roomNo && roomNo !== 'all' && { roomNo }),
            ...(status && status !== 'all' && { status }),

            ...(search && {
               
                $or: [
                    { roomNo: { $regex: search, $options: 'i' } },
                   
                    { floor: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } }
                ]
            })
        };

        let sortOption = {};
        if (sort === '-createdAt') {
            sortOption = { createdAt: -1 }; // Newest first
        } else if (sort === 'createdAt') {
            sortOption = { createdAt: 1 }; // Oldest first

        } else if (sort === 'roomNo') {
            sortOption = { roomNo: 1 }; // A-Z
        } else if (sort === '-roomNo') {
            sortOption = { name: -1 }; // Z-A

        } else if (sort === 'floor') {
            sortOption = { floor: 1 }; // A-Z
        
        // } else if (sort === 'category') {
        //     sortOption = { category: 1 }; // A-Z
        }
    

        // Calculate pagination values
        const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        const total = await Room.countDocuments(query);

        // Get paginated results
        const rooms = await Room.find(query).populate({
                path: "currentOrder",
                select: "customerDetails"
            })


            .sort(sortOption)
            .skip(startIndex)
            .limit(limit)

        res.status(200).json({
            message: 'All rooms fetched successfully',
            success: true,
            data: rooms,
            rooms,

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


const updateRoomStatus = async (req, res, next) => {
   
    try {

        const { status, bookedBy, dateBooking, dateReturn, guests, orderId } = req.body;
        const { id } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid Id");
            return next(error);
        };

        const room = await Room.findByIdAndUpdate(
            id,
            
            { status, bookedBy, dateBooking, dateReturn,  guests, currentOrder: orderId },
            { new : true }
        );

       
        if (!room) {
            const error = createHttpError(404, 'Room is not Exist!');
            return error;
        }

        res.status(200).json({ success: true, message: 'Room is booked now...', data: room })
        
    } catch (error) {
        next(error)
    }

};

const removeRoom = async (req, res) => {
    try {
    
        await Room.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Room removed Successfully' })
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message })
   
    }
};


module.exports = { addRoom, getRooms, updateRoomStatus, updateRoom, removeRoom }