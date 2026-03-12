import React, { useState, useMemo } from 'react'
import { addOrder, addTransaction, updateCustomer, updateRoom } from '../../https';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalPrice } from '../../redux/slices/cartSlice';
import { removeAllItems } from '../../redux/slices/cartSlice';
import { removeCustomer } from '../../redux/slices/customerSlice';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Invoice from '../invoice/Invoice'
import { removeRoom } from '../../redux/slices/roomSlice';
import { FaCalculator, FaMoneyBillWave, FaCreditCard, FaPrint, FaCheckCircle, FaReceipt, FaPercentage } from 'react-icons/fa';

const Bill = () => {
    const dispatch = useDispatch();
    
    const customerData = useSelector((state) => state.customer);
    const roomData = useSelector((state) => state.room);
    const userData = useSelector((state) => state.user);
    const cartData = useSelector(state => state.cart);

    const total = useSelector(getTotalPrice);
    const taxRate = 5.25; // Changed from 0 to 5.25% as per your text

    const calculations = useMemo(() => {
        const tax = (total * taxRate) / 100;
        const totalPriceWithTax = total + tax;
        return { tax, totalPriceWithTax };
    }, [total, taxRate]);

    // Payed account 
    const [payedAmount, setPayedAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState();

    const balance = (calculations.totalPriceWithTax - Number(payedAmount)).toFixed(2);

    const showPayed = () => {
        setPayedAmount(calculations.totalPriceWithTax.toFixed(2));
    }

    const cashPaymethod = () => {
        setPaymentMethod('Cash');
        showPayed();
    }

    const onlinePaymethod = () => {
        setPaymentMethod('Online');
        showPayed();
    }

    // Get booking data from first cart item
    const firstItem = cartData[0] || {};
    const dateBooking = firstItem.dateBooking || "";
    const dateReturn = firstItem.dateReturn || "";
    const bookingDays = Number(firstItem.bookingDays || firstItem.qty || 0);

    const handlePayedAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            const numericValue = value === '' ? 0 : parseFloat(value);
            setPayedAmount(numericValue > calculations.totalPriceWithTax
                ? calculations.totalPriceWithTax
                : numericValue
            );
        }
    };

    // Press placeOrder
    const handlePlaceOrder = async () => {
        if (!customerData.customerName) {
            toast.warning('Please select customer!');
            return;
        };
        if (!paymentMethod) {
            toast.warning('Please select a payment method!');
            return;
        };
        
        if (cartData.length === 0) {
            toast.warning('Please add items to cart!');
            return;
        };

        if (paymentMethod === "Cash" || paymentMethod === 'Online') {
            const orderData = {
                customerDetails: {
                    name: customerData.customerName,
                    email: customerData.email,
                    phone: customerData.contactNo,
                    guests: customerData.guests,
                    Idnumber: customerData.Idnumber,
                },
                orderStatus: "In Progress",
                orderType: 'Invoice',
                bills: {
                    total: total.toFixed(2),
                    tax: (calculations.tax).toFixed(2),
                    totalWithTax: (calculations.totalPriceWithTax).toFixed(2),
                    payed: Number(payedAmount).toFixed(2),
                    balance: balance,
                },
                items: cartData,
                room: roomData._id,
                customer: customerData.customerId,
                guests: customerData.guests,
                paymentMethod: paymentMethod,
                dateBooking,
                dateReturn,
                bookingDays,
                user: userData._id,
                orderNo: customerData.orderId,
            };

            setTimeout(() => {
                orderMutation.mutate(orderData);
            }, 1500);
        }
    };

    // Order Mutation
    const orderMutation = useMutation({ 
        mutationFn: (reqData) => addOrder(reqData),
        onSuccess: (resData) => {
            const { data } = resData.data;
            setOrderInfo(data);
            toast.success('Sale Invoice Placed and Confirmed Successfully.');
            
            // Update room 
            const roomData = {
                status: "Booked",
                bookedBy: customerData.customerName,
                dateBooking: dateBooking,
                dateReturn: dateReturn,
                orderId: data._id,
                guests: data.customerDetails.guests,
                roomId: data.room
            }

            setTimeout(() => {
                roomUpdateMutation.mutate(roomData)
            }, 1500);

            // Add transaction
            const transactionData = {
                transactionNumber: `${Date.now()}`,
                amount: Number(payedAmount).toFixed(2),
                type: 'Income',
                category: 'Reservation',
                refrence: customerData.customerName,
                description: '-',
                user: userData._id,
                date: new Date().toISOString().slice(0, 10)
            }
            
            setTimeout(() => {
                transactionMutation.mutate(transactionData)
            }, 1500);

            // Update customer balance
            const previousBalance = Number(customerData.balance) || 0;
            const numericNewBalance = previousBalance + Number(balance);
            const formattedNewBalance = numericNewBalance.toFixed(2);

            const balanceData = {
                balance: formattedNewBalance,
                customerId: data.customer
            }

            setTimeout(() => {
                customerUpdateMutation.mutate(balanceData)
            }, 1500);

            setShowInvoice(true);
            
            // Clear states
            dispatch(removeCustomer());
            dispatch(removeAllItems());
            dispatch(removeRoom());
            setPaymentMethod('');
            setPayedAmount(0);
        },
        onError: (error) => {
            console.log(error);
            toast.error('Failed to place order. Please try again.');
        }
    });

    const roomUpdateMutation = useMutation({
        mutationFn: (reqData) => updateRoom(reqData),
        onError: (error) => {
            console.log(error)
        }
    });

    const transactionMutation = useMutation({
        mutationFn: (reqData) => addTransaction(reqData),
        onSuccess: () => {
            toast.success('The income was transferred to the finance department.');
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const customerUpdateMutation = useMutation({
        mutationFn: (reqData) => updateCustomer(reqData),
        onError: (error) => {
            console.log(error)
        }
    });

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-lg">
                        <FaCalculator className="text-emerald-600" size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-emerald-800">Payment Summary</h2>
                        <p className="text-sm text-emerald-600">Complete your booking payment</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-emerald-600">Items</p>
                    <p className="text-lg font-bold text-emerald-800">{cartData.length}</p>
                </div>
            </div>

            {/* Bill Breakdown */}
            <div className="space-y-4 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-md border border-emerald-100">
                            <span className="text-sm font-medium text-emerald-700">Subtotal</span>
                        </div>
                        <span className="text-sm text-emerald-600">
                            ({cartData.length} {cartData.length === 1 ? 'item' : 'items'})
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-emerald-800">
                            {total.toFixed(2)} <span className="text-sm text-emerald-600">SD</span>
                        </p>
                    </div>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-md border border-emerald-100">
                            <FaPercentage className="text-emerald-600" size={14} />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-emerald-700">Tax</span>
                            <span className="text-xs text-emerald-500 ml-2">({taxRate}%)</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold text-emerald-800">
                            {calculations.tax.toFixed(2)} <span className="text-sm text-emerald-600">SD</span>
                        </p>
                    </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2.5 rounded-lg">
                            <FaReceipt className="text-emerald-600" size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-700">Grand Total</p>
                            <p className="text-xs text-emerald-500">Including all charges</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl md:text-3xl font-bold text-emerald-800">
                            {calculations.totalPriceWithTax.toFixed(2)} <span className="text-lg text-emerald-600">SD</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Amount */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-6 border border-emerald-200">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-emerald-600" size={18} />
                        <span className="text-sm font-semibold text-emerald-700">Payment Amount</span>
                    </div>
                    <button
                        onClick={() => setPayedAmount(calculations.totalPriceWithTax)}
                        className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Pay Full Amount
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Amount Paid Input */}
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                        <label className="block text-xs text-emerald-600 mb-2">Amount Paid (SD)</label>
                        <div className="relative">
                            <input
                                name="payedAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                max={calculations.totalPriceWithTax}
                                value={payedAmount}
                                onChange={handlePayedAmountChange}
                                className="w-full p-3 pl-10 text-2xl font-bold text-emerald-800 bg-emerald-50 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                            />
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-bold">SD</span>
                        </div>
                        <div className="text-xs text-emerald-500 mt-2">
                            Max: {calculations.totalPriceWithTax.toFixed(2)} SD
                        </div>
                    </div>

                    {/* Balance Display */}
                    <div className={`p-3 rounded-lg border-2 ${Number(balance) > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <label className="block text-xs text-emerald-600 mb-2">Balance Due (SD)</label>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-2xl font-bold ${Number(balance) > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                    {Math.abs(Number(balance)).toFixed(2)}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    {Number(balance) > 0 ? 'Amount to collect' : 'Fully paid'}
                                </p>
                            </div>
                            {Number(balance) <= 0 && (
                                <FaCheckCircle className="text-emerald-500" size={24} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-emerald-700 mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={cashPaymethod}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                            paymentMethod === 'Cash' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 transform scale-[1.02]' 
                            : 'border-emerald-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50'
                        }`}
                    >
                        <FaMoneyBillWave size={24} />
                        <span className="font-semibold">Cash</span>
                        <span className="text-xs text-emerald-600">Pay with cash</span>
                    </button>
                    
                    <button
                        onClick={onlinePaymethod}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                            paymentMethod === 'Online' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 transform scale-[1.02]' 
                            : 'border-emerald-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50'
                        }`}
                    >
                        <FaCreditCard size={24} />
                        <span className="font-semibold">Online</span>
                        <span className="text-xs text-emerald-600">Card/Transfer</span>
                    </button>
                </div>
                
                {paymentMethod && (
                    <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">
                                Selected: {paymentMethod} Payment
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                    <FaPrint />
                    <span>Print Receipt</span>
                </button>
                
                <button
                    onClick={handlePlaceOrder}
                    disabled={cartData.length === 0 || !customerData.customerName || !paymentMethod}
                    className={`group font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                        cartData.length === 0 || !customerData.customerName || !paymentMethod
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                    }`}
                >
                    <FaCheckCircle />
                    <span>Place Order</span>
                </button>
            </div>

            {/* Order Summary - Optional */}
            {cartData.length > 0 && (
                <div className="mt-6 pt-6 border-t border-emerald-100">
                    <h4 className="text-sm font-semibold text-emerald-700 mb-3">Order Summary</h4>
                    <div className="space-y-2">
                        {cartData.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-emerald-800 truncate max-w-[60%]">
                                    {item.name} ({item.quantity} nights)
                                </span>
                                <span className="font-medium text-emerald-700">
                                    {item.price.toFixed(2)} SD
                                </span>
                            </div>
                        ))}
                        {cartData.length > 2 && (
                            <div className="text-xs text-emerald-600 text-center">
                                +{cartData.length - 2} more items
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            {showInvoice && (
                <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
            )}
        </div>
    );
};

export default Bill;


// import React, { useState, useMemo } from 'react'

// import { addOrder, addTransaction, updateCustomer, updateRoom } from '../../https';

// import { useDispatch, useSelector } from 'react-redux';

// import { getTotalPrice } from '../../redux/slices/cartSlice';
// import { removeAllItems } from '../../redux/slices/cartSlice';
// import { removeCustomer } from '../../redux/slices/customerSlice';
// import { useMutation } from '@tanstack/react-query';

// import { enqueueSnackbar } from 'notistack';
// import { toast } from 'react-toastify';
// import Invoice from '../invoice/Invoice'
// import { removeRoom } from '../../redux/slices/roomSlice';

// const Bill = () => {
    
//     const dispatch = useDispatch();
    
//     const customerData = useSelector((state) => state.customer);
//     const roomData = useSelector((state)=> state.room);
//     const userData = useSelector((state) => state.user);
//     const cartData = useSelector(state => state.cart);

//     const total = useSelector(getTotalPrice);
//     const taxRate = 0;

//     const calculations = useMemo(() => {
//         const tax = (total * taxRate) / 100;
//         const totalPriceWithTax = total + tax;
//         return { tax, totalPriceWithTax };
//     }, [total]);

//     // Payed account 
//     const [payedAmount, setPayedAmount] = useState(0);
//     const [paymentMethod, setPaymentMethod] = useState('');
//     const [showInvoice, setShowInvoice] = useState(false);
//     const [orderInfo, setOrderInfo] = useState();

  

//     // const balance = (totalPriceWithTax.toFixed(2)) - payedAmount;
//     const balance = (calculations.totalPriceWithTax - Number(payedAmount)).toFixed(2);

//      const showPayed = () => {
//         setPayedAmount(calculations.totalPriceWithTax.toFixed(2));
//     }

//     const cashPaymethod = () => {
//         setPaymentMethod('Cash');
//         showPayed();
//     }

//     const onlinePaymethod = () => {
//         setPaymentMethod('Online');
//         showPayed();
//     }

//     // Get booking data from first cart item
//     const firstItem = cartData[0] || {};
   
//     const dateBooking = firstItem.dateBooking || "";
//     const dateReturn = firstItem.dateReturn || "";
//     const bookingDays = Number(firstItem.bookingDays || firstItem.qty || 0);

//     const handlePayedAmountChange = (e) => {
//         const value = e.target.value;
//         if (/^\d*\.?\d*$/.test(value)) {
//             const numericValue = value === '' ? 0 : parseFloat(value);
//             setPayedAmount(numericValue > calculations.totalPriceWithTax
//                 ? calculations.totalPriceWithTax
//                 : numericValue
//             );
//         }
//     };



//     // Press placeOrder
//         const handlePlaceOrder = async () => {
            
//             if (!customerData.customerName) {
//                 toast.warning('Please select customer !')
//                 return;
//             };
//             if (!paymentMethod){
//             enqueueSnackbar('please select a payment method', {variant: "warning"});
//               return;
//             };
         
//             if (paymentMethod === "Cash" || paymentMethod === 'Online') {
    
//                 const orderData = {
//                 // to save customer
//                 customerDetails: {
//                 name : customerData.customerName,
//                 email : customerData.email,
//                 phone : customerData.contactNo,
//                 guests : customerData.guests,
//                 Idnumber: customerData.Idnumber,

//                 },
//                 // to save Status
//                 orderStatus : "In Progress",
//                 orderType: 'Invoice',
                
//                 // to save TOTALS   || NEEDED
//                 bills: {
//                     total : total.toFixed(2),
//                     tax : (calculations.tax).toFixed(2) ,
//                     totalWithTax : (calculations.totalPriceWithTax).toFixed(2) ,

//                     payed: Number(payedAmount).toFixed(2),
//                     balance : balance,
//                 },
    
//                 // to save New Items || NEEDED
//                 items: cartData,
    
//                 room: roomData._id,
//                 customer : customerData.customerId ,
//                 guests:  customerData.guests,

//                 paymentMethod: paymentMethod,

//                 dateBooking,
//                 dateReturn,
//                 bookingDays,

//                 user: userData._id,
//                 orderNo : customerData.orderId,

//                 };
    
//                setTimeout(() => {
//                 orderMutation.mutate(orderData);
//                 }, 1500);
    
//             }
    
//          }

//     // order Mutation consist update table 
//     const orderMutation = useMutation ({ 
    
//         mutationFn: (reqData) => addOrder(reqData),
              
//         onSuccess: (resData) => {
            
//             const { data } = resData.data; // data comes from backend ... resData default on mutation
//             console.log(data);
                   
//             setOrderInfo(data)  // to show details in report 
                   
//             // enqueueSnackbar('Order Placed!', {
//             // variant: "success"
//             // });
//             toast.success('Sale Invoice Placed and Confirmed Successfully .') ;
            
    
//             // Update room 
//             const roomData = {          // roomData added in http file
//                 status: "Booked",
//                 bookedBy: customerData.customerName,
//                 dateBooking: dateBooking,
//                 dateReturn: dateReturn,

//                 orderId: data._id ,      // data from backend
//                 guests: data.customerDetails.guests ,
//                 roomId: data.room     // data from backend
                
//             }

//             setTimeout(() => {
//                 roomUpdateMutation.mutate(roomData)
//             }, 1500);

           
//             const transactionData = {
//                 transactionNumber: `${Date.now()}`,

//                 amount: Number(payedAmount).toFixed(2),
//                 type: 'Income',
//                 category: 'Reservation',
//                 refrence: customerData.customerName,
//                 description: '-',  user: userData._id,
//                 date: new Date().toISOString().slice(0, 10)
//             }
//             setTimeout(() => {
//                 transactionMutation.mutate(transactionData)
//             }, 1500);


//             // Update customer 
//             const previousBalance = Number(customerData.balance) || 0;
//             const numericNewBalance = previousBalance + Number(balance); // Do math with numbers
//             const formattedNewBalance = numericNewBalance.toFixed(2); // Then format to 2 decimal places

//             const balanceData = {
//                 // balance: balance + (customerData.balance),
//                 // balance: (Number(customerData.balance || 0) + Number(balance)).toFixed(2)
//                 balance: formattedNewBalance, // This will be a string like "125.50"
//                 customerId: data.customer
//             }

//             setTimeout(() => {
//                 customerUpdateMutation.mutate(balanceData)
//             }, 1500);

    
//             setShowInvoice(true); // to open report 
    
//             dispatch(removeCustomer());
//             dispatch(removeAllItems());
//             dispatch(removeRoom());
//             setPaymentMethod('');

//             setPayedAmount(0);
//         },
                   
                
//         onError: (error) => {
//             console.log(error);
//         }
//     });


//     const roomUpdateMutation = useMutation({

//         mutationFn: (reqData) => updateRoom(reqData),
//         onSuccess: (resData) => {

//             console.log(resData);

//         },
//         onError: (error) => {
//             console.log(error)
//         }
//     });



//     const transactionMutation = useMutation({
//         mutationFn: (reqData) => addTransaction(reqData),

//         onSuccess: (resData) => {

//             const { data } = resData.data; // data comes from backend ... resData default on mutation     
//             toast.success('The income was transfered to the finance department .');
//         },
//         onError: (error) => {
//             console.log(error);
//         }
//     });



//     // update Customer
//     const customerUpdateMutation = useMutation({

//         mutationFn: (reqData) => updateCustomer(reqData),
//         onSuccess: (resData) => {

//             console.log(resData);

//         },
//         onError: (error) => {
//             console.log(error)
//         }
//     });




//     return (
//         <>
//             <div className ='flex items-center justify-between px-5 mt-2'>
//                 <p className ='text-xs text-[#1f1f1f] font-medium mt-2'>Services : ({cartData.length})</p>
//                 <p className ='ml-0  text-[#1f1f1f] text-sm font-semibold'>
//                     <span className ='text-xs font-normal text-emerald-700'>AED </span>
//                     {total.toFixed(2)}
//                 </p>
//             </div>

//             <div className ='flex items-center justify-between px-5 mt-2'>
//                 <p className ='text-xs text-[#1f1f1f] font-medium mt-2'>Tax(5.25%)</p>
//                 <p className ='ml-0  text-[#1f1f1f] text-sm font-semibold'>
//                     <span className ='text-xs font-normal text-emerald-700'>AED </span>
//                      {calculations.tax.toFixed(2)}
//                 </p>
//             </div>

//             <div className ='flex items-center justify-between px-5 mt-2'>
//                 <p className ='text-xs text-[#1f1f1f] font-medium mt-2'>Grand Total :</p>
//                 <p className ='ml-0  text-emerald-700 text-xl font-semibold'>
//                     <span className ='text-xs font-normal text-[#1a1a1a]'>AED </span>
//                     {calculations.totalPriceWithTax.toFixed(2)}
//                 </p>
//             </div>


//             <div className='flex bg-white border-t-3 border-emerald-600 items-center justify-between px-5 mt-5 shadow-lg/30 p-5 rounded-lg'>

//                 <div className='flex gap-1 items-center justify-between'>
//                     <p className='text-xs text-[#1a1a1a] font-medium mt-2'>Payed :</p>

//                     <input 
//                         // name='payedAmount'
//                         // type='text'
//                         // // value={Number(payedAmount).toFixed(2)}
//                         // value ={payedAmount}
//                         // onChange={(e) => Number(setPayedAmount(e.target.value))}
//                         className='w-25 bg-emerald-50 rounded-lg p-1 text-emerald-700 text-xl font-semibold'
//                         name='payedAmount'
//                         type='number'
//                         step='0.01'
//                         min='0'
//                         max={calculations.totalPriceWithTax}
//                         value={payedAmount}
//                         onChange={handlePayedAmountChange}
//                     />
//                     <span className='text-xs font-normal text-[#1a1a1a] mt-3'>AED</span>
//                 </div>

//                 <p className='text-xs text-[#1a1a1a] font-medium mt-2'>Balance :</p>
//                 <p className='ml-0  text-[#be3e3f]'><span className='text-2xl font-semibold'>
//                     {Number(balance).toFixed(2)}</span><span className='text-xs font-normal text-[#1a1a1a]'> AED</span></p>

//             </div>




//             {/*bg-[#383737] */}
//             <div className ='flex items-center gap-3 px-5 py-2 mt-4'>
//                 <button  className ={`px-4 py-2 w-full rounded-lg text-[#f5f5f5] font-semibold cursor-pointer shadow-lg/30
//                 ${paymentMethod === 'Cash' ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"}`} 
//                 onClick ={cashPaymethod}
//                 >Cash</button>
          
//                 <button  className ={`px-4 py-2 w-full rounded-lg text-[#f5f5f5] font-semibold cursor-pointer shadow-lg/30
//                 ${paymentMethod === 'Online' ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"}`} 
//                 onClick ={onlinePaymethod}
//                 >Online</button>
//             </div>

//             <div className ='flex items-center gap-3 px-5 mt-2'>
                
//                 <button className ='bg-sky-600 px-4 py-2 w-full rounded-lg text-[#1a1a1a] cursor-pointer font-semibold text-[#f5f5f5]'>
//                     Print Receipt
//                 </button>
//                 <button className ='bg-emerald-600 px-4 py-2 w-full rounded-lg text-white cursor-pointer font-semibold'
//                     onClick ={handlePlaceOrder}
//                     >
//                     Place Order
//                 </button>

//             </div>
        
//             {showInvoice && (
//                 <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
//              )}

//         </ >    
//     );
// };

// export default Bill ;