import React , { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { RiSunFoggyFill } from "react-icons/ri";
import { BsFillMoonStarsFill } from "react-icons/bs";

const Greetings = () => {
    function getCurrentShift() {
        const hour = new Date().getHours();
        // Example: Morning = 6:00-17:59, Evening = 18:00-5:59
        return (hour >= 6 && hour < 18) ? 'Morning' : 'Evening';
    }


    const userData = useSelector(state => state.user)
    const [dateTime, setDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDateTime(new Date()), 1000);
        return ()=> clearInterval(timer);
    }, []); 

    const formatDate = (date) => {
        const months = [
            'Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, 
        ${date.getFullYear()}` ;
    };

    const formatTime = (date) =>
        `${String(date.getHours()).padStart(2, '0')}:${String(
            date.getMinutes()
        ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}` ;


    return(
        <div className ='flex items-center bg-white justify-between shadow-xl p-1'>
            <div>
                <h1 className ='text-[#1a1a1a] text-md font-semibold tracking-wide]'>Good Morning - {userData.name || "Test user"}</h1>
                <p className ='text-emerald-600 text-sm'>Give your best services for customers ...</p>
            </div>
            
            <div className='flex items-center gap-2 justify-center'>

                {getCurrentShift() === 'Morning' ? (
                    <RiSunFoggyFill className='text-[#F6B100]' size={30} />
                ) : (
                    <BsFillMoonStarsFill className='text-gray-400' size={30} />
                )}
                <h1 className='text-sm text-sky-600 font-semibold'>
                    {getCurrentShift()} shift
                </h1>

            </div>

            <div className ='px-2'>
                <h1 className ='text-emerald-600 text-lg font-bold tracking-wide'>{formatTime(dateTime)}</h1>
                <p className ='text-[#1f1f1f] text-sm font-semibold'>{formatDate(dateTime)}</p>
            </div>
        </div>

 
    )
}


export default Greetings