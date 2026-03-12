import React , {useEffect, useState, useRef}  from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux';
import { MdPrint, MdClose, MdReceipt, MdAccountBalance, MdCalendarToday } from "react-icons/md";
import { api } from '../../https';
import hotel from '../../assets/images/solitair.png' 

const OrdersDetails = ({setIsDetailsModal}) => {
    const customerData = useSelector((state) => state.customer);
    const customer = customerData.customerId;
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // fetch Details
    const fetchCustomerDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/api/order/orderCustomer', {
                customer: customerData.customerId
            });

            console.log("API Response:", res.data);

            if (res.data.success) {
                setCustomerInvoices(res.data.data || []);
                console.log("Customer invoices:", res.data.data);
            } else {
                setError(res.data.message || "Failed to fetch orders");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError(error.response?.data?.message || "Network error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customer) {
            fetchCustomerDetails();
        }
    }, [customer]);

    // Printing
    const invoiceRef = useRef(null);
    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");

        WinPrint.document.write(` 
            <html>
                <head>
                    <title>Solitaire Hotel - Guest Statement</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            padding: 30px; 
                            background: #f9fafb;
                            line-height: 1.6;
                        }
                        
                        .statement-container { 
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
                        
                        .statement-title {
                            font-size: 28px;
                            font-weight: bold;
                            color: #065f46;
                            margin-bottom: 8px;
                            text-align: center;
                        }
                        
                        .statement-subtitle {
                            text-align: center;
                            color: #6b7280;
                            font-size: 14px;
                            margin-bottom: 30px;
                        }
                        
                        .guest-summary {
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 12px;
                            padding: 20px;
                            margin-bottom: 30px;
                        }
                        
                        .guest-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                        }
                        
                        .guest-item {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        
                        .guest-icon {
                            width: 40px;
                            height: 40px;
                            background: #d1fae5;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #065f46;
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
                            font-size: 16px;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        
                        th {
                            background-color: #10b981;
                            color: white;
                            padding: 12px;
                            text-align: left;
                            font-size: 13px;
                        }
                        
                        td {
                            padding: 10px 12px;
                            border-bottom: 1px solid #e5e7eb;
                            font-size: 12px;
                        }
                        
                        tfoot tr {
                            background-color: #f0fdf4;
                            font-weight: 600;
                        }
                        
                        tfoot td {
                            border-top: 2px solid #10b981;
                        }
                        
                        .summary-section {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                            margin-top: 30px;
                        }
                        
                        .summary-card {
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 8px;
                            padding: 15px;
                        }
                        
                        .summary-card .label {
                            font-size: 12px;
                            color: #047857;
                            margin-bottom: 5px;
                        }
                        
                        .summary-card .value {
                            font-size: 18px;
                            font-weight: bold;
                            color: #065f46;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 11px;
                            border-top: 1px solid #e5e7eb;
                            padding-top: 20px;
                        }
                        
                        @media print {
                            body { 
                                padding: 0; 
                                background: white;
                            }
                            .statement-container {
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

    // Calculate totals
    const totalAmount = customerInvoices.reduce((acc, invoice) => acc + invoice.bills.totalWithTax, 0);
    const totalTax = customerInvoices.reduce((acc, invoice) => acc + invoice.bills.tax, 0);
    const totalPaid = customerInvoices.reduce((acc, invoice) => acc + invoice.bills.payed, 0);

    return(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-2xl border border-emerald-200 
                          w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col'
            >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MdReceipt className="text-white w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h2 className='text-xl font-bold text-white'>Customer Statement</h2>
                                <p className='text-emerald-100 text-sm'>Transaction history for {customerData.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                                         transition duration-200 cursor-pointer flex items-center gap-2 text-sm font-medium"
                            >
                                <MdPrint className="w-4 h-4" />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                            <button
                                onClick={() => setIsDetailsModal(false)}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
                                         transition duration-200 cursor-pointer flex items-center gap-2 text-sm font-medium"
                            >
                                <MdClose className="w-4 h-4" />
                                <span className="hidden sm:inline">Close</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Print Content - Hidden from view */}
                <div ref={invoiceRef} className="hidden">
                    <div className="statement-container">
                        <div className="header">
                            <div className="logo-container">
                                <img src={hotel} alt="Solitaire Hotel" />
                            </div>
                            <div className="hotel-info">
                                <div className="hotel-name">SOLITAIRE HOTEL</div>
                                <div className="hotel-tagline">Luxury Redefined • Premium Hospitality</div>
                            </div>
                        </div>

                        <div className="statement-title">GUEST STATEMENT</div>
                        <div className="statement-subtitle">Transaction History for {customerData.customerName}</div>

                        <div className="guest-summary">
                            <div className="guest-grid">
                                <div className="guest-item">
                                    <div className="guest-icon">👤</div>
                                    <div>
                                        <div className="guest-label">Guest Name</div>
                                        <div className="guest-value">{customerData.customerName}</div>
                                    </div>
                                </div>
                                <div className="guest-item">
                                    <div className="guest-icon">💰</div>
                                    <div>
                                        <div className="guest-label">Current Balance</div>
                                        <div className="guest-value">{customerData.balance.toFixed(2)} SD</div>
                                    </div>
                                </div>
                                <div className="guest-item">
                                    <div className="guest-icon">📋</div>
                                    <div>
                                        <div className="guest-label">Total Invoices</div>
                                        <div className="guest-value">{customerInvoices.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Invoice Type</th>
                                    <th>Invoice #</th>
                                    <th>Total</th>
                                    <th>Tax</th>
                                    <th>Total with Tax</th>
                                    <th>Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customerInvoices.map((invoice, index) => (
                                    <tr key={index}>
                                        <td>{new Date(invoice.orderDate).toLocaleDateString('en-GB')}</td>
                                        <td>{invoice.orderType}</td>
                                        <td>{invoice.orderNumber}</td>
                                        <td>{invoice.bills.total.toFixed(2)}</td>
                                        <td>{invoice.bills.tax.toFixed(2)}</td>
                                        <td>{invoice.bills.totalWithTax.toFixed(2)}</td>
                                        <td>{invoice.bills.payed.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3"><strong>Totals</strong></td>
                                    <td><strong>{customerInvoices.reduce((acc, inv) => acc + inv.bills.total, 0).toFixed(2)}</strong></td>
                                    <td><strong>{customerInvoices.reduce((acc, inv) => acc + inv.bills.tax, 0).toFixed(2)}</strong></td>
                                    <td><strong>{totalAmount.toFixed(2)}</strong></td>
                                    <td><strong>{totalPaid.toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="summary-section">
                            <div className="summary-card">
                                <div className="label">Total Amount</div>
                                <div className="value">{totalAmount.toFixed(2)} SD</div>
                            </div>
                            <div className="summary-card">
                                <div className="label">Total Tax</div>
                                <div className="value">{totalTax.toFixed(2)} SD</div>
                            </div>
                            <div className="summary-card">
                                <div className="label">Total Paid</div>
                                <div className="value">{totalPaid.toFixed(2)} SD</div>
                            </div>
                            <div className="summary-card">
                                <div className="label">Remaining Balance</div>
                                <div className="value">{customerData.balance.toFixed(2)} SD</div>
                            </div>
                        </div>

                        <div className="footer">
                            <p>This is an official guest statement generated by Solitaire Hotel Management System</p>
                            <p>Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p>Solitaire Hotel • Luxury Redefined • Premium Hospitality</p>
                        </div>
                    </div>
                </div>

                {/* Customer Info Summary */}
                <div className="p-5 border-b border-emerald-100 bg-emerald-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <MdReceipt className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Guest</p>
                                    <h3 className="font-bold text-emerald-900 text-lg">{customerData.customerName}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <MdAccountBalance className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Current Balance</p>
                                    <h3 className={`font-bold text-lg ${customerData.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {customerData.balance.toFixed(2)} SD
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <MdCalendarToday className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-600 font-medium">Total Invoices</p>
                                    <h3 className="font-bold text-emerald-900 text-lg">{customerInvoices.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-5">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                                <p className="text-emerald-600 font-medium">Loading statement...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MdClose className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="text-red-600 font-medium mb-2">Error loading statement</p>
                                <p className="text-gray-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && customerInvoices.length === 0 && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MdReceipt className="w-8 h-8 text-emerald-600" />
                                </div>
                                <p className="text-emerald-600 font-medium text-lg mb-2">No invoices found</p>
                                <p className="text-emerald-400 text-sm">This guest has no transaction history</p>
                            </div>
                        </div>
                    )}

                    {/* Invoices Table */}
                    {!loading && !error && customerInvoices.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700">
                                        <tr className="text-white text-sm font-semibold">
                                            <th className="p-4 text-left">Date</th>
                                            <th className="p-4 text-left">Invoice Type</th>
                                            <th className="p-4 text-left">Invoice #</th>
                                            <th className="p-4 text-left">Total</th>
                                            <th className="p-4 text-left">Tax</th>
                                            <th className="p-4 text-left">Total with Tax</th>
                                            <th className="p-4 text-left">Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerInvoices.map((invoice, index) => (
                                            <tr 
                                                key={index}
                                                className={`border-b border-emerald-50 hover:bg-emerald-50/50 transition-all duration-200 
                                                          ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`}
                                            >
                                                <td className="p-4 font-medium text-emerald-900">
                                                    {new Date(invoice.orderDate).toLocaleDateString('en-GB')}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                                        {invoice.orderType}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-emerald-700 font-medium">
                                                    {invoice.orderNumber}
                                                </td>
                                                <td className="p-4 font-medium text-emerald-900">
                                                    {invoice.bills.total.toFixed(2)}
                                                </td>
                                                <td className="p-4 text-emerald-700">
                                                    {invoice.bills.tax.toFixed(2)}
                                                </td>
                                                <td className="p-4 font-bold text-emerald-900">
                                                    {invoice.bills.totalWithTax.toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`font-bold ${invoice.bills.payed > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                        {invoice.bills.payed.toFixed(2)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                                        <tr>
                                            <td className="p-4 font-bold" colSpan={3}>Total</td>
                                            <td className="p-4 font-bold">
                                                {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.total, 0).toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold">
                                                {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.tax, 0).toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold">
                                                {totalAmount.toFixed(2)}
                                            </td>
                                            <td className="p-4 font-bold">
                                                {totalPaid.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Statistics */}
                {!loading && !error && customerInvoices.length > 0 && (
                    <div className="p-5 border-t border-emerald-100 bg-emerald-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-emerald-200">
                                <p className="text-sm text-emerald-600 font-medium mb-1">Total Amount</p>
                                <p className="text-xl font-bold text-emerald-900">
                                    {totalAmount.toFixed(2)} SD
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-emerald-200">
                                <p className="text-sm text-emerald-600 font-medium mb-1">Total Tax</p>
                                <p className="text-xl font-bold text-emerald-900">
                                    {totalTax.toFixed(2)} SD
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-emerald-200">
                                <p className="text-sm text-emerald-600 font-medium mb-1">Total Paid</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {totalPaid.toFixed(2)} SD
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-emerald-200">
                                <p className="text-sm text-emerald-600 font-medium mb-1">Remaining Balance</p>
                                <p className={`text-xl font-bold ${customerData.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {customerData.balance.toFixed(2)} SD
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default OrdersDetails;



// import React , {useEffect, useState, useRef}  from 'react'
// import { motion } from 'framer-motion'
// import { useSelector } from 'react-redux';
// import { MdPrint, MdClose, MdReceipt, MdAccountBalance, MdCalendarToday } from "react-icons/md";

// import { api } from '../../https';
// import hotel from '../../assets/images/solitair.png' 


// const OrdersDetails = ({setIsDetailsModal}) => {
//     const customerData = useSelector((state) => state.customer);

//     const customer = customerData.customerId;
//     const [customerInvoices, setCustomerInvoices] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // fetch Details
//     const fetchCustomerDetails = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//         const res = await api.post('/api/order/orderCustomer', {
//             customer: customerData.customerId
//         });

//         console.log("API Response:", res.data); // Debug log

//         if (res.data.success) {
//             setCustomerInvoices(res.data.data || []);
//             console.log("Customer invoices:", res.data.data);
//         } else {
//             // Updated to use res.data.message
//             setError(res.data.message || "Failed to fetch orders");
//         }
//     } catch (error) {
//         console.error("Fetch error:", error);
//         // Updated to use error.response?.data?.message
//         setError(error.response?.data?.message || "Network error occurred");
//     } finally {
//         setLoading(false);
//     }
// };

//     useEffect(() => {
//         if (customer) {
//             fetchCustomerDetails();
//         }
//     }, [customer]);

//     // Printing
//     const invoiceRef = useRef(null);
//     const handlePrint = () => {
//         const printContent = invoiceRef.current.innerHTML;
//         const WinPrint = window.open("", "", "width=900, height=650");

//         WinPrint.document.write(` 
//                 <html>
//                     <head>
//                         <title>Solitair Hotel</title>
//                         <title>Payment Receipt</title>
//                         <style>
//                             body { 
//                                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//                                 padding: 30px; 
//                                 background: #f9fafb;
//                                 line-height: 1.6;
//                             }
//                             .invoice-container { 
//                                 max-width: 210mm; 
//                                 min-height: 297mm; 
//                                 margin: 0 auto; 
//                                 padding: 40px; 
//                                 background: white;
//                                 border: 1px solid #e5e7eb;
//                                 box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//                                 border-radius: 12px;
//                             }
//                             .header { 
//                                 text-align: center; 
//                                 border-bottom: 2px solid #10b981; 
//                                 padding-bottom: 20px; 
//                                 margin-bottom: 30px;
//                             }
//                             .receipt-title {
//                                 font-size: 28px;
//                                 font-weight: bold;
//                                 color: #065f46;
//                                 margin-bottom: 8px;
//                             }
//                             .company-info {
//                                 color: #6b7280;
//                                 font-size: 14px;
//                                 margin-bottom: 5px;
//                             }
//                             .section-title {
//                                 font-size: 16px;
//                                 font-weight: 600;
//                                 color: #065f46;
//                                 margin: 20px 0 10px 0;
//                                 padding-bottom: 5px;
//                                 border-bottom: 1px solid #d1fae5;
//                             }
//                             .info-row {
//                                 display: flex;
//                                 justify-content: space-between;
//                                 margin: 8px 0;
//                                 font-size: 14px;
//                             }
//                             .label {
//                                 font-weight: 500;
//                                 color: #4b5563;
//                             }
//                             .value {
//                                 font-weight: 600;
//                                 color: #111827;
//                             }
//                             .amount-box {
//                                 background: #d1fae5;
//                                 padding: 15px;
//                                 border-radius: 8px;
//                                 margin: 20px 0;
//                                 text-align: center;
//                                 border: 2px solid #10b981;
//                             }
//                             .amount-title {
//                                 font-size: 14px;
//                                 color: #065f46;
//                                 font-weight: 500;
//                             }
//                             .amount-value {
//                                 font-size: 32px;
//                                 font-weight: bold;
//                                 color: #065f46;
//                                 margin: 10px 0;
//                             }
//                             .signature-area {
//                                 margin-top: 40px;
//                                 padding-top: 20px;
//                                 border-top: 1px dashed #9ca3af;
//                             }
//                             .footer {
//                                 margin-top: 40px;
//                                 text-align: center;
//                                 color: #6b7280;
//                                 font-size: 12px;
//                                 padding-top: 20px;
//                                 border-top: 1px solid #e5e7eb;
//                             }
//                             .thank-you {
//                                 text-align: center;
//                                 color: #059669;
//                                 font-weight: 500;
//                                 font-size: 16px;
//                                 margin: 20px 0;
//                             }
//                             @media print {
//                                 body { 
//                                     padding: 0; 
//                                     background: white;
//                                 }
//                                 .invoice-container {
//                                     box-shadow: none;
//                                     border: none;
//                                     padding: 20px;
//                                 }
//                             }
//                         </style>
//                     </head>
//                     <body>
//                         ${printContent}
//                     </body>
//                 </html>
//                 `);

//         WinPrint.document.close();
//         WinPrint.focus();
//         setTimeout(() => {
//             WinPrint.print();
//             WinPrint.close();
//             window.location.reload();
//         }, 1000);
//     }

    

//     return(
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ duration: 0.3, ease: 'easeInOut' }}
//                 className='bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-2xl border border-emerald-200 
//                           w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col'
//             >
//                 {/* Modal Header */}
//                 <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 p-5">
//                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                         <div className="flex items-center gap-3">
//                             <div className="bg-white/20 p-2 rounded-lg">
//                                 <MdReceipt className="text-white w-5 h-5" />
//                             </div>
//                             <div className="flex-1">
//                                 <h2 className='text-xl font-bold text-white'>Customer Statement</h2>
//                                 <p className='text-emerald-100 text-sm'>Transaction history for {customerData.customerName}</p>
//                             </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <button
//                                 onClick={handlePrint}
//                                 className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
//                                          transition duration-200 cursor-pointer flex items-center gap-2 text-sm font-medium"
//                             >
//                                 <MdPrint className="w-4 h-4" />
//                                 <span className="hidden sm:inline">Print</span>
//                             </button>
//                             <button
//                                 onClick={() => setIsDetailsModal(false)}
//                                 className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg 
//                                          transition duration-200 cursor-pointer flex items-center gap-2 text-sm font-medium"
//                             >
//                                 <MdClose className="w-4 h-4" />
//                                 <span className="hidden sm:inline">Close</span>
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Customer Info Summary */}
//                 <div className="p-5 border-b border-emerald-100 bg-emerald-50/50">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                             <div className="flex items-center gap-3 mb-2">
//                                 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
//                                     <MdReceipt className="w-5 h-5 text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-emerald-600 font-medium">Guest</p>
//                                     <h3 className="font-bold text-emerald-900 text-lg">{customerData.customerName}</h3>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                             <div className="flex items-center gap-3 mb-2">
//                                 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
//                                     <MdAccountBalance className="w-5 h-5 text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-emerald-600 font-medium">Current Balance</p>
//                                     <h3 className={`font-bold text-lg ${customerData.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
//                                         {customerData.balance.toFixed(2)} SD
//                                     </h3>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                             <div className="flex items-center gap-3 mb-2">
//                                 <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
//                                     <MdCalendarToday className="w-5 h-5 text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-sm text-emerald-600 font-medium">Total Invoices</p>
//                                     <h3 className="font-bold text-emerald-900 text-lg">{customerInvoices.length}</h3>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Table Content */}
//                 <div className="flex-1 overflow-auto p-5">
//                     {/* Print content (hidden from view, used only for printing) */}
//                     <div ref={invoiceRef} className="hidden">
//                         <div className="p-8">
//                             <h2 className="text-2xl font-bold text-center mb-6">Guest Statement</h2>
//                             <div className="mb-6">
//                                 <p className="text-lg"><strong>Guest:</strong> {customerData.customerName}</p>
//                                 <p className="text-lg"><strong>Balance:</strong> {customerData.balance.toFixed(2)} AED</p>
//                             </div>
//                             <table className="w-full border-collapse">
//                                 <thead>
//                                     <tr className="bg-gray-100">
//                                         <th className="border p-2">Date</th>
//                                         <th className="border p-2">Invoice Type</th>
//                                         <th className="border p-2">Invoice Number</th>
//                                         <th className="border p-2">Total</th>
//                                         <th className="border p-2">Tax</th>
//                                         <th className="border p-2">Total with Tax</th>
//                                         <th className="border p-2">Paid</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {customerInvoices.map((invoice, index) => (
//                                         <tr key={index}>
//                                             <td className="border p-2">{new Date(invoice.orderDate).toLocaleDateString('en-GB')}</td>
//                                             <td className="border p-2">{invoice.orderType}</td>
//                                             <td className="border p-2">{invoice.orderNumber}</td>
//                                             <td className="border p-2">{invoice.bills.total.toFixed(2)}</td>
//                                             <td className="border p-2">{invoice.bills.tax.toFixed(2)}</td>
//                                             <td className="border p-2">{invoice.bills.totalWithTax.toFixed(2)}</td>
//                                             <td className="border p-2">{invoice.bills.payed.toFixed(2)}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                                 <tfoot>
//                                     <tr className="font-bold">
//                                         <td className="border p-2" colSpan={3}>Total</td>
//                                         <td className="border p-2">{customerInvoices.reduce((acc, invoice) => acc + invoice.bills.total, 0).toFixed(2)}</td>
//                                         <td className="border p-2">{customerInvoices.reduce((acc, invoice) => acc + invoice.bills.tax, 0).toFixed(2)}</td>
//                                         <td className="border p-2">{customerInvoices.reduce((acc, invoice) => acc + invoice.bills.totalWithTax, 0).toFixed(2)}</td>
//                                         <td className="border p-2">{customerInvoices.reduce((acc, invoice) => acc + invoice.bills.payed, 0).toFixed(2)}</td>
//                                     </tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Loading State */}
//                     {loading && (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="flex flex-col items-center gap-3">
//                                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
//                                 <p className="text-emerald-600 font-medium">Loading statement...</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Error State */}
//                     {error && !loading && (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="text-center">
//                                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                     <MdClose className="w-8 h-8 text-red-600" />
//                                 </div>
//                                 <p className="text-red-600 font-medium mb-2">Error loading statement</p>
//                                 <p className="text-gray-600 text-sm">{error}</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Empty State */}
//                     {!loading && !error && customerInvoices.length === 0 && (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="text-center">
//                                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                     <MdReceipt className="w-8 h-8 text-emerald-600" />
//                                 </div>
//                                 <p className="text-emerald-600 font-medium text-lg mb-2">No invoices found</p>
//                                 <p className="text-emerald-400 text-sm">This guest has no transaction history</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Invoices Table */}
//                     {!loading && !error && customerInvoices.length > 0 && (
//                         <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                     <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700">
//                                         <tr className="text-white text-sm font-semibold">
//                                             <th className="p-4 text-left">Date</th>
//                                             <th className="p-4 text-left">Invoice Type</th>
//                                             <th className="p-4 text-left">Invoice #</th>
//                                             <th className="p-4 text-left">Total</th>
//                                             <th className="p-4 text-left">Tax</th>
//                                             <th className="p-4 text-left">Total with Tax</th>
//                                             <th className="p-4 text-left">Paid</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {customerInvoices.map((invoice, index) => (
//                                             <tr 
//                                                 key={index}
//                                                 className={`border-b border-emerald-50 hover:bg-emerald-50/50 transition-all duration-200 
//                                                           ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`}
//                                             >
//                                                 <td className="p-4 font-medium text-emerald-900">
//                                                     {new Date(invoice.orderDate).toLocaleDateString('en-GB')}
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
//                                                         {invoice.orderType}
//                                                     </span>
//                                                 </td>
//                                                 <td className="p-4 font-mono text-emerald-700 font-medium">
//                                                     {invoice.orderNumber}
//                                                 </td>
//                                                 <td className="p-4 font-medium text-emerald-900">
//                                                     {invoice.bills.total.toFixed(2)}
//                                                 </td>
//                                                 <td className="p-4 text-emerald-700">
//                                                     {invoice.bills.tax.toFixed(2)}
//                                                 </td>
//                                                 <td className="p-4 font-bold text-emerald-900">
//                                                     {invoice.bills.totalWithTax.toFixed(2)}
//                                                 </td>
//                                                 <td className="p-4">
//                                                     <span className={`font-bold ${invoice.bills.payed > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
//                                                         {invoice.bills.payed.toFixed(2)}
//                                                     </span>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                     <tfoot className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
//                                         <tr>
//                                             <td className="p-4 font-bold" colSpan={3}>Total</td>
//                                             <td className="p-4 font-bold">
//                                                 {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.total, 0).toFixed(2)}
//                                             </td>
//                                             <td className="p-4 font-bold">
//                                                 {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.tax, 0).toFixed(2)}
//                                             </td>
//                                             <td className="p-4 font-bold">
//                                                 {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.totalWithTax, 0).toFixed(2)}
//                                             </td>
//                                             <td className="p-4 font-bold">
//                                                 {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.payed, 0).toFixed(2)}
//                                             </td>
//                                         </tr>
//                                     </tfoot>
//                                 </table>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Summary Statistics */}
//                 {!loading && !error && customerInvoices.length > 0 && (
//                     <div className="p-5 border-t border-emerald-100 bg-emerald-50/50">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                                 <p className="text-sm text-emerald-600 font-medium mb-1">Total Amount</p>
//                                 <p className="text-xl font-bold text-emerald-900">
//                                     {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.totalWithTax, 0).toFixed(2)} SD
//                                 </p>
//                             </div>
//                             <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                                 <p className="text-sm text-emerald-600 font-medium mb-1">Total Tax</p>
//                                 <p className="text-xl font-bold text-emerald-900">
//                                     {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.tax, 0).toFixed(2)} SD
//                                 </p>
//                             </div>
//                             <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                                 <p className="text-sm text-emerald-600 font-medium mb-1">Total Paid</p>
//                                 <p className="text-xl font-bold text-emerald-600">
//                                     {customerInvoices.reduce((acc, invoice) => acc + invoice.bills.payed, 0).toFixed(2)} SD
//                                 </p>
//                             </div>
//                             <div className="bg-white rounded-lg p-4 border border-emerald-200">
//                                 <p className="text-sm text-emerald-600 font-medium mb-1">Remaining Balance</p>
//                                 <p className={`text-xl font-bold ${customerData.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
//                                     {customerData.balance.toFixed(2)} SD
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </motion.div>
//         </div>
//     );
// };

   
// export default OrdersDetails;


