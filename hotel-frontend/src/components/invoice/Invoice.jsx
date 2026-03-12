import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { FaPrint, FaTimes, FaHotel, FaPhone, FaUser, FaCalendar, FaMoneyBill, FaCreditCard, FaReceipt } from 'react-icons/fa';
import hotel from '../../assets/images/solitair.png' 

const Invoice = ({ orderInfo, setShowInvoice }) => {
    const invoiceRef = useRef(null);
    
    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        
        const printWindow = window.open('', '_blank', 'width=900,height=650');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Solitaire Hotel - Invoice #${orderInfo?._id?.substring(0, 8) || ''}</title>
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
                        
                        .dates-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            margin-top: 15px;
                            padding-top: 15px;
                            border-top: 1px solid #86efac;
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
                        
                        .price-tag {
                            background: #d1fae5;
                            color: #065f46;
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 600;
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
                        
                        .payment-section {
                            border: 1px solid #86efac;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        
                        .payment-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                        }
                        
                        .status-badge {
                            background: #d1fae5;
                            color: #065f46;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                        }
                        
                        .thank-you {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                        }
                        
                        .thank-you h3 {
                            color: #065f46;
                            font-size: 18px;
                            margin-bottom: 10px;
                        }
                        
                        .thank-you p {
                            color: #6b7280;
                            font-size: 12px;
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
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };

    const handleClose = () => {
        setShowInvoice(false);
    };

    if (!orderInfo) {
        return (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50'>
                <div className='bg-white p-8 rounded-2xl shadow-2xl'>
                    <p className='text-emerald-600'>Loading receipt...</p>
                </div>
            </div>
        );
    }

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
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto'>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-emerald-100'
            >
                {/* Action Buttons */}
                <div className="no-print bg-gradient-to-r from-emerald-600 to-green-600 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FaReceipt className="text-white" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-white">Booking Invoice</h2>
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
                        }}>BOOKING INVOICE</h2>
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
                                Guest Information
                            </h3>
                            <div className="info-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '15px' 
                            }}>
                                <div className="info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <FaUser className="info-icon" style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }} />
                                    <div>
                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Guest Name</p>
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
                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>ID Number</p>
                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{orderInfo.customerDetails?.Idnumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="dates-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '15px', 
                                marginTop: '15px', 
                                paddingTop: '15px', 
                                borderTop: '1px solid #86efac' 
                            }}>
                                <div>
                                    <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Check-in Date</p>
                                    <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{formatDate(orderInfo.dateBooking)}</p>
                                </div>
                                <div>
                                    <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Check-out Date</p>
                                    <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{formatDate(orderInfo.dateReturn)}</p>
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
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Room/Service</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Rate Type</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Nights</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Rate/Night (SD)</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Total (SD)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderInfo.items.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>
                                                <div style={{ fontWeight: 600 }}>{item.name || 'Room'}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                    {item.seats ? `${item.seats} Seats` : 'Standard Room'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>
                                                <span className="price-tag" style={{ 
                                                    background: '#d1fae5', 
                                                    color: '#065f46', 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '11px', 
                                                    fontWeight: '600' 
                                                }}>
                                                    {item.priceType === 'priceTow' ? 'Premium' : 'Standard'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>{item.quantity || 0}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>{(item.pricePerQuantity || 0).toFixed(2)}</td>
                                            <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', fontWeight: 600, color: '#065f46' }}>{(item.price || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
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
                                <span style={{ fontWeight: 600 }}>{(orderInfo.bills?.totalWithTax || 0).toFixed(2)} SD</span>
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
                                <span>{(orderInfo.bills?.totalWithTax || 0).toFixed(2)} SD</span>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="payment-section" style={{ 
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
                            }}>Payment Information</h3>
                            <div className="payment-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(2, 1fr)', 
                                gap: '15px' 
                            }}>
                                <div>
                                    <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Payment Method</p>
                                    <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{orderInfo.paymentMethod || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Amount Paid</p>
                                    <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{(orderInfo.bills?.payed || 0).toFixed(2)} SD</p>
                                </div>
                                <div>
                                    <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Balance</p>
                                    <p className="info-value" style={{ 
                                        fontWeight: '600', 
                                        color: (orderInfo.bills?.balance || 0) > 0 ? '#dc2626' : '#065f46' 
                                    }}>
                                        {(orderInfo.bills?.balance || 0).toFixed(2)} SD
                                    </p>
                                </div>
                                <div>
                                    <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Status</p>
                                    <span className="status-badge" style={{ 
                                        background: '#d1fae5', 
                                        color: '#065f46', 
                                        padding: '4px 12px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px', 
                                        fontWeight: '600' 
                                    }}>{orderInfo.orderStatus || 'Confirmed'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thank You Message */}
                        <div className="thank-you" style={{ 
                            textAlign: 'center', 
                            marginTop: '30px', 
                            paddingTop: '20px', 
                            borderTop: '1px solid #e5e7eb' 
                        }}>
                            <h3 style={{ color: '#065f46', fontSize: '18px', marginBottom: '10px' }}>Thank You for Choosing Solitaire Hotel!</h3>
                            <p style={{ color: '#6b7280', fontSize: '12px' }}>We appreciate your business and look forward to serving you.</p>
                            <p style={{ marginTop: '10px', color: '#6b7280', fontSize: '12px' }}>For any inquiries, please contact: +1 234 567 8900</p>
                            <p style={{ marginTop: '5px', fontSize: '10px', color: '#9ca3af' }}>Invoice generated on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Invoice;
