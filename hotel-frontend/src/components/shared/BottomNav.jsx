import React, { useState } from 'react'
import { HiOutlineHome } from "react-icons/hi2";
import { FaServicestack } from "react-icons/fa6";
import { AiOutlineApartment } from "react-icons/ai"; // rooms -- apartment شقه
import { BsLifePreserver } from "react-icons/bs";  // reservation
import { FiMoreVertical } from "react-icons/fi";   // more
import { FaFirstOrder } from "react-icons/fa6";
import { CgMoreVertical } from "react-icons/cg";
import { PiMathOperationsLight } from "react-icons/pi";
import { TbTransformPoint } from "react-icons/tb";
import { BiUnite } from "react-icons/bi";

import { IoCloseCircle } from 'react-icons/io5'; 
import { PiStairsThin } from "react-icons/pi";
import { IoBedOutline } from "react-icons/io5";
import { FaListOl } from "react-icons/fa";

import { useNavigate, useLocation } from 'react-router-dom'

import { FaUsers } from "react-icons/fa";

const BottomNav = () => {
   
   const navigate = useNavigate();
   // change value
   const [name, setName] = useState();
   const [phone, setPhone] = useState();


   // to show Acive button
   const location = useLocation(); 
   
   const [isMoreModal, setIsMoreModal] = useState(false);
   const handleMoreOpen = () => {
      setIsMoreModal(true)
   }

   // to show Active Button
   const isActive = (path) => location.pathname === path;

   
   return( 
      <div className ='fixed bottom-0 left-0 right-0 bg-linear-65 from-emerald-50 to-emerald-600 text-emerald-50 p-2 flex justify-around h-16 text-sm font-semibold'>
         
         <button
            onClick={() => navigate('/')}
            className ={`${isActive('/') ? "bg-emerald-600 text-white" : ""} flex items-center justify-center text-emerald-400
             w-[150px] rounded-sm shadow-lg/30 cursor-pointer`}>
            <HiOutlineHome className ='inline mr-2' size={25}/><p>Home</p></button>
         <button

            onClick={() => navigate('/customers')}
            className ={`${isActive('/reservation') ? "bg-emerald-600" : ""} flex items-center justify-center text-emerald-50
             w-[150px] rounded-sm shadow-lg/30 cursor-pointer`}> 
            <FaUsers className ='inline mr-2 ' size={25}/><p>Customers</p></button>
         <button

            onClick={() => navigate('/rooms')} 
            className ={`${isActive('/rooms') ? "bg-emerald-600" : ""} flex items-center justify-center text-emerald-50 
            w-[150px] rounded-sm shadow-lg/30 cursor-pointer`}>
            <IoBedOutline className ='inline mr-2' size={25}/><p>Rooms</p>
         </button>
       

         <button
            onClick={handleMoreOpen}

            className= 'w-[150px] shadow-lg/30 text-sm font-semibold rounded-sm flex items-center justify-center gap-1 cursor-pointer'>
            <CgMoreVertical className='inline mr-1 text-white' size={25} />
            <p className='mt-1'>
               More
            </p>
         </button>

      
         {/* disabled={isActive('/menu') || isActive('/rooms')} */}
         <button  onClick ={() => navigate('/roomsbill')} 
            className ='absolute bottom-2 shadow-xl/30 text-emerald-600 rounded-full p-2 items-center justify-center cursor-pointer border-b-3 border-white'>
               <FaFirstOrder size={40}/>
         </button>

         {isMoreModal && (
            <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center shadow-lg z-50' 
            style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }} >
               <div className='flex flex-col bg-sky- rounded-lg p-3 min-w-[300px]'>
                  <div className='flex justify-between items-center mb-2'>
                     <h2 className='text-white text-lg font-semibold'>More Options</h2>
                     <button onClick={() => setIsMoreModal(false)} className='rounded-full  text-[#be3e3f] cursor-pointer'>
                        <IoCloseCircle size={25} />
                     </button>
                  </div>

                  <hr className='border-t-3 border-emerald-600 mb-2' />
                  <div className='flex flex-col gap-5 justify-between items-center px-8 mt-1'>

                     <div className='flex justify-between  gap-2 items-center shadow-xl '>
                        <button onClick={() => { setIsMoreModal(false); navigate('/floors'); }}
                           className='flex justify-around items-center  w-50 h-12 shadow-xl bg-white rounded-sm px-2 py-3 text-sm text-[#1a1a1a] font-semibold cursor-pointer'>
                           Floors
                           <PiStairsThin className= 'inline text-emerald-600 w-10 h-6 ' />
                        </button>
                        <button onClick={() => { setIsMoreModal(false); navigate('/services'); }}
                           className='flex justify-around items-center  w-50 h-12 shadow-xl bg-white rounded-sm px-2 py-3 text-sm text-[#1a1a1a] font-semibold cursor-pointer'>
                           Services
                           <FaListOl className='inline text-emerald-600 w-10 h-6 ' />
                        </button>
                     </div>
                     <div className='flex justify-between gap-2 items-center shadow-xl '>
                        <button onClick={() => { setIsMoreModal(false); navigate('/items'); }}
                           className='flex justify-around items-center  w-50 h-12 shadow-xl bg-white rounded-sm px-2 py-3 text-sm text-[#1a1a1a] font-semibold cursor-pointer'>
                           Items
                           <TbTransformPoint className= 'inline text-emerald-600 w-10 h-6 ' />
                        </button>
                        <button onClick={() => { setIsMoreModal(false); navigate('/services'); }}
                           className='flex justify-around items-center  w-50 h-12 shadow-xl bg-white rounded-sm px-2 py-3 text-sm text-[#1a1a1a] font-semibold cursor-pointer'>
                           Units
                           <BiUnite className='inline text-emerald-600 w-10 h-6 ' />
                        </button>
                        
                     </div>
                   


                  </div>
               </div>
            </div>
         )}


      

        
      </div>
    )
}


export default BottomNav;