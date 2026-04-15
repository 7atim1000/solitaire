import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../https';
import { toast } from 'react-toastify'
import { IoCloseCircle } from 'react-icons/io5';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdAttachMoney, MdUpdate } from "react-icons/md";

const CompanyUpdate = ({ company, setIsEditCompanyModal, fetchCompanies }) => {
    const [loading, setLoading] = useState(false);
    
    const handleClose = () => {
        setIsEditCompanyModal(false);
    };

    // Keep the exact same state structure
    const [companyName, setCompanyName] = useState(company.companyName);
    const [email, setEmail] = useState(company.email);
    const [contactNo, setContactNo] = useState(company.contactNo);
    const [address, setAddress] = useState(company.address);
    const [balance, setBalance] = useState(company.balance);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Send as JSON (removing multipart/form-data)
            const updateData = {
                companyName,
                email,
                contactNo,
                address,
                balance
            };
            
            const { data } = await api.put(`/api/company/${company._id}`, updateData);

            if (data.success) {
                toast.success(data.message);
                fetchCompanies();
                handleClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-emerald-50 rounded-xl shadow-2xl border border-emerald-200 
                          w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hidden'
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MdPerson className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-white'>Update Company</h2>
                                <p className='text-emerald-100 text-sm'>Modify company details</p>
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
                <div className='p-5 space-y-4'>
                    <form onSubmit={onSubmitHandler}>
                        {/* Customer Name */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdPerson className="text-emerald-600 w-4 h-4" />
                                Company Name
                            </label>
                            <div className="relative">
                                <input
                                    type='text'
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder='Enter company name'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                <MdPerson className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdEmail className="text-emerald-600 w-4 h-4" />
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Enter customer email'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                <MdEmail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdLocationOn className="text-emerald-600 w-4 h-4" />
                                Address
                            </label>
                            <div className="relative">
                                <input
                                    type='text'
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder='Enter customer address'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                <MdLocationOn className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Contact Number */}
                        <div className="mb-4">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdPhone className="text-emerald-600 w-4 h-4" />
                                Contact Number
                            </label>
                            <div className="relative">
                                <input
                                    type='text'
                                    value={contactNo}
                                    onChange={(e) => setContactNo(e.target.value)}
                                    placeholder='+971 5X XXX XXXX'
                                    className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    autoComplete='off'
                                    disabled={loading}
                                />
                                <MdPhone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="mb-6">
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                                <MdAttachMoney className="text-emerald-600 w-4 h-4" />
                                Current Balance
                            </label>
                            <div className="relative">
                                <input
                                    type='text'
                                    value={balance}
                                    onChange={(e) => setBalance(e.target.value)}
                                    placeholder='Enter customer balance'
                                    className='w-full px-4 py-3 pl-10 pr-12 bg-gray-300 border border-emerald-200 rounded-lg 
                                             text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                             focus:border-transparent transition duration-200'
                                    required
                                    autoComplete='off'
                                    disabled
                                />
                                <MdAttachMoney className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                                    SD
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Current balance: {balance} AED
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type='submit'
                            disabled={loading}
                            className={`w-full py-3 rounded-lg transition duration-200 cursor-pointer 
                                     font-medium text-sm flex items-center justify-center gap-2
                                     ${loading 
                                        ? 'bg-emerald-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                                     } text-white`}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <MdUpdate className="w-4 h-4" />
                                    <span>Update Company</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Cancel Button */}
                <div className="border-t border-emerald-200 p-4 bg-emerald-50">
                    <button
                        onClick={handleClose}
                        className='w-full py-2.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg 
                                 hover:bg-emerald-50 transition duration-200 cursor-pointer font-medium text-sm'
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CompanyUpdate;