import React from 'react'

const Employee = () => {
    return (
        <div className ='container mx-auto py-2 px-6 md:px-10'>
            
            <div className ='flex justify-between items-center'>
                <div>
                    <h2 className ='font-semibold text-[#1a1a1a] text-lg'>Incomes Performance</h2>
                    <p className ='text-xs text-[#1f1f1f]'>Employee Incomes , puplic income or income between date</p>
                </div>

                <button className ='flex items-center gap-1 px-4 py-2 rounded-md text-[#1f1f1f] bg-gray-300 text-xs font-semibold' >Last Day
                    <svg
                       className ='w-3 h-3'
                       viewBox ='0 0 24 24'
                       stroke = 'currentColor'
                       strokeWidth ='4'
                    >
                    
                    <path d='M19 9l-7 7-7-7'/>
                    </svg>
                </button>

            </div>
        </div>
    )
};


export default Employee;