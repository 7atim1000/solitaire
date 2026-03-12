import React from 'react'
import { CiSearch } from "react-icons/ci";
import { FaUserTie } from "react-icons/fa";
import { CiBellOff } from "react-icons/ci";
import { SiHiltonhotelsandresorts } from "react-icons/si";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdDashboardCustomize } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { removeUser } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../https';

const Headers = () => {

    const userData = useSelector(state => state.user);
    const navigate = useNavigate()
    
    const dispatch = useDispatch();
    
    const logOutMutation = useMutation({
        mutationFn: () => logout(),
        onSuccess: (data) => {
            dispatch(removeUser());
            navigate('/auth');
        },
        onErorr: (error) => {
            console.log(error);
        }
    });


    const handleLogout = () => {
    if (!logOutMutation.isLoading) {
        
        // Clear client-side cookie just in case
        document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        logOutMutation.mutate();
    }
};

    return ( // #1d2569 rgb(10, 80, 167)  #025cca #1a1a1a  #1f1f1f
       <header className ='flex justify-between items-center py-4 px-8 bg-linear-65 from-emerald-50 to-emerald-600 h-17 shadow-xl '>

            {/* Logo */}
            <div className ='flex gap-2 items-center ml-0'>
               <SiHiltonhotelsandresorts onClick ={() => navigate('/')} className ='text-4xl text-emerald-600 cursor-pointer' size ={50} />
               <h1 className ='text-lg font-semibold text-emerald-600'>Hotel</h1>
            </div>

            {/* Search */}
            <div className ='flex items-center bg-emerald-50 gap-2 p-1 w-[500px] rounded-[5px]'>
                <CiSearch className ='text-emerald-600 text-lg font-bold'/>
                <input 
                    type ="text"
                    placeholder ='Search'
                    className ='text-[#1a1a1a] px-2  rounded-md outline-none w-full'
                />
            </div>
            

            {/* Logged user & Bell & Dashbord*/}
            <div className ='flex items-center gap-4 mr-0'>
                
                { userData.role === 'Admin' && (
                    <div onClick={() => navigate('/dashboard')} className ='cursor-pointer p-2 rounded-[15px] '>
                        <MdDashboardCustomize className ='text-emerald-50 text-2xl font-bold'/>
                    </div>
                )}
           
                    <div className ='cursor-pointer p-2 rounded-[15px]'>
                        <CiBellOff className ='text-emerald-50 text-2xl font-bold'/>
                    </div>


                    <div className ='flex items-center gap-3 cursor-pointer'>
                        <FaUserTie className ='text-emerald-50 text-2xl'/>
                        <div className ='flex-col text-start'>
                            <h1 className ='text-emerald-50 text-xs font-semibold'>{userData.name || "Test user"}</h1>
                            <p className ='text-white text-xs'>{userData.role || "Role"}</p>
                        </div>

            {/* logged out */}
                        <RiLogoutCircleRLine onClick={handleLogout} className ='text-white  border-b-2 border-emerald-50 p-1 ml-2 rounded-[3px]' size={37}/>
                    </div>

            </div>

       </header>
       
    
        
    )
}

export default Headers