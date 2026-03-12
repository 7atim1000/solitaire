import { useMutation } from '@tanstack/react-query';
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalPrice, removeAllItems } from '../../redux/slices/cartSlice';
import { addTransaction, extraOrder, updateCustomer, updateTotals } from '../../https';
import { toast } from 'react-toastify';
import { removeCustomer } from '../../redux/slices/customerSlice';
import ExtraInvoice from './ExtraInvoice';
import { FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaReceipt, FaShoppingBasket } from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';

const ExtraBill = () => {
    const dispatch = useDispatch();

    const customerData = useSelector(state => state.customer);
    const cartData = useSelector(state => state.cart);
    const orderData = useSelector(state => state.order);
    const total = useSelector(getTotalPrice);
    
    const taxRate = 0.00;
    
    const calculations = useMemo(() => {
        const tax = (total * taxRate) / 100;
        const totalPriceWithTax = total + tax;
        
        const previousTotal = orderData.billsTotal || 0;
        const previousTax = orderData.billsTax || 0;
        const previousTotalWithTax = orderData.billsTotalWithTax || 0;
        const previousPayed = orderData.billsPayed || 0;
        const previousBalance = orderData.billsBalance || 0;

        return {
            tax,
            totalPriceWithTax,
            extraTotal: total + previousTotal,
            extraTax: tax + previousTax,
            extraTotalWithTax: totalPriceWithTax + previousTotalWithTax,
            payedLast: previousPayed,
            balanceLast: previousBalance
        };
    }, [total, orderData]);

    const [payedAmount, setPayedAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState();

    const payedTotal = Number(payedAmount) + calculations.payedLast;
    const balanceNow = calculations.extraTotalWithTax - payedTotal;

    const extraMutation = useMutation({
        mutationFn: extraOrder,
        onSuccess: (resData) => {
            const { data } = resData.data;
            setOrderInfo(data);
            toast.success('Extra services added to invoice Successfully.');
        },
        onError: (error) => {
            console.error('Extra order error:', error);
            toast.error('Failed to add extra services');
        }
    });

    const totalUpdateMutation = useMutation({
        mutationFn: updateTotals,
        onSuccess: (resData) => {
            console.log('Update success:', resData);
            toast.success('Invoice totals updated');
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Update failed');
        }
    });

    const transactionMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: (resData) => {
            toast.success('The income was transferred to the finance department.');
        },
        onError: (error) => {
            console.error('Transaction error:', error);
        }
    });

    const customerUpdateMutation = useMutation({
        mutationFn: updateCustomer,
        onSuccess: (resData) => {
            toast.success('Customer balance updated successfully.');
        },
        onError: (error) => {
            console.error('Customer update error:', error);
        }
    });

    const handleUpdate = async (orderId) => {
        const totalData = {
            total: (calculations.extraTotal).toFixed(2),
            totalWithTax: (calculations.extraTotalWithTax).toFixed(2),
            payed: payedTotal.toFixed(2),
            balance: balanceNow.toFixed(2),
            tax: (calculations.extraTax).toFixed(2),
            orderId: orderId
        };

        await totalUpdateMutation.mutateAsync(totalData);
    };

    const handleExtraServices = async () => {
        // if (!paymentMethod) {
        //     toast.error('Please select a payment method');
        //     return;
        // }

        if (!cartData.length) {
            toast.error('No services selected');
            return;
        }

        try {
            const extraData = {
                cartData,
                orderId: orderData._id
            };

            await extraMutation.mutateAsync(extraData);
            await handleUpdate(orderData._id);

            if (payedAmount > 0) {
                const transactionData = {
                    transactionNumber: `${Date.now()}`,
                    amount: Number(payedAmount.toFixed(2)),
                    type: 'Income',
                    category: 'Services',
                    refrence: orderData.customerDetailsName || 'Unknown',
                    description: 'Extra services payment',
                    date: new Date().toISOString().slice(0, 10)
                };
                await transactionMutation.mutateAsync(transactionData);
            }

            const previousBalance = Number(customerData.balance) || 0;
            const numericNewBalance = previousBalance + Number(balanceNow);
            const formattedNewBalance = numericNewBalance.toFixed(2);

            const balanceData = {
                balance: formattedNewBalance,
                customerId: orderData.cstId
            };
            await customerUpdateMutation.mutateAsync(balanceData);

            setShowInvoice(true);
            dispatch(removeCustomer());
            dispatch(removeAllItems());
            setPaymentMethod('');
            setPayedAmount(0);

        } catch (error) {
            console.error('Error in handleExtraServices:', error);
            toast.error('Failed to process order. Please try again.');
        }
    };

    const handlePayedAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setPayedAmount(value === '' ? 0 : parseFloat(value));
        }
    };

    const handleClearAll = () => {
        setPayedAmount(0);
        setPaymentMethod('');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <div className="flex items-center gap-2">
                    <FaReceipt className="text-white text-lg" />
                    <h3 className="text-white font-semibold">Bill Summary</h3>
                </div>
            </div>

            <div className="p-5 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FaShoppingBasket className="text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Current Services</span>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            {cartData.length} items
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Services Total:</span>
                        <span className="text-lg font-bold text-green-600">
                            {total.toFixed(2)} <span className="text-xs font-normal text-gray-500">SD</span>
                        </span>
                    </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                        <FaReceipt className="text-green-600" />
                        Final Invoice Totals
                    </h4>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total (with tax):</span>
                            <span className="font-semibold text-gray-800">
                                {calculations.extraTotalWithTax.toFixed(2)} SD
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-green-200">
                            <span className="text-gray-600">Previous Paid:</span>
                            <span className="font-medium text-green-600">
                                {calculations.payedLast.toFixed(2)} SD
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Previous Balance:</span>
                            <span className="font-medium text-red-600">
                                {calculations.balanceLast.toFixed(2)} SD
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    {/* <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <MdPayment className="text-green-600" />
                        Payment Details
                    </h4> */}

                    {/* <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-1">Payment Amount</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-16"
                                name="payedAmount"
                                type="text"
                                placeholder="0.00"
                                value={payedAmount || ''}
                                onChange={handlePayedAmountChange}
                            />
                            <span className="absolute right-3 top-2 text-sm text-gray-500">SD</span>
                        </div>
                    </div> */}

                    {/* <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                paymentMethod === 'Cash' 
                                    ? 'bg-green-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setPaymentMethod('Cash')}
                        >
                            <FaMoneyBillWave size={16} />
                            <span>Cash</span>
                        </button>

                        <button
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                paymentMethod === 'Online' 
                                    ? 'bg-green-600 text-white shadow-md' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setPaymentMethod('Online')}
                        >
                            <FaCreditCard size={16} />
                            <span>Online</span>
                        </button>
                    </div> */}

                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Paid:</span>
                            <span className="font-semibold text-green-600">
                                {payedTotal.toFixed(2)} SD
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Remaining Balance:</span>
                            <span className={`font-semibold ${balanceNow > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {balanceNow.toFixed(2)} SD
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        onClick={handleExtraServices}
                        // disabled={!paymentMethod || cartData.length === 0}
                    >
                        <FaCheckCircle size={16} />
                        Confirm Services
                    </button>
                    
                    <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                        onClick={handleClearAll}
                    >
                        <FaTimesCircle size={16} />
                        Clear
                    </button>
                </div>

                {(extraMutation.isLoading || totalUpdateMutation.isLoading) && (
                    <div className="text-center py-2">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        <p className="text-xs text-gray-500 mt-1">Processing...</p>
                    </div>
                )}
            </div>

            {showInvoice && (
                <ExtraInvoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #86efac;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #22c55e;
                }
            `}</style>
        </div>
    );
};

export default ExtraBill;


// import { useMutation } from '@tanstack/react-query';
// import React, { useState, useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getTotalPrice, removeAllItems } from '../../redux/slices/cartSlice';
// import { addTransaction, extraOrder, updateCustomer, updateTotals } from '../../https';
// import { toast } from 'react-toastify';
// import { removeCustomer } from '../../redux/slices/customerSlice';
// import ExtraInvoice from './ExtraInvoice';

// const ExtraBill = () => {
//     const dispatch = useDispatch();

//     const customerData = useSelector(state => state.customer);
//     const cartData = useSelector(state => state.cart);
//     const orderData = useSelector(state => state.order);
//     const total = useSelector(getTotalPrice);
    
//     const taxRate = 0.00;
    
//     // Memoized calculations to prevent unnecessary recalculations
//     const calculations = useMemo(() => {
//         const tax = (total * taxRate) / 100;
//         const totalPriceWithTax = total + tax;
        
//         const previousTotal = orderData.billsTotal || 0;
//         const previousTax = orderData.billsTax || 0;
//         const previousTotalWithTax = orderData.billsTotalWithTax || 0;
//         const previousPayed = orderData.billsPayed || 0;
//         const previousBalance = orderData.billsBalance || 0;

//         return {
//             tax,
//             totalPriceWithTax,
//             extraTotal: total + previousTotal,
//             extraTax: tax + previousTax,
//             extraTotalWithTax: totalPriceWithTax + previousTotalWithTax,
//             payedLast: previousPayed,
//             balanceLast: previousBalance
//         };
//     }, [total, orderData]);

//     const [payedAmount, setPayedAmount] = useState(0);
//     const [paymentMethod, setPaymentMethod] = useState('');
//     const [showInvoice, setShowInvoice] = useState(false);
//     const [orderInfo, setOrderInfo] = useState();

//     // Calculate derived values
//     const payedTotal = Number(payedAmount) + calculations.payedLast;
//     const balanceNow = calculations.extraTotalWithTax - payedTotal;

//     const extraMutation = useMutation({
//         mutationFn: extraOrder,
//         onSuccess: (resData) => {
//             const { data } = resData.data;
//             setOrderInfo(data);
//             toast.success('Extra services added to invoice Successfully.');
//         },
//         onError: (error) => {
//             console.error('Extra order error:', error);
//             toast.error('Failed to add extra services');
//         }
//     });

//     const totalUpdateMutation = useMutation({
//         mutationFn: updateTotals,
//         onSuccess: (resData) => {
//             console.log('Update success:', resData);
//             toast.success('Invoice totals updated');
//         },
//         onError: (error) => {
//             console.error('Update error:', error);
//             toast.error(error.response?.data?.message || 'Update failed');
//         }
//     });

//     const transactionMutation = useMutation({
//         mutationFn: addTransaction,
//         onSuccess: (resData) => {
//             toast.success('The income was transferred to the finance department.');
//         },
//         onError: (error) => {
//             console.error('Transaction error:', error);
//         }
//     });

//     const customerUpdateMutation = useMutation({
//         mutationFn: updateCustomer,
//         onSuccess: (resData) => {
//             toast.success('Customer balance updated successfully.');
//         },
//         onError: (error) => {
//             console.error('Customer update error:', error);
//         }
//     });

//     const handleUpdate = async (orderId) => {
//         const totalData = {
//             total: (calculations.extraTotal).toFixed(2),
//             totalWithTax: (calculations.extraTotalWithTax).toFixed(2),
//             payed: payedTotal.toFixed(2),
//             balance: balanceNow.toFixed(2),
//             tax: (calculations.extraTax).toFixed(2),
//             orderId: orderId
//         };

//         await totalUpdateMutation.mutateAsync(totalData);
//     };

//     const handleExtraServices = async () => {
//         if (!paymentMethod) {
//             toast.error('Please select a payment method');
//             return;
//         }

//         if (!cartData.length) {
//             toast.error('No services selected');
//             return;
//         }

//         try {
//             // 1. Create extra order
//             const extraData = {
//                 cartData,
//                 orderId: orderData._id
//             };

//             const extraResult = await extraMutation.mutateAsync(extraData);
            
//             // 2. Update totals
//             await handleUpdate(orderData._id);

//             // 3. Add transaction if payment was made
//             if (payedAmount > 0) {
//                 const transactionData = {
//                     transactionNumber: `${Date.now()}`,
//                     amount: Number(payedAmount.toFixed(2)),
//                     type: 'Income',
//                     category: 'Services',
//                     refrence: orderData.customerDetailsName || 'Unknown',
//                     description: 'Extra services payment',
//                     date: new Date().toISOString().slice(0, 10)
//                 };
//                 await transactionMutation.mutateAsync(transactionData);
//             }

//             // 4. Update customer balance 
//             const previousBalance = Number(customerData.balance) || 0;
//             const numericNewBalance = previousBalance + Number(balanceNow); // Do math with numbers
//             const formattedNewBalance = numericNewBalance.toFixed(2); // Then format to 2 decimal places

//             const balanceData = {
//                 balance: formattedNewBalance,
//                 customerId: orderData.cstId
//             };
//             await customerUpdateMutation.mutateAsync(balanceData);

//             // 5. Reset UI and show invoice
//             setShowInvoice(true);
//             dispatch(removeCustomer());
//             dispatch(removeAllItems());
//             setPaymentMethod('');
//             setPayedAmount(0);

//         } catch (error) {
//             console.error('Error in handleExtraServices:', error);
//             toast.error('Failed to process order. Please try again.');
//         }
//     };

//     const handlePayedAmountChange = (e) => {
//         const value = e.target.value;
//         // Allow only numbers and decimal point
//         if (/^\d*\.?\d*$/.test(value)) {
//             setPayedAmount(value === '' ? 0 : parseFloat(value));
//         }
//     };

//     return (
//         <div className='overflow-y-scroll scrollbar-hidden h-[calc(100vh-5rem-5rem)] shadow-lg/30'>
//             {/* Current Services Section */}
//             <div className='flex items-center justify-between px-5 mt-2'>
//                 <p className='text-xs text-[#1f1f1f] font-normal'>Services: ({cartData.length})</p>
//                 <p className='text-[#1f1f1f] text-xs font-semibold'>
//                     <span className='text-xs font-normal text-emerald-600'>SD </span>
//                     {total.toFixed(2)}
//                 </p>
//             </div>
            
//             {/* <div className='flex items-center justify-between px-5 mt-2'>
//                 <p className='text-xs text-[#1f1f1f] font-normal'>Tax(5.25%)</p>
//                 <p className='text-[#1f1f1f] text-sm font-semibold'>
//                     <span className='text-xs font-normal text-emerald-600'>SD </span>
//                     {calculations.tax.toFixed(2)}
//                 </p>
//             </div>
//              */}
//             <div className='flex items-center justify-between px-5 mt-2'>
//                 <p className='text-xs text-[#1f1f1f] font-normal'>Services Total:</p>
//                 <p className='text-emerald-600 text-lg font-semibold'>
//                     <span className='text-xs font-normal text-[#1a1a1a]'>SD </span>
//                     {calculations.totalPriceWithTax.toFixed(2)}
//                 </p>
//             </div>

//             <hr className='border-white border-t-3 mt-1' />
            
//             {/* Combined Totals Section */}
//             <div className='bg-emerald-50 p-1 shadow-lg/30'>
//                 {/* <div className='flex items-center justify-between px-5 mt-2'>
//                     <p className='text-xs text-[#1f1f1f] font-normal'>Final Total:</p>
//                     <p className='text-[#1a1a1a] text-xs font-semibold'>
//                         <span className='text-xs font-normal text-emerald-700'>SD </span>
//                         {calculations.extraTotal.toFixed(2)}
//                     </p>
//                 </div>
                
//                 <div className='flex items-center justify-between px-5 mt-2'>
//                     <p className='text-xs text-[#1f1f1f] font-normal'>Total Tax(0.00%)</p>
//                     <p className='text-[#1a1a1a] text-sm font-semibold'>
//                         <span className='text-xs font-normal text-emerald-700'>SD </span>
//                         {calculations.extraTax.toFixed(2)}
//                     </p>
//                 </div> */}
                
//                 <div className='flex items-center justify-between px-5 mt-2'>
//                     <p className='text-xs text-[#1a1a1a] font-normal'>Total Final:</p>
//                     <p className='text-emerald-600 text-lg font-semibold'>
//                         <span className='text-xs font-normal text-[#1a1a1a]'>SD </span>
//                         {calculations.extraTotalWithTax.toFixed(2)}
//                     </p>
//                 </div>
                
//                 <div className='flex justify-between px-5 mt-2'>
//                     <div className='flex items-center gap-2'>
//                         <p className='text-xs text-[#1a1a1a] font-normal'>Last Payed:</p>
//                         <p className='text-emerald-600 text-sm font-semibold'>
//                             {calculations.payedLast.toFixed(2)}
//                         </p>
//                     </div>
                    
//                     <div className='flex items-center gap-2'>
//                         <p className='text-xs text-[#1a1a1a] font-normal'>Last Balance:</p>
//                         <p className='text-[#be3e3f] text-sm font-semibold'>
//                             {calculations.balanceLast.toFixed(2)}
//                         </p>
//                     </div>
                    
//                     <p className='font-normal text-sm underline'>SD</p>
//                 </div>
//             </div>

//             <hr className='border-white border-t-3 mt-1' />
            
//             {/* Payment Section */}
//             {/* <div className='flex bg-white items-center justify-between px-5 mt-2 shadow-lg/30 p-3 rounded-lg'>
//                 <p className='text-xs text-[#1a1a1a] font-normal'>Payed Now:</p>
                
//                 <input
//                     className='w-[50%] bg-emerald-50 rounded-sm p-1 text-emerald-600 text-md font-semibold shadow-lg/30 border-b-1 border-emerald-600'
//                     name='payedAmount'
//                     type='number'
//                     step='0.01'
//                     min='0'
//                     max={calculations.extraTotalWithTax}
//                     value={payedAmount}
//                     onChange={handlePayedAmountChange}
//                 />
                
//                 <span className='text-xs font-normal text-[#1a1a1a]'>AED</span>
//             </div> */}

//             <div className='flex items-center gap-5 p-1 justify-center'>
//                 <p className='text-xs text-[#1a1a1a] font-normal'>Total Payed:</p>
//                 <p className='text-emerald-700 text-sm font-semibold'>{payedTotal.toFixed(2)}</p>

//                 <p className='text-xs text-[#1a1a1a] font-normal'>Balance Now:</p>
//                 <p className='text-[#be3e3f] text-sm font-semibold'>{balanceNow.toFixed(2)}</p>

//                 <span className='text-xs font-normal text-[#1a1a1a]'>AED</span>
//             </div>

//             {/* Payment Method Buttons */}
//             {/* <div className='flex items-center gap-3 px-5 py-2 mt-1'>
//                 <button
//                     className={`px-4 py-1 w-full rounded-lg font-semibold cursor-pointer shadow-lg/30 ${
//                         paymentMethod === 'Cash' 
//                             ? "bg-emerald-600 text-white" 
//                             : "bg-white text-emerald-600"
//                     }`}
//                     onClick={() => setPaymentMethod('Cash')}
//                 >
//                     Cash
//                 </button>

//                 <button
//                     className={`px-4 py-1 w-full rounded-lg font-semibold cursor-pointer shadow-lg/30 ${
//                         paymentMethod === 'Online' 
//                             ? "bg-emerald-600 text-white" 
//                             : "bg-white text-emerald-600"
//                     }`}
//                     onClick={() => setPaymentMethod('Online')}
//                 >
//                     Online
//                 </button>
//             </div> */}
            
//             {/* Action Buttons */}
//             <div className='flex items-center gap-3 px-5 py-1'>
            
//                 <button
//                     className='shadow-lg/30 bg-emerald-600 px-4 py-1 w-full rounded-sm cursor-pointer font-semibold text-white'
//                     onClick={handleExtraServices}
//                     disabled={!paymentMethod || cartData.length === 0}
//                 >
//                     Confirm Services
//                 </button>
//                 <button className='shadow-lg/30 bg-[#f6b100] px-4 py-1 w-full rounded-sm cursor-pointer font-semibold text-[#1a1a1a]'>
//                     Cancel
//                 </button>

//             </div>
            
//             {showInvoice && (
//                 <ExtraInvoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
//             )}
//         </div>
//     );
// };

// export default ExtraBill;