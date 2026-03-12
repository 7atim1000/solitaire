import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTotalPrice, removeAllItems } from '../../redux/slices/cartSlice';
import { addTransaction, extraOrder, updateCustomer, updateTotals } from '../../https';


import { toast } from 'react-toastify';
import { removeCustomer } from '../../redux/slices/customerSlice';
import ExtraInvoice from './ExtraInvoice';


const ExtraBills = () => {

    const dispatch = useDispatch();

    const cartData = useSelector(state => state.cart);      // to save Extra services
   
    const userData = useSelector((state) => state.user);   // To save new user by
    
    // to set and save extraItems
    const extraItemsData = useSelector(state => state.extra);
    
    // to set and save totals
    // Previous Totals
    const orderData = useSelector(state => state.order)

    // extra Totals
    const total = useSelector(getTotalPrice);
        // now Totals
        const taxRate = 5.25;  
        const tax = (total * taxRate) / 100;
        const totalPriceWithTax = total + tax;
        
        // now + previous
        const extraTax = ((total * taxRate) / 100) + (orderData.billsTax);
        const extraTotal = total + orderData.billsTotal ;
        const extraTotalWithTax = total + tax + orderData.billsTotalWithTax;

        const payedLast = orderData.billsPayed;
        const balanceLast = orderData.billsBalance; 

        // Payed account 
        const [payedAmount, setPayedAmount] = useState(0)

        const balanceNow = Number(totalPriceWithTax + balanceLast) - Number(payedAmount) 
        const payedTotal = Number(payedLast) + Number(payedAmount);
      


    // insert and typing Order :-
    const [paymentMethod, setPaymentMethod] = useState();
   
    const [showInvoice, setShowInvoice] = useState(false);
    const [orderInfo, setOrderInfo] = useState();

    const handleExtraServices = async () => {
            
        if (!paymentMethod){
            enqueueSnackbar('please select a payment method', {variant: "warning"});
            return;
        }

        if (paymentMethod === "Cash" || paymentMethod === 'Online') {

            
            const extraData = {
   
            cartData,
            orderId: orderData._id
              
            };
            
            // 1- extraMutation
            setTimeout(() => {
                extraMutation.mutate(extraData);

            }, 1500);

            // 2- updateTotals
            handleUpdate();

            // 3- payed transaction Income
            if (payedAmount > 0) {

                const transactionData = {
                transactionNumber: `${Date.now()}`,

                amount: payedAmount,
                type: 'Income',
                category: 'Services',
                refrence: orderData.customerDetailsName,
                description: '-',
                date: new Date().toISOString().slice(0, 10)
            }
            setTimeout(() => {
                transactionMutation.mutate(transactionData)
            }, 1500);

            }


            
            // Finally customerBalance 
            const balanceData = {
                balance: balanceNow,            //// MUST UPDATE AND EDIT IT TO (lastCustomerBalance + newInvocieBalance)
                customerId: orderData.cstId
            }

            setTimeout(() => {
                customerUpdateMutation.mutate(balanceData)
                console.log(orderData.cstId)
            }, 1500);

            
            setShowInvoice(true); 

            dispatch(removeCustomer());
            dispatch(removeAllItems());
            setPaymentMethod('');
            setPayedAmount(0)

        };

    }


    const extraMutation = useMutation({
        
        mutationFn: (reqData) => extraOrder(reqData),
        onSuccess: (resData) => {
                    
            console.log(resData);
            
            const { data } = resData.data; 
            console.log(data) ;
                   
            setOrderInfo(data) ;

            toast.success('Extra services added to invoice Successfully .');            
        }, 

        onError: (error) => {
            console.log(error);
        }
    });


    // const totalUpdateMutation = useMutation({

    //     mutationFn: (reqData) => updateTotals(reqData),
    //     onSuccess: (resData) => {

    //         console.log(resData);
    //          toast.success('Invoice totals updated .');
            

    //     },
    //     onError: (error) => {
    //         console.log(error)
    //     }
    // });

    
    // Improved Mutation Usage
    const totalUpdateMutation = useMutation({

        mutationFn: updateTotals,
        onSuccess: (resData) => {
            console.log('Update success:', resData);
            toast.success('Invoice totals updated');
            // Consider updating local state/cache here
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Update failed');
        }
    });


    const handleUpdate = () => {
        const totalData = {
            
            total: extraTotal,
            totalWithTax: extraTotalWithTax,
            
            payed : payedTotal,
            balance : balanceNow, 
            tax : extraTax,
            
            orderId: orderData._id
        };

        totalUpdateMutation.mutate(totalData);
        console.log(orderData._id)
    };


    const transactionMutation = useMutation({
        mutationFn: (reqData) => addTransaction(reqData),

        onSuccess: (resData) => {

            const { data } = resData.data; // data comes from backend ... resData default on mutation     
            toast.success('The income was transfered to the finance department .');
        },
        onError: (error) => {
            console.log(error);
        }
    });

    
    // customerMutation
    const customerUpdateMutation = useMutation({

        mutationFn: (reqData) => updateCustomer(reqData),
        onSuccess: (resData) => {

            console.log(resData);
            toast.success('Customer balance is updated .');
        },

        onError: (error) => {
            console.log(error)
        }
    });




    return (
       <>
        <div className ='overflow-y-scroll scrollbar-hidden h-[calc(100vh-5rem-5rem)] overflow-y-scroll scrollbar-hidden shadow-lg/30'>

            <div className ='flex items-center justify-between px-5 mt-2'>
                <p className ='text-xs text-[#1f1f1f] font-normal mt-2'>Services : ({cartData.length})</p>
                <p className ='ml-0  text-[#1f1f1f] text-xs font-semibold'><span className ='text-xs font-normal text-emerald-600'>AED </span>{total.toFixed(2)}</p>
            </div>
            <div className ='flex items-center justify-between px-5 mt-2'>
                <p className ='text-xs text-[#1f1f1f] font-normal mt-2'>Tax(5.25%)</p>
                <p className ='text-[#1f1f1f] text-sm font-semibold'><span className ='text-xs font-normal text-emerald-600'>AED </span>{tax.toFixed(2)}</p>
            </div>
            <div className ='flex items-center justify-between px-5 mt-2'>
                <p className ='text-xs text-[#1f1f1f] font-normal mt-2'>Grand Total :</p>
                <p className ='text-emerald-600 text-lg font-semibold'>
                    <span className ='text-xs font-normal text-[#1a1a1a]'>AED </span>
                    {totalPriceWithTax.toFixed(2)}
                </p>
            </div>

            <hr className ='border-white border-t-3 mt-1' />
            
            <div className ='bg-emerald-50 p-1 shadow-lg/30'>
                <div className ='flex items-center justify-between px-5 mt-2 '>
                    <p className ='text-xs text-[#1f1f1f] font-normal mt-2'>Services : ({orderData.Length + cartData.length})</p> {/* orderData.billsTotal   */}
                    <p className ='text-[#1a1a1a] text-xs font-semibold'><span className ='text-xs font-normal text-emerald-700'>AED </span>{extraTotal.toFixed(2)}</p>
                </div>
                <div className ='flex items-center justify-between px-5 mt-2 '>
                    <p className ='text-xs text-[#1f1f1f] font-normal mt-2'>Tax(5.25%)</p>                      {/* orderData.billsTax */}
                    <p className ='ml-0  text-[#1a1a1a] text-sm font-semibold'><span className ='text-xs font-normal text-emerald-700'>AED </span>{extraTax.toFixed(2)}</p>
                </div>
                <div className ='flex items-center justify-between px-5 mt-2'>
                    <p className ='text-xs text-[#1a1a1a] font-normal mt-2'>Total With Tax :</p>                 {/* orderData.billsTotalWithTax */}
                    <p className ='ml-0  text-emerald-600 text-lg font-semibold'><span className ='text-xs font-normal text-[#1a1a1a]'>AED </span>{extraTotalWithTax.toFixed(2)}</p>
                </div>
                <div className ='flex justify-between px-5 mt-2'>

                        <div className ='flex items-center justify-between gap-2'>
                            <p className='text-xs text-[#1a1a1a] font-normal'>Last Payed :</p>
                            <p className='ml-0 text-emerald-600 text-sm font-semibold'>{payedLast.toFixed(2)}</p>
                        </div>
                        <div className ='flex items-center justify-between gap-2'>
                            <p className='text-xs text-[#1a1a1a] font-normal'>Last Balance :</p>
                            <p className='ml-0  text-[#be3e3f] text-sm font-semibold'>{balanceLast.toFixed(2)}</p>
                        </div>
                        <p className ='font-normal text-sm underline'>AED</p>
                </div>
            </div>

            <hr className ='border-white border-t-3 mt-1' />
                
                <div className='flex bg-white items-center justify-between px-5 mt-2 shadow-lg/30 p-3 rounded-lg'>
                    <p className='text-xs text-[#1a1a1a] font-normal mt-2'>Payed Now :</p>

                    <input className='w-[50%] bg-emerald-50 rounded-sm p-1 text-emerald-600 text-md font-semibold 
                    shadow-lg/30 border-b-1 border-emerald-600'
                        name='payedAmount'
                        type='number'
                        value={Number(payedAmount).toFixed(2)}
                        
                        onChange={(e) => Number(setPayedAmount(e.target.value))}
                    />
                    <span className='text-xs font-normal text-[#1a1a1a] mt-3'> AED</span>
                </div>

                <div className ='flex items-center  gap-5 p-1 justify-center'>
    
                    <p className='text-xs text-[#1a1a1a] font-normal '>Total Payed :</p>
                    <p className='ml-0  text-emerald-700 text-sm font-semibold text-sm font-semibold'>{payedTotal}</p>

                    <p className='text-xs text-[#1a1a1a] font-normal '>Balance Now :</p>
                    <p className='ml-0  text-[#be3e3f] text-sm font-semibold'>{balanceNow.toFixed(2)}</p>

                    <span className='text-xs font-normal text-[#1a1a1a]'> AED</span>
                </div>

                <div className='flex items-center gap-3 px-5 py-2 mt-1'>
                    <button className={`px-4 py-1 w-full rounded-lg  font-semibold cursor-pointer shadow-lg/30
                    ${paymentMethod === 'Cash' ? "bg-emerald-600 text-white" : "bg-white text-emerald-600"}`}
                        onClick={() => setPaymentMethod('Cash')}
                    >Cash
                    </button>

                    <button className={`px-4 py-1 w-full rounded-lg  font-semibold cursor-pointer shadow-lg/30
                    ${paymentMethod === 'Online' ? "bg-emerald-600 text-white" : "bg-white text-emerald-600"}`}
                        onClick={() => setPaymentMethod('Online')}
                    >Online
                    </button>
                </div>
            
                <div className='flex items-center gap-3 px-5 py-1'>
                    <button className='shadow-lg/30 bg-[#f6b100] px-4 py-1 w-full rounded-sm cursor-pointer font-semibold text-[#1a1a1a]
                     shadow-lg/30'
                     >
                        Print Receipt
                    </button>
                    <button className='shadow-lg/30 bg-emerald-600 px-4 py-1 w-full rounded-sm cursor-pointer font-semibold text-white 
                    shadow-lg/30'
                        onClick={handleExtraServices}
                    >   Place Order
                    </button>
                </div>
                    
            {showInvoice && (
                <ExtraInvoice orderInfo={orderInfo} setShowInvoice={setShowInvoice} />
            )}
    
        </div>       


       </>
    );
};



export default ExtraBills;


