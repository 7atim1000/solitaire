import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { addCompany, addOrder } from '../../https';
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack';
import { toast } from 'react-hot-toast';
import { GrClose } from "react-icons/gr";
import { IoCloseCircle } from "react-icons/io5";


const CompanyAddModal = ({ setIsAddCompanyModal, fetchCompanies }) => {
    
    const userData = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    
    const handleClose = () => {
        setIsAddCompanyModal(false);
    };

    const [formData, setFormData] = useState({
        companyName: '', 
        contactNo: '', 
        address: '', 
        email: '', 
        balance: '',
    });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData((prev) => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    // Opening Balance Mutation
    const openBalanceMutation = useMutation({
        mutationFn: (reqData) => addOrder(reqData),
        onSuccess: (resData) => {
            const { data } = resData; 
            console.log(data);
            toast.success('Opening balance posted to the Accounting department.');
        },
        onError: (error) => {
            console.log('Error posting opening balance:', error);
            toast.error('Failed to post opening balance');
        }
    });

    // Company Mutation
    const CompanyMutation = useMutation({
        mutationFn: (reqData) => addCompany(reqData),
        onSuccess: (res) => {
            const { data } = res;
            const newCompanyId = data.data?._id || data.company?._id;
            const newCompanyName = data.data?.companyName || data.company?.companyName || formData.companyName;
            
            enqueueSnackbar(data.message, { variant: "success" });
            
            // Check if balance > 0 and create opening balance order
            const balanceAmount = Number(formData.balance);
            if (balanceAmount > 0 && newCompanyId) {
                const openBalanceOrderData = {
                    orderNumber: `OB-COMPANY-${Date.now()}`,
                    orderType: 'Companies opening balance',
                    orderStatus: "Completed",
                    supplier: newCompanyId,
                    company: newCompanyId,  // Add company field with company ID
                    companyName: newCompanyName,  // Add companyName field with company name
                    customerDetails: {
                        name: formData.companyName,
                        email: formData.email,
                        phone: formData.contactNo,
                    },
                    bills: {
                        total: balanceAmount,
                        tax: 0,
                        totalWithTax: balanceAmount,
                        payed: 0,
                        balance: 0,
                        currency: 'SD'
                    },
                    items: [],
                    paymentMethod: null,
                    orderDate: new Date().toISOString().split('T')[0],
                    user: userData?._id || null,
                };

                setTimeout(() => {
                    openBalanceMutation.mutate(openBalanceOrderData);
                }, 500);
            }
            
            if (typeof fetchCompanies === 'function') {
                fetchCompanies();
            }
            setIsAddCompanyModal(false);
        },
        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response?.data?.message || 'An error occurred', { variant: "error" });
            console.log(error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare data for submission - convert empty balance to 0
        const submissionData = {
            ...formData,
            balance: formData.balance === '' ? 0 : Number(formData.balance)
        };
        
        console.log('Submitting company data:', submissionData);
        CompanyMutation.mutate(submissionData);
    };

    return(
        <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50'
            style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className='bg-white border-b-3 border-emerald-600 h-[calc(100vh-2rem)] p-2 shadow-xl w-120 md:mt-1 mt-1 overflow-y-scroll scrollbar-hidden'
            >
                {/*Modal Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Company</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-600 font-bold hover:text-[#be3e3f] text-2xl cursor-pointer"
                        disabled={loading}
                    >
                        ×
                    </button>
                 </div>

                {/*Modal Body */}
                <form className='p-6' onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       
                        <div className="mb-4">
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name='companyName'
                                value={formData.companyName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter company name"
                                required
                                disabled={loading}
                             />
                         </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Company email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="company@example.com"
                                required
                                disabled={loading}
                             />
                         </div>


                         <div className="mb-4">
                            <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Number *
                            </label>
                            <input
                                type="text"
                                id="contactNo"
                                name='contactNo'
                                value={formData.contactNo}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter company contact number"
                                required
                                disabled={loading}
                             />
                         </div>

                         <div className="mb-4">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Address *
                            </label>
                            <input
                                type="text"
                                id="address"
                                name='address'
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter company address"
                                required
                                disabled={loading}
                             />
                         </div>

                          <div className="mb-4">
                            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                                Company Balance
                            </label>
                            <input
                                type="number"
                                id="balance"
                                name='balance'
                                value={formData.balance}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                disabled={loading}
                             />
                             <p className="text-xs text-gray-500 mt-1">Leave empty for zero balance</p>
                             {Number(formData.balance) > 0 && (
                                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                    <span>ℹ️</span>
                                    Opening balance of {Number(formData.balance).toFixed(2)} SD will be posted to accounting
                                </p>
                            )}
                         </div>

                    </div>
                    {/* Modal Footer - Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-semibold text-[#be3e3f] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || CompanyMutation.isPending}
                        >
                            {CompanyMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </div>
                             ) : (
                                 'Add Company'
                             )}
                         </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CompanyAddModal;

// import React, {useState} from 'react'
// import { addCompany } from '../../https';
// import {motion} from 'framer-motion'
// import { useMutation } from '@tanstack/react-query'

// import { enqueueSnackbar } from 'notistack';
// import { GrClose } from "react-icons/gr";
// import { IoCloseCircle } from "react-icons/io5";


// const CompanyAddModal = ({setIsAddCompanyModal, fetchCompanies}) => {
    
//     const [loading, setLoading] = useState(false);
//     const handleClose = () => {
//         setIsAddCompanyModal(false);
//     };


//     const [formData, setFormData] = useState({
//         companyName :'' , contactNo :'' , address :'', email :'', balance : '',
//     });
    
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
        
//         // Handle all fields normally
//         setFormData((prev) => ({ 
//             ...prev, 
//             [name]: value 
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
        
//         // Prepare data for submission - convert empty balance to 0
//         const submissionData = {
//             ...formData,
//             // If balance is empty string, set to 0, otherwise convert to number
//             balance: formData.balance === '' ? 0 : Number(formData.balance)
//         };
        
//         console.log(submissionData)
//         CompanyMutation.mutate(submissionData)
//     };


//     const CompanyMutation = useMutation({
        
//         mutationFn: (reqData) => addCompany(reqData),
//         onSuccess: (res) => {
//             const { data } = res;
//             enqueueSnackbar(data.message, { variant: "success" });
//             if (typeof fetchCompanies === 'function') {
//                 fetchCompanies();
//             }
//             setIsAddCompanyModal(false);
//         },
//         onError: (error) => {
//             const { response } = error;
//             enqueueSnackbar(response?.data?.message || 'An error occurred', { variant: "error" });
//             console.log(error);
//         },
//     });


//     return(

//         <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50'
//             style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.3, ease: "easeInOut" }}
//                 className='bg-white border-b-3 border-emerald-600 h-[calc(100vh-2rem)] p-2 shadow-xl w-120 md:mt-1 mt-1 overflow-y-scroll scrollbar-hidden'
//             >
//                 {/*Modal Header */}
//                 <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
//                     <h2 className="text-xl font-semibold text-gray-800">Add New Company</h2>
//                     <button
//                         onClick={handleClose}
//                         className="text-gray-600 font-bold hover:text-[#be3e3f] text-2xl cursor-pointer"
//                         disabled={loading}
//                     >
//                         ×
//                     </button>
//                  </div>

//                 {/*Modal Body */}
//                 <form className='p-6' onSubmit={handleSubmit}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       
//                         <div className="mb-4">
//                             <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Comapny Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="companyName"
//                                 name='companyName'
//                                 value={formData.companyName}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="Enter company name"
//                                 required
//                                 disabled={loading}
//                              />
//                          </div>

//                         <div className="mb-4">
//                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Company email *
//                             </label>
//                             <input
//                                 type="email"
//                                 id="email"
//                                 name='email'
//                                 value={formData.email}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="company@example.com"
//                                 required
//                                 disabled={loading}
//                              />
//                          </div>


//                          <div className="mb-4">
//                             <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Contact Number *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="contactNo"
//                                 name='contactNo'
//                                 value={formData.contactNo}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="Enter company contact number"
//                                 required
//                                 disabled={loading}
//                              />
//                          </div>

//                          <div className="mb-4">
//                             <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Address *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="address"
//                                 name='address'
//                                 value={formData.address}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="Enter company address"
//                                 required
//                                 disabled={loading}
//                              />
//                          </div>

//                           <div className="mb-4">
//                             <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Company Balance
//                             </label>
//                             <input
//                                 type="number"
//                                 id="balance"
//                                 name='balance'
//                                 value={formData.balance}
//                                 onChange={handleInputChange}
//                                 placeholder="0.00"
//                                 step="0.01"
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 disabled={loading}
//                              />
//                              <p className="text-xs text-gray-500 mt-1">Leave empty for zero balance</p>
//                          </div>

//                     </div>
//                     {/* Modal Footer - Buttons */}
//                     <div className="flex justify-end gap-3 pt-6 border-t mt-4">
//                         <button
//                             type="button"
//                             onClick={handleClose}
//                             className="px-4 py-2 text-sm font-semibold text-[#be3e3f] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
//                             disabled={loading}
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             {loading ? (
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     Adding...
//                                 </div>
//                              ) : (
//                                  'Add Company'
//                              )}
//                          </button>
//                     </div>
//                 </form>
//             </motion.div>
//         </div>
//     );
// };

// export default CompanyAddModal;
