import React from 'react'
import { metricsData } from '../../constants';

const Metrics = () => {
    return (
        <div className ='container mx-auto py-2 px-6 md:px-5'>
            
            <div className ='flex justify-between items-center'>
                <div>
                    <h2 className ='font-semibold text-[#1a1a1a] text-lg'>Overall Performance</h2>
                    <p className ='text-xs text-[#1f1f1f]'>Employee Incomes , puplic income or income between date</p>
                </div>

                <button className ='flex items-center gap-1 px-4 py-2 rounded-md text-[#1f1f1f] bg-gray-300 text-xs font-semibold' >Last 1 Mounth
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
            
            <div className ='mt-6 grid grid-cols-4 gap-4 bg-gray-300 p-5 rounded-lg'>
                {metricsData.map((metric, index) => {
                    return (

                        <div key={index}
                            className ='shadow-lg rounded-lg p-4' style={{
                            backgroundColor: metric.color
                        }}>

                        <div className ='flex justify-between items-center'>
                            <p className ='font-medium text-xs text-[#f5f5f5]'>{metric.title}</p>
                        
                        <div className ='flex items-center gap-1'>
                            <svg className ='w-3 h-3' viewBox ='0 0 24 24'
                            strock ='currentColor' strokeWidth ='4' fill ='none' style ={{
                                color: metric.isIncrease ? 'f5f5f5' : 'red'
                            }}
                            >

                            <path d={metric.isIncrease ? 'M5 1517-7 7 7' : 'M19 91-7 7-7-7'}/>
                            </svg>

                            <p className ='font-medium text-xs' style={{ color: metric.isIncrease ? "#f5f5f5" : "#f5f5f5"}}>{metric.percentage}</p>
                        </div>
                        </div>

                        <p className ='mt-1 font-semibold text-2xl text-[#f5f5f5]'>{metric.value}</p>

                        </div>
                    )
                })}
            </div>

        </div>
    );
};



export default Metrics;