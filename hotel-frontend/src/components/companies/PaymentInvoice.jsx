import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { MdPrint, MdClose, MdReceipt, MdPerson, MdEmail, MdPhone, MdPayment, MdCheckCircle } from "react-icons/md";
import { FaSignature } from "react-icons/fa";
import hotel from '../../assets/images/solitair.png' 

const PaymentInvoice = ({ paymentInfo, setPaymentInvoice }) => {
    const invoiceRef = useRef(null);

    const handleClose = () => {
        setPaymentInvoice(false);
        window.location.reload();     
    }

    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");

        WinPrint.document.write(` 
                <html>
                    <head>
                        <title>Solitair Hotel - Payment Receipt</title>
                        <style>
                            body { 
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                padding: 30px; 
                                background: #f9fafb;
                                line-height: 1.6;
                            }
                            .invoice-container { 
                                max-width: 210mm; 
                                min-height: 297mm; 
                                margin: 0 auto; 
                                padding: 40px; 
                                background: white;
                                border: 1px solid #e5e7eb;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                border-radius: 12px;
                            }
                            .header { 
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                border-bottom: 2px solid #10b981; 
                                padding-bottom: 20px; 
                                margin-bottom: 30px;
                            }
                            .logo-container {
                                width: 120px;
                                height: 80px;
                                overflow: hidden;
                            }
                            .logo-container img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                            }
                            .hotel-info {
                                text-align: right;
                            }
                            .hotel-name {
                                font-size: 24px;
                                font-weight: bold;
                                color: #065f46;
                                margin-bottom: 5px;
                            }
                            .hotel-tagline {
                                color: #6b7280;
                                font-size: 14px;
                            }
                            .receipt-title {
                                font-size: 28px;
                                font-weight: bold;
                                color: #065f46;
                                margin-bottom: 8px;
                                text-align: center;
                            }
                            .company-info {
                                color: #6b7280;
                                font-size: 14px;
                                margin-bottom: 5px;
                                text-align: center;
                            }
                            .thank-you {
                                text-align: center;
                                color: #059669;
                                font-weight: 500;
                                font-size: 16px;
                                margin: 20px 0;
                            }
                            .section-title {
                                font-size: 16px;
                                font-weight: 600;
                                color: #065f46;
                                margin: 20px 0 10px 0;
                                padding-bottom: 5px;
                                border-bottom: 1px solid #d1fae5;
                            }
                            .info-row {
                                display: flex;
                                justify-content: space-between;
                                margin: 8px 0;
                                font-size: 14px;
                            }
                            .label {
                                font-weight: 500;
                                color: #4b5563;
                            }
                            .value {
                                font-weight: 600;
                                color: #111827;
                            }
                            .guest-details {
                                background: #f0fdf4;
                                border-radius: 12px;
                                padding: 20px;
                                margin: 20px 0;
                                border: 1px solid #86efac;
                            }
                            .guest-grid {
                                display: grid;
                                grid-template-columns: repeat(3, 1fr);
                                gap: 16px;
                            }
                            .guest-item {
                                display: flex;
                                align-items: center;
                                gap: 12px;
                            }
                            .guest-icon {
                                color: #059669;
                                font-size: 20px;
                            }
                            .guest-label {
                                font-size: 12px;
                                color: #6b7280;
                                margin-bottom: 2px;
                            }
                            .guest-value {
                                font-weight: 600;
                                color: #1f2937;
                            }
                            .amount-box {
                                background: #d1fae5;
                                padding: 15px;
                                border-radius: 8px;
                                margin: 20px 0;
                                text-align: center;
                                border: 2px solid #10b981;
                            }
                            .amount-title {
                                font-size: 14px;
                                color: #065f46;
                                font-weight: 500;
                            }
                            .amount-value {
                                font-size: 32px;
                                font-weight: bold;
                                color: #065f46;
                                margin: 10px 0;
                            }
                            .signature-area {
                                margin-top: 40px;
                                padding-top: 20px;
                                border-top: 1px dashed #9ca3af;
                            }
                            .signature-grid {
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 30px;
                            }
                            .signature-line {
                                margin-top: 10px;
                                border-bottom: 2px solid #d1d5db;
                            }
                            .footer {
                                margin-top: 40px;
                                text-align: center;
                                color: #6b7280;
                                font-size: 12px;
                                padding-top: 20px;
                                border-top: 1px solid #e5e7eb;
                            }
                            @media print {
                                body { 
                                    padding: 0; 
                                    background: white;
                                }
                                .invoice-container {
                                    box-shadow: none;
                                    border: none;
                                    padding: 20px;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                </html>
                `);
        WinPrint.document.close();
        WinPrint.focus();
        setTimeout(() => {
            WinPrint.print();
            WinPrint.close();
            window.location.reload();
        }, 1000);
    }

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[calc(100vh-2rem)] overflow-hidden flex flex-col'
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MdReceipt className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-white'>Payment Receipt</h2>
                                <p className='text-emerald-100 text-sm'>Payment confirmation and invoice</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                                         transition duration-200 cursor-pointer flex items-center gap-2 text-sm font-medium"
                            >
                                <MdPrint className="w-4 h-4" />
                                Print
                            </button>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                                         transition duration-200 cursor-pointer flex items-center gap-2 text-sm font-medium"
                            >
                                <MdClose className="w-4 h-4" />
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-50">
                    {/* Invoice Content for Printing */}
                    <div ref={invoiceRef} className="hidden">
                        <div className="invoice-container">
                            {/* Header with Logo - One Row */}
                            <div className="header">
                                <div className="logo-container">
                                    <img src={hotel} alt="Solitair Hotel" />
                                </div>
                                <div className="hotel-info">
                                    <div className="hotel-name">Solitair Hotel</div>
                                    <div className="hotel-tagline">Luxury & Comfort</div>
                                </div>
                            </div>

                            <div className="receipt-title">PAYMENT RECEIPT</div>
                            <div className="company-info">Official Payment Confirmation</div>
                            <div className="thank-you">Thank you for your payment!</div>

                            <div className="section-title">Payment Information</div>
                            <div className="info-row">
                                <span className="label">Receipt Number:</span>
                                <span className="value">{paymentInfo.orderNumber}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Date:</span>
                                <span className="value">{new Date(paymentInfo.orderDate).toLocaleDateString('en-GB')}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Payment Method:</span>
                                <span className="value">{paymentInfo.paymentMethod}</span>
                            </div>

                            <div className="section-title">Company Details</div>
                            <div className="guest-details">
                                <div className="guest-grid">
                                    <div className="guest-item">
                                        <MdPerson className="guest-icon" />
                                        <div>
                                            <div className="guest-label">Name</div>
                                            <div className="guest-value">{paymentInfo.companyName}</div>
                                        </div>
                                    </div>
                                    <div className="guest-item">
                                        <MdEmail className="guest-icon" />
                                        <div>
                                            <div className="guest-label">Email</div>
                                            <div className="guest-value">{paymentInfo.company.email}</div>
                                        </div>
                                    </div>
                                    <div className="guest-item">
                                        <MdPhone className="guest-icon" />
                                        <div>
                                            <div className="guest-label">Phone</div>
                                            <div className="guest-value">{paymentInfo.company.contactNo}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="amount-box">
                                <div className="amount-title">PAID AMOUNT</div>
                                <div className="amount-value">{paymentInfo.bills.payed.toFixed(2)} SD</div>
                                <div className="amount-title">Payment Confirmed</div>
                            </div>

                            <div className="section-title">Payment Status</div>
                            <div className="info-row">
                                <span className="label">Status:</span>
                                <span className="value" style={{color: '#059669'}}>COMPLETED ✓</span>
                            </div>

                            <div className="signature-area">
                                <div className="signature-grid">
                                    <div>
                                        <div className="label">Signature</div>
                                        <div className="signature-line"></div>
                                    </div>
                                    <div>
                                        <div className="label">Authorized Signature</div>
                                        <div className="signature-line"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="footer">
                                <p>This is an official receipt. Please keep it for your records.</p>
                                <p>Receipt #{paymentInfo.orderNumber} • Issued on {new Date().toLocaleDateString('en-GB')}</p>
                                <p>Solitair Hotel • Luxury & Comfort</p>
                            </div>
                        </div>
                    </div>

                    {/* Visible Invoice Content */}
                    <div className="bg-white border border-emerald-200 rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
                        {/* Header with Logo - One Row */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-emerald-200">
                            <div className="w-32 h-20 overflow-hidden">
                                <img 
                                    src={hotel} 
                                    alt="Solitair Hotel" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="text-right">
                                <h1 className="text-2xl font-bold text-emerald-800">Solitair Hotel</h1>
                                <p className="text-sm text-emerald-600">Luxury & Comfort</p>
                            </div>
                        </div>

                        {/* Receipt Title */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                                className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <MdCheckCircle className="text-white w-10 h-10" />
                            </motion.div>
                            <h1 className="text-3xl font-bold text-emerald-900 mb-2">PAYMENT RECEIPT</h1>
                            <p className="text-emerald-600 font-medium">Official Payment Confirmation</p>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-emerald-500 text-lg mt-3"
                            >
                                Thank you for your payment!
                            </motion.p>
                        </div>

                        {/* Payment Info */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                                <MdReceipt className="w-5 h-5" />
                                Payment Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-emerald-600 mb-1">Receipt Number</p>
                                    <p className="font-mono font-bold text-emerald-900 text-lg">{paymentInfo.orderNumber}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-emerald-600 mb-1">Payment Date</p>
                                    <p className="font-semibold text-emerald-900">{new Date(paymentInfo.orderDate).toLocaleDateString('en-GB')}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-emerald-600 mb-1">Payment Method</p>
                                    <div className="flex items-center gap-2">
                                        <MdPayment className="w-4 h-4 text-emerald-600" />
                                        <p className="font-semibold text-emerald-900">{paymentInfo.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-emerald-600 mb-1">Status</p>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                        COMPLETED
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                                <MdPerson className="w-5 h-5" />
                                Guest Details
                            </h2>
                            <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3">
                                        <MdPerson className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-emerald-600">Company Name</p>
                                            <p className="font-semibold text-emerald-900">{paymentInfo.company.companyName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MdEmail className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-emerald-600">Email</p>
                                            <p className="font-semibold text-emerald-900">{paymentInfo.company.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MdPhone className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-sm text-emerald-600">Phone</p>
                                            <p className="font-semibold text-emerald-900">{paymentInfo.company.contactNo}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amount Box */}
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-6 text-center">
                                <p className="text-emerald-600 font-medium mb-2">PAID AMOUNT</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-emerald-900">{paymentInfo.bills.payed.toFixed(2)}</span>
                                    <span className="text-2xl font-bold text-emerald-700">SD</span>
                                </div>
                                <p className="text-emerald-500 text-sm mt-3">Payment successfully processed and confirmed</p>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="border-t border-emerald-200 pt-6">
                            <h2 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                                <FaSignature className="w-5 h-5" />
                                Signatures
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-emerald-600 mb-2">Signature</p>
                                    <div className="h-12 border-b-2 border-dashed border-emerald-300"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-600 mb-2">Authorized Signature</p>
                                    <div className="h-12 border-b-2 border-dashed border-emerald-300"></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-emerald-200 text-center">
                            <p className="text-sm text-emerald-600 mb-2">
                                This is an official receipt. Please keep it for your records.
                            </p>
                            <p className="text-xs text-emerald-500">
                                Receipt #{paymentInfo.orderNumber} • Issued on {new Date().toLocaleDateString('en-GB')}
                            </p>
                            <p className="text-xs text-emerald-500 mt-1">
                                Solitair Hotel • Luxury & Comfort
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-emerald-200 p-5 bg-emerald-50/50">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white 
                                     rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition duration-200 
                                     cursor-pointer font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <MdPrint className="w-4 h-4" />
                            Print Receipt
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex-1 py-3.5 bg-white border border-emerald-300 text-emerald-700 
                                     rounded-lg hover:bg-emerald-50 transition duration-200 cursor-pointer font-medium text-sm"
                        >
                            Close & Return
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default PaymentInvoice;
