import React , {useState} from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack'
import { GrClose } from "react-icons/gr";
import { IoCloseCircle } from "react-icons/io5";
import { addCategory } from '../../https';



const CategoryAddModal = ({setIsAddCategoryModal}) => {
    const [loading, setLoading] = useState(false);
    
    const handleClose = () => {
        setIsAddCategoryModal(false);
    };
    
    const [formData, setFormData] = useState({
        categoryName :'', description :''
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData)

        categoryMutation.mutate(formData)
        window.location.reload()
        setIsAddCategoryModal(false)
    };


    const categoryMutation = useMutation({
        mutationFn: (reqData) => addCategory(reqData),
        onSuccess: (res) => {

            const { data } = res;
            //console.log(data)
            enqueueSnackbar(data.message, { variant: "success" });
        },

        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response.data.message, { variant: "error" });

            console.log(error);
        },
    });


     return(
        
        <div className='fixed inset-0  bg-opacity-50 flex items-center justify-center z-50' 
        style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>
            <motion.div

                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className='bg-white border-b-3 border-emerald-600  h-[calc(100vh-2rem)] p-2 shadow-xl w-120 md:mt-1 mt-1      
                overflow-y-scroll scrollbar-hidden'
             >

                {/* Modal Header */}
                 <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
                     <h2 className="text-xl font-semibold text-gray-800">Add New Category</h2>
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
                            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                name='categoryName'
                                id="categoryName"
                                value={formData.categoryName}
                                onChange={handleInputChange}

                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter category name"
                                required
                                disabled={loading}
                             />
                         </div>

                         <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <input
                                type="text"
                                id="description"
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}

                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                placeholder="Enter category description (Optional)"
                                required
                                autoComplete='off'
                                disabled={loading}
                             />
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
                                 'Add Category'
                             )}
                         </button>
                    </div>

                 </form>
             </motion.div>

         </div>

    );
};


export default CategoryAddModal ;