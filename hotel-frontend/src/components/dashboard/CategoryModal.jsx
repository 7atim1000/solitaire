import React, {useState} from 'react'
import { motion } from 'framer-motion'
import { IoCloseCircle } from "react-icons/io5";
import { useMutation } from '@tanstack/react-query';
import { addCategory } from '../../https';
import { enqueueSnackbar } from 'notistack';

const CategoryModal = ({setIsCategoryModalOpen}) => {
    
    
    const handleClose = () => {
        setIsCategoryModalOpen(false)
    }

    
    
    const[formData , setFormData] = useState({
       name : "",    
    });
   
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }



    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData)
        categoryMutation.mutate(formData)
    };


    

    const categoryMutation = useMutation({
        mutationFn: (reqData) => addCategory(reqData),
        
        onSuccess: (res) => {
            setIsCategoryModalOpen(false);
          
            const { data } = res;
            //console.log(data)
            enqueueSnackbar(data.message, { variant: "success"});
        },

        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response.data.message, { variant: "error"});

            console.log(error);
        },
    });





    return (
        <div className ='fixed inset-0 bg-opacity-50 flex items-center justify-center shadow-lg z-50'>
                    <motion.div
                        initial ={{opacity :0 , scale :0.9}}
                        animate ={{opacity :1, scale :1}}
                        exit ={{opacity :0, scale :0.9}}
                        transition ={{durayion :0.3 , ease: 'easeInOut'}}
        
                        className ='bg-gray-300 p-6 rounded-lg shadow-lg w-120 md:mt-35 mt-10'
                    >
        
        
                        {/*Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className ='text-[#1a1a1a] text-sm font-semibold'>Add Category</h2>
                            
                            <button onClick ={handleClose} className ='rounded-full text-gray-600  hover:text-red-700 cursor-pointer'>
                                <IoCloseCircle size={25}/>
                            </button>
                        </div>
                  
                        {/*Modal Body*/}
                        <form className ='mt-3 space-y-6' onSubmit ={handleSubmit}>
                          
                            <div>
                                <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Category Name :</label>
                        
                                <div className ='flex items-center rounded-lg p-2 px-4 bg-[#f5f5f5] shadow-lg'>
                                <input 
                                    type ='text'
                                    name ='name'
        
                                    value ={formData.name}
                                    onChange ={handleChange}
                                   
                                    placeholder = 'Enter category name'
                                    className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none'
                                    required
                                    autoComplete='none'
                                />
                                </div>
        
                            </div>
                          
        
                            <button
                                type ='submit'
                                className ='w-full rounded-lg mt-6 py-3 text-sm bg-blue-700 text-[#f5f5f5] cursor-pointer hover:bg-green-700 bg:text[#f5f5f5]'
                            >
                                Add Category
                            </button>
                                   
                          
                        </form>
                    </motion.div>
                </div>
    );
};



export default CategoryModal ;