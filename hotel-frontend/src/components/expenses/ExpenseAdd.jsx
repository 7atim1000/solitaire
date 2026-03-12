import React, { useState } from 'react'
import { addExpense } from '../../https';
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { IoCloseCircle } from 'react-icons/io5';
import { MdAttachMoney, MdAdd, MdReceipt, MdWarning } from "react-icons/md";

const ExpenseAdd = ({ setIsExpenseModalOpen }) => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        expenseName: ""
    });
        
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await ExpenseMutation.mutateAsync(formData);
            setIsExpenseModalOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const ExpenseMutation = useMutation({
        mutationFn: (reqData) => addExpense(reqData),
        onSuccess: (res) => {
            const { data } = res;
            enqueueSnackbar(data.message, { variant: "success"});
            setFormData({ expenseName: "" });
            window.location.reload()
        },
        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response?.data?.message || "An error occurred", { variant: "error"});
            console.log(error);
        },
    });
         
    const handleClose = () => {
        setIsExpenseModalOpen(false);
    };

    // Common expense categories for quick selection
    const commonExpenseTypes = [
        "Office Supplies",
        "Rent & Utilities",
        "Salaries & Wages",
        "Marketing & Advertising",
        "Travel & Entertainment",
        "Equipment Purchase",
        "Maintenance & Repairs",
        "Insurance Premiums",
        "Software Subscriptions",
        "Professional Fees",
        "Bank Charges",
        "Tax Payments",
        "Shipping & Delivery",
        "Training & Development",
        "Employee Benefits",
        "Raw Materials",
        "Packaging Costs",
        "Legal Fees",
        "Consulting Services",
        "Miscellaneous Expenses"
    ];

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-emerald-50 rounded-xl shadow-2xl border border-emerald-200 
                          w-full max-w-md'
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MdReceipt className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className='text-lg sm:text-xl font-bold text-white'>Add Expense Category</h2>
                                <p className='text-emerald-100 text-xs sm:text-sm'>Create new expense account</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleClose}
                            className='p-2 text-white hover:bg-white/20 rounded-lg transition duration-200 cursor-pointer'
                            disabled={loading}
                        >
                            <IoCloseCircle size={22} />
                        </button>
                    </div>
                </div>

                {/* Modal Body - Form */}
                <div className='p-4 sm:p-5'>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdAttachMoney className="text-red-600 w-4 h-4" />
                                Expense Category Name
                            </label>
                            <div className="relative">
                                <input 
                                    type='text'
                                    name='expenseName'
                                    value={formData.expenseName}
                                    onChange={handleInputChange}
                                    placeholder='Enter expense category name'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                <MdAttachMoney className='absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600' />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Create a descriptive name for the expense category
                            </p>
                        </div>

                        {/* Common Expense Categories */}
                        <div className="mb-6 pt-4 border-t border-emerald-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Common Expense Categories:</h4>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                                {commonExpenseTypes.map((type, index) => (
                                    <span 
                                        key={index}
                                        onClick={() => setFormData({ expenseName: type })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer 
                                                 transition duration-200 border
                                                 ${formData.expenseName === type
                                                    ? 'bg-red-600 text-white border-red-600'
                                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                                                 }`}
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type='button'
                                onClick={handleClose}
                                disabled={loading}
                                className='flex-1 px-4 py-3 bg-white border border-emerald-300 text-emerald-700 rounded-lg 
                                         hover:bg-emerald-50 transition duration-200 cursor-pointer font-medium text-sm'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={loading || !formData.expenseName.trim()}
                                className={`flex-1 px-4 py-3 rounded-lg transition duration-200 cursor-pointer 
                                         font-medium text-sm flex items-center justify-center gap-2
                                         ${loading || !formData.expenseName.trim()
                                            ? 'bg-emerald-400 cursor-not-allowed' 
                                            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                                         } text-white shadow-sm hover:shadow-md`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdAdd className="w-4 h-4" />
                                        <span>Add Expense Category</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Section */}
                <div className="border-t border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                        <MdWarning className="text-red-600 w-5 h-5" />
                        <div>
                            <p className="text-sm font-medium text-emerald-800">Expense Tracking Tips</p>
                            <p className="text-xs text-emerald-600">
                                Use specific names for accurate financial tracking and tax reporting
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExpenseAdd;