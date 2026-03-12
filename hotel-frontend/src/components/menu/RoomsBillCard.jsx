import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';

import { CgUnavailable } from 'react-icons/cg';
import { BsCheck2Circle } from 'react-icons/bs';
import { setRoom } from '../../redux/slices/roomSlice';

const RoomsBillCard = ({ id, floor, roomNo, seats, priceOne, priceTow, status, image, bookedBy, dateReturn }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [priceType, setPriceType] = useState(null); // 'priceOne' or 'priceTow'
    const [isLoading, setIsLoading] = useState(false);

    const handleInvoice = async () => {
        if (!selectedPrice || !priceType) return;
        
        try {
            setIsLoading(true);
            
            dispatch(setRoom({
                _id: id,
                roomNo,
                floor,
                seats,
                priceOne, // Pass both prices
                priceTow, // Pass both prices
                selectedPrice, // The actual selected price value
                selectedPriceType: priceType, // 'priceOne' or 'priceTow'
                image
            }));
            
            // Simulate API delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
            navigate('/menu');
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateDaysStatus = () => {
        const returnDate = new Date(dateReturn);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((returnDate - today) / (1000 * 60 * 60 * 24));

        let text = '';
        let className = '';

        if (daysDiff > 1) {
            text = `${daysDiff} days left`;
            className = 'text-blue-600';
        } else if (daysDiff === 1) {
            text = '1 day left';
            className = 'text-orange-600';
        } else if (daysDiff === 0) {
            text = 'Due today';
            className = 'text-red-600 font-semibold';
        } else {
            text = `${Math.abs(daysDiff)} days overdue`;
            className = 'text-red-700 font-bold';
        }

        return { text, className, daysDiff };
    };

    const daysStatus = dateReturn ? calculateDaysStatus() : null;

    const handlePriceSelect = (price, type) => {
        if (isLoading) return; // Prevent price selection during loading
        setSelectedPrice(price);
        setPriceType(type);
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-100 cursor-pointer transform hover:-translate-y-1">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                        <h1 className="text-emerald-700 text-lg font-bold tracking-tight">{roomNo}</h1>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Floor {floor}
                    </span>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status === 'booked' 
                    ? 'bg-red-50 border border-red-200 text-red-700' 
                    : 'bg-green-50 border border-green-200 text-green-700'}`}>
                    {status === 'booked' ? (
                        <CgUnavailable className="animate-pulse" size={18} />
                    ) : (
                        <BsCheck2Circle size={16} />
                    )}
                    <span className="text-sm font-semibold capitalize">{status}</span>
                </div>
            </div>

            {/* Image */}
            <div className="relative h-30 overflow-hidden group">
                <img 
                    src={image} 
                    alt={`Room ${roomNo}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Room details */}
                <div className="grid grid-cols-1 gap-3 ">
                    {/* <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-md">
                            <span className="text-blue-700 text-sm font-semibold">Seats</span>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{seats}</span>
                    </div> */}
                    
                    <div className="flex items-center gap-2 bg-emerald-50 p-1 rounded-lg">
                        <span className="text-lg font-bold text-gray-800">{floor}</span>
                        <div className="p-2 rounded-md">
                            <span className="text-emerald-700 text-sm font-semibold">Floor</span>
                        </div>
                        
                    </div>
                </div>

                {/* Price Selection - Only show when available */}
                {status === "available" && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Price One Option */}
                            <div 
                                onClick={() => handlePriceSelect(priceOne, 'priceOne')}
                                className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                    selectedPrice === priceOne && priceType === 'priceOne'
                                    ? 'border-blue-500 bg-blue-50 transform scale-[1.02]'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                        {priceOne.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">SD / night</div>
                                    <div className="text-xs font-medium text-blue-700 mt-2">
                                        Price Option 1
                                    </div>
                                </div>
                            </div>

                            {/* Price Two Option */}
                            <div 
                                onClick={() => handlePriceSelect(priceTow, 'priceTow')}
                                className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                                    selectedPrice === priceTow && priceType === 'priceTow'
                                    ? 'border-emerald-500 bg-emerald-50 transform scale-[1.02]'
                                    : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <div className="text-center">
                                    <div className="text-lg font-bold text-emerald-600">
                                        {priceTow.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">SD / night</div>
                                    <div className="text-xs font-medium text-emerald-700 mt-2">
                                        Price Option 2
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Selected Price Indicator */}
                        {selectedPrice && (
                            <div className={`text-center p-3 rounded-lg ${
                                priceType === 'priceOne' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                                <div className="text-sm font-semibold">
                                    Selected: {selectedPrice.toFixed(2)} SD ({priceType === 'priceOne' ? 'Option 1' : 'Option 2'})
                                </div>
                            </div>
                        )}

                        {/* Book Button - Disabled until price is selected or during loading */}
                        <button
                            onClick={handleInvoice}
                            disabled={!selectedPrice || isLoading}
                            className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 transform shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group ${
                                selectedPrice && !isLoading
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-lg">Processing...</span>
                                </>
                            ) : selectedPrice ? (
                                <>
                                    <span className="text-lg">Book Now</span>
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    <span className="text-lg">Select a Price First</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Booked info - Only show when booked */}
                {status === "booked" && (
                    <div className="space-y-3">
                        {/* Booked info */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-100 p-2 rounded-lg">
                                        <span className="text-red-700 text-xs font-semibold">Booked By</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                                        {bookedBy}
                                    </span>
                                </div>
                                
                                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${daysStatus?.className} bg-white border`}>
                                    {daysStatus?.text}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Available on:</span>
                                <span className="font-semibold text-gray-800">
                                    {new Date(dateReturn).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        
                        {/* Warning for overdue */}
                        {daysStatus?.daysDiff < 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-sm font-medium text-red-700">
                                        This booking is overdue!
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomsBillCard;

// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useDispatch } from 'react-redux';

// import { CgUnavailable } from 'react-icons/cg';
// import { BsCheck2Circle } from 'react-icons/bs';
// import { setRoom } from '../../redux/slices/roomSlice';

// const RoomsBillCard = ({ id, floor, roomNo, seats, priceOne, priceTow, status, image, bookedBy, dateReturn }) => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const [selectedPrice, setSelectedPrice] = useState(null);
//     const [priceType, setPriceType] = useState(null); // 'priceOne' or 'priceTow'

//     const handleInvoice = () => {
//         if (!selectedPrice || !priceType) return;
        
//         dispatch(setRoom({ 
//             _id: id, 
//             roomNo, 
//             floor, 
//             seats, 
//             priceOne: priceType === 'priceOne' ? selectedPrice : priceOne,
//             priceTow: priceType === 'priceTow' ? selectedPrice : priceTow,
//             image 
//         }));
//         navigate('/menu');
//     };

//     const calculateDaysStatus = () => {
//         const returnDate = new Date(dateReturn);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         returnDate.setHours(0, 0, 0, 0);
//         const daysDiff = Math.floor((returnDate - today) / (1000 * 60 * 60 * 24));

//         let text = '';
//         let className = '';

//         if (daysDiff > 1) {
//             text = `${daysDiff} days left`;
//             className = 'text-blue-600';
//         } else if (daysDiff === 1) {
//             text = '1 day left';
//             className = 'text-orange-600';
//         } else if (daysDiff === 0) {
//             text = 'Due today';
//             className = 'text-red-600 font-semibold';
//         } else {
//             text = `${Math.abs(daysDiff)} days overdue`;
//             className = 'text-red-700 font-bold';
//         }

//         return { text, className, daysDiff };
//     };

//     const daysStatus = dateReturn ? calculateDaysStatus() : null;

//     const handlePriceSelect = (price, type) => {
//         setSelectedPrice(price);
//         setPriceType(type);
//     };

//     return (
//         <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-100 cursor-pointer transform hover:-translate-y-1">
//             {/* Header */}
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
//                 <div className="flex items-center gap-2">
//                     <div className="bg-emerald-100 p-2 rounded-lg">
//                         <h1 className="text-emerald-700 text-lg font-bold tracking-tight">{roomNo}</h1>
//                     </div>
//                     <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                         Floor {floor}
//                     </span>
//                 </div>
                
//                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status === 'booked' 
//                     ? 'bg-red-50 border border-red-200 text-red-700' 
//                     : 'bg-green-50 border border-green-200 text-green-700'}`}>
//                     {status === 'booked' ? (
//                         <CgUnavailable className="animate-pulse" size={18} />
//                     ) : (
//                         <BsCheck2Circle size={16} />
//                     )}
//                     <span className="text-sm font-semibold capitalize">{status}</span>
//                 </div>
//             </div>

//             {/* Image */}
//             <div className="relative h-48 overflow-hidden group">
//                 <img 
//                     src={image} 
//                     alt={`Room ${roomNo}`}
//                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             </div>

//             {/* Content */}
//             <div className="p-4 space-y-4">
//                 {/* Room details */}
//                 <div className="grid grid-cols-2 gap-3">
//                     <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
//                         <div className="bg-blue-100 p-2 rounded-md">
//                             <span className="text-blue-700 text-sm font-semibold">Seats</span>
//                         </div>
//                         <span className="text-lg font-bold text-gray-800">{seats}</span>
//                     </div>
                    
//                     <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-lg">
//                         <div className="bg-emerald-100 p-2 rounded-md">
//                             <span className="text-emerald-700 text-sm font-semibold">Floor</span>
//                         </div>
//                         <span className="text-lg font-bold text-gray-800">{floor}</span>
//                     </div>
//                 </div>

//                 {/* Price Selection - Only show when available */}
//                 {status === "available" && (
//                     <div className="space-y-3">
//                         <div className="grid grid-cols-2 gap-3">
//                             {/* Price One Option */}
//                             <div 
//                                 onClick={() => handlePriceSelect(priceOne, 'priceOne')}
//                                 className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
//                                     selectedPrice === priceOne && priceType === 'priceOne'
//                                     ? 'border-blue-500 bg-blue-50 transform scale-[1.02] '
//                                     : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
//                                 }`}
//                             >
//                                 <div className="text-center">
//                                     <div className="text-lg font-bold text-blue-600">
//                                         {priceOne.toFixed(2)}
//                                     </div>
//                                     <div className="text-xs text-gray-600 mt-1">SD / night</div>
//                                     <div className="text-xs font-medium text-blue-700 mt-2">
//                                         Price Option 1
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Price Two Option */}
//                             <div 
//                                 onClick={() => handlePriceSelect(priceTow, 'priceTow')}
//                                 className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
//                                     selectedPrice === priceTow && priceType === 'priceTow'
//                                     ? 'border-emerald-500 bg-emerald-50 transform scale-[1.02]'
//                                     : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
//                                 }`}
//                             >
//                                 <div className="text-center">
//                                     <div className="text-lg font-bold text-emerald-600">
//                                         {priceTow.toFixed(2)}
//                                     </div>
//                                     <div className="text-xs text-gray-600 mt-1">SD / night</div>
//                                     <div className="text-xs font-medium text-emerald-700 mt-2">
//                                         Price Option 2
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Selected Price Indicator */}
//                         {selectedPrice && (
//                             <div className={`text-center p-3 rounded-lg ${
//                                 priceType === 'priceOne' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
//                             }`}>
//                                 <div className="text-sm font-semibold">
//                                     Selected: {selectedPrice.toFixed(2)} SD ({priceType === 'priceOne' ? 'Option 1' : 'Option 2'})
//                                 </div>
//                             </div>
//                         )}

//                         {/* Book Button - Disabled until price is selected */}
//                         <button
//                             onClick={handleInvoice}
//                             disabled={!selectedPrice}
//                             className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 transform shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group ${
//                                 selectedPrice
//                                 ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
//                                 : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
//                             }`}
//                         >
//                             {selectedPrice ? (
//                                 <>
//                                     <span className="text-lg">Book Now</span>
//                                     <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                                     </svg>
//                                 </>
//                             ) : (
//                                 <>
//                                     <span className="text-lg">Select a Price First</span>
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                                     </svg>
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 )}

//                 {/* Booked info - Only show when booked */}
//                 {status === "booked" && (
//                     <div className="space-y-3">
//                         {/* Booked info */}
//                         <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <div className="bg-red-100 p-2 rounded-lg">
//                                         <span className="text-red-700 text-xs font-semibold">Booked By</span>
//                                     </div>
//                                     <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
//                                         {bookedBy}
//                                     </span>
//                                 </div>
                                
//                                 <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${daysStatus?.className} bg-white border`}>
//                                     {daysStatus?.text}
//                                 </div>
//                             </div>
                            
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                 </svg>
//                                 <span>Available on:</span>
//                                 <span className="font-semibold text-gray-800">
//                                     {new Date(dateReturn).toLocaleDateString('en-GB', {
//                                         day: 'numeric',
//                                         month: 'short',
//                                         year: 'numeric'
//                                     })}
//                                 </span>
//                             </div>
//                         </div>
                        
//                         {/* Warning for overdue */}
//                         {daysStatus?.daysDiff < 0 && (
//                             <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
//                                 <div className="flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                                     </svg>
//                                     <span className="text-sm font-medium text-red-700">
//                                         This booking is overdue!
//                                     </span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RoomsBillCard;

// import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useDispatch } from 'react-redux';

// import { CgUnavailable } from 'react-icons/cg';
// import { BsCheck2Circle } from 'react-icons/bs';
// import { setRoom } from '../../redux/slices/roomSlice';

// const RoomsBillCard = ({ id, floor, roomNo, seats, priceOne, priceTow, status, image, bookedBy, dateReturn }) => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const handleInvoice = (_id, roomNo, floor, seats, priceOne, priceTow, image) => {
//         dispatch(setRoom({ _id, roomNo, floor, seats, priceOne, priceTow, image }));
//         navigate('/menu');
//     };

//     const calculateDaysStatus = () => {
//         const returnDate = new Date(dateReturn);
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         returnDate.setHours(0, 0, 0, 0);
//         const daysDiff = Math.floor((returnDate - today) / (1000 * 60 * 60 * 24));

//         let text = '';
//         let className = '';

//         if (daysDiff > 1) {
//             text = `${daysDiff} days left`;
//             className = 'text-blue-600';
//         } else if (daysDiff === 1) {
//             text = '1 day left';
//             className = 'text-orange-600';
//         } else if (daysDiff === 0) {
//             text = 'Due today';
//             className = 'text-red-600 font-semibold';
//         } else {
//             text = `${Math.abs(daysDiff)} days overdue`;
//             className = 'text-red-700 font-bold';
//         }

//         return { text, className, daysDiff };
//     };

//     const daysStatus = dateReturn ? calculateDaysStatus() : null;

//     return (
//         <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-100 cursor-pointer transform hover:-translate-y-1">
//             {/* Header */}
//             <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
//                 <div className="flex items-center gap-2">
//                     <div className="bg-emerald-100 p-2 rounded-lg">
//                         <h1 className="text-emerald-700 text-lg font-bold tracking-tight">{roomNo}</h1>
//                     </div>
//                     <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                         Floor {floor}
//                     </span>
//                 </div>
                
//                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status === 'booked' 
//                     ? 'bg-red-50 border border-red-200 text-red-700' 
//                     : 'bg-green-50 border border-green-200 text-green-700'}`}>
//                     {status === 'booked' ? (
//                         <CgUnavailable className="animate-pulse" size={18} />
//                     ) : (
//                         <BsCheck2Circle size={16} />
//                     )}
//                     <span className="text-sm font-semibold">{status}</span>
//                 </div>
//             </div>

//             {/* Image */}
//             <div className="relative h-48 overflow-hidden group">
//                 <img 
//                     src={image} 
//                     alt={`Room ${roomNo}`}
//                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
//                 {/* Price badge */}
//                 <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
//                         <div className="text-center">
//                             <span className="text-sm font-bold text-blue-600">{priceOne.toFixed(2)}</span>
//                             <span className="text-xs text-gray-600 block">SD / night</span>
//                         </div>
//                 </div>
//                 <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
//                         <div className="text-center">
//                             <span className="text-sm font-bold text-blue-600">{priceTow.toFixed(2)}</span>
//                             <span className="text-xs text-gray-600 block">SD / night</span>
//                         </div>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="p-4 space-y-4">
//                 {/* Room details */}
//                 <div className="grid grid-cols-2 gap-3">
//                     <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
//                         <div className="bg-blue-100 p-2 rounded-md">
//                             <span className="text-blue-700 text-sm font-semibold">Seats</span>
//                         </div>
//                         <span className="text-lg font-bold text-gray-800">{seats}</span>
//                     </div>
                    
//                     <div className="flex items-center gap-2 bg-emerald-50 p-3 rounded-lg">
//                         <div className="bg-emerald-100 p-2 rounded-md">
//                             <span className="text-emerald-700 text-sm font-semibold">Floor</span>
//                         </div>
//                         <span className="text-lg font-bold text-gray-800">{floor}</span>
//                     </div>
//                 </div>

//                 {/* Action button or booking info */}
//                 {status === "available" ? (
//                     <button
//                         onClick={() => handleInvoice(id, roomNo, floor, seats, price, image)}
//                         className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
//                     >
//                         <span className="text-lg">Book Now</span>
//                         <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                         </svg>
//                     </button>
//                 ) : (
//                     <div className="space-y-3">
//                         {/* Booked info */}
//                         <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 space-y-3">
//                             <div className="flex items-center justify-between">
//                                 <div className="flex items-center gap-2">
//                                     <div className="bg-red-100 p-2 rounded-lg">
//                                         <span className="text-red-700 text-xs font-semibold">Booked By</span>
//                                     </div>
//                                     <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
//                                         {bookedBy}
//                                     </span>
//                                 </div>
                                
//                                 <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${daysStatus?.className} bg-white border`}>
//                                     {daysStatus?.text}
//                                 </div>
//                             </div>
                            
//                             <div className="flex items-center gap-2 text-sm text-gray-600">
//                                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                 </svg>
//                                 <span>Available on:</span>
//                                 <span className="font-semibold text-gray-800">
//                                     {new Date(dateReturn).toLocaleDateString('en-GB', {
//                                         day: 'numeric',
//                                         month: 'short',
//                                         year: 'numeric'
//                                     })}
//                                 </span>
//                             </div>
//                         </div>
                        
//                         {/* Warning for overdue */}
//                         {daysStatus?.daysDiff < 0 && (
//                             <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
//                                 <div className="flex items-center gap-2">
//                                     <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                                     </svg>
//                                     <span className="text-sm font-medium text-red-700">
//                                         This booking is overdue!
//                                     </span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default RoomsBillCard;

// import React from 'react'
// import {useNavigate} from 'react-router-dom'
// import {useDispatch} from 'react-redux';

// import { CgUnavailable } from 'react-icons/cg';
// import { BsCheck2Circle } from 'react-icons/bs';
// import { setRoom } from '../../redux/slices/roomSlice';

// const RoomsBillCard =({id, floor, roomNo, seats, price, status, image, bookedBy, dateReturn}) => {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const handleInvoice = (_id, roomNo, floor, seats, price, image) => {
//         dispatch(setRoom({ _id, roomNo, floor ,seats, price, image }));
//         navigate('/menu');
//         //console.log(customerId)
//     };
//     return (
        
//         <div  className ='w-[250px] h-[310px] bg-white p-1 rounded-lg shadow-lg/30 cursor-pointer hover:bg-emerald-500/10'>
   
//             <div className ='flex items-center justify-between p-1 shadow-lg/xl'>
//                 <h1 className ='text-emerald-600 text-sm font-semibold'>{roomNo}</h1>

//                 <p className ={`${status === 'Booked'? "bg-red-200 text-[#be3e3f]" : "bg-green-200 text-green-700"} 
//                     text-xs font-semibold px-2 py-1 rounded-lg shadow-lg`}>
//                     <CgUnavailable className ='inline' size ={25} hidden ={status === 'Available'}/> 
//                     <BsCheck2Circle hidden ={status === 'Booked'} size ={20} className ='inline'/>
//                     {status}
//                 </p>
//             </div>
               
//             <div className ='flex items-center justify-center mt-2 mb-2' >
//                 <img src ={image} className ='h-35 hover:h-60 rounded-sm'/>
//             </div>
   
//             <div className ='flex flex-col gap-1'>
//                 <div className ='flex justify-between items-center'>
//                     <p className='text-[#1a1a1a] text-xs'><span className='text-emerald-600 text-xs font-semibold'>{floor}</span></p>
//                     <p className='text-[#1a1a1a] text-xs'>Seats : <span className='text-[#0ea5e9] text-sm font-semibold'>{seats}</span></p>
//                 </div>
//                 <div className ='flex justify-between items-center'>
//                     <p className='text-[#1a1a1a] text-xs'>Price : <span className='text-[#0ea5e9] text-sm font-semibold'>{price}</span>
//                         <span className ='text-[#1a1a1a] text-xs font-normal'> AED</span>
//                     </p>                    
//                 </div>
//                 <button
//                     hidden={status === "Booked"}
//                     onClick={() => handleInvoice(id, roomNo, floor, seats, price, image)}
//                     className='rounded-sm bg-[#0ea5e9] w-full text-[#f6b100] text-xl font-bold py-4 cursor-pointer '>
//                     Book the room
//                 </button>

//                 <div hidden ={status === 'Available'} className ='flex flex-col rounded-sm bg-red-200 p-1'>
//                     <p
//                         className='w-full text-[#1f1f1f] text-xs font-normal cursor-pointer'>
//                         Booked By : <span className='text-emerald-600 text-xs font-semibold'> {bookedBy}</span>
//                     </p>
//                     <div className ='flex items-center justify-between '>
//                         <p
//                             className='w-full text-[#1f1f1f] text-xs font-normal cursor-pointer w-[50%]'>
//                             Available on : <span className='text-emerald-600 text-xs font-normal'> {new Date(dateReturn).toLocaleDateString('en-GB')}</span>
//                         </p>
//                         <p className={`text-xs font-normal w-[50%] ${(() => {
//                                 const returnDate = new Date(dateReturn);
//                                 const today = new Date();
//                                 today.setHours(0, 0, 0, 0);
//                                 returnDate.setHours(0, 0, 0, 0);
//                                 const daysDiff = Math.floor((returnDate - today) / (1000 * 60 * 60 * 24));

//                                 // Apply red text if 1 day left or due today
//                                 return daysDiff <= 1 ? 'text-[#be3e3f]' : '';
//                             })()
//                             }`}>
//                             {(() => {
//                                 const returnDate = new Date(dateReturn);
//                                 const today = new Date();
//                                 today.setHours(0, 0, 0, 0);
//                                 returnDate.setHours(0, 0, 0, 0);
//                                 const daysDiff = Math.floor((returnDate - today) / (1000 * 60 * 60 * 24));

//                                 if (daysDiff > 1) return `${daysDiff} days left`;
//                                 if (daysDiff === 1) return '1 day left';
//                                 if (daysDiff === 0) return 'Due today';
//                                 return `${Math.abs(daysDiff)} days overdue`;
//                             })()}
//                         </p>
//                     </div>
                   
//                 </div>
               
//             </div>   
            
//         </div>
//     );
// };


// export default RoomsBillCard;