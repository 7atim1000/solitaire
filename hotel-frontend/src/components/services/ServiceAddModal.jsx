import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { GrClose } from "react-icons/gr";
import { IoCloseCircle } from "react-icons/io5";
import { addService, api } from '../../https';
import { toast } from 'react-toastify';

const ServiceAddModal = ({ setIsAddItemModal, fetchItems }) => {
    const handleClose = () => {
        setIsAddItemModal(false);
    };

    const [formData, setFormData] = useState({
        category: '',
        serviceName: '',
        qty: 0,
        price: '',
        unit: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        itemMutation.mutate(formData);
    };

    const itemMutation = useMutation({
        mutationFn: (reqData) => addService(reqData),
        onSuccess: (data) => {
            fetchItems();
            window.location.reload();
            setIsAddItemModal(false);
            enqueueSnackbar(data.message, { variant: "success" });
        },
        onError: (error) => {
            const { data } = error.response;
            enqueueSnackbar(data.message, { variant: "error" });
            console.log(error);
        }
    });

    const [categorylist, setCategoryList] = useState([]);
    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/category/');
            if (response.data.success) {
                setCategoryList(response.data.categories);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const [unitlist, setUnitList] = useState([]);
    const fetchUnits = async () => {
        try {
            const response = await api.get('/api/unit/');
            if (response.data.success) {
                setUnitList(response.data.units);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchUnits();
    }, []);

    return (
        <div 
            className='fixed inset-0 flex items-center justify-center z-50 p-4'
            style={{ backgroundColor: 'rgba(5, 24, 1, 0.6)' }}
            onClick={handleClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className='bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header - Green gradient */}
                <div className='bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-white text-lg font-semibold tracking-wide'>
                            Add New Item
                        </h2>
                        <button 
                            onClick={handleClose} 
                            className='text-white/80 hover:text-white transition-colors cursor-pointer'
                        >
                            <IoCloseCircle size={28} />
                        </button>
                    </div>
                    <p className='text-emerald-100 text-xs mt-1'>
                        Fill in the details to add a new service item
                    </p>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className='p-6 space-y-5'>
                    {/* Category Selection */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Category <span className='text-emerald-600'>*</span>
                        </label>
                        <select
                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 
                                     outline-none transition-all bg-white text-gray-700'
                            value={formData.category}
                            onChange={handleInputChange}
                            name='category'
                            required
                        >
                            <option value='' disabled>Select Category ...</option>
                            {categorylist.map((category, index) => (
                                <option key={index} value={category.categoryName}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Item Name */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Item Name <span className='text-emerald-600'>*</span>
                        </label>
                        <input
                            type='text'
                            name='serviceName'
                            value={formData.serviceName}
                            onChange={handleInputChange}
                            placeholder='e.g., Breakfast, WiFi, Laundry'
                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 
                                     outline-none transition-all text-gray-700 placeholder-gray-400'
                            autoComplete='off'
                            required
                        />
                    </div>

                    {/* Quantity */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Quantity <span className='text-emerald-600'>*</span>
                        </label>
                        <input
                            type='number'
                            name='qty'
                            value={formData.qty}
                            onChange={handleInputChange}
                            placeholder='Enter quantity'
                            className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                                     focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 
                                     outline-none transition-all text-gray-700 placeholder-gray-400'
                            autoComplete='off'
                            min='0'
                            required
                        />
                    </div>

                    {/* Price and Unit - Side by side */}
                    <div className='grid grid-cols-2 gap-4'>
                        {/* Price */}
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium text-gray-700'>
                                Price <span className='text-emerald-600'>*</span>
                            </label>
                            <div className='relative'>
                                <input
                                    type='number'
                                    name='price'
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder='0.00'
                                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                                             focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 
                                             outline-none transition-all text-gray-700 placeholder-gray-400'
                                    autoComplete='off'
                                    min='0'
                                    step='0.01'
                                    required
                                />
                                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 
                                                 text-emerald-600 font-medium text-sm'>SD</span>
                            </div>
                        </div>

                        {/* Unit Selection */}
                        <div className='space-y-2'>
                            <label className='block text-sm font-medium text-gray-700'>
                                Unit <span className='text-emerald-600'>*</span>
                            </label>
                            <select
                                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                                         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 
                                         outline-none transition-all bg-white text-gray-700'
                                value={formData.unit}
                                onChange={handleInputChange}
                                name='unit'
                                required
                            >
                                <option value='' disabled>Select Unit</option>
                                {unitlist.map((unit, index) => (
                                    <option key={index} value={unit.unitName}>
                                        {unit.unitName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preview Section */}
                    {formData.serviceName && formData.price && formData.unit && (
                        <div className='bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 mt-4'>
                            <h3 className='text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2'>
                                <span className='w-1 h-4 bg-emerald-600 rounded-full'></span>
                                Item Summary
                            </h3>
                            <div className='flex justify-between items-center text-sm'>
                                <span className='text-gray-600'>{formData.serviceName}</span>
                                <span className='font-semibold text-emerald-700'>
                                    {formData.price} SD / {formData.unit}
                                </span>
                            </div>
                            {formData.qty > 0 && (
                                <p className='text-xs text-gray-500 mt-1'>
                                    Quantity: {formData.qty} {formData.unit}(s)
                                </p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl
                                     text-gray-700 font-medium hover:bg-gray-50 
                                     transition-all cursor-pointer order-2 sm:order-1'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={itemMutation.isPending}
                            className='flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 
                                     text-white font-medium rounded-xl hover:from-emerald-700 
                                     hover:to-green-700 shadow-md hover:shadow-lg 
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2 order-1 sm:order-2'
                        >
                            {itemMutation.isPending ? (
                                <>
                                    <div className='w-4 h-4 border-2 border-white border-t-transparent 
                                                    rounded-full animate-spin'></div>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <span>Add Item</span>
                                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' 
                                              strokeWidth='2' d='M12 4v16m8-8H4'></path>
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ServiceAddModal;


// import React ,{useState, useEffect} from 'react'
// import { motion } from 'framer-motion'
// import { useMutation } from '@tanstack/react-query';
// import { enqueueSnackbar  } from 'notistack';
// import { GrClose } from "react-icons/gr";
// import { IoCloseCircle } from "react-icons/io5";
// import { addService, api } from '../../https';

// const ServiceAddModal = ({setIsAddItemModal, fetchItems}) => {
//     const handleClose = () => {
//         setIsAddItemModal(false)
//     };


//     const [formData, setFormData] = useState({
//         category :'' , serviceName :'' , qty :0 , price :'' , unit :''
//     });

     
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log(formData);

//         itemMutation.mutate(formData);

//     };
    
//     const itemMutation = useMutation({

//         mutationFn: (reqData) => addService(reqData),

//         onSuccess: (data) => {
//             fetchItems();
//             setIsAddItemModal(false)
//             enqueueSnackbar(data.message, { variant: "success" })
            
//         },
//         onError: (error) => {
//             const { data } = error.response;
//             enqueueSnackbar(data.message, { variant: "error" })
//             console.log(error)
//         }
//     });



//     const [categorylist, setCategoryList] = useState([]);
//     const fetchCategories = async () => {

//         try {

//             const response = await api.get('/api/category/')
//             if (response.data.success) {
//                 setCategoryList(response.data.categories);
//             }
//             else {
//                 toast.error(response.data.message)
//             }


//             console.log(response.data)

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     };


//     const [unitlist, setUnitList] = useState([]);
//     const fetchUnits = async () => {

//         try {

//             const response = await api.get('/api/unit/')
//             if (response.data.success) {
//                 setUnitList(response.data.units);
//             }
//             else {
//                 toast.error(response.data.message)
//             }


//             console.log(response.data)

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     };


//     useEffect(() => {

//         fetchCategories() ,
//         fetchUnits()
        
//     }, []);


    

    
//     return(
        
//         <div className='fixed inset-0  bg-opacity-50 flex items-center justify-center z-50' 
//         style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
//             <motion.div

//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.3, ease: "easeInOut" }}
//                 className='bg-white border-b-3 border-emerald-600  h-[calc(100vh-2rem)] p-2 shadow-xl w-120 md:mt-1 mt-1      
//                 overflow-y-scroll scrollbar-hidden'
//             >

//                 {/*Modal Header */}
//                 <div className='flex justify-between items-center bg-white p-2 rounded-md shadow-xl'>
//                     <h2 className='text-[#1a1a1a] text-sm font-semibold'>
//                         New Item
//                     </h2>
//                     <button onClick={handleClose} className='rounded-sm border-b border-[#be3e3f] text-[#be3e3f] cursor-pointer hover:bg-[#be3e3f]/30'>
//                         <IoCloseCircle size={25} />
//                     </button>
//                 </div>

//                 {/*Modal Body */}

//                 <form className='space-y-4 mt-5' onSubmit={handleSubmit}>

//                     <div className='flex items-center p-3 shadow-xl rounded-lg bg-white shadow-xl'>
//                         <select className='w-full bg-emerald-50 text-[#1a1a1a] h-8 rounded-lg shadow-xl' value={formData.category}
//                             onChange={handleInputChange}
//                             name='category'
//                             required
//                         >

//                             <option className='text-emerald-600 text-xs font-normal '>Select Service ...</option>
//                             {categorylist.map((category, index) => (
//                                 <option key={index} value={category.categoryName} className='text-xs font-normal'>
//                                     {category.categoryName}
//                                 </option>

//                             ))};
//                         </select>
//                     </div>


//                     <div className='flex items-center justify-between'>
//                         <label htmlFor='' className='w-[15%] text-emerald-600 block mb-2 mt-3 text-xs font-semibold'>Item name</label>
//                         <div className='w-[85%] flex items-center p-3 shadow-xl rounded-sm bg-white shadow-xl'>
//                             <input
//                                 type='text'
//                                 name='serviceName'
//                                 value={formData.serviceName}
//                                 onChange={handleInputChange}

//                                 placeholder='Enter item name'
//                                 className='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none text-xs font-normal border-b border-emerald-600'
//                                 autoComplete='off'
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className='flex items-center justify-between'>
//                         <label className='w-[15%] text-emerald-600 block mb-2 mt-3 text-xs font-semibold'>Quantity</label>
//                         <div className='w-[85%] flex items-center p-3 shadow-xl rounded-lg bg-white shadow-xl'>
//                             <input
//                                 type="number"
//                                 name='qty'
//                                 value={formData.qty}
//                                 onChange={handleInputChange}

//                                 autoComplete='off'
//                                 placeholder="Quantity if exist"
//                                 className='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none text-xs font-normal border-b border-emerald-600 '
//                                 required

//                             />
//                         </div>
//                     </div>

                    
//                     <div className ='flex items-center justify-between'>
                            
//                         <label className='w-[5%] text-emerald-600 block mb-2 mt-3 text-xs font-semibold'>Price</label>
//                         <div className='w-[25%] flex items-center p-3 shadow-xl rounded-lg bg-white shadow-xl'>
//                             <input
//                                 type="number"
//                                 name='price'
//                                 value={formData.price}
//                                 onChange={handleInputChange}

//                                 autoComplete='off'
//                                 placeholder="Price"
//                                 className='bg-transparent w-full flex-1 text-[#1a1a1a] focus:outline-none text-xs font-normal border-b border-emerald-600'
//                                 required

//                             />
//                         </div>
            

                    
//                     <div className='w-[50%] flex items-center p-3 shadow-xl rounded-lg bg-white shadow-xl'>
//                         <select className='w-full bg-emerald-50 text-[#1a1a1a] h-8 rounded-sm shadow-xl' value={formData.unit}
//                             onChange={handleInputChange}
//                             name='unit'
//                             required
//                         >

//                             <option className='text-emerald-600 text-xs font-normal '>Select Unit ...</option>
//                             {unitlist.map((unit, index) => (
//                                 <option key={index} value={unit.unitName} className='text-xs font-normal'>
//                                     {unit.unitName}
//                                 </option>

//                             ))};
//                         </select>
//                     </div>


//                     </div>

                          

//                     <button
//                         type="submit"
//                         className='p-3 rounded-lg mt-3 py-3 text-sm bg-emerald-600 text-white font-semibold cursor-pointer'
//                     >
//                         Add Item
//                     </button>

//                 </form>
//             </motion.div>

//         </div>
//     );
// };

// export default ServiceAddModal ;