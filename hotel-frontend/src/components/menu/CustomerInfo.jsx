   import React, {useState} from 'react'
import { useSelector } from 'react-redux';
import { formatDate, formatTime, getAvatarName } from '../../utils';
import { FaUser, FaCalendarAlt, FaClock, FaHashtag } from 'react-icons/fa';

const CustomerInfo = () => {
    const customerData = useSelector(state => state.customer);
    const [dateTime] = useState(new Date());

    return (
        <div className="bg-white rounded-xl shadow-lg border border-emerald-100 p-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <FaUser className="text-emerald-600" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-emerald-800">Guest Information</h2>
                        <p className="text-xs text-emerald-600">Booking details and customer info</p>
                    </div>
                </div>
                
                {/* Avatar */}
                <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {getAvatarName(customerData.customerName) || 'CN'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-100 border-2 border-white rounded-full p-1">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-2">
                {/* Customer Name Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-2 border border-emerald-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="bg-emerald-100 p-1.5 rounded-md">
                            <FaUser className="text-emerald-600" size={14} />
                        </div>
                        {/* <span className="text-xs font-medium text-emerald-700">Guest Name</span>
                         */}
                        <p className="text-lg font-bold text-emerald-800 truncate">
                        {customerData.customerName || 'Not Selected'}
                        </p>

                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                        <span className="px-2 py-1 bg-emerald-100 rounded-full">Active</span>
                        <span>Dine In</span>
                    </div>
                </div>

                {/* Order ID Card */}
                {/* <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-emerald-100 p-1.5 rounded-md">
                            <FaHashtag className="text-emerald-600" size={14} />
                        </div>
                        <span className="text-xs font-medium text-emerald-700">Order Reference</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200">
                            <p className="text-sm font-mono font-bold text-emerald-800">
                                #{customerData.orderId || 'N/A'}
                            </p>
                        </div>
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                            Dine In
                        </span>
                    </div>
                </div> */}
            </div>

            {/* Date & Time */}
            {/* <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100"> */}
                {/* <div className="flex items-center gap-2 mb-3">
                    <div className="bg-emerald-100 p-1.5 rounded-md">
                        <FaCalendarAlt className="text-emerald-600" size={14} />
                    </div>
                    <span className="text-sm font-medium text-emerald-700">Booking Date & Time</span>
                </div> */}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    {/* <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                            <FaCalendarAlt className="text-emerald-500" size={16} />
                            <span className="text-xs font-medium text-emerald-700">Date</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-emerald-800">
                                {formatDate(dateTime)}
                            </p>
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                Today
                            </span>
                        </div>
                    </div> */}

                    {/* Time */}
                    {/* <div className="bg-white rounded-lg p-3 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                            <FaClock className="text-emerald-500" size={16} />
                            <span className="text-xs font-medium text-emerald-700">Time</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-emerald-800">
                                {formatTime(dateTime)}
                            </p>
                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                                Current
                            </span>
                        </div>
                    </div> */}
                {/* </div> */}

                {/* Additional Info */}
                {/* <div className="mt-4 pt-4 border-t border-emerald-200">
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span>Booking created automatically</span>
                    </div>
                </div> */}
            </div>

            {/* Quick Stats - Optional enhancement */}
            {customerData.balance !== undefined && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-center">
                        <p className="text-xs text-emerald-600 mb-1">Balance</p>
                        <p className={`text-lg font-bold ${customerData.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {(Number(customerData.balance) || 0).toFixed(2)} SD
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-emerald-600 mb-1">Status</p>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                            {customerData.customerName ? 'Active' : 'Select Customer'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInfo;
   
   // import React, {useState} from 'react'
    // import { useSelector } from 'react-redux';
    // import { formatDate, formatTime, getAvatarName } from '../../utils';

    // const CustomerInfo = () => {
    //     const customerData = useSelector(state => state.customer);
    //     const [dateTime, setDateTime] = useState(new Date())

    //     return (

    //         <div className ='px-4 py-1   flex items-center justify-between shadow-xl mb-1'>
            
    //             <div className ='flex flex-col items-start '>
    //                 <h1 className ='text-xs underline text-emerald-600 font-semibold'>{customerData.customerName || 'customer Name' } </h1>
    //                 <p className  ='text-xs text-[#1a1a1a] font-normal mt-1'>#{customerData.orderId || 'N/A'} / Dine in</p>
    //                 <p className  ='text-xs text-[#1a1a1a] font-normal mt-2'>{formatDate(dateTime)} / {formatTime(dateTime)}</p>
    //             </div>

    //             <button className ='bg-emerald-600 text-white p-3 text-lg font-semibold rounded-full shadow-lg/30'>{getAvatarName(customerData.customerName) || 'CN'}</button>
                
    //         </div>

            
    //     );
    // };

    // export default CustomerInfo ;