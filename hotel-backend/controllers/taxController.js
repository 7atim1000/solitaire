const Tax = require('../models/taxModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');

// Helper function to generate tax number with sequence
const generateTaxNumber = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Find the last tax for this year/month
    const lastTax = await Tax.findOne({
        taxNumber: { $regex: `^${year}/${month}/` }
    }).sort({ taxNumber: -1 });

    let sequence = 1;
    
    if (lastTax) {
        // Extract the sequence number from the last tax number
        const lastSequence = parseInt(lastTax.taxNumber.split('/')[2]);
        if (!isNaN(lastSequence)) {
            sequence = lastSequence + 1;
        }
    }

    // Format sequence with leading zeros (01, 02, etc.)
    const formattedSequence = String(sequence).padStart(2, '0');
    
    return `${year}/${month}/${formattedSequence}`;
};

// @desc    Add a new tax
// @route   POST /api/taxes
// @access  Private
const addTax = async (req, res, next) => {
    try {
        const { order, orderValue, tax, taxValue } = req.body;

        // Validate required fields
        if (!order || !orderValue || !taxValue) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: order, orderValue, taxValue'
            });
        }

        // Check if order exists
        const existingOrder = await Order.findById(order);
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Generate tax number with sequence
        const taxNumber = await generateTaxNumber();

        // Create new tax
        const newTax = new Tax({
            order,
            orderValue,
            tax: tax || 'VAT', // Default tax type if not provided
            taxValue,
            taxNumber,
            taxDate: new Date() // Set to today
        });

        await newTax.save();

        // Populate order field for response
        const populatedTax = await Tax.findById(newTax._id).populate({
            path: 'order',
            populate: [
                { path: 'customer' },
                { path: 'room' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Tax record created successfully',
            data: populatedTax
        });

    } catch (error) {
        console.error('Error adding tax:', error);
        next(error);
    }
};

// @desc    Fetch all taxes with filters
// @route   GET /api/taxes
// @access  Private
const fetchTaxes = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            startDate, 
            endDate, 
            search,
            sortBy = 'taxDate',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        let query = {};

        // Filter by date range
        if (startDate || endDate) {
            query.taxDate = {};
            if (startDate) {
                query.taxDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.taxDate.$lte = new Date(endDate);
            }
        }

        // Search functionality
        if (search) {
            query.$or = [
                { taxNumber: { $regex: search, $options: 'i' } },
                { tax: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Determine sort order
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Fetch taxes with population
        const taxes = await Tax.find(query)
            .populate({
                path: 'order',
                populate: [
                    { path: 'customer', select: 'name email phone' },
                    { path: 'room', select: 'roomNo' }
                ]
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalTaxes = await Tax.countDocuments(query);

        // Calculate summary statistics
        const summary = await Tax.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalOrderValue: { $sum: '$orderValue' },
                    totalTaxValue: { $sum: '$taxValue' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Taxes fetched successfully',
            data: {
                taxes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTaxes / parseInt(limit)),
                    totalItems: totalTaxes,
                    itemsPerPage: parseInt(limit)
                },
                summary: summary[0] || {
                    totalOrderValue: 0,
                    totalTaxValue: 0,
                    count: 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching taxes:', error);
        next(error);
    }
};

// @desc    Get single tax by ID
// @route   GET /api/taxes/:id
// @access  Private
const getTaxById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tax ID format'
            });
        }

        const tax = await Tax.findById(id).populate({
            path: 'order',
            populate: [
                { path: 'customer' },
                { path: 'room' }
            ]
        });

        if (!tax) {
            return res.status(404).json({
                success: false,
                message: 'Tax record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: tax
        });

    } catch (error) {
        console.error('Error fetching tax:', error);
        next(error);
    }
};

// @desc    Update tax
// @route   PUT /api/taxes/:id
// @access  Private
const updateTax = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { orderValue, tax, taxValue } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tax ID format'
            });
        }

        const updatedTax = await Tax.findByIdAndUpdate(
            id,
            { orderValue, tax, taxValue },
            { new: true, runValidators: true }
        ).populate({
            path: 'order',
            populate: [
                { path: 'customer' },
                { path: 'room' }
            ]
        });

        if (!updatedTax) {
            return res.status(404).json({
                success: false,
                message: 'Tax record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tax record updated successfully',
            data: updatedTax
        });

    } catch (error) {
        console.error('Error updating tax:', error);
        next(error);
    }
};

// @desc    Delete tax
// @route   DELETE /api/taxes/:id
// @access  Private
const deleteTax = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tax ID format'
            });
        }

        const deletedTax = await Tax.findByIdAndDelete(id);

        if (!deletedTax) {
            return res.status(404).json({
                success: false,
                message: 'Tax record not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Tax record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting tax:', error);
        next(error);
    }
};

// @desc    Get tax summary by date range
// @route   GET /api/taxes/summary
// @access  Private
const getTaxSummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.taxDate = {};
            if (startDate) dateFilter.taxDate.$gte = new Date(startDate);
            if (endDate) dateFilter.taxDate.$lte = new Date(endDate);
        }

        const summary = await Tax.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalOrderValue: { $sum: '$orderValue' },
                    totalTaxValue: { $sum: '$taxValue' },
                    count: { $sum: 1 },
                    avgTaxRate: { $avg: { $multiply: ['$taxValue', 100 / '$orderValue'] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalOrderValue: 1,
                    totalTaxValue: 1,
                    count: 1,
                    avgTaxRate: { $round: ['$avgTaxRate', 2] }
                }
            }
        ]);

        // Group by month for trend analysis
        const monthlyTrend = await Tax.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        year: { $year: '$taxDate' },
                        month: { $month: '$taxDate' }
                    },
                    totalTaxValue: { $sum: '$taxValue' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                summary: summary[0] || {
                    totalOrderValue: 0,
                    totalTaxValue: 0,
                    count: 0,
                    avgTaxRate: 0
                },
                monthlyTrend
            }
        });

    } catch (error) {
        console.error('Error getting tax summary:', error);
        next(error);
    }
};

module.exports = {
    addTax,
    fetchTaxes,
    getTaxById,
    updateTax,
    deleteTax,
    getTaxSummary
};