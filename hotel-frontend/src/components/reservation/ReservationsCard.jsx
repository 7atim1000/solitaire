import React from 'react';
import { FaCheckDouble } from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa';
import { getAvatarName } from '../../utils';

// evedence
const ReservationsCard = ({key, order}) => {
    
    return (

        <div className='w-[400px] bg-[#1f1f1f] p-4 rounded-lg mb-4 shadow-lg/30 border-b border-[#f6b100]'>
            <div className='flex items-center gap-5'>

                <button className='bg-sky-400 p-4 text-sm font-bold rounded-full'>{getAvatarName(order.customerDetails.name)}</button>

                <div className='flex items-center justify-between w-[100%]'>

                    <div className='flex flex-col items-start gap-1'>
                        <h1 className='text-[#f5f5f5] text-sm tracking-wide'>{order.customerDetails.name}</h1>
                        <p className={`${order.shift === 'morning' ? 'text-[#f6b100]' : 'text-[#e6e6e6]'} text-sm font-medium`}>{order.shift}</p>
                        {/* <p className='text-[#ababab] text-sm'>Table | {order.table.tabNo}</p> */}
                    </div>

                    <div className='flex flex-col items-center gap-2'>
                        {
                            order.orderStatus === "Completed" ? (
                                <>
                                    <p className='text-green-600 bg-[#2e4a40] px-2 rounded-lg text-xs'><FaCheckDouble className='inline mr-2' />{order.orderStatus}</p>
                                    <p className='text-[#ababab] text-sm'><FaCircle className='inline mr-1 text-green-600' />Ready to serve</p>
                                </>

                            ) : (
                                <>
                                    <p className='text-yellow-600 bg-[#4a452e] py-2 px-2 rounded-lg text-xs font-normal'><FaCheckDouble className='inline mr-2' />{order.orderStatus}</p>
                                    <p className='text-[#ababab] text-xs font-normal'><FaCircle className='inline mr-1 text-yellow-600' />Preparing</p>
                                </>

                            )
                        }
                    </div>

                </div>

            </div>


            <div className='flex justify-around items-center mt-4 text-[#ababab]'>
                <p className='text-sky-400 text-sm font-semibold'>{order.date ? new Date(order.date).toLocaleDateString('en-GB') : ''}</p>
                <p className='text-sm font-semibold'>{order.items.length} <span className='text-xs font-normal'>Items</span></p>
            </div>
            <hr className='w-full mt-4 text-black border-t-1' />
            <div className='flex items-center justify-between mt-4'>
                <h1 className='text-sky-400 text-sm font-semibold'>Total</h1>
                <p className='text-[#f5f5f5] text-lg font-semibold'>
                    <span className='text-xs font-normal'>SD </span>
                    {order.bills.totalWithTax.toFixed(2)}</p>
            </div>

        </div>

    )
}


export default ReservationsCard; 