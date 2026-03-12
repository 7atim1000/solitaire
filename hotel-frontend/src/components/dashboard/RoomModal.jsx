import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { IoCloseCircle } from "react-icons/io5";
import { addRoom } from '../../https';

import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack' 

const RoomModal = ({setIsRoomModalOpen}) => {

    const [roomData, setRoomData] = useState({
        category :"", roomNo :"", seats :"", price :""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoomData((prev) => ({...prev, [name] : value}));
    }

    

    const handleSubmit = (e) => {

        e.preventDefault();
        console.log(roomData)
        roomMutation.mutate(roomData)

    }
 
    const handleClose = () => {
        setIsRoomModalOpen(false)
    }


    const roomMutation = useMutation({
        mutationFn: (reqData) => addRoom(reqData),
        
        onSuccess: (res) => {
            setIsRoomModalOpen(false);
          
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
                    <h2 className ='text-[#1a1a1a] text-sm font-semibold'>Add Room</h2>
                    <button onClick ={handleClose} className ='rounded-full text-gray-600  hover:text-red-700 cursor-pointer'>
                        <IoCloseCircle size={25}/>
                    </button>
                </div>
          
                {/*Modal Body*/}
                <form className ='mt-3 space-y-6' onSubmit ={handleSubmit}>
                  
                    <div>
                        <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Category :</label>
                
                        <div className ='flex items-center rounded-lg p-2 px-4 bg-[#f5f5f5] shadow-lg'>
                        <input 
                            type ='text'
                            name ='category'

                            value ={roomData.category}
                            onChange ={handleInputChange}
                           
                            placeholder = 'Enter category of room'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none'
                            required
                            autoComplete='none'
                        />
                        </div>

                    </div>
                  
                    <div>
                        <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Room No :</label>
                
                        <div className ='flex items-center rounded-lg p-2 px-4 bg-[#f5f5f5] shadow-lg'>
                        <input 
                            type ='text'
                            name ='roomNo'
    
                            value ={roomData.roomNo}
                            onChange ={handleInputChange}      
                           
                            placeholder = 'Enter room number'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none'
                            required
                            autoComplete='none'
                        />
                        </div>

                    </div>

                    <div>
                        <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Number of seats :</label>
                
                        <div className ='flex items-center rounded-lg p-2 px-4 bg-[#f5f5f5] shadow-lg'>
                        <input 
                            type ='number'
                            name ='seats'

                            value ={roomData.seats}
                            onChange ={handleInputChange} 
                           
                            placeholder = 'Enter number of seets'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none'
                            required
                            autoComplete='none'
                        />
                        </div>

                    </div>

                    
                    <div>
                        <label className ='text-[#1f1f1f] block mb-2 mt-3 text-sm font-medium'>Price per day :</label>
                
                        <div className ='flex items-center rounded-lg p-2 px-4 bg-[#f5f5f5] shadow-lg'>
                        <input 
                            type ='number'
                            name ='price'
                            
                            value ={roomData.price}
                            onChange ={handleInputChange}
                           
                            placeholder = 'Enter price of day'
                            className ='bg-transparent flex-1 text-[#1a1a1a] focus:outline-none'
                            required
                            autoComplete='none'
                        />
                        </div>

                    </div>

                    <button
                        type ='submit'
                        className ='w-full rounded-lg mt-6 py-3 text-sm bg-blue-700 text-[#f5f5f5] cursor-pointer hover:bg-green-700 hover:text[#f5f5f5]'
                    >
                        Add Room
                    </button>
                           
                  
                </form>
            </motion.div>
        </div>
    );
};


export default RoomModal ;