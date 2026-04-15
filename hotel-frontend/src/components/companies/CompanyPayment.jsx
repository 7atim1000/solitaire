import React ,{useState} from 'react'

import { motion } from 'framer-motion'
import { IoCloseCircle } from "react-icons/io5";
import { MdAttachMoney, MdCalendarToday, MdDescription, MdPayment, MdCheckCircle } from "react-icons/md";
import { FaCashRegister, FaGlobe } from "react-icons/fa";

import { useSelector } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addOrder,  addTransaction,  updateCompany } from '../../https';
import PaymentInvoice from './PaymentInvoice';

const CompanyPayment = ({setIsPaymentModal, fetchCompanies}) => {

    const handleClose = () => {
        setIsPaymentModal(false)
    }
    
    const companyData = useSelector((state) => state.company);
    const userData = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        payed: 0, description: '',
        date: new Date().toISOString().slice(0, 10)
    });
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({...prev, [name] : value}));
    };

    // payment Method
    const [paymentMethod, setPaymentMethod] = useState();
    
    //  reportInvoice
    const [paymentInvoice, setPaymentInvoice] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState();

    const handlePlaceOrder = async () => {

        if (!paymentMethod) {
            toast.warning('Please select payment method !')
            return;
        };

        if (paymentMethod === "Cash" || paymentMethod === 'Online') {

            const paymentOrderData = {

                orderNumber: `${Date.now()}`,
                orderType: 'companiesPayment',
                orderStatus: "Completed",
           
                company: companyData.companyId,
                companyName: companyData.companyName,
                customerDetails :{
                    name  :  '',
                    email :  '',
                    phone :  '',
                },
     
                bills: {
                    total: 0,
                    tax: 0,
                    totalWithTax: 0,
                    payed: formData.payed,
                    balance: 0,
                    
                },

                // to save New Items || NEEDED
                items: null,
                paymentMethod: paymentMethod,

                // date :  new Date(formData.date + 'T00:00:00Z').toISOString().slice(0, 10)
                orderDate: formData.date ,
                user: userData._id,
            };

            setTimeout(() => {
                paymentMutation.mutate(paymentOrderData);
            }, 1500);

        }
    };

  
    const paymentMutation = useMutation({
        mutationFn: (reqData) => addOrder(reqData),

        onSuccess: (resData) => {
            const { data } = resData.data; // data comes from backend ... resData default on mutation
            console.log(data);

            setPaymentInfo(data)  // to show details in report            

            toast.success('Company payment confirm successfully .');
            
            const balanceData = {
                balance: companyData.balance - formData.payed,
                companyId: companyData.companyId
            }

            setTimeout(() => {
                companyUpdateMutation.mutate(balanceData)
            }, 1500)

            // add transaction to finance
            const payedAmount = formData.payed;

            const transactionData = {
                transactionNumber: `${Date.now()}`,

                amount: payedAmount,
                type: 'Income',
                category: 'Company Payment',
                refrence: companyData.companyName,
                description: '-',  user: userData._id,
                date: new Date().toISOString().slice(0, 10)
            }
            setTimeout(() => {
                transactionMutation.mutate(transactionData)
            }, 1500);

        
            setPaymentInvoice(true); // to open report 
            setPaymentMethod('');
            fetchCompanies();
            // to reset form
            setFormData({
                payed: 0, description: '',
                date: new Date().toDateString().slice(0, 10)
            })
        },


        onError: (error) => {
            console.log(error);
        }
    });

    
    const companyUpdateMutation = useMutation({

        mutationFn: (reqData) => updateCompany(reqData),
        onSuccess: (resData) => {

            console.log(resData);
        },
        onError: (error) => {
            console.log(error)
        }
    });

    // add transaction  ...
    const transactionMutation = useMutation({
        mutationFn: (reqData) => addTransaction(reqData),

        onSuccess: (resData) => {
            const { data } = resData.data; 
            //console.log(data);       
            toast.success('The revenue was transferred to the finance department .');
        },
        onError: (error) => {
            console.log(error);
        }
    });

    
    
    return (
     
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-2xl border border-emerald-200 
                          w-full max-w-lg max-h-[90vh] overflow-y-auto'
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#10b981 #ecfdf5',
                }}
            >
                {/* Custom scrollbar styling */}
                <style jsx>{`
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 6px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: #ecfdf5;
                        border-radius: 3px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: #10b981;
                        border-radius: 3px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: #059669;
                    }
                `}</style>

                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MdPayment className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-white'>Company Payment</h2>
                                <p className='text-emerald-100 text-sm'>Process payment for company</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleClose}
                            className='p-2 text-white hover:bg-white/20 rounded-lg transition duration-200 cursor-pointer'
                        >
                            <IoCloseCircle size={22} />
                        </button>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="p-5 border-b border-emerald-100 bg-emerald-50/50">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-emerald-800 mb-2">Company Details</h3>
                        <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-emerald-700 font-medium">Company:</span>
                                <span className="font-bold text-emerald-900">{companyData.companyName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-emerald-700 font-medium">Current Balance:</span>
                                <span className={`font-bold ${companyData.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {Number(companyData.balance).toFixed(2)} SD
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className='p-5 space-y-5'>
                    {/* Date Field */}
                    <div>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                            <MdCalendarToday className="text-emerald-600 w-4 h-4" />
                            Payment Date
                        </label>
                        <div className="relative">
                            <input
                                type='date'
                                name='date'
                                value={formData.date}
                                onChange={handleInputChange}
                                className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                         text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                         focus:border-transparent transition duration-200'
                                required
                            />
                            <MdCalendarToday className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                        </div>
                    </div>

                    {/* Amount Field */}
                    <div>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                            <MdAttachMoney className="text-emerald-600 w-4 h-4" />
                            Payment Amount (SD)
                        </label>
                        <div className="relative">
                            <input
                                type='text'
                                name='payed'
                                value={formData.payed}
                                onChange={handleInputChange}
                                placeholder='Enter payment amount'
                                className='w-full px-4 py-3 pl-10 pr-12 bg-white border border-emerald-200 rounded-lg 
                                         text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                         focus:border-transparent transition duration-200'
                                required
                            />
                            <MdAttachMoney className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>
                                SD
                            </span>
                        </div>
                        {formData.payed > companyData.balance && (
                            <p className="text-xs text-red-500 mt-2">
                                Warning: Payment amount exceeds company balance
                            </p>
                        )}
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-2'>
                            <MdDescription className="text-emerald-600 w-4 h-4" />
                            Description (Optional)
                        </label>
                        <div className="relative">
                            <input
                                type='text'
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder='Enter payment description'
                                className='w-full px-4 py-3 pl-10 bg-white border border-emerald-200 rounded-lg 
                                         text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                         focus:border-transparent transition duration-200'
                            />
                            <MdDescription className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2 mb-3'>
                            <MdPayment className="text-emerald-600 w-4 h-4" />
                            Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type='button'
                                onClick={() => setPaymentMethod('Cash')}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2
                                    ${paymentMethod === 'Cash' 
                                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700' 
                                        : 'border-emerald-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                            >
                                <FaCashRegister className={`w-5 h-5 ${paymentMethod === 'Cash' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <span className="font-medium">Cash</span>
                            </button>
                            
                            <button
                                type='button'
                                onClick={() => setPaymentMethod('Online')}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2
                                    ${paymentMethod === 'Online' 
                                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700' 
                                        : 'border-emerald-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                            >
                                <FaGlobe className={`w-5 h-5 ${paymentMethod === 'Online' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <span className="font-medium">Online</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 border-t border-emerald-200 bg-emerald-50/50">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleClose}
                            className='flex-1 py-3.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg 
                                     hover:bg-emerald-50 transition duration-200 cursor-pointer font-medium text-sm'
                        >
                            Cancel
                        </button>
                        <button
                            type='button'
                            onClick={handlePlaceOrder}
                            disabled={!paymentMethod || paymentMutation.isLoading}
                            className={`flex-1 py-3.5 rounded-lg transition duration-200 cursor-pointer 
                                     font-medium text-sm flex items-center justify-center gap-2
                                     ${!paymentMethod || paymentMutation.isLoading
                                        ? 'bg-emerald-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                                     } text-white`}
                        >
                            {paymentMutation.isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <MdCheckCircle className="w-4 h-4" />
                                    <span>Confirm Payment</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>

            {paymentInvoice && (
                <PaymentInvoice paymentInfo={paymentInfo} setPaymentInvoice={setPaymentInvoice} />
            )}
        </div>
    );
};

export default CompanyPayment;