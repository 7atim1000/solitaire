import React, { useEffect, useRef } from 'react' 
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { removeItem } from '../../redux/slices/cartSlice';

const CartInfo = () => {
    const cartData = useSelector(state => state.cart);
    
    const scrolLRef = useRef();
    useEffect(() => {
        if (scrolLRef.current) {
            scrolLRef.current.scrollTo({
                top: scrolLRef.current.scrollHeight,
                behavior: "smooth"
            })
        }
    }, [cartData])

    // remove item - Need to handle both id and priceType now
    const dispatch = useDispatch();
    const handleRemove = (itemId) => {
        // For backward compatibility, we'll remove all items with this room ID
        // But in the new structure, you should remove by both id and priceType
        dispatch(removeItem(itemId))
    }

    // Calculate totals
    const totalAmount = cartData.reduce((sum, item) => sum + item.price, 0);
    const totalDays = cartData.reduce((sum, item) => sum + item.quantity, 0);

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg mb-2 overflow-hidden border border-emerald-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4">
                <div className="flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold">Booking Cart</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm bg-emerald-700/30 px-3 py-1 rounded-full">
                            {cartData.length} {cartData.length === 1 ? 'item' : 'items'}
                        </span>
                        <span className="text-sm bg-emerald-700/30 px-3 py-1 rounded-full">
                            {totalDays} {totalDays === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cart Items */}
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100" ref={scrolLRef}>
                {cartData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-emerald-200 mb-3">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
                        <p className="text-sm text-gray-400">Start adding room reservations!</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {cartData.map((item, index) => {
                            // Get price type label
                            const priceTypeLabel = item.priceType === 'priceTow' ? 'Premium' : 'Standard';
                            const priceTypeColor = item.priceType === 'priceTow' ? 'emerald' : 'blue';

                            return (
                                <div 
                                    key={`${item.id}-${item.priceType || index}`}
                                    className="bg-gradient-to-r from-gray-50 to-white rounded-lg border border-emerald-100 p-4 hover:border-emerald-300 transition-all duration-300"
                                >
                                    {/* Item Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-emerald-800 text-lg">{item.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full bg-${priceTypeColor}-100 text-${priceTypeColor}-700 font-medium`}>
                                                    {priceTypeLabel} Rate
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <span>Floor {item.floor || '--'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span>{item.seats || '--'} Seats</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                    </div>

                                    {/* Price Details */}
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-white p-3 rounded-lg border border-emerald-50">
                                            <p className="text-xs text-gray-500 mb-1">Rate per night</p>
                                            <p className="font-bold text-emerald-700">
                                                {item.pricePerQuantity.toFixed(2)} SD
                                            </p>
                                        </div>
                                        <div className="bg-white p-3 rounded-lg border border-emerald-50">
                                            <p className="text-xs text-gray-500 mb-1">Total nights</p>
                                            <p className="font-bold text-emerald-700">
                                                {item.quantity} {item.quantity === 1 ? 'night' : 'nights'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date Information */}
                                    {item.dateBooking && item.dateReturn && (
                                        <div className="bg-emerald-50 p-3 rounded-lg mb-3">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-emerald-600 mb-1">From</p>
                                                    <p className="font-medium text-emerald-800">
                                                        {formatDate(item.dateBooking)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-emerald-600 mb-1">To</p>
                                                    <p className="font-medium text-emerald-800">
                                                        {formatDate(item.dateReturn)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Item Footer */}
                                    <div className="flex justify-between items-center pt-3 border-t border-emerald-100">
                                        <div className="text-sm text-gray-600">
                                            {item.pricePerQuantity.toFixed(2)} SD × {item.quantity} nights
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Total</p>
                                            <p className="text-xl font-bold text-emerald-800">
                                                {item.price.toFixed(2)} SD
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cart Summary - Only show when there are items */}
            {cartData.length > 0 && (
                <div className="border-t border-emerald-100 p-4 bg-gradient-to-r from-emerald-50 to-green-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-emerald-600">Total amount</p>
                            <p className="text-2xl font-bold text-emerald-800">
                                {totalAmount.toFixed(2)} SD
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-emerald-600">{totalDays} total nights</p>
                            <p className="text-sm font-medium text-emerald-700">
                                {cartData.length} {cartData.length === 1 ? 'room' : 'rooms'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartInfo;

// import React, { useEffect, useRef } from 'react' 
// import { MdDelete } from "react-icons/md";
// import { useDispatch, useSelector } from 'react-redux';
// import { removeItem } from '../../redux/slices/cartSlice';

// const CartInfo = () => {

//     const cartData = useSelector(state => state.cart);
    
//     const scrolLRef = useRef();
//     useEffect(() => {
//         if (scrolLRef.current) {

//             scrolLRef.current.scrollTo({
//                 top: scrolLRef.current.scrollHeight,
//                 behavior: "smooth"
//             })
           
//         }
//     }, [cartData])

//     // remove item
//     const dispatch = useDispatch();
//     const handleRemove = (itemId) => {
//     dispatch(removeItem(itemId))
//     }

//     return (
//         <div className ='px-1 py-1 bg-white mb-10 shadow-xl'>
         
//             <div className ='mt-1 overflow-y-scroll scrollbar-hidden shadow-lg h-[100px] rounded-lg border-b-2 border-emerald-600' ref ={scrolLRef} >
               
//                 {cartData.length === 0 ? (
//                     <p className ='text-xs text-[#be3e3f] font-semibold flex justify-center items-center h-[150px]'>Your cart is empty. Start adding reservation!</p>
               
//                 ) : cartData.map((item) => {
                    
//                     return (
//                         <div className ='bg-white  hover:bg-emerald-50 shadow-lg/30 rounded-lg p-4 mb-2' >

//                             <div className ='flex items-center justify-between py-2'>
//                                 <h1 className ='text-[#1a1a1a] font-semibold text-sm underline'>{item.name}</h1>
//                                 <p className ='text-[#1a1a1a] font-semibold font-sm'>
//                                     <span className ='text-sm text-emerald-700'>{item.pricePerQuantity}</span> 
//                                        x
//                                     <span className ='text-sm text-emerald-700'> {item.quantity}</span>
//                                         </p> 
//                                 {/* <form>
//                                     <input
//                                 type= 'Number'
//                                 name='quantity'
//                                 value= {item.quantity}
//                                 className ='text-[#1a1a1a]'
//                                 />
//                                 </form> */}
//                             </div>
    
//                             <div className ='mt-1 flex justify-between items-center'>
//                                 <div className ='flex items-center gap-3'>
//                                 <MdDelete className ='cursor-pointer text-[#be3e3f]' size={20 }
//                                 onClick ={() => handleRemove(item.id)}
//                                 />
//                             </div>
//                             <p className ='ml-0  text-[#1a1a1a] text-lg font-semibold'><span className ='text-xs font-normal text-emerald-700 shadow-lg'>AED </span> {item.price}</p>
//                         </div>
    
//                     </div>
//                     )
//                 })}
//             </div>

//         </div>
//     );
// };


// export default CartInfo ;