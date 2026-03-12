import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaPrint, FaTimes, FaCheckCircle, FaHotel, FaUser, FaPhone } from 'react-icons/fa'
import hotel from '../../assets/images/solitair.png' 

const ExtraInvoice = ({orderInfo, setShowInvoice}) => {
    const navigate = useNavigate();
    
    const invoiceRef = useRef(null);

    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");

        WinPrint.document.write(` 
        <html>
            <head>
                <title>Solitaire Hotel - Services Statement</title>
                <style>
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
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
                    
                    .invoice-title {
                        font-size: 28px;
                        font-weight: bold;
                        color: #065f46;
                        margin-bottom: 8px;
                        text-align: center;
                    }
                    
                    .invoice-subtitle {
                        text-align: center;
                        color: #6b7280;
                        font-size: 14px;
                        margin-bottom: 30px;
                    }
                    
                    .customer-section {
                        background: #f0fdf4;
                        border: 1px solid #86efac;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #065f46;
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                    }
                    
                    .info-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                    }
                    
                    .info-icon {
                        color: #10b981;
                        font-size: 18px;
                        margin-top: 2px;
                    }
                    
                    .info-label {
                        font-size: 12px;
                        color: #6b7280;
                        margin-bottom: 2px;
                    }
                    
                    .info-value {
                        font-weight: 600;
                        color: #1f2937;
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
                        padding: 12px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 13px;
                    }
                    
                    tfoot tr {
                        background-color: #f0fdf4;
                        font-weight: 600;
                    }
                    
                    tfoot td {
                        border-top: 2px solid #10b981;
                        font-weight: 700;
                    }
                    
                    .text-right {
                        text-align: right;
                    }
                    
                    .summary-section {
                        background: #f0fdf4;
                        border: 1px solid #86efac;
                        border-radius: 12px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    
                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #86efac;
                    }
                    
                    .grand-total {
                        font-size: 18px;
                        font-weight: bold;
                        color: #065f46;
                        padding-top: 10px;
                        margin-top: 10px;
                        border-top: 2px solid #10b981;
                    }
                    
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                    }
                    
                    .footer p {
                        margin: 5px 0;
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
                <div class="invoice-container">
                    ${printContent}
                </div>
            </body>
        </html>
    `);
        WinPrint.document.close();
        WinPrint.focus();
        setTimeout(() => {
            WinPrint.print();
            WinPrint.close();
            navigate('/invoices');
        }, 1000);
    };
    

    const handleClose = () => {
        setShowInvoice(false);
        navigate('/invoices');
    };

    if (!orderInfo) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading services information...</p>
            </div>
        </div>
    );

    // Format date helper function
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-emerald-100"
            >
                {/* Action Buttons */}
                <div className="no-print bg-gradient-to-r from-emerald-600 to-green-600 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaHotel className="text-white text-xl" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Services Invoice</h2>
                            <p className="text-emerald-100 text-sm">Order #{orderInfo._id?.substring(0, 8) || ''}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                        >
                            <FaPrint />
                            <span>Print</span>
                        </button>
                        <button
                            onClick={handleClose}
                            className="bg-red-500/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                        >
                            <FaTimes />
                            <span>Close</span>
                        </button>
                    </div>
                </div>

                {/* Invoice Content for Display */}
                <div ref={invoiceRef} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="invoice-container" style={{ 
                        maxWidth: '100%', 
                        minHeight: 'auto', 
                        padding: '30px',
                        margin: '0',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Hotel Header */}
                        <div className="header" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            borderBottom: '2px solid #10b981',
                            paddingBottom: '20px',
                            marginBottom: '25px'
                        }}>
                            <div className="logo-container" style={{ width: '120px', height: '80px' }}>
                                <img src={hotel} alt="Solitaire Hotel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div className="hotel-info" style={{ textAlign: 'right' }}>
                                <h1 className="hotel-name" style={{ 
                                    fontSize: '24px', 
                                    fontWeight: 'bold', 
                                    color: '#065f46', 
                                    margin: '0 0 5px 0' 
                                }}>SOLITAIRE HOTEL</h1>
                                <p className="hotel-tagline" style={{ 
                                    color: '#6b7280', 
                                    fontSize: '14px', 
                                    margin: '0' 
                                }}>Luxury Redefined • Premium Hospitality</p>
                            </div>
                        </div>

                        {/* Invoice Title */}
                        <h2 className="invoice-title" style={{ 
                            fontSize: '28px', 
                            fontWeight: 'bold', 
                            color: '#065f46', 
                            textAlign: 'center', 
                            marginBottom: '8px' 
                        }}>SERVICES STATEMENT</h2>
                        <p className="invoice-subtitle" style={{ 
                            textAlign: 'center', 
                            color: '#6b7280', 
                            fontSize: '14px', 
                            marginBottom: '25px' 
                        }}>Invoice #{orderInfo._id?.substring(0, 8) || ''}</p>

                        {/* Customer Information */}
                        <div className="customer-section" style={{ 
                            background: '#f0fdf4', 
                            border: '1px solid #86efac', 
                            borderRadius: '12px', 
                            padding: '20px', 
                            marginBottom: '25px' 
                        }}>
                            <h3 className="section-title" style={{ 
                                fontSize: '18px', 
                                fontWeight: '600', 
                                color: '#065f46', 
                                marginBottom: '15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px' 
                            }}>
                                <FaUser size={18} style={{ color: '#10b981' }} />
                                Customer Information
                            </h3>
                            <div className="info-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '15px' 
                            }}>
                                <div className="info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <FaUser className="info-icon" style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }} />
                                    <div>
                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Name</p>
                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{orderInfo.customerDetails?.name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <FaPhone className="info-icon" style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }} />
                                    <div>
                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Phone</p>
                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{orderInfo.customerDetails?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <FaUser className="info-icon" style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }} />
                                    <div>
                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Email</p>
                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{orderInfo.customerDetails?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        {orderInfo.items && orderInfo.items.length > 0 && (
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse', 
                                margin: '20px 0' 
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Item</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Quantity</th>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Cost (SD)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderInfo.items.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>{item.name || 'Item'}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'right', fontWeight: '600' }}>{item.price?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: '#f0fdf4' }}>
                                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', borderTop: '2px solid #10b981' }} colSpan="2">Total Cost:</td>
                                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: '#065f46', textAlign: 'right', borderTop: '2px solid #10b981' }}>
                                            {orderInfo.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)} SD
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        )}

                        {/* Summary Section */}
                        <div className="summary-section" style={{ 
                            background: '#f0fdf4', 
                            border: '1px solid #86efac', 
                            borderRadius: '12px', 
                            padding: '20px', 
                            margin: '20px 0' 
                        }}>
                            <h3 className="section-title" style={{ 
                                fontSize: '18px', 
                                fontWeight: '600', 
                                color: '#065f46', 
                                marginBottom: '15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px' 
                            }}>Payment Summary</h3>
                            <div className="summary-row" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '8px 0', 
                                borderBottom: '1px solid #86efac' 
                            }}>
                                <span>Total Amount</span>
                                <span style={{ fontWeight: 600 }}>
                                    {orderInfo.items?.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)} SD
                                </span>
                            </div>
                            <div className="summary-row grand-total" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '8px 0',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#065f46',
                                borderTop: '2px solid #10b981',
                                marginTop: '10px',
                                paddingTop: '10px'
                            }}>
                                <span>Amount Due</span>
                                <span>{orderInfo.items?.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)} SD</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="footer" style={{ 
                            textAlign: 'center', 
                            marginTop: '30px', 
                            paddingTop: '20px', 
                            borderTop: '1px solid #e5e7eb',
                            color: '#6b7280',
                            fontSize: '12px'
                        }}>
                            <p style={{ margin: '5px 0' }}>This is a computer generated invoice</p>
                            <p style={{ margin: '5px 0' }}>Thank you for choosing Solitair Hotel</p>
                            <p style={{ margin: '5px 0', fontSize: '10px' }}>Generated on: {new Date().toLocaleDateString('en-GB', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExtraInvoice;

// import React, { useRef } from 'react'
// import { motion } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { FaPrint, FaTimes, FaCheckCircle, FaHotel } from 'react-icons/fa'
// import hotel from '../../assets/images/solitair.png' 

// const ExtraInvoice = ({orderInfo, setShowInvoice}) => {
//     const navigate = useNavigate();
    
//     const invoiceRef = useRef(null);

//     const handlePrint = () => {
//         const printContent = invoiceRef.current.innerHTML;
//         const WinPrint = window.open("", "", "width=900, height=650");

//         WinPrint.document.write(` 
//         <html>
//             <head>
//                 <title>Services Statement - Solitair Hotel</title>
//                 <style>
//                     @page {
//                         size: A4;
//                         margin: 1.5cm;
//                     }
//                     body { 
//                         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//                         padding: 0;
//                         margin: 0;
//                         background: white;
//                         color: #333;
//                         line-height: 1.5;
//                     }
//                     .print-container {
//                         max-width: 210mm;
//                         min-height: 297mm;
//                         margin: 0 auto;
//                         padding: 30px;
//                         background: white;
//                     }
//                     /* Header - Logo and Hotel name in one row */
//                     .header {
//                         display: flex;
//                         align-items: center;
//                         justify-content: space-between;
//                         margin-bottom: 25px;
//                         border-bottom: 2px solid #059669;
//                         padding-bottom: 15px;
//                     }
//                     .logo-container {
//                         width: 100px;
//                         height: 60px;
//                         overflow: hidden;
//                     }
//                     .logo-container img {
//                         width: 100%;
//                         height: 100%;
//                         object-fit: contain;
//                     }
//                     .hotel-info {
//                         text-align: right;
//                     }
//                     .hotel-name {
//                         font-size: 22px;
//                         font-weight: bold;
//                         color: #059669;
//                         margin: 0 0 3px 0;
//                     }
//                     .hotel-tagline {
//                         color: #6b7280;
//                         font-size: 11px;
//                         margin: 0;
//                     }
//                     /* Title */
//                     .title {
//                         text-align: center;
//                         margin-bottom: 20px;
//                     }
//                     .title h2 {
//                         font-size: 22px;
//                         font-weight: bold;
//                         color: #1f2937;
//                         margin: 0;
//                     }
//                     /* Customer section - all in one row */
//                     .customer-section {
//                         background: #f0fdf4;
//                         border-radius: 10px;
//                         padding: 15px;
//                         margin-bottom: 20px;
//                         border: 1px solid #86efac;
//                     }
//                     .customer-header {
//                         display: flex;
//                         align-items: center;
//                         gap: 8px;
//                         margin-bottom: 12px;
//                     }
//                     .customer-header h3 {
//                         font-size: 16px;
//                         font-weight: 600;
//                         color: #059669;
//                         margin: 0;
//                     }
//                     .customer-grid {
//                         display: flex;
//                         justify-content: space-between;
//                         gap: 20px;
//                     }
//                     .customer-item {
//                         flex: 1;
//                     }
//                     .customer-label {
//                         color: #6b7280;
//                         font-size: 11px;
//                         margin-bottom: 2px;
//                     }
//                     .customer-value {
//                         font-weight: 500;
//                         color: #1f2937;
//                         font-size: 13px;
//                     }
//                     /* Table */
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin: 15px 0;
//                     }
//                     th {
//                         background-color: #059669;
//                         color: white;
//                         padding: 10px;
//                         text-align: left;
//                         font-size: 12px;
//                         font-weight: 600;
//                     }
//                     td {
//                         padding: 8px 10px;
//                         border-bottom: 1px solid #e5e7eb;
//                         font-size: 11px;
//                     }
//                     tfoot tr {
//                         background-color: #f9fafb;
//                         font-weight: 600;
//                     }
//                     tfoot td {
//                         border-top: 2px solid #059669;
//                         font-weight: 700;
//                     }
//                     .text-right {
//                         text-align: right;
//                     }
//                     .text-green {
//                         color: #059669;
//                     }
//                     .footer {
//                         margin-top: 30px;
//                         text-align: center;
//                         font-size: 10px;
//                         color: #6b7280;
//                         border-top: 1px solid #e5e7eb;
//                         padding-top: 12px;
//                     }
//                     .footer p {
//                         margin: 2px 0;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="print-container">
//                     ${printContent}
//                 </div>
//             </body>
//         </html>
//     `);
//         WinPrint.document.close();
//         WinPrint.focus();
//         setTimeout(() => {
//             WinPrint.print();
//             WinPrint.close();
//             navigate('/invoices');
//         }, 1000);
//     };
    

//     const handleClose = () => {
//         setShowInvoice(false);
//         navigate('/invoices');
//     };

//     if (!orderInfo) return (
//         <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
//                 <p className="mt-2 text-gray-600">Loading services information...</p>
//             </div>
//         </div>
//     );

//     return (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
//                 transition={{ duration: 0.3, ease: 'easeInOut' }}
//                 className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
//             >
//                 {/* Modal Header */}
//                 <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <FaHotel className="text-white text-xl" />
//                         <h2 className="text-xl font-bold">Invoice Receipt</h2>
//                     </div>
//                     <button
//                         onClick={handleClose}
//                         className="p-2 hover:bg-white/20 rounded-lg transition-colors"
//                         aria-label="Close"
//                     >
//                         <FaTimes size={20} />
//                     </button>
//                 </div>

//                 {/* Scrollable Invoice Content */}
//                 <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
//                     <div 
//                         ref={invoiceRef} 
//                         className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
//                     >
//                         {/* Header with Logo - One Row */}
//                         <div className="flex items-center justify-between mb-6 border-b-2 border-green-200 pb-3">
//                             <div className="w-24 h-16 overflow-hidden">
//                                 <img 
//                                     src={hotel} 
//                                     alt="Hotel Logo" 
//                                     className="w-full h-full object-contain"
//                                 />
//                             </div>
//                             <div className="text-right">
//                                 <h1 className="text-xl font-bold text-green-700">Solitair Hotel</h1>
//                                 <p className="text-xs text-gray-500">Luxury & Comfort</p>
//                             </div>
//                         </div>

//                         {/* Invoice Title */}
//                         <div className="text-center mb-5">
//                             <h2 className="text-xl font-bold text-gray-800">STATEMENT RECEIPT</h2>
//                         </div>

//                         {/* Customer Details - All in One Row */}
//                         <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
//                             <div className="flex items-center gap-2 mb-3">
//                                 <FaCheckCircle className="text-green-600 text-sm" />
//                                 <h3 className="font-semibold text-green-700 text-sm">Customer Information</h3>
//                             </div>
//                             <div className="flex justify-between gap-4">
//                                 <div className="flex-1">
//                                     <p className="text-xs text-gray-500 mb-1">Name</p>
//                                     <p className="text-sm font-medium text-gray-800">{orderInfo.customerDetails?.name || 'N/A'}</p>
//                                 </div>
//                                 <div className="flex-1">
//                                     <p className="text-xs text-gray-500 mb-1">Phone</p>
//                                     <p className="text-sm font-medium text-gray-800">{orderInfo.customerDetails?.phone || 'N/A'}</p>
//                                 </div>
//                                 <div className="flex-1">
//                                     <p className="text-xs text-gray-500 mb-1">Email</p>
//                                     <p className="text-sm font-medium text-gray-800">{orderInfo.customerDetails?.email || 'N/A'}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Items Table */}
//                         {orderInfo.items && orderInfo.items.length > 0 && (
//                             <div className="mb-5">
//                                 <h3 className="text-sm font-semibold text-gray-700 mb-3">Items Ordered</h3>
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full border-collapse">
//                                         <thead>
//                                             <tr className="bg-green-600">
//                                                 <th className="p-2 text-left text-white text-xs">Item</th>
//                                                 <th className="p-2 text-center text-white text-xs">Qty</th>
//                                                 <th className="p-2 text-right text-white text-xs">Cost (SD)</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {orderInfo.items.map((item, index) => (
//                                                 <tr key={index} className="border-b border-gray-200">
//                                                     <td className="p-2 text-xs">{item.name || 'Item'}</td>
//                                                     <td className="p-2 text-center text-xs">{item.quantity}</td>
//                                                     <td className="p-2 text-right text-xs font-medium">{item.price?.toFixed(2)}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot>
//                                             <tr className="bg-gray-50">
//                                                 <td className="p-2 text-xs font-semibold text-gray-700" colSpan="2">Total Cost:</td>
//                                                 <td className="p-2 text-right text-xs font-bold text-green-600">
//                                                     {orderInfo.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)} SD
//                                                 </td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Footer */}
//                         <div className="mt-6 text-center text-gray-400 text-xs border-t border-gray-200 pt-3">
//                             <p className="mb-1">This is a computer generated invoice</p>
//                             <p className="mb-1">Thank you for choosing Solitair Hotel</p>
//                             <p>Date: {new Date().toLocaleDateString('en-GB', { 
//                                 day: '2-digit', 
//                                 month: '2-digit', 
//                                 year: 'numeric',
//                                 hour: '2-digit',
//                                 minute: '2-digit'
//                             })}</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Modal Footer */}
//                 <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
//                     <button
//                         onClick={handleClose}
//                         className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
//                     >
//                         <FaTimes />
//                         Close
//                     </button>
//                     <button
//                         onClick={handlePrint}
//                         className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
//                     >
//                         <FaPrint />
//                         Print 
//                     </button>
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default ExtraInvoice;

// import React, { useRef } from 'react'
// import { motion } from 'framer-motion'
// import { useNavigate } from 'react-router-dom'
// import { FaPrint, FaTimes, FaCheckCircle, FaHotel } from 'react-icons/fa'
// import hotel from '../../assets/images/solitair.png' 

// const ExtraInvoice = ({orderInfo, setShowInvoice}) => {
//     const navigate = useNavigate();
    
//     const invoiceRef = useRef(null);

//     const handlePrint = () => {
//         const printContent = invoiceRef.current.innerHTML;
//         const WinPrint = window.open("", "", "width=900, height=650");

//         WinPrint.document.write(` 
//         <html>
//             <head>
//                 <title>Services Statement</title>
//                 <style>
//                     @page {
//                         size: A4;
//                         margin: 1.5cm;
//                     }
//                     body { 
//                         font-family: 'Arial', sans-serif; 
//                         padding: 20px; 
//                         background: white;
//                         color: #333;
//                         line-height: 1.5;
//                         margin: 0;
//                     }
//                     .invoice-container { 
//                         max-width: 100%;
//                         margin: 0 auto;
//                     }
//                     /* Header styles matching component */
//                     .header {
//                         display: flex;
//                         align-items: center;
//                         justify-content: space-between;
//                         margin-bottom: 30px;
//                         border-bottom: 2px solid #059669;
//                         padding-bottom: 15px;
//                     }
//                     .logo-container {
//                         width: 120px;
//                         height: 80px;
//                         overflow: hidden;
//                     }
//                     .logo-container img {
//                         width: 100%;
//                         height: 100%;
//                         object-fit: contain;
//                     }
//                     .hotel-name {
//                         text-align: right;
//                     }
//                     .hotel-name h1 {
//                         color: #059669;
//                         font-size: 24px;
//                         margin-bottom: 5px;
//                     }
//                     .hotel-name p {
//                         color: #6b7280;
//                         font-size: 12px;
//                     }
//                     /* Title styles */
//                     h2 {
//                         color: #047857;
//                         font-size: 20px;
//                         text-align: center;
//                         margin-bottom: 20px;
//                     }
//                     /* Customer details grid */
//                     .customer-details {
//                         background: #f0fdf4;
//                         border-radius: 12px;
//                         padding: 20px;
//                         margin-bottom: 24px;
//                         border: 1px solid #86efac;
//                     }
//                     .customer-grid {
//                         display: grid;
//                         grid-template-columns: repeat(3, 1fr);
//                         gap: 16px;
//                     }
//                     .customer-item {
//                         margin-bottom: 0;
//                     }
//                     .customer-label {
//                         color: #6b7280;
//                         font-size: 12px;
//                         margin-bottom: 4px;
//                     }
//                     .customer-value {
//                         font-weight: 500;
//                         color: #1f2937;
//                         font-size: 14px;
//                     }
//                     /* Table styles */
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin: 20px 0;
//                     }
//                     th {
//                         background-color: #059669;
//                         color: white;
//                         padding: 12px;
//                         text-align: left;
//                         font-size: 13px;
//                     }
//                     td {
//                         padding: 10px 12px;
//                         border-bottom: 1px solid #e5e7eb;
//                         font-size: 12px;
//                     }
//                     tbody tr:hover {
//                         background-color: #f9fafb;
//                     }
//                     tfoot tr {
//                         background-color: #f9fafb;
//                         font-weight: 600;
//                     }
//                     tfoot td {
//                         border-top: 2px solid #059669;
//                     }
//                     .text-right {
//                         text-align: right;
//                     }
//                     .text-center {
//                         text-align: center;
//                     }
//                     .text-green-600 {
//                         color: #059669;
//                     }
//                     .font-bold {
//                         font-weight: 700;
//                     }
//                     /* Footer styles */
//                     .footer {
//                         margin-top: 40px;
//                         text-align: center;
//                         font-size: 10px;
//                         color: #6b7280;
//                         border-top: 1px solid #e5e7eb;
//                         padding-top: 15px;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="invoice-container">
//                     ${printContent}
//                 </div>
//             </body>
//         </html>
//     `);
//         WinPrint.document.close();
//         WinPrint.focus();
//         setTimeout(() => {
//             WinPrint.print();
//             WinPrint.close();
//             navigate('/invoices');
//         }, 1000);
//     };
    

//     const handleClose = () => {
//         setShowInvoice(false);
//         navigate('/invoices');
//     };

//     if (!orderInfo) return (
//         <div className="flex items-center justify-center h-64">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
//                 <p className="mt-2 text-gray-600">Loading services information...</p>
//             </div>
//         </div>
//     );

//     return (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
//                 transition={{ duration: 0.3, ease: 'easeInOut' }}
//                 className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
//             >
//                 {/* Modal Header */}
//                 <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <FaHotel className="text-white text-xl" />
//                         <h2 className="text-xl font-bold">Invoice Receipt</h2>
//                     </div>
//                     <button
//                         onClick={handleClose}
//                         className="p-2 hover:bg-white/20 rounded-lg transition-colors"
//                         aria-label="Close"
//                     >
//                         <FaTimes size={20} />
//                     </button>
//                 </div>

//                 {/* Scrollable Invoice Content */}
//                 <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
//                     <div 
//                         ref={invoiceRef} 
//                         className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
//                         style={{ 
//                             minHeight: '297mm',
//                             width: '210mm',
//                             margin: '0 auto',
//                             boxSizing: 'border-box'
//                         }}
//                     >
//                         {/* START ... Header with Logo */}
//                         <div className="flex items-center justify-between mb-8 border-b-2 border-green-200 pb-2">
//                             <div className="w-32 h-15 overflow-hidden">
//                                 <img 
//                                     src={hotel} 
//                                     alt="Hotel Logo" 
//                                     className="w-full h-full object-contain"
//                                 />
//                             </div>
//                             <div className="text-right">
//                                 <h1 className="text-2xl font-bold text-green-700">Solitair Hotel</h1>
//                                 <p className="text-sm text-gray-500">Luxury & Comfort</p>
//                             </div>
//                         </div>
//                         {/* END ... Header with Logo */}

//                         {/* Invoice Title */}
//                         <div className="text-center mb-6">
//                             <h2 className="text-2xl font-bold text-gray-800 mb-2">STATEMENT RECEIPT</h2>
//                             {/* <div className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
//                                 #{orderInfo._id?.slice(-8) || 'N/A'}
//                             </div> */}
//                         </div>

//                         {/* Customer Details */}
//                         <div className="bg-green-50 rounded-xl p-5 mb-6 border border-green-200">
//                             <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
//                                 <FaCheckCircle className="text-green-600" />
//                                 Customer Information
//                             </h3>
//                             <div className="grid grid-cols-3 gap-4 text-sm">
//                                 <div>
//                                     <p className="text-gray-500">Name</p>
//                                     <p className="font-medium text-gray-800">{orderInfo.customerDetails?.name || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500">Phone</p>
//                                     <p className="font-medium text-gray-800">{orderInfo.customerDetails?.phone || 'N/A'}</p>
//                                 </div>
                                
//                                 <div>
//                                     <p className="text-gray-500">Phone</p>
//                                     <p className="font-medium text-gray-800">{orderInfo.customerDetails?.email || 'N/A'}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Items Table */}
//                         {orderInfo.items && orderInfo.items.length > 0 && (
//                             <div className="mb-8">
//                                 <h3 className="font-semibold text-gray-700 mb-4">Items Ordered</h3>
//                                 <table className="w-full border-collapse">
//                                     <thead>
//                                         <tr className="bg-green-600 text-white">
//                                             <th className="p-3 text-left text-sm">Item</th>
//                                             <th className="p-3 text-center text-sm">Quantity</th>
//                                             <th className="p-3 text-right text-sm">Cost</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {orderInfo.items.map((item, index) => (
//                                             <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
//                                                 <td className="p-3 text-sm">{item.name || 'Item'}</td>
//                                                 <td className="p-3 text-center text-sm">{item.quantity}</td>
//                                                 <td className="p-3 text-right text-sm">{item.price?.toFixed(2)} SD</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                     <tfoot>
//                                         <tr className="bg-gray-50 font-semibold">
//                                             <td className="p-3 text-sm text-gray-700" colSpan="2">Total Cost:</td>
//                                             <td className="p-3 text-right text-sm text-green-600 font-bold">
//                                                 {orderInfo.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)} SD
//                                             </td>
//                                         </tr>
//                                     </tfoot>
//                                 </table>
//                             </div>
//                         )}

//                         {/* Footer */}
//                         <div className="mt-12 text-center text-gray-400 text-xs border-t border-gray-200 pt-6">
//                             <p>This is a computer generated invoice</p>
//                             <p className="mt-1">Thank you for choosing Solitair Hotel</p>
//                             <p className="mt-2">Date: {new Date().toLocaleDateString('en-GB')}</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Modal Footer */}
//                 <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
//                     <button
//                         onClick={handleClose}
//                         className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
//                     >
//                         <FaTimes />
//                         Close
//                     </button>
//                     <button
//                         onClick={handlePrint}
//                         className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
//                     >
//                         <FaPrint />
//                         Print 
//                     </button>
//                 </div>
//             </motion.div>
//         </div>
//     );
// };

// export default ExtraInvoice;
