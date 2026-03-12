import React from 'react'

const MiniCard = ({title, icon, number, footerNum}) => {
    return (
        <div className ='bg-white shadow-lg/30 px-5 py-2 rounded-lg w-[50%] border-b-2 border-emerald-600'>
            <div className ='flex items-center justify-between mt-0'>
                <h1 className ='text-[#1a1a1a] text-sm font-semibold'>{title}</h1>
                
                <button className ={`${title === "Total Earning" ? "text-emerald-600" : "text-[#f6b100]"} text-xl font-semibold rouded-full`}>{icon}</button>
            
            </div>
            <div className ='mt-1'>
                <h1 className ={`${title === "Total Earning" ? "text-emerald-700" : "text-[#f6b100]" } text-xl font-semibold `}>
                    {number}
                    <span className ='font-normal text-xs text-[#1a1a1a]'> AED</span>
                </h1>
                <h1 className ={`${title === "Total Earning" ? "text-sky-600" : "text-sky-600"} text-xs font-semibold`}>
                    {/* <p className ={`${title === "Total Earning" ? "text-emerald-700" : "text-[#f6b100]"}`}>{footerNum}</p> */}
                    than yesterday</h1>
            </div>
        </div>
    )
    
}

export default MiniCard