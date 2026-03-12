import React, {useEffect, useRef} from 'react'
import { MdDelete, MdShoppingCart } from 'react-icons/md';
import { FaShoppingBasket } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem } from '../../redux/slices/cartSlice';
//import { setExtra } from '../../redux/slices/extraSlice';

const ExtraCartInfo = () => {
    // recieve items from order
    const cartData = useSelector(state => state.cart);
    //const cartData = useSelector(state => state.extra);
    
    const scrolLRef = useRef();
    useEffect(() => {
        if (scrolLRef.current) {
            scrolLRef.current.scrollTo({
                top: scrolLRef.current.scrollHeight,
                behavior: "smooth"
            })
        }
    }, [cartData]);  // array on cardSlice

    // remove item
    const dispatch = useDispatch();
    const handleRemove = (itemId) => {
        dispatch(removeItem(itemId));
    };

    // Calculate totals
    const totalItems = cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalAmount = cartData.reduce((sum, item) => sum + (item.price || 0), 0);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <FaShoppingBasket className="text-green-600 text-lg" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Extra Services</h2>
                        <p className="text-xs text-gray-500">Items added to cart</p>
                    </div>
                </div>
                
                {/* Cart Counter Badge */}
                {cartData.length > 0 && (
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                        <MdShoppingCart className="text-green-600" size={16} />
                        <span className="text-xs font-medium text-green-700">{cartData.length} items</span>
                    </div>
                )}
            </div>

            {/* Cart Items Container */}
            <div className="mb-4">
                <div 
                    ref={scrolLRef}
                    className="overflow-y-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100 rounded-lg"
                    style={{ maxHeight: '250px' }}
                >
                    {cartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <div className="mb-3 p-3 bg-gray-100 rounded-full">
                                <FaShoppingBasket className="text-gray-400 text-2xl" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Your cart is empty</p>
                            <p className="text-xs text-gray-400 mt-1">Add services from the menu</p>
                        </div>
                    ) : (
                        <div className="space-y-3 pr-2">
                            {cartData.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="group bg-white border border-gray-200 rounded-xl p-3 hover:border-green-300 hover:shadow-sm transition-all duration-200"
                                >
                                    {/* Item Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-gray-800 text-sm truncate max-w-[150px]" title={item.name}>
                                            {item.name}
                                        </h3>
                                        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                            <span className="text-xs font-semibold text-green-700">{item.quantity}</span>
                                            <span className="text-xs text-gray-500">×</span>
                                            <span className="text-xs font-semibold text-green-700">{item.pricePerQuantity}</span>
                                        </div>
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="flex items-center gap-1.5 px-2 py-1 text-red-600 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 group/btn"
                                            title="Remove item"
                                        >
                                            <MdDelete className="text-current" size={16} />
                                            <span className="text-xs font-medium opacity-0 group-hover/btn:opacity-100 transition-opacity">Remove</span>
                                        </button>
                                        
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-gray-800">
                                                {item.price.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">AED</span>
                                        </div>
                                    </div>

                                    {/* Unit Price Indicator */}
                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-100 text-[10px] text-gray-400">
                                        Unit price: {item.pricePerQuantity} AED × {item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Footer - Only show if cart has items */}
            {cartData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Items:</span>
                        <span className="text-sm font-semibold text-gray-800">{totalItems} units</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="text-lg font-bold text-green-600">
                            {totalAmount.toFixed(2)} <span className="text-xs font-normal text-gray-500">AED</span>
                        </span>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={() => cartData.forEach(item => handleRemove(item.id))}
                            className="flex-1 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollbar Styles */}
            <style jsx>{`
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 8px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #86efac;
                    border-radius: 8px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #22c55e;
                }
            `}</style>
        </div>
    );
};

export default ExtraCartInfo;


// import React, {useEffect, useRef} from 'react'
// import { MdDelete } from 'react-icons/md';
// import { useDispatch, useSelector } from 'react-redux';
// import { removeItem } from '../../redux/slices/cartSlice';
// //import { setExtra } from '../../redux/slices/extraSlice';


// const ExtraCartInfo = () => {
//     // recieve items from order
    
//     const cartData = useSelector(state => state.cart);
//     //const cartData = useSelector(state => state.extra);
    
//     const scrolLRef = useRef();
//     useEffect(() => {
//         if (scrolLRef.current) {

//             scrolLRef.current.scrollTo({
//                 top: scrolLRef.current.scrollHeight,
//                 behavior: "smooth"
//             })
           
//         }
//     }, [cartData])  // array on cardSlice
    

//     // remove item
//     const dispatch = useDispatch();
//     const handleRemove = (itemId) => {
//     dispatch(removeItem(itemId))

//         //const _id = id;
//         //const Name = name;
//         //const Price = price;
//         //dispatch(setExtra({_id ,Name ,Price}));
//         //dispatch(setExtra([]));
//     }


//     return (

//         <div className='px-1 py-1 shadow-lg/30' >
//             <h1 className='px-4 text-xs underline text-[#1a1a1a] font-semibold shadow-xl'>Extra Services</h1>

//             <div className='mt-1 overflow-y-scroll scrollbar-hidden h-[165px]' ref={scrolLRef} >
//                 {cartData.length === 0 ? (
//                     <p className='text-xs text-red-700 font-semibold flex justify-center items-center h-[130px]'>Your add services cart is empty !</p>
//                     // recieve items from order
//                 ) : cartData.map((item) => {

//                     return (
//                         <div className='bg-white shadow-lg rounded-lg px-4 mb-2 mt-2 shadow-lg/30' >

//                             <div className='flex items-center justify-between py-0'>
//                                 <h1 className='text-emerald-600 font-semibold text-sm underline'>{item.name}</h1>
//                                 <p className=''>
//                                     <span className='font-semibold text-xs text-[#1a1a1a]'>{item.pricePerQuantity} </span>
//                                     <span className='text-xs font-normal text-emerald-600'>x </span>
//                                     <span className='font-semibold text-xs text-[#1a1a1a]'></span>{item.quantity}</p>

//                             </div>

//                             <div className='mt-1 flex justify-between items-center'>
//                                 <div className='flex items-center gap-3'>
//                                     <MdDelete className='cursor-pointer text-[#be3e3f] hover:text-lg shadow-lg' size={18}
//                                         onClick={() => handleRemove(item.id)}
//                                     />
//                                 </div>
//                                 <p className='ml-0  text-[#1a1a1a] text-md font-semibold'><span className='text-xs font-normal text-emerald-700'>AED </span> {item.price}</p>
//                             </div>

//                         </div>
//                     )
//                 })}
//             </div>

//         </div>

//     );
// };


// export default ExtraCartInfo;