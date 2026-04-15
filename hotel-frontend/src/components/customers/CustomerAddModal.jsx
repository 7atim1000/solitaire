import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { addCustomer } from '../../https';
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack';
import { api, addOrder } from '../../https';
import { toast } from 'react-hot-toast';

const CustomerAddModal = ({ setIsAddCustomerModal, fetchCustomers }) => {
    
    const userData = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    
    const handleClose = () => {
        setIsAddCustomerModal(false);
    };

    const [formData, setFormData] = useState({
        customerName: '', 
        Idnumber: '', 
        contactNo: '', 
        address: '', 
        email: '', 
        balance: '',
        companies: false,
        personal: false,
        company: ''
    });
    
    // Fetch companies on component mount
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
            const response = await api.post('/api/company/fetch', {
                search: '',
                page: 1,
                limit: 1000
            });

            if (response.data.success) {
                setCompanies(response.data.companies || response.data.data || []);
            } else {
                enqueueSnackbar(response.data.message || 'Failed to fetch companies', { variant: "error" });
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar(error.message || 'Error fetching companies', { variant: "error" });
        } finally {
            setLoadingCompanies(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData((prev) => ({ 
                ...prev, 
                [name]: checked 
            }));
            
            if (name === 'companies' && !checked) {
                setFormData((prev) => ({ 
                    ...prev, 
                    companies: false,
                    company: '' 
                }));
            }
        } else {
            setFormData((prev) => ({ 
                ...prev, 
                [name]: value 
            }));
        }
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

    // Customer Mutation
    const CustomerMutation = useMutation({
        mutationFn: (reqData) => addCustomer(reqData),
        onSuccess: (res) => {
            const { data } = res;
            const newCustomerId = data.data?._id || data.customer?._id;
            
            enqueueSnackbar(data.message, { variant: "success" });
            
            // Check if balance > 0 and create opening balance order
            const balanceAmount = Number(formData.balance);
            if (balanceAmount > 0 && newCustomerId) {
                const openBalanceOrderData = {
                    orderNumber: `OB-${Date.now()}`,
                    orderType: 'Guests Opening balance',
                    orderStatus: "Completed",
                    customer: newCustomerId,
                    customerDetails: {
                        name: formData.customerName,
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
            
            if (typeof fetchCustomers === 'function') {
                fetchCustomers();
            }
            setIsAddCustomerModal(false);
        },
        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response?.data?.message || 'An error occurred', { variant: "error" });
            console.log(error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate: At least one of companies or personal must be true
        if (!formData.companies && !formData.personal) {
            enqueueSnackbar('Please select at least one customer type (Companies or Personal)', { variant: "warning" });
            return;
        }
        
        // Validate: If companies is true, company must be selected
        if (formData.companies && !formData.company) {
            enqueueSnackbar('Please select a company when Companies is checked', { variant: "warning" });
            return;
        }
        
        const submissionData = {
            ...formData,
            balance: formData.balance === '' ? 0 : Number(formData.balance),
            company: formData.companies ? (formData.company || null) : null
        };
        
        console.log('Submitting customer data:', submissionData);
        CustomerMutation.mutate(submissionData);
    };

    return(
        <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50'
            style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className='bg-white border-b-3 border-emerald-600 h-[calc(100vh-2rem)] p-2 shadow-xl w-200 md:mt-1 mt-1 overflow-y-scroll scrollbar-hidden'
            >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Guest</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-600 font-bold hover:text-[#be3e3f] text-2xl cursor-pointer"
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                {/* Modal Body */}
                <form className='p-6' onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       
                        <div className="mb-4">
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                                Guest Name *
                            </label>
                            <input
                                type="text"
                                id="customerName"
                                name='customerName'
                                value={formData.customerName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter customer name"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Guest email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name='email'
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="guest@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                ID Number *
                            </label>
                            <input
                                type="text"
                                id="idNumber"
                                name='Idnumber'
                                value={formData.Idnumber}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter guest ID number"
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
                                placeholder="Enter customer contact number"
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
                                placeholder="Enter customer address"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Customer Type Checkboxes */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customer Type *
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="companies"
                                        checked={formData.companies}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-gray-700">Companies</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="personal"
                                        checked={formData.personal}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                        disabled={loading}
                                    />
                                    <span className="text-sm text-gray-700">Personal</span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Select at least one type</p>
                        </div>

                        {/* Company Selection Dropdown - Show only when Companies checkbox is checked */}
                        {formData.companies && (
                            <div className="mb-4">
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Company *
                                </label>
                                <select
                                    id="company"
                                    name='company'
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                                    disabled={loading || loadingCompanies}
                                    required={formData.companies}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company._id} value={company._id}>
                                            {company.name || company.companyName}
                                        </option>
                                    ))}
                                </select>
                                {loadingCompanies && (
                                    <p className="text-xs text-gray-500 mt-1">Loading companies...</p>
                                )}
                                {!loadingCompanies && companies.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">No companies available. Please add companies first.</p>
                                )}
                            </div>
                        )}
                        
                        {formData.personal && (
                        <div className="mb-4">
                            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
                                Guest Balance
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
                        
                        )}

                        

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
                            disabled={loading || CustomerMutation.isPending}
                        >
                            {CustomerMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </div>
                            ) : (
                                'Add Guest'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CustomerAddModal;


// import React, { useState, useEffect } from 'react'
// import { addCustomer } from '../../https';
// import { motion } from 'framer-motion'
// import { useMutation } from '@tanstack/react-query'
// import { enqueueSnackbar } from 'notistack';
// import { api, addOrder } from '../../https';

// const CustomerAddModal = ({ setIsAddCustomerModal, fetchCustomers }) => {
    
//     const [loading, setLoading] = useState(false);
//     const [companies, setCompanies] = useState([]);
//     const [loadingCompanies, setLoadingCompanies] = useState(false);
//     const [openBalanceInfo, setOpenBalanceInfo] = useState();
    
//     const handleClose = () => {
//         setIsAddCustomerModal(false);
//     };

//     const [formData, setFormData] = useState({
//         customerName: '', 
//         Idnumber: '', 
//         contactNo: '', 
//         address: '', 
//         email: '', 
//         balance: '',
//         companies: false, // Add companies checkbox
//         personal: false,  // Add personal checkbox
//         company: ''       // Company field
//     });
    
//     // Fetch companies on component mount
//     useEffect(() => {
//         fetchCompanies();
//     }, []);

//     const fetchCompanies = async () => {
//         setLoadingCompanies(true);
//         try {
//             const response = await api.post('/api/company/fetch', {
//                 search: '',
//                 page: 1,
//                 limit: 1000
//             });

//             if (response.data.success) {
//                 setCompanies(response.data.companies || response.data.data || []);
//             } else {
//                 enqueueSnackbar(response.data.message || 'Failed to fetch companies', { variant: "error" });
//             }
//         } catch (error) {
//             console.log(error);
//             enqueueSnackbar(error.message || 'Error fetching companies', { variant: "error" });
//         } finally {
//             setLoadingCompanies(false);
//         }
//     };
    
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
        
//         // Handle checkbox inputs differently
//         if (type === 'checkbox') {
//             setFormData((prev) => ({ 
//                 ...prev, 
//                 [name]: checked 
//             }));
            
//             // If unchecking 'companies', clear the company selection
//             if (name === 'companies' && !checked) {
//                 setFormData((prev) => ({ 
//                     ...prev, 
//                     companies: false,
//                     company: '' 
//                 }));
//             }
//         } else {
//             setFormData((prev) => ({ 
//                 ...prev, 
//                 [name]: value 
//             }));
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
        
//         // Validate: At least one of companies or personal must be true
//         if (!formData.companies && !formData.personal) {
//             enqueueSnackbar('Please select at least one customer type (Companies or Personal)', { variant: "warning" });
//             return;
//         }
        
//         // Validate: If companies is true, company must be selected
//         if (formData.companies && !formData.company) {
//             enqueueSnackbar('Please select a company when Companies is checked', { variant: "warning" });
//             return;
//         }
        
//         const submissionData = {
//             ...formData,
//             balance: formData.balance === '' ? 0 : Number(formData.balance),
//             // If companies is false, send null for company field
//             company: formData.companies ? (formData.company || null) : null
//         };
        
//         console.log(submissionData);
//         CustomerMutation.mutate(submissionData);
//     };

//     const CustomerMutation = useMutation({
//         mutationFn: (reqData) => addCustomer(reqData),
//         onSuccess: (res) => {
//             const { data } = res;
//             enqueueSnackbar(data.message, { variant: "success" });
//             if (typeof fetchCustomers === 'function') {
//                 fetchCustomers();
//             }
//             setIsAddCustomerModal(false);
//         },
//         onError: (error) => {
//             const { response } = error;
//             enqueueSnackbar(response?.data?.message || 'An error occurred', { variant: "error" });
//             console.log(error);
//         },
//     });

//     /////////////////////////////////////////////////////////////

//     // if (formData.balance > 0 ) {

//     //         const openBalanceOrderData = {

//     //             orderNumber: `${Date.now()}`,
//     //             orderType: 'Opening balance',
//     //             orderStatus: "Completed",
           
//     //             customer: formData.id,
//     //             customerDetails :{
//     //                 name : formData.customerName ,
//     //                 email : formData.email ,
//     //                 phone : formData.contactNo ,
//     //             },
     
//     //             bills: {
//     //                 total: 0,
//     //                 tax: 0,
//     //                 totalWithTax: 0,
//     //                 payed: 0,
//     //                 balance: formData.balance,
                    
//     //             },

//     //             // to save New Items || NEEDED
//     //             items: null,
//     //             paymentMethod : null,

//     //             // date :  new Date(formData.date + 'T00:00:00Z').toISOString().slice(0, 10)
//     //             orderDate: formData.date ,
//     //             user: userData._id,
//     //         };

//     //         setTimeout(() => {
//     //             openBalanceMutation.mutate(openBalanceOrderData);
//     //         }, 1500);

//     //     }
//     // };

//     // const openBalanceMutation = useMutation({
//     //         mutationFn: (reqData) => addOrder(reqData),
    
//     //         onSuccess: (resData) => {
//     //             const { data } = resData.data; 
//     //             console.log(data);
    
//     //             toast.success('Opening balance posted to the Accounting .');
    
//     //         },
    
//     //         onError: (error) => {
//     //             console.log(error);
//     //         }
//     //     });
//     ///////////////////////////////////////////////////////


//     return(
//         <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center z-50'
//             style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.3, ease: "easeInOut" }}
//                 className='bg-white border-b-3 border-emerald-600 h-[calc(100vh-2rem)] p-2 shadow-xl w-200 md:mt-1 mt-1 overflow-y-scroll scrollbar-hidden'
//             >
//                 {/* Modal Header */}
//                 <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
//                     <h2 className="text-xl font-semibold text-gray-800">Add New Guest</h2>
//                     <button
//                         onClick={handleClose}
//                         className="text-gray-600 font-bold hover:text-[#be3e3f] text-2xl cursor-pointer"
//                         disabled={loading}
//                     >
//                         ×
//                     </button>
//                 </div>

//                 {/* Modal Body */}
//                 <form className='p-6' onSubmit={handleSubmit}>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       
//                         <div className="mb-4">
//                             <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Guest Name *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="customerName"
//                                 name='customerName'
//                                 value={formData.customerName}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="Enter customer name"
//                                 required
//                                 disabled={loading}
//                             />
//                         </div>

//                         <div className="mb-4">
//                             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Guest email *
//                             </label>
//                             <input
//                                 type="email"
//                                 id="email"
//                                 name='email'
//                                 value={formData.email}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="guest@example.com"
//                                 required
//                                 disabled={loading}
//                             />
//                         </div>

//                         <div className="mb-4">
//                             <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
//                                 ID Number *
//                             </label>
//                             <input
//                                 type="text"
//                                 id="idNumber"
//                                 name='Idnumber'
//                                 value={formData.Idnumber}
//                                 onChange={handleInputChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder="Enter guest ID number"
//                                 required
//                                 disabled={loading}
//                             />
//                         </div>

//                         <div className="mb-4">
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
//                                 placeholder="Enter customer contact number"
//                                 required
//                                 disabled={loading}
//                             />
//                         </div>

//                         <div className="mb-4">
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
//                                 placeholder="Enter customer address"
//                                 required
//                                 disabled={loading}
//                             />
//                         </div>

//                         {/* Customer Type Checkboxes */}
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Customer Type *
//                             </label>
//                             <div className="flex gap-6">
//                                 <label className="flex items-center gap-2 cursor-pointer">
//                                     <input
//                                         type="checkbox"
//                                         name="companies"
//                                         checked={formData.companies}
//                                         onChange={handleInputChange}
//                                         className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                                         disabled={loading}
//                                     />
//                                     <span className="text-sm text-gray-700">Companies</span>
//                                 </label>
//                                 <label className="flex items-center gap-2 cursor-pointer">
//                                     <input
//                                         type="checkbox"
//                                         name="personal"
//                                         checked={formData.personal}
//                                         onChange={handleInputChange}
//                                         className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                                         disabled={loading}
//                                     />
//                                     <span className="text-sm text-gray-700">Personal</span>
//                                 </label>
//                             </div>
//                             <p className="text-xs text-gray-500 mt-1">Select at least one type</p>
//                         </div>

//                         {/* Company Selection Dropdown - Show only when Companies checkbox is checked */}
//                         {formData.companies && (
//                             <div className="mb-4">
//                                 <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
//                                     Select Company *
//                                 </label>
//                                 <select
//                                     id="company"
//                                     name='company'
//                                     value={formData.company}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
//                                     disabled={loading || loadingCompanies}
//                                     required={formData.companies}
//                                 >
//                                     <option value="">Select Company</option>
//                                     {companies.map((company) => (
//                                         <option key={company._id} value={company._id}>
//                                             {company.name || company.companyName}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {loadingCompanies && (
//                                     <p className="text-xs text-gray-500 mt-1">Loading companies...</p>
//                                 )}
//                                 {!loadingCompanies && companies.length === 0 && (
//                                     <p className="text-xs text-amber-600 mt-1">No companies available. Please add companies first.</p>
//                                 )}
//                             </div>
//                         )}

//                         <div className="mb-4">
//                             <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Guest Balance
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
//                             />
//                             <p className="text-xs text-gray-500 mt-1">Leave empty for zero balance</p>
//                         </div>

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
//                             disabled={loading}
//                         >
//                             {CustomerMutation.isPending ? (
//                                 <div className="flex items-center gap-2">
//                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     Adding...
//                                 </div>
//                             ) : (
//                                 'Add Guest'
//                             )}
//                         </button>
//                     </div>
//                 </form>
//             </motion.div>
//         </div>
//     );
// };

// export default CustomerAddModal;
