import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../https';
import { toast } from 'react-toastify';
import { IoCloseCircle } from 'react-icons/io5';
import { MdAttachMoney, MdCategory, MdDescription, MdPayment, MdReceipt, MdUpdate } from "react-icons/md";
import { FaArrowUp, FaArrowDown, FaMoneyBillWave } from "react-icons/fa";

const TransactionUpdate = ({ transaction, setIsEditTransactionModal, fetchTransactions }) => {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Payment method options
    const paymentMethods = [
        { value: "Cash", label: "Cash", icon: "💵" },
        { value: "Credit Card", label: "Credit Card", icon: "💳" },
        { value: "Debit Card", label: "Debit Card", icon: "🏦" },
        { value: "Bank Transfer", label: "Bank Transfer", icon: "↗️" },
        { value: "Digital Wallet", label: "Digital Wallet", icon: "📱" },
        { value: "Check", label: "Check", icon: "📝" }
    ];

    const [formData, setFormData] = useState({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        refrence: transaction.refrence,
        description: transaction.description,
        paymentMethod: transaction.paymentMethod || "Cash",
        status: 'updated'
    });

    // Fetch categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Fetch both incomes and expenses
            const [incomesResponse, expensesResponse] = await Promise.all([
                api.get('/api/incomes/'),
                api.get('/api/expenses/')
            ]);

            if (incomesResponse.data.success) {
                setIncomes(incomesResponse.data.data || []);
            }
            
            if (expensesResponse.data.success) {
                setExpenses(expensesResponse.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setUpdating(true);
        
        try {
            const { data } = await api.put(`/api/transactions/${transaction._id}`, formData);
            if (data.success) {
                toast.success(data.message);
                fetchTransactions();
                handleClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleClose = () => {
        setIsEditTransactionModal(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                        <p className="text-gray-600 font-medium">Loading categories...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-emerald-50 rounded-xl shadow-2xl border border-emerald-200 
                          w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col'
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MdReceipt className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className='text-lg sm:text-xl font-bold text-white'>Update Transaction</h2>
                                <p className='text-emerald-100 text-xs sm:text-sm'>Modify transaction details</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleClose}
                            className='p-2 text-white hover:bg-white/20 rounded-lg transition duration-200 cursor-pointer'
                            disabled={updating}
                        >
                            <IoCloseCircle size={22} />
                        </button>
                    </div>
                </div>

                {/* Modal Body - Form */}
                <div className='flex-1 overflow-y-auto p-4 sm:p-5'>
                    <form onSubmit={onSubmitHandler}>
                        {/* Type Selection */}
                        <div className="mb-5">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-3'>
                                <FaMoneyBillWave className="text-emerald-600 w-4 h-4" />
                                Transaction Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type='button'
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'Income' }))}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border 
                                             transition duration-200 cursor-pointer text-sm font-medium
                                             ${formData.type === 'Income'
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-600 shadow-md'
                                                : 'bg-white border-emerald-200 text-gray-700 hover:bg-green-50'
                                             }`}
                                    disabled={updating}
                                >
                                    <FaArrowUp className="w-4 h-4" />
                                    Income
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setFormData(prev => ({ ...prev, type: 'Expense' }))}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border 
                                             transition duration-200 cursor-pointer text-sm font-medium
                                             ${formData.type === 'Expense'
                                                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-600 shadow-md'
                                                : 'bg-white border-emerald-200 text-gray-700 hover:bg-red-50'
                                             }`}
                                    disabled={updating}
                                >
                                    <FaArrowDown className="w-4 h-4" />
                                    Expense
                                </button>
                            </div>
                            {formData.type && (
                                <p className={`text-xs mt-2 font-medium text-center
                                    ${formData.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                    Current Type: {formData.type}
                                </p>
                            )}
                        </div>

                        {/* Category Selection */}
                        {(formData.type === 'Income' || formData.type === 'Expense') && (
                            <div className="mb-4">
                                <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                    <MdCategory className="text-emerald-600 w-4 h-4" />
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        name='category'
                                        className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                                 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                                 focus:border-transparent transition duration-200 appearance-none'
                                        disabled={updating}
                                    >
                                        <option value="">
                                            {formData.type === 'Income' 
                                                ? 'Select Income Category' 
                                                : 'Select Expense Category'}
                                        </option>
                                        {(formData.type === 'Income' ? incomes : expenses).map((item, index) => (
                                            <option key={index} value={item[formData.type === 'Income' ? 'incomeName' : 'expenseName']}>
                                                {item[formData.type === 'Income' ? 'incomeName' : 'expenseName']}
                                            </option>
                                        ))}
                                    </select>
                                    <MdCategory className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdPayment className="text-emerald-600 w-4 h-4" />
                                Payment Method
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                    name='paymentMethod'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200 appearance-none'
                                    disabled={updating}
                                >
                                    {paymentMethods.map((method, index) => (
                                        <option key={index} value={method.value}>
                                            {method.icon} {method.label}
                                        </option>
                                    ))}
                                </select>
                                <MdPayment className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdAttachMoney className="text-emerald-600 w-4 h-4" />
                                Amount
                            </label>
                            <div className="relative">
                                <input
                                    type='number'
                                    name='amount'
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder='Enter amount'
                                    className='w-full px-4 py-3 pl-10 pr-12 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    min="0"
                                    step="0.01"
                                    disabled={updating}
                                />
                                <MdAttachMoney className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                                    SD
                                </span>
                            </div>
                        </div>

                        {/* Reference */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdReceipt className="text-emerald-600 w-4 h-4" />
                                Reference
                            </label>
                            <div className="relative">
                                <input
                                    type='text'
                                    name='refrence'
                                    value={formData.refrence}
                                    onChange={handleInputChange}
                                    placeholder='Enter reference (invoice number, receipt ID, etc.)'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    disabled={updating}
                                />
                                <MdReceipt className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdDescription className="text-emerald-600 w-4 h-4" />
                                Description
                            </label>
                            <div className="relative">
                                <input
                                    type='text'
                                    name='description'
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder='Enter transaction description'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    disabled={updating}
                                />
                                <MdDescription className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type='submit'
                            disabled={updating || !formData.type || !formData.amount || !formData.category}
                            className={`w-full py-3 rounded-lg transition duration-200 cursor-pointer 
                                     font-medium text-sm flex items-center justify-center gap-2
                                     ${updating || !formData.type || !formData.amount || !formData.category
                                        ? 'bg-emerald-400 cursor-not-allowed' 
                                        : formData.type === 'Income'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                                     } text-white shadow-sm hover:shadow-md`}
                        >
                            {updating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <MdUpdate className="w-4 h-4" />
                                    <span>Update Transaction</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="border-t border-emerald-200 bg-emerald-50 p-4">
                    <button
                        onClick={handleClose}
                        disabled={updating}
                        className='w-full py-2.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg 
                                 hover:bg-emerald-50 transition duration-200 cursor-pointer font-medium text-sm'
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default TransactionUpdate;