import React from 'react'

import { getAvatarName } from '../../utils';
import { FaLongArrowAltRight } from "react-icons/fa";
import { MdOutlineChecklistRtl } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
// landing page


const OrderList = ({key, order}) => {

    return (
        <div className ='flex px-5 items-center gap-5 mb-2 bg-white rounded-lg shadow-lg/30 border-b-2 border-emerald-600'>
            {/*left side */}
            <button className ='bg-emerald-600 w-12 h-12 rounded-full text-white  text-xs font-semibold  my-2'>{getAvatarName(order.customerDetails.name)}</button>
          
            <div className ='flex justify-between items-center w-[100%]'>
                
                <div className ='flex flex-col items-start gap-'>
                    <h1 className ='text-[#1a1a1a] text-sm font-semibold tracking-wide'>{order.customerDetails.name}</h1>
                    <p className ='text-blue-700 text-sm'>{order.items.length} Items</p>
                </div>
            {/*center side */}
                <div>
                    <h1 className ='text-emerald-600 bg-emerald-50 font-semibold text-sm rounded-lg p-1 shadow-lg/30 '>Room<FaLongArrowAltRight className ='inline ml-2'/> {order.room.roomNo}</h1>
                </div>

            {/*right side */}    
                <div className ='flex flex-col items-start gap-1'>
                    <p className ='bg-green-700 text-[#f5f5f5] px-4 text-sm shadow-lg rounded-lg'><MdOutlineChecklistRtl className ='inline mr-0' size={20}/> Ready</p>
                    <p className ='text-sm text-[#1f1f1f] '><FaCheckCircle className ='inline mr-0 text-green-900' size={15}/> Ready to serve</p>
                </div>

            </div>

        </div>
    )
}


export default OrderList