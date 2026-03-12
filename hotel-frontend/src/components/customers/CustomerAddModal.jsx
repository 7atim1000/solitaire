import React, {useState} from 'react'
import { addCustomer } from '../../https';
import {motion} from 'framer-motion'
import { useMutation } from '@tanstack/react-query'

import { enqueueSnackbar } from 'notistack';
import { GrClose } from "react-icons/gr";
import { IoCloseCircle } from "react-icons/io5";


const CustomerAddModal = ({setIsAddCustomerModal, fetchCustomers}) => {
    
    const [loading, setLoading] = useState(false);
    const handleClose = () => {
        setIsAddCustomerModal(false);
    };


    const [formData, setFormData] = useState({
        customerName :'' , Idnumber: '' , contactNo :'' , address :'', email :'', balance : '',
    });
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Handle all fields normally
        setFormData((prev) => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare data for submission - convert empty balance to 0
        const submissionData = {
            ...formData,
            // If balance is empty string, set to 0, otherwise convert to number
            balance: formData.balance === '' ? 0 : Number(formData.balance)
        };
        
        console.log(submissionData)
        CustomerMutation.mutate(submissionData)
    };


    const CustomerMutation = useMutation({
        mutationFn: (reqData) => addCustomer(reqData),
        onSuccess: (res) => {
            const { data } = res;
            enqueueSnackbar(data.message, { variant: "success" });
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
                    <h2 className="text-xl font-semibold text-gray-800">Add New Guest</h2>
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
                        >
                            {loading ? (
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


// import React, {useState} from 'react'
// import { addCustomer } from '../../https';
// import {motion} from 'framer-motion'
// import { useMutation } from '@tanstack/react-query'

// import { enqueueSnackbar } from 'notistack';
// import { GrClose } from "react-icons/gr";
// import { IoCloseCircle } from "react-icons/io5";


// const CustomerAddModal = ({setIsAddCustomerModal, fetchCustomers}) => {
    
//     const [loading, setLoading] = useState(false);
//     const handleClose = () => {
//         setIsAddCustomerModal(false);
//     };


//     const [formData, setFormData] = useState({
//         customerName :'' , Idnumber: '' , contactNo :'' , address :'', email :'', balance :0,
//     });
//         const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

    
    
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log(formData)

//         CustomerMutation.mutate(formData)
       
//         setIsAddCustomerModal(false)
//     };


//     const CustomerMutation = useMutation({
//         mutationFn: (reqData) => addCustomer(reqData),
//         onSuccess: (res) => {

//             const { data } = res;
//             //console.log(data)
//             enqueueSnackbar(data.message, { variant: "success" });
//             if (typeof fetchCustomers === 'function') {
//                 fetchCustomers();
//             } else {
//                 window.location.reload();
//             }

//         },

//         onError: (error) => {
//             const { response } = error;
//             enqueueSnackbar(response.data.message, { variant: "error" });

//             console.log(error);
//         },
//     });


//     return(

//         <div className='fixed inset-0  bg-opacity-50 flex items-center justify-center z-50'
//             style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
//             <motion.div

//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.3, ease: "easeInOut" }}
//                 className='bg-white border-b-3 border-emerald-600  h-[calc(100vh-2rem)] p-2 shadow-xl w-120 md:mt-1 mt-1      
//                         overflow-y-scroll scrollbar-hidden'
//             >

//                 {/*Modal Header */}
//                 <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
//                     <h2 className="text-xl font-semibold text-gray-800">Add New Guest</h2>
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
//                              />
//                          </div>

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
//                              />
//                          </div>

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
//                                 placeholder="Enter customer contact number"
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
//                                 placeholder="Enter customer address"
//                                 required
//                                 disabled={loading}
//                              />
//                          </div>

//                           <div className="mb-4">
//                             <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
//                                 Guest Balance *
//                             </label>
//                             <input
//                                 type="number"
//                                 id="balance"
//                                 name='balance'
//                                 value={formData.balance}
//                                 onChange={handleInputChange}

//                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                                 placeholder=""
//                                 required
//                                disabled={loading}
//                              />
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
//                                  'Add Guest'
//                              )}
//                          </button>
//                     </div>

//                 </form>
//             </motion.div>

//         </div>

//     );


// };

// export default CustomerAddModal;