import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { addUnit, api } from '../../https';
import { toast } from 'react-toastify';
import { GrClose } from "react-icons/gr";
import { IoCloseCircle } from "react-icons/io5";
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';

const UnitAddModal = ({ setIsAddUnitModal }) => {
    const [formData, setFormData] = useState({
        unitName: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        unitMutation.mutate(formData);
    };

    const unitMutation = useMutation({
        mutationFn: (reqData) => addUnit(reqData),
        onSuccess: (data) => {
            window.location.reload();
            setIsAddUnitModal(false);
            enqueueSnackbar(data.message, { variant: "success" });
        },
        onError: (error) => {
            const { data } = error.response;
            enqueueSnackbar(data.message, { variant: "error" });
            console.log(error);
        }
    });

    const handleClose = () => {
        setIsAddUnitModal(false);
    };

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
                            Add New Unit
                        </h2>
                        <button 
                            onClick={handleClose} 
                            className='text-white/80 hover:text-white transition-colors cursor-pointer'
                        >
                            <IoCloseCircle size={28} />
                        </button>
                    </div>
                    <p className='text-emerald-100 text-xs mt-1'>
                        Fill in the details to create a new unit
                    </p>
                </div>

                {/* Modal Body */}
                <form className='p-6 space-y-6' onSubmit={handleSubmit}>
                    {/* Unit Name Input */}
                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700'>
                            Unit Name <span className='text-emerald-600'>*</span>
                        </label>
                        <div className='relative'>
                            <input
                                type='text'
                                name='unitName'
                                value={formData.unitName}
                                onChange={handleInputChange}
                                placeholder='e.g., Piece, Meal, Deluxe Room, Suite 101'
                                className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                                         focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 
                                         outline-none transition-all text-gray-700 placeholder-gray-400'
                                autoComplete='off'
                                required
                            />
                            {/* Decorative element */}
                            <div className='absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 
                                          scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left'>
                            </div>
                        </div>
                        {formData.unitName && (
                            <p className='text-xs text-emerald-600 mt-1 flex items-center gap-1'>
                                <span className='w-1 h-1 bg-emerald-600 rounded-full'></span>
                                Unit name: {formData.unitName}
                            </p>
                        )}
                    </div>

                    {/* Additional Fields (can be added later) */}
                    <div className='bg-emerald-50/50 rounded-xl p-4 border border-emerald-100'>
                        <h3 className='text-sm font-medium text-emerald-800 mb-2 flex items-center gap-2'>
                            <span className='w-1 h-4 bg-emerald-600 rounded-full'></span>
                            Unit Information
                        </h3>
                        <p className='text-xs text-gray-600'>
                            Additional fields like floor, capacity, and status can be added here
                        </p>
                    </div>

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
                            disabled={unitMutation.isPending}
                            className='flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 
                                     text-white font-medium rounded-xl hover:from-emerald-700 
                                     hover:to-green-700 shadow-md hover:shadow-lg 
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2 order-1 sm:order-2'
                        >
                            {unitMutation.isPending ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <span>Add Unit</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
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

export default UnitAddModal;



// import React , {useState, useEffect} from 'react'
// import { motion } from 'framer-motion'
// import { addUnit, api } from '../../https';
// import { toast } from 'react-toastify'

// import { GrClose } from "react-icons/gr";
// import { IoCloseCircle } from "react-icons/io5";
// import { useMutation } from '@tanstack/react-query';
// import { enqueueSnackbar } from 'notistack';


// const UnitAddModal = ({setIsAddUnitModal}) => {

//     const [formData, setFormData] = useState({
//         unitName : "", 
//     });

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log(formData);

//         unitMutation.mutate(formData);
   
//     };

//     const unitMutation = useMutation({

//         mutationFn: (reqData) => addUnit(reqData),

//         onSuccess: (data) => {
//             window.location.reload()
//             setIsAddUnitModal(false)
//             enqueueSnackbar(data.message, { variant: "success" })
//         },
//         onError: (error) => {
//             const { data } = error.response;
//             enqueueSnackbar(data.message, { variant: "error" })
//             console.log(error)
//         }
//     });





//     const handleClose = () => {
//         setIsAddUnitModal(false)
//     };


//     return(

//         <div className='fixed inset-0  bg-opacity-50 flex items-center justify-center z-50' 
//         style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }} >
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
//                         New Unit
//                     </h2>
//                     <button onClick={handleClose} className='rounded-sm border-b border-[#be3e3f] text-[#be3e3f] cursor-pointer hover:bg-[#be3e3f]/30'>
//                         <IoCloseCircle size={25} />
//                     </button>
//                 </div>

//                 {/*Modal Body */}

//                 <form className='space-y-4 mt-5' onSubmit={handleSubmit}>

           

//                     <div className='flex items-center justify-between'>
//                         <label htmlFor='' className='w-[15%] text-emerald-600 block mb-2 mt-3 text-xs font-semibold'>Unit Name</label>
//                         <div className='w-[85%] flex items-center p-3 shadow-xl rounded-lg bg-white shadow-xl'>
//                             <input
//                                 type='text'
//                                 name='unitName'
//                                 value={formData.unitName}
//                                 onChange={handleInputChange}

//                                 placeholder='Enter unit name'
//                                 className='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none text-xs font-normal border-b border-emerald-600'
//                                 autoComplete='off'
//                                 required
//                             />
//                         </div>
//                     </div>

                    
//                     <button
//                         type="submit"
//                         className='p-3 w-full rounded-lg mt-3 py-3 text-sm bg-emerald-600 text-white font-semibold cursor-pointer'
//                     >
//                         Add unit
//                     </button>

//                 </form>
//             </motion.div>

//         </div>
//     )

// };

// export default UnitAddModal ;