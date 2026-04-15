import React, { useState, useMemo, useRef, useEffect } from 'react'
import { addOrder, addTransaction, updateCustomer, updateRoom, updateCompany } from '../../https';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalPrice } from '../../redux/slices/cartSlice';
import { removeAllItems } from '../../redux/slices/cartSlice';
import { removeCustomer } from '../../redux/slices/customerSlice';
import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { toast } from 'react-toastify';
import Invoice from '../invoice/Invoice'
import { removeRoom } from '../../redux/slices/roomSlice';
import { 
    FaCalculator, 
    FaMoneyBillWave, 
    FaCreditCard, 
    FaPrint, 
    FaCheckCircle, 
    FaReceipt, 
    FaPercentage,
    FaShoppingCart
} from 'react-icons/fa';
import { BsCashCoin } from 'react-icons/bs';

const Bills = () => {
    const isMounted = useRef(true);
    const dispatch = useDispatch();

    const customerData = useSelector((state) => state.customer);
    const roomData = useSelector((state) => state.room);
    const userData = useSelector((state) => state.user);
    const cartData = useSelector(state => state.cart);

    const total = useSelector(getTotalPrice);
    const taxRate = 0.00;
    
    const calculations = useMemo(() => {
        const tax = (total * taxRate) / 100;
        const totalPriceWithTax = total + tax;
        return { tax, totalPriceWithTax };
    }, [total]);

    const [payedAmount, setPayedAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    //Add a state for input disabled
    const [isInputDisabled, setIsInputDisabled] = useState(true);

    const balance = calculations.totalPriceWithTax - Number(payedAmount);

    const firstItem = cartData[0] || {};
    const dateBooking = firstItem.dateBooking || "";
    const dateReturn = firstItem.dateReturn || "";
    const bookingDays = Number(firstItem.bookingDays || firstItem.qty || 0);

    // Helper function to check if customer is corporate
    const isCorporateCustomer = () => {
        return customerData.companies === true;
    };

    const showPayed = () => {
        setPayedAmount(calculations.totalPriceWithTax.toFixed(2));
    }

    const cashPaymethod = () => {
        setPaymentMethod('Cash');
        showPayed();
        setIsInputDisabled(false); 
    }

    const onlinePaymethod = () => {
        setPaymentMethod('Online');
        showPayed();
        setIsInputDisabled(false); 
    }

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

    const orderMutation = useMutation({
        mutationFn: addOrder,
        onSuccess: (resData) => {
            const orderDataFromServer = resData.data;
            
            // Format the data properly for Invoice component
            const formattedOrderInfo = {
                _id: orderDataFromServer._id,
                orderNo: orderDataFromServer.orderNo || customerData.orderId,
                orderStatus: orderDataFromServer.orderStatus || "In Progress",
                orderType: orderDataFromServer.orderType || "Invoice",
                paymentMethod: orderDataFromServer.paymentMethod || paymentMethod,
                dateBooking: orderDataFromServer.dateBooking || dateBooking,
                dateReturn: orderDataFromServer.dateReturn || dateReturn,
                bookingDays: orderDataFromServer.bookingDays || bookingDays,
            
                customerDetails: {
                    name: orderDataFromServer.customerDetails?.name || customerData.customerName,
                    phone: orderDataFromServer.customerDetails?.phone || customerData.contactNo,
                    guests: orderDataFromServer.customerDetails?.guests || customerData.guests,
                    Idnumber: orderDataFromServer.customerDetails?.Idnumber || customerData.Idnumber,
                    email: orderDataFromServer.customerDetails?.email || customerData.email,
                },
                
                bills: {
                    total: orderDataFromServer.bills?.total || calculations.totalPriceWithTax,
                    tax: orderDataFromServer.bills?.tax || calculations.tax,
                    totalWithTax: orderDataFromServer.bills?.totalWithTax || calculations.totalPriceWithTax,
                    payed: orderDataFromServer.bills?.payed || Number(payedAmount),
                    balance: orderDataFromServer.bills?.balance || balance,
                },
                
                items: orderDataFromServer.items || cartData.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    pricePerQuantity: item.pricePerQuantity,
                    priceType: item.priceType || 'priceOne',
                    seats: item.seats,
                    dateBooking: item.dateBooking,
                    dateReturn: item.dateReturn,
                    bookingDays: item.bookingDays,
                }))
            };
            
            setOrderInfo(formattedOrderInfo);
            toast.success('Reservation Confirmed Successfully.');
            return orderDataFromServer;
        },
        onError: (error) => {
            console.error('Order error:', error);
            toast.error('Failed to place order');
            throw error;
        }
    });

    const roomUpdateMutation = useMutation({
        mutationFn: updateRoom,
        onSuccess: (resData) => {
            console.log('Room updated successfully:', resData);
        },
        onError: (error) => {
            console.error('Room update error:', error);
            toast.error('Room update failed');
            throw error;
        }
    });

    const transactionMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: (resData) => {
            toast.success('The income was transferred to the finance department.');
        },
        onError: (error) => {
            console.error('Transaction error:', error);
            throw error;
        }
    });

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    ////////////////////////////////////////////////
    const customerUpdateMutation = useMutation({
        mutationFn: updateCustomer,
        onSuccess: (resData) => {
            if (!isMounted.current) return;
            console.log('Customer balance updated successfully:', resData);
            toast.success('Customer balance updated successfully');
        },
        onError: (error) => {
            if (!isMounted.current) return;
            console.error('Customer update error - Full error:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error message:', error.message);
            
            // More detailed error message
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer balance';
            toast.error(`Customer balance update failed: ${errorMessage}`);
            throw error;
        }
    });

    const companyUpdateMutation = useMutation({
        mutationFn: updateCompany,
        onSuccess: (resData) => {
            if (!isMounted.current) return;
            console.log('Company balance updated successfully:', resData);
            toast.success('Company balance updated successfully');
        },
        onError: (error) => {
            if (!isMounted.current) return;
            console.error('Company update error:', error);
            console.error('Error response data:', error.response?.data);
            toast.error(`Company balance update failed: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    });

    /////////////////////////////////////////////////////////
    const handlePlaceOrder = async () => {
    if (!customerData.customerName) {
        toast.warning('Please select customer!');
        return;
    }

    if (!paymentMethod) {
        enqueueSnackbar('Please select a payment method', { variant: "warning" });
        return;
    }

    if (cartData.length === 0) {
        toast.warning('Please add services to the cart!');
        return;
    }

    if (!roomData?._id) {
        toast.warning('Please select a room!');
        return;
    }

    try {
        setIsProcessing(true);
    
        // Prepare cart items with proper structure
        const formattedCartItems = cartData.map(item => ({
            id: item.id,
            name: item.name,
            pricePerQuantity: item.pricePerQuantity,
            quantity: item.quantity,
            qty: item.qty,
            price: item.price,
            dateBooking: item.dateBooking,
            dateReturn: item.dateReturn,
            bookingDays: item.bookingDays,
            seats: item.seats,
            priceType: item.priceType || 'priceOne',
            floor: item.floor,
            image: item.image
        }));

        const orderData = {
            customerDetails: {
                name: customerData.customerName,
                email: customerData.email,
                phone: customerData.contactNo,
                guests: customerData.guests,
                Idnumber: customerData.Idnumber,
            },
            orderStatus: "In Progress",
            bills: {
                total: calculations.totalPriceWithTax,
                tax: calculations.tax,
                totalWithTax: calculations.totalPriceWithTax,
                payed: Number(payedAmount),
                balance: balance,
            },
            items: formattedCartItems,
            room: roomData._id,
            customer: customerData.customerId,
            // Fix: Send null for company if it's not a corporate customer
            company: isCorporateCustomer() && customerData.companyId ? customerData.companyId : null,
            companyName: isCorporateCustomer() ? customerData.company : null,
            guests: customerData.guests,
            paymentMethod: paymentMethod,
            dateBooking,
            dateReturn,
            bookingDays,
            user: userData._id,
            orderNo: customerData.orderId,
            orderType: "Invoice",
        };

        console.log('Order Data:', orderData);

        // 1. Create order
        const orderDataFromServer = await orderMutation.mutateAsync(orderData);
        console.log('Order created:', orderDataFromServer);

        // 2. Update room
        const roomUpdatePayload = {
            roomId: roomData._id,
            status: "booked",
            bookedBy: customerData.customerName,
            dateBooking: dateBooking,
            dateReturn: dateReturn,
            orderId: orderDataFromServer._id,
            guests: orderDataFromServer.customerDetails?.guests || customerData.guests
        };

        await roomUpdateMutation.mutateAsync(roomUpdatePayload);
        console.log('Room updated successfully');

        // 3. Add transaction if payment was made
        if (payedAmount > 0) {
            const transactionData = {
                transactionNumber: `${Date.now()}`,
                amount: Number(payedAmount),
                type: 'Income',
                category: 'Reservation',
                refrence: customerData.customerName,
                description: 'Room reservation payment',
                date: new Date().toISOString().slice(0, 10)
            };
            await transactionMutation.mutateAsync(transactionData);
            console.log('Transaction added successfully');
        }

        // 4 & 5. Update balance based on customer type
        if (isCorporateCustomer()) {
            console.log('Updating COMPANY balance for corporate customer');
            console.log('Company ID:', customerData.companyId);
            console.log('Current company balance:', customerData.companyBalance);
            console.log('Balance to add:', balance);
            
            // Validate companyId exists
            if (!customerData.companyId) {
                throw new Error('Company ID is missing. Please reselect the corporate customer.');
            }
            
            // For corporate customers - Update COMPANY balance
            const previousCompanyBalance = Number(customerData.companyBalance) || 0;
            const newCompanyBalance = Number((previousCompanyBalance + Number(balance)).toFixed(2));

            const companyUpdatePayload = {
                companyId: customerData.companyId,
                balance: newCompanyBalance
            };

            console.log('Company update payload:', companyUpdatePayload);
            await companyUpdateMutation.mutateAsync(companyUpdatePayload);
            console.log(`Company balance updated from ${previousCompanyBalance} to ${newCompanyBalance}`);
        } else {
            console.log('Updating CUSTOMER balance for personal customer');
            console.log('Customer ID:', customerData.customerId);
            console.log('Current customer balance:', customerData.balance);
            console.log('Balance to add:', balance);
            
            // Validate customerId exists
            if (!customerData.customerId) {
                throw new Error('Customer ID is missing. Please reselect the customer.');
            }
            
            // For personal customers - Update CUSTOMER balance
            const previousBalance = Number(customerData.balance) || 0;
            const newBalance = Number((previousBalance + Number(balance)).toFixed(2));

            const customerUpdatePayload = {
                customerId: customerData.customerId,
                balance: newBalance
            };

            console.log('Customer update payload:', customerUpdatePayload);
            await customerUpdateMutation.mutateAsync(customerUpdatePayload);
            console.log(`Customer balance updated from ${previousBalance} to ${newBalance}`);
        }

        // 6. Reset UI
        setShowInvoice(true);
        dispatch(removeCustomer());
        dispatch(removeAllItems());
        dispatch(removeRoom());
        setPaymentMethod('');
        setPayedAmount(0);
        setIsProcessing(false);

    } catch (error) {
        console.error('Error in handlePlaceOrder:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
        });
        
        // Show more specific error message
        const errorMessage = error.response?.data?.message || error.message || 'Failed to process order. Please try again.';
        toast.error(errorMessage);
        setIsProcessing(false);
    }
};
    /////////////////////////////////////////////////////////////////////////////////
    

    // Format currency function
    const formatCurrency = (amount) => {
        return amount.toFixed(2);
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-2 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 backdrop-blur-sm p-2.5 rounded-lg">
                            <FaCalculator size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold">Payment Summary</h2>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2">
                            <FaShoppingCart />
                            <span className="text-sm">{cartData.length} items</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill Breakdown */}
            <div className="p-4 md:p-6 space-y-4">
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
                        <p className="text-lg md:text-lg font-bold text-emerald-800">
                            {formatCurrency(calculations.totalPriceWithTax)} <span className="text-lg text-emerald-600">SD</span>
                        </p>
                    </div>
                </div>

                {/* Payment Amount */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <FaMoneyBillWave className="text-emerald-600" size={18} />
                            <span className="text-sm font-semibold text-emerald-700">Payment Amount</span>
                        </div>
                        <button
                            onClick={() => setPayedAmount(calculations.totalPriceWithTax)}
                            className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full transition-colors duration-200"
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
                                    className="w-full p-3 pl-10 text-sm font-bold text-emerald-800 bg-emerald-50 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                                    disabled={isInputDisabled}
                                />
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 font-bold">SD</span>
                            </div>

                            <div className="text-xs text-emerald-500 mt-2">
                                Max: {formatCurrency(calculations.totalPriceWithTax)} SD
                            </div>
                        </div>

                        {/* Balance Display */}
                        <div className={`p-3 rounded-lg border-2 ${balance > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                            <label className="block text-xs text-emerald-600 mb-2">Balance Due (SD)</label>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-bold ${balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                        {formatCurrency(Math.abs(balance))}
                                    </p>
                                    <p className="text-xs text-emerald-600 mt-1">
                                        {balance > 0 ? 'Amount to collect' : balance < 0 ? 'Overpaid' : 'Fully paid'}
                                    </p>
                                </div>
                                {balance <= 0 && (
                                    <FaCheckCircle className="text-emerald-500" size={24} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div>
                    <h3 className="text-sm font-semibold text-emerald-700 mb-1">Select Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={cashPaymethod}
                            disabled={isProcessing}
                            className={`p-2 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                paymentMethod === 'Cash' 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 transform scale-[1.05]' 
                                : 'border-emerald-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50'
                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <BsCashCoin size={24} />
                            <span className="font-semibold">Cash</span>
                            <span className="text-xs text-emerald-600">Pay with cash</span>
                        </button>
                        
                        <button
                            onClick={onlinePaymethod}
                            disabled={isProcessing}
                            className={`p-2 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                paymentMethod === 'Online' 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 transform scale-[1.02]' 
                                : 'border-emerald-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50'
                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FaCreditCard size={24} />
                            <span className="font-semibold">Online</span>
                            <span className="text-xs text-emerald-600">Pay with Bankak</span>
                        </button>
                    </div>
                    
                    {paymentMethod && (
                        <div className="mt-1 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
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
                <div className="grid grid-cols-1 md:grid-cols-1 gap-3 pt-2 border-t border-emerald-100">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={!paymentMethod || cartData.length === 0 || isProcessing}
                        className={`group font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                            !paymentMethod || cartData.length === 0 || isProcessing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                        }`}
                    >
                        {isProcessing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle />
                                <span>Confirm Reservation</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Order Summary */}
                {cartData.length > 0 && (
                    <div className="pt-4 border-t border-emerald-100">
                        <h4 className="text-sm font-semibold text-emerald-700 mb-3">Order Summary</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {cartData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm p-2 hover:bg-emerald-50 rounded-lg">
                                    <span className="text-emerald-800 truncate max-w-[60%]">
                                        {item.name} ({item.quantity} nights)
                                    </span>
                                    <span className="font-medium text-emerald-700">
                                        {formatCurrency(item.price)} SD
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Modal - Pass the orderInfo data */}
            {showInvoice && orderInfo && (
                <Invoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
            )}
        </div>
    );
};

export default Bills;