import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../https';
import { 
    FaArrowLeft, FaFileInvoice, FaUser, FaPhone, 
    FaEnvelope, FaMapMarkerAlt, FaCalendar, FaHashtag,
    FaMoneyBillWave, FaCreditCard, FaPrint, FaDownload,
    FaEdit, FaHome, FaUsers, FaIdCard, FaClock, FaReceipt
} from 'react-icons/fa';
import { MdOutlinePayment, MdOutlineReceipt } from 'react-icons/md';
import { BsFillCalendarCheckFill, BsFillCalendarXFill } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import hotel from '../assets/images/solitair.png' 

const InvDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const billPrintRef = useRef(null);
    const itemsPrintRef = useRef(null);
  
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [generatingBill, setGeneratingBill] = useState(false);
    const [showFinalBill, setShowFinalBill] = useState(false);
    const [taxRecord, setTaxRecord] = useState(null);

    // Fetch order details
    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/order/${id}`);
            
            if (response.data.success) {
                setOrder(response.data.data);
                console.log('Order fetched:', response.data.data);
            } else {
                toast.error('Failed to fetch order details');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Error loading order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Handle Final Bill generation
    const handleFinalBill = async () => {
        if (!order) return;

        setGeneratingBill(true);
        try {
            // Calculate tax (17% fixed)
            const taxRate = 17;
            const orderValue = order.bills?.total || 0;
            const taxValue = (orderValue * taxRate) / 100;

            const taxData = {
                order: order._id,
                orderValue: orderValue,
                tax: `${taxRate}% VAT`,
                taxValue: taxValue,
            };

            console.log('Sending tax data:', taxData);

            const response = await api.post('/api/taxes', taxData);

            if (response.data.success) {
                setTaxRecord(response.data.data);
                setShowFinalBill(true);
                toast.success('Final bill generated successfully!');
            } else {
                toast.error('Failed to generate final bill');
            }
        } catch (error) {
            console.error('Error generating final bill:', error);
            toast.error(error.response?.data?.message || 'Error generating final bill');
        } finally {
            setGeneratingBill(false);
        }
    };

    // Handle print final bill
    const handlePrintFinalBill = () => {
        if (!taxRecord) return;
        
        const printContent = billPrintRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");
        
        WinPrint.document.write(` 
            <html>
                <head>
                    <title>Solitaire Hotel - Final Bill ${taxRecord.taxNumber}</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 0;
                            padding: 20px;
                            background: white;
                            color: #333;
                            line-height: 1.5;
                        }
                        
                        .bill-container { 
                            max-width: 210mm; 
                            min-height: 297mm; 
                            margin: 0 auto; 
                            background: white;
                        }
                        
                        .header { 
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            border-bottom: 2px solid #10b981; 
                            padding-bottom: 20px; 
                            margin-bottom: 25px;
                        }
                        
                        .logo-container {
                            width: 120px;
                            height: 80px;
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
                            margin: 0;
                        }
                        
                        .hotel-tagline {
                            color: #6b7280;
                            font-size: 14px;
                            margin: 5px 0 0 0;
                        }
                        
                        .bill-title {
                            font-size: 28px;
                            font-weight: bold;
                            color: #065f46;
                            text-align: center;
                            margin-bottom: 25px;
                            letter-spacing: 1px;
                        }
                        
                        .tax-info {
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 20px;
                        }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                        }
                        
                        .info-item {
                            margin-bottom: 0;
                        }
                        
                        .info-label {
                            font-size: 12px;
                            color: #6b7280;
                            margin-bottom: 4px;
                            font-weight: 500;
                        }
                        
                        .info-value {
                            font-weight: 600;
                            color: #1f2937;
                            font-size: 14px;
                        }
                        
                        .details-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            background: #f9fafb;
                            padding: 20px;
                            border-radius: 8px;
                            margin-bottom: 25px;
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
                            font-weight: 600;
                        }
                        
                        td {
                            padding: 10px 12px;
                            border-bottom: 1px solid #e5e7eb;
                            font-size: 12px;
                        }
                        
                        tfoot tr {
                            background-color: #f0fdf4;
                        }
                        
                        tfoot td {
                            border-top: 2px solid #10b981;
                            font-weight: 600;
                        }
                        
                        .total-section {
                            margin-top: 25px;
                            padding: 20px;
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 8px;
                        }
                        
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            font-size: 14px;
                        }
                        
                        .grand-total {
                            font-size: 18px;
                            font-weight: bold;
                            color: #065f46;
                            border-top: 2px solid #10b981;
                            margin-top: 10px;
                            padding-top: 10px;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 11px;
                            border-top: 1px solid #e5e7eb;
                            padding-top: 20px;
                        }
                        
                        .footer p {
                            margin: 5px 0;
                        }
                        
                        .text-right {
                            text-align: right;
                        }
                        
                        .font-bold {
                            font-weight: 700;
                        }
                        
                        .text-green {
                            color: #065f46;
                        }
                        
                        @media print {
                            body { 
                                padding: 0; 
                                background: white;
                            }
                            .bill-container {
                                box-shadow: none;
                                padding: 0;
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
        }, 1000);
    };

    // Handle print items
    const handlePrintItems = () => {
        const printContent = itemsPrintRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");
        
        WinPrint.document.write(` 
            <html>
                <head>
                    <title>Solitaire Hotel - Order Items</title>
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
                        
                        .text-center {
                            text-align: center;
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
        }, 1000);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return Number(amount || 0).toFixed(2);
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const statusMap = {
            'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
            'Checked In': 'bg-blue-100 text-blue-700 border-blue-200',
            'Checked Out': 'bg-green-100 text-green-700 border-green-200',
            'Cancel': 'bg-red-100 text-red-700 border-red-200',
            'Completed': 'bg-green-100 text-green-700 border-green-200',
            'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Calculate total cost of items
    const totalItemsCost = order?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h3>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const orderValue = order.bills?.total || 0;
    const taxRate = 17;
    const taxAmount = (orderValue * taxRate) / 100;
    const totalWithTax = order.bills?.totalWithTax || 0;

    return (
        <div className="min-h-screen w-full bg-gray-50" dir="ltr">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 text-white"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaFileInvoice className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Order Details</h1>
                                <p className="text-green-100 text-sm">Order #{order.orderNo || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleFinalBill}
                                disabled={generatingBill}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md ${
                                    generatingBill 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-white text-green-700 hover:bg-green-50'
                                }`}
                            >
                                {generatingBill ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <MdOutlineReceipt />
                                        <span>Final Bill</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Status Badge */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Order Status:</span>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(order.orderStatus)}`}>
                            {order.orderStatus || 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaClock />
                        <span>Last updated: {formatDate(order.updatedAt)}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'details' 
                                    ? 'border-green-500 text-green-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Order Details
                        </button>
                        <button
                            onClick={() => setActiveTab('items')}
                            className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'items' 
                                    ? 'border-green-500 text-green-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Items {order.items?.length > 0 && `(${order.items.length})`}
                        </button>
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'billing' 
                                    ? 'border-green-500 text-green-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Billing Information
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaUser className="text-green-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Name</p>
                                        <p className="font-medium text-gray-800">
                                            {order.customerDetails?.name || order.customer?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                        <p className="font-medium text-gray-800">
                                            {order.customerDetails?.email || order.customer?.email || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                                        <p className="font-medium text-gray-800">
                                            {order.customerDetails?.phone || order.customer?.phone || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Guests</p>
                                        <p className="font-medium text-gray-800">
                                            {order.customerDetails?.guests || order.guests || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">ID Number</p>
                                        <p className="font-medium text-gray-800">
                                            {order.customerDetails?.Idnumber || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                        <p className="text-xs text-gray-500 mb-1">Address</p>
                                        <p className="font-medium text-gray-800">
                                            {order.customerDetails?.address || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Information */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaCalendar className="text-green-600" />
                                    Booking Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-xs text-blue-600 mb-1">Check In</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatDate(order.dateBooking)}
                                        </p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-lg">
                                        <p className="text-xs text-amber-600 mb-1">Check Out</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatDate(order.dateReturn)}
                                        </p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <p className="text-xs text-purple-600 mb-1">Booking Days</p>
                                        <p className="font-semibold text-gray-800">
                                            {order.bookingDays || 'N/A'} days
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <p className="text-xs text-emerald-600 mb-1">Seats</p>
                                        <p className="font-semibold text-gray-800">
                                            {order.seats || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Information */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaHashtag className="text-green-600" />
                                    Order Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Order Number</p>
                                        <p className="font-medium text-gray-800">{order.orderNo || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Order Type</p>
                                        <p className="font-medium text-gray-800">{order.orderType || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Shift</p>
                                        <p className="font-medium text-gray-800">{order.shift || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Order Date</p>
                                        <p className="font-medium text-gray-800">{formatDate(order.orderDate)}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">Room</p>
                                        <p className="font-medium text-gray-800">
                                            {order.room?.roomNumber || order.room || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-1">User</p>
                                        <p className="font-medium text-gray-800">
                                            {order.user?.name || order.user || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    Order Items
                                </h3>
                                <button
                                    onClick={handlePrintItems}
                                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <FaPrint />
                                    <span>Print Items</span>
                                </button>
                            </div>
                            {order.items && order.items.length > 0 ? (
                                <>
                                    {/* Hidden printable content */}
                                    <div ref={itemsPrintRef} className="hidden">
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

                                        <h2 className="invoice-title" style={{ 
                                            fontSize: '28px', 
                                            fontWeight: 'bold', 
                                            color: '#065f46', 
                                            textAlign: 'center', 
                                            marginBottom: '8px' 
                                        }}>ORDER ITEMS</h2>
                                        <p className="invoice-subtitle" style={{ 
                                            textAlign: 'center', 
                                            color: '#6b7280', 
                                            fontSize: '14px', 
                                            marginBottom: '25px' 
                                        }}>Order #{order.orderNo || 'N/A'}</p>

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
                                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{order.customerDetails?.name || order.customer?.name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                    <FaPhone className="info-icon" style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }} />
                                                    <div>
                                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Phone</p>
                                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{order.customerDetails?.phone || order.customer?.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="info-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                    <FaUser className="info-icon" style={{ color: '#10b981', fontSize: '18px', marginTop: '2px' }} />
                                                    <div>
                                                        <p className="info-label" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>ID Number</p>
                                                        <p className="info-value" style={{ fontWeight: '600', color: '#1f2937' }}>{order.customerDetails?.Idnumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <table style={{ 
                                            width: '100%', 
                                            borderCollapse: 'collapse', 
                                            margin: '20px 0' 
                                        }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>#</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Item</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Quantity</th>
                                                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px' }}>Cost (SD)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>{index + 1}</td>
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' }}>{item.name || item.product?.name || 'Item'}</td>
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'center' }}>{item.quantity || 0}</td>
                                                        <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(item.price)} SD</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ backgroundColor: '#f0fdf4' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', borderTop: '2px solid #10b981' }} colSpan="3">Total Cost:</td>
                                                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: '700', color: '#065f46', textAlign: 'right', borderTop: '2px solid #10b981' }}>
                                                        {formatCurrency(totalItemsCost)} SD
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>

                                        <div className="footer" style={{ 
                                            textAlign: 'center', 
                                            marginTop: '30px', 
                                            paddingTop: '20px', 
                                            borderTop: '1px solid #e5e7eb',
                                            color: '#6b7280',
                                            fontSize: '12px'
                                        }}>
                                            <p style={{ margin: '5px 0' }}>This is a computer generated items list</p>
                                            <p style={{ margin: '5px 0' }}>Generated on: {new Date().toLocaleDateString('en-GB', { 
                                                day: '2-digit', 
                                                month: '2-digit', 
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>

                                    {/* Visible table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border p-3 text-left">#</th>
                                                    <th className="border p-3 text-left">Item</th>
                                                    <th className="border p-3 text-center">Quantity</th>
                                                    <th className="border p-3 text-right">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="border p-3">{index + 1}</td>
                                                        <td className="border p-3">{item.name || item.product?.name || 'Item'}</td>
                                                        <td className="border p-3 text-center">{item.quantity || 0}</td>
                                                        <td className="border p-3 text-right">{formatCurrency(item.price)} SD</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-green-50 font-semibold">
                                                    <td className="border p-3" colSpan={3}>Total Cost:</td>
                                                    <td className="border p-3 text-right font-bold text-green-600">
                                                        {formatCurrency(totalItemsCost)} SD
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No items found for this order</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaMoneyBillWave className="text-green-600" />
                                Billing Summary
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Payment Information */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="font-medium text-gray-700 mb-4">Payment Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <span className="font-medium text-gray-800 flex items-center gap-1">
                                                <FaCreditCard className="text-green-600" />
                                                {order.paymentMethod || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Payment Amount:</span>
                                            <span className="font-medium text-gray-800">
                                                {formatCurrency(order.payment)} SD
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bill Summary */}
                                <div className="bg-green-50 rounded-xl p-6">
                                    <h4 className="font-medium text-green-700 mb-4">Bill Summary</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium text-gray-800">
                                                {formatCurrency(order.bills?.total)} SD
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Tax (17%):</span>
                                            <span className="font-medium text-gray-800">
                                                {formatCurrency(taxAmount)} SD
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-green-200">
                                            <span className="font-semibold text-gray-800">Total:</span>
                                            <span className="font-bold text-lg text-green-700">
                                                {formatCurrency(order.bills?.totalWithTax)} SD
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-gray-600">Paid:</span>
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(order.bills?.payed)} SD
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Balance:</span>
                                            <span className={`font-medium ${order.bills?.balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(order.bills?.balance)} SD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Bill Modal */}
            {showFinalBill && taxRecord && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FaReceipt className="text-white text-xl" />
                                <h2 className="text-xl font-bold">Final Bill</h2>
                            </div>
                            <button
                                onClick={() => setShowFinalBill(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                        </div>

                        {/* Bill Content - Printable */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div ref={billPrintRef} className="bg-white">
                                {/* Header with Logo */}
                                <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #10b981', paddingBottom: '20px', marginBottom: '25px' }}>
                                    <div className="logo-container" style={{ width: '120px', height: '80px' }}>
                                        <img src={hotel} alt="Solitaire Hotel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div className="hotel-info" style={{ textAlign: 'right' }}>
                                        <div className="hotel-name" style={{ fontSize: '24px', fontWeight: 'bold', color: '#065f46', margin: 0 }}>SOLITAIRE HOTEL</div>
                                        <div className="hotel-tagline" style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0 0 0' }}>Luxury Redefined • Premium Hospitality</div>
                                    </div>
                                </div>

                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#065f46', textAlign: 'center', marginBottom: '25px', letterSpacing: '1px' }}>FINAL BILL</div>

                                {/* Tax Info */}
                                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Tax Number</div>
                                            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{taxRecord.taxNumber}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Tax Date</div>
                                            <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{formatDate(taxRecord.taxDate)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Order Number</div>
                                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{order.orderNo || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Customer Name</div>
                                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{order.customerDetails?.name || order.customer?.name || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Room</div>
                                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{order.room?.roomNumber || order.room || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Booking Period</div>
                                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                                            {formatDate(order.dateBooking)} - {formatDate(order.dateReturn)}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                {order.items && order.items.length > 0 && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Item</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Qty</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Price</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>{item.name || item.product?.name || 'Item'}</td>
                                                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>{item.quantity || 0}</td>
                                                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'right' }}>{formatCurrency(item.price)} SD</td>
                                                    <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'right' }}>{formatCurrency(item.price * (item.quantity || 1))} SD</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ backgroundColor: '#f0fdf4' }}>
                                                <td colSpan="3" style={{ padding: '10px 12px', borderTop: '2px solid #10b981', textAlign: 'right', fontWeight: '600' }}>Total:</td>
                                                <td style={{ padding: '10px 12px', borderTop: '2px solid #10b981', textAlign: 'right', fontWeight: '600', color: '#065f46' }}>
                                                    {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))} SD
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}

                                {/* Tax Calculation */}
                                <div style={{ marginTop: '25px', padding: '20px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(taxRecord.orderValue)} SD</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
                                        <span>Tax ({taxRecord.tax}):</span>
                                        <span>{formatCurrency(taxRecord.taxValue)} SD</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#065f46', borderTop: '2px solid #10b981', marginTop: '10px', paddingTop: '10px' }}>
                                        <span>Total Amount:</span>
                                        <span>{formatCurrency(taxRecord.orderValue + taxRecord.taxValue)} SD</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '11px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
                                    <p style={{ margin: '5px 0' }}>This is a computer generated tax invoice</p>
                                    <p style={{ margin: '5px 0' }}>Thank you for choosing Solitaire Hotel!</p>
                                    <p style={{ margin: '5px 0' }}>Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowFinalBill(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrintFinalBill}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <FaPrint />
                                Print Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvDetails;

// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { api } from '../https';
// import { 
//     FaArrowLeft, FaFileInvoice, FaUser, FaPhone, 
//     FaEnvelope, FaMapMarkerAlt, FaCalendar, FaHashtag,
//     FaMoneyBillWave, FaCreditCard, FaPrint, FaDownload,
//     FaEdit, FaHome, FaUsers, FaIdCard, FaClock, FaReceipt
// } from 'react-icons/fa';
// import { MdOutlinePayment, MdOutlineReceipt } from 'react-icons/md';
// import { BsFillCalendarCheckFill, BsFillCalendarXFill } from 'react-icons/bs';
// import { toast } from 'react-hot-toast';
// import hotel from '../assets/images/solitair.png' 

// const InvDetails = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const billPrintRef = useRef(null);
  
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('details');
//     const [generatingBill, setGeneratingBill] = useState(false);
//     const [showFinalBill, setShowFinalBill] = useState(false);
//     const [taxRecord, setTaxRecord] = useState(null);

//     // Fetch order details
//     const fetchOrderDetails = async () => {
//         setLoading(true);
//         try {
//             const response = await api.get(`/api/order/${id}`);
            
//             if (response.data.success) {
//                 setOrder(response.data.data);
//                 console.log('Order fetched:', response.data.data);
//             } else {
//                 toast.error('Failed to fetch order details');
//             }
//         } catch (error) {
//             console.error('Error fetching order:', error);
//             toast.error('Error loading order details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (id) {
//             fetchOrderDetails();
//         }
//     }, [id]);

//     // Handle back navigation
//     const handleBack = () => {
//         navigate(-1);
//     };

//     // Handle Final Bill generation
//     const handleFinalBill = async () => {
//         if (!order) return;

//         setGeneratingBill(true);
//         try {
//             // Calculate tax (17% fixed)
//             const taxRate = 17;
//             const orderValue = order.bills?.total || 0;
//             const taxValue = (orderValue * taxRate) / 100;

//             const taxData = {
//                 order: order._id,
//                 orderValue: orderValue,
//                 tax: `${taxRate}% VAT`,
//                 taxValue: taxValue,
//             };

//             console.log('Sending tax data:', taxData);

//             const response = await api.post('/api/taxes', taxData);

//             if (response.data.success) {
//                 setTaxRecord(response.data.data);
//                 setShowFinalBill(true);
//                 toast.success('Final bill generated successfully!');
//             } else {
//                 toast.error('Failed to generate final bill');
//             }
//         } catch (error) {
//             console.error('Error generating final bill:', error);
//             toast.error(error.response?.data?.message || 'Error generating final bill');
//         } finally {
//             setGeneratingBill(false);
//         }
//     };

//     // Handle print final bill
//     const handlePrintFinalBill = () => {
//         if (!taxRecord) return;
        
//         const printContent = billPrintRef.current.innerHTML;
//         const WinPrint = window.open("", "", "width=900, height=650");
        
//         WinPrint.document.write(` 
//             <html>
//                 <head>
//                     <title>Solitaire Hotel - Final Bill ${taxRecord.taxNumber}</title>
//                     <style>
//                         @page {
//                             size: A4;
//                             margin: 1.5cm;
//                         }
                        
//                         body { 
//                             font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
//                             margin: 0;
//                             padding: 20px;
//                             background: white;
//                             color: #333;
//                             line-height: 1.5;
//                         }
                        
//                         .bill-container { 
//                             max-width: 210mm; 
//                             min-height: 297mm; 
//                             margin: 0 auto; 
//                             background: white;
//                         }
                        
//                         .header { 
//                             display: flex;
//                             align-items: center;
//                             justify-content: space-between;
//                             border-bottom: 2px solid #10b981; 
//                             padding-bottom: 20px; 
//                             margin-bottom: 25px;
//                         }
                        
//                         .logo-container {
//                             width: 120px;
//                             height: 80px;
//                         }
                        
//                         .logo-container img {
//                             width: 100%;
//                             height: 100%;
//                             object-fit: contain;
//                         }
                        
//                         .hotel-info {
//                             text-align: right;
//                         }
                        
//                         .hotel-name {
//                             font-size: 24px;
//                             font-weight: bold;
//                             color: #065f46;
//                             margin: 0;
//                         }
                        
//                         .hotel-tagline {
//                             color: #6b7280;
//                             font-size: 14px;
//                             margin: 5px 0 0 0;
//                         }
                        
//                         .bill-title {
//                             font-size: 28px;
//                             font-weight: bold;
//                             color: #065f46;
//                             text-align: center;
//                             margin-bottom: 25px;
//                             letter-spacing: 1px;
//                         }
                        
//                         .tax-info {
//                             background: #f0fdf4;
//                             border: 1px solid #86efac;
//                             border-radius: 8px;
//                             padding: 15px;
//                             margin-bottom: 20px;
//                         }
                        
//                         .info-grid {
//                             display: grid;
//                             grid-template-columns: repeat(2, 1fr);
//                             gap: 15px;
//                         }
                        
//                         .info-item {
//                             margin-bottom: 0;
//                         }
                        
//                         .info-label {
//                             font-size: 12px;
//                             color: #6b7280;
//                             margin-bottom: 4px;
//                             font-weight: 500;
//                         }
                        
//                         .info-value {
//                             font-weight: 600;
//                             color: #1f2937;
//                             font-size: 14px;
//                         }
                        
//                         .details-grid {
//                             display: grid;
//                             grid-template-columns: repeat(2, 1fr);
//                             gap: 15px;
//                             background: #f9fafb;
//                             padding: 20px;
//                             border-radius: 8px;
//                             margin-bottom: 25px;
//                         }
                        
//                         table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin: 20px 0;
//                         }
                        
//                         th {
//                             background-color: #10b981;
//                             color: white;
//                             padding: 12px;
//                             text-align: left;
//                             font-size: 13px;
//                             font-weight: 600;
//                         }
                        
//                         td {
//                             padding: 10px 12px;
//                             border-bottom: 1px solid #e5e7eb;
//                             font-size: 12px;
//                         }
                        
//                         tfoot tr {
//                             background-color: #f0fdf4;
//                         }
                        
//                         tfoot td {
//                             border-top: 2px solid #10b981;
//                             font-weight: 600;
//                         }
                        
//                         .total-section {
//                             margin-top: 25px;
//                             padding: 20px;
//                             background: #f0fdf4;
//                             border: 1px solid #86efac;
//                             border-radius: 8px;
//                         }
                        
//                         .total-row {
//                             display: flex;
//                             justify-content: space-between;
//                             padding: 8px 0;
//                             font-size: 14px;
//                         }
                        
//                         .grand-total {
//                             font-size: 18px;
//                             font-weight: bold;
//                             color: #065f46;
//                             border-top: 2px solid #10b981;
//                             margin-top: 10px;
//                             padding-top: 10px;
//                         }
                        
//                         .footer {
//                             margin-top: 40px;
//                             text-align: center;
//                             color: #6b7280;
//                             font-size: 11px;
//                             border-top: 1px solid #e5e7eb;
//                             padding-top: 20px;
//                         }
                        
//                         .footer p {
//                             margin: 5px 0;
//                         }
                        
//                         .text-right {
//                             text-align: right;
//                         }
                        
//                         .font-bold {
//                             font-weight: 700;
//                         }
                        
//                         .text-green {
//                             color: #065f46;
//                         }
                        
//                         @media print {
//                             body { 
//                                 padding: 0; 
//                                 background: white;
//                             }
//                             .bill-container {
//                                 box-shadow: none;
//                                 padding: 0;
//                             }
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     ${printContent}
//                 </body>
//             </html>
//         `);
        
//         WinPrint.document.close();
//         WinPrint.focus();
//         setTimeout(() => {
//             WinPrint.print();
//             WinPrint.close();
//         }, 1000);
//     };

//     // Format date
//     const formatDate = (date) => {
//         if (!date) return 'N/A';
//         return new Date(date).toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     // Format currency
//     const formatCurrency = (amount) => {
//         return Number(amount || 0).toFixed(2);
//     };

//     // Get status badge color
//     const getStatusBadge = (status) => {
//         const statusMap = {
//             'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
//             'Checked In': 'bg-blue-100 text-blue-700 border-blue-200',
//             'Checked Out': 'bg-green-100 text-green-700 border-green-200',
//             'Cancel': 'bg-red-100 text-red-700 border-red-200',
//             'Completed': 'bg-green-100 text-green-700 border-green-200',
//             'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200'
//         };
//         return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
//     };

//     // Calculate total cost of items
//     const totalItemsCost = order?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

//     if (loading) {
//         return (
//             <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading order details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!order) {
//         return (
//             <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-4" />
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h3>
//                     <button
//                         onClick={handleBack}
//                         className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                     >
//                         Go Back
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const orderValue = order.bills?.total || 0;
//     const taxRate = 17;
//     const taxAmount = (orderValue * taxRate) / 100;
//     const totalWithTax = order.bills?.totalWithTax || 0;

//     return (
//         <div className="min-h-screen w-full bg-gray-50" dir="ltr">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 py-4">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={handleBack}
//                                 className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 text-white"
//                             >
//                                 <FaArrowLeft size={20} />
//                             </button>
//                             <div className="bg-white/20 p-3 rounded-xl">
//                                 <FaFileInvoice className="text-white text-2xl" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold text-white">Order Details</h1>
//                                 <p className="text-green-100 text-sm">Order #{order.orderNo || 'N/A'}</p>
//                             </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={handleFinalBill}
//                                 disabled={generatingBill}
//                                 className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md ${
//                                     generatingBill 
//                                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                                         : 'bg-white text-green-700 hover:bg-green-50'
//                                 }`}
//                             >
//                                 {generatingBill ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
//                                         <span>Generating...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <MdOutlineReceipt />
//                                         <span>Final Bill</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-7xl mx-auto px-4 py-6">
//                 {/* Status Badge */}
//                 <div className="mb-6 flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <span className="text-sm text-gray-600">Order Status:</span>
//                         <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(order.orderStatus)}`}>
//                             {order.orderStatus || 'N/A'}
//                         </span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                         <FaClock />
//                         <span>Last updated: {formatDate(order.updatedAt)}</span>
//                     </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="border-b border-gray-200 mb-6">
//                     <div className="flex gap-6">
//                         <button
//                             onClick={() => setActiveTab('details')}
//                             className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
//                                 activeTab === 'details' 
//                                     ? 'border-green-500 text-green-600' 
//                                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                         >
//                             Order Details
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('items')}
//                             className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
//                                 activeTab === 'items' 
//                                     ? 'border-green-500 text-green-600' 
//                                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                         >
//                             Items {order.items?.length > 0 && `(${order.items.length})`}
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('billing')}
//                             className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
//                                 activeTab === 'billing' 
//                                     ? 'border-green-500 text-green-600' 
//                                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                         >
//                             Billing Information
//                         </button>
//                     </div>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                     {activeTab === 'details' && (
//                         <div className="space-y-6">
//                             {/* Customer Information */}
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <FaUser className="text-green-600" />
//                                     Customer Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Name</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.name || order.customer?.name || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Email</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.email || order.customer?.email || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Phone</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.phone || order.customer?.phone || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Guests</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.guests || order.guests || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">ID Number</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.Idnumber || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg col-span-2">
//                                         <p className="text-xs text-gray-500 mb-1">Address</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.address || 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Booking Information */}
//                             <div className="border-t border-gray-200 pt-6">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <FaCalendar className="text-green-600" />
//                                     Booking Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                                     <div className="bg-blue-50 p-4 rounded-lg">
//                                         <p className="text-xs text-blue-600 mb-1">Check In</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {formatDate(order.dateBooking)}
//                                         </p>
//                                     </div>
//                                     <div className="bg-amber-50 p-4 rounded-lg">
//                                         <p className="text-xs text-amber-600 mb-1">Check Out</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {formatDate(order.dateReturn)}
//                                         </p>
//                                     </div>
//                                     <div className="bg-purple-50 p-4 rounded-lg">
//                                         <p className="text-xs text-purple-600 mb-1">Booking Days</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {order.bookingDays || 'N/A'} days
//                                         </p>
//                                     </div>
//                                     <div className="bg-emerald-50 p-4 rounded-lg">
//                                         <p className="text-xs text-emerald-600 mb-1">Seats</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {order.seats || 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Order Information */}
//                             <div className="border-t border-gray-200 pt-6">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <FaHashtag className="text-green-600" />
//                                     Order Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Order Number</p>
//                                         <p className="font-medium text-gray-800">{order.orderNo || 'N/A'}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Order Type</p>
//                                         <p className="font-medium text-gray-800">{order.orderType || 'N/A'}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Shift</p>
//                                         <p className="font-medium text-gray-800">{order.shift || 'N/A'}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Order Date</p>
//                                         <p className="font-medium text-gray-800">{formatDate(order.orderDate)}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Room</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.room?.roomNumber || order.room || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">User</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.user?.name || order.user || 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'items' && (
//                         <div>
//                             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                 Order Items
//                             </h3>
//                             {order.items && order.items.length > 0 ? (
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full border-collapse">
//                                         <thead>
//                                             <tr className="bg-gray-100">
//                                                 <th className="border p-3 text-left">#</th>
//                                                 <th className="border p-3 text-left">Item</th>
//                                                 <th className="border p-3 text-center">Quantity</th>
//                                                 <th className="border p-3 text-right">Cost</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {order.items.map((item, index) => (
//                                                 <tr key={index} className="hover:bg-gray-50">
//                                                     <td className="border p-3">{index + 1}</td>
//                                                     <td className="border p-3">{item.name || item.product?.name || 'Item'}</td>
//                                                     <td className="border p-3 text-center">{item.quantity || 0}</td>
//                                                     <td className="border p-3 text-right">{formatCurrency(item.price)} SD</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot>
//                                             <tr className="bg-green-50 font-semibold">
//                                                 <td className="border p-3" colSpan={3}>Total Cost:</td>
//                                                 <td className="border p-3 text-right font-bold text-green-600">
//                                                     {formatCurrency(totalItemsCost)} SD
//                                                 </td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12 bg-gray-50 rounded-lg">
//                                     <p className="text-gray-500">No items found for this order</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeTab === 'billing' && (
//                         <div className="space-y-6">
//                             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                 <FaMoneyBillWave className="text-green-600" />
//                                 Billing Summary
//                             </h3>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {/* Payment Information */}
//                                 <div className="bg-gray-50 rounded-xl p-6">
//                                     <h4 className="font-medium text-gray-700 mb-4">Payment Details</h4>
//                                     <div className="space-y-3">
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Payment Method:</span>
//                                             <span className="font-medium text-gray-800 flex items-center gap-1">
//                                                 <FaCreditCard className="text-green-600" />
//                                                 {order.paymentMethod || 'N/A'}
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Payment Amount:</span>
//                                             <span className="font-medium text-gray-800">
//                                                 {formatCurrency(order.payment)} SD
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Bill Summary */}
//                                 <div className="bg-green-50 rounded-xl p-6">
//                                     <h4 className="font-medium text-green-700 mb-4">Bill Summary</h4>
//                                     <div className="space-y-3">
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Subtotal:</span>
//                                             <span className="font-medium text-gray-800">
//                                                 {formatCurrency(order.bills?.total)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Tax (17%):</span>
//                                             <span className="font-medium text-gray-800">
//                                                 {formatCurrency(taxAmount)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center pt-3 border-t border-green-200">
//                                             <span className="font-semibold text-gray-800">Total:</span>
//                                             <span className="font-bold text-lg text-green-700">
//                                                 {formatCurrency(order.bills?.totalWithTax)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center pt-2">
//                                             <span className="text-gray-600">Paid:</span>
//                                             <span className="font-medium text-green-600">
//                                                 {formatCurrency(order.bills?.payed)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Balance:</span>
//                                             <span className={`font-medium ${order.bills?.balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                                 {formatCurrency(order.bills?.balance)} SD
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Final Bill Modal */}
//             {showFinalBill && taxRecord && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
//                             <div className="flex items-center gap-3">
//                                 <FaReceipt className="text-white text-xl" />
//                                 <h2 className="text-xl font-bold">Final Bill</h2>
//                             </div>
//                             <button
//                                 onClick={() => setShowFinalBill(false)}
//                                 className="p-2 hover:bg-white/20 rounded-lg transition-colors"
//                             >
//                                 <FaArrowLeft size={20} />
//                             </button>
//                         </div>

//                         {/* Bill Content - Printable */}
//                         <div className="flex-1 overflow-y-auto p-6">
//                             <div ref={billPrintRef} className="bg-white">
//                                 {/* Header with Logo */}
//                                 <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #10b981', paddingBottom: '20px', marginBottom: '25px' }}>
//                                     <div className="logo-container" style={{ width: '120px', height: '80px' }}>
//                                         <img src={hotel} alt="Solitaire Hotel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
//                                     </div>
//                                     <div className="hotel-info" style={{ textAlign: 'right' }}>
//                                         <div className="hotel-name" style={{ fontSize: '24px', fontWeight: 'bold', color: '#065f46', margin: 0 }}>SOLITAIRE HOTEL</div>
//                                         <div className="hotel-tagline" style={{ color: '#6b7280', fontSize: '14px', margin: '5px 0 0 0' }}>Luxury Redefined • Premium Hospitality</div>
//                                     </div>
//                                 </div>

//                                 <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#065f46', textAlign: 'center', marginBottom: '25px', letterSpacing: '1px' }}>FINAL BILL</div>

//                                 {/* Tax Info */}
//                                 <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
//                                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
//                                         <div>
//                                             <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Tax Number</div>
//                                             <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{taxRecord.taxNumber}</div>
//                                         </div>
//                                         <div>
//                                             <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Tax Date</div>
//                                             <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{formatDate(taxRecord.taxDate)}</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Order Details */}
//                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', background: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
//                                     <div>
//                                         <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Order Number</div>
//                                         <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{order.orderNo || 'N/A'}</div>
//                                     </div>
//                                     <div>
//                                         <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Customer Name</div>
//                                         <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{order.customerDetails?.name || order.customer?.name || 'N/A'}</div>
//                                     </div>
//                                     <div>
//                                         <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Room</div>
//                                         <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{order.room?.roomNumber || order.room || 'N/A'}</div>
//                                     </div>
//                                     <div>
//                                         <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Booking Period</div>
//                                         <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
//                                             {formatDate(order.dateBooking)} - {formatDate(order.dateReturn)}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Items Table */}
//                                 {order.items && order.items.length > 0 && (
//                                     <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
//                                         <thead>
//                                             <tr style={{ backgroundColor: '#10b981', color: 'white' }}>
//                                                 <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Item</th>
//                                                 <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Qty</th>
//                                                 <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Price</th>
//                                                 <th style={{ padding: '12px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Total</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {order.items.map((item, idx) => (
//                                                 <tr key={idx}>
//                                                     <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>{item.name || item.product?.name || 'Item'}</td>
//                                                     <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px' }}>{item.quantity || 0}</td>
//                                                     <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'right' }}>{formatCurrency(item.price)} SD</td>
//                                                     <td style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', textAlign: 'right' }}>{formatCurrency(item.price * (item.quantity || 1))} SD</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot>
//                                             <tr style={{ backgroundColor: '#f0fdf4' }}>
//                                                 <td colSpan="3" style={{ padding: '10px 12px', borderTop: '2px solid #10b981', textAlign: 'right', fontWeight: '600' }}>Total:</td>
//                                                 <td style={{ padding: '10px 12px', borderTop: '2px solid #10b981', textAlign: 'right', fontWeight: '600', color: '#065f46' }}>
//                                                     {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))} SD
//                                                 </td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 )}

//                                 {/* Tax Calculation */}
//                                 <div style={{ marginTop: '25px', padding: '20px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
//                                         <span>Subtotal:</span>
//                                         <span>{formatCurrency(taxRecord.orderValue)} SD</span>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' }}>
//                                         <span>Tax ({taxRecord.tax}):</span>
//                                         <span>{formatCurrency(taxRecord.taxValue)} SD</span>
//                                     </div>
//                                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '18px', fontWeight: 'bold', color: '#065f46', borderTop: '2px solid #10b981', marginTop: '10px', paddingTop: '10px' }}>
//                                         <span>Total Amount:</span>
//                                         <span>{formatCurrency(taxRecord.orderValue + taxRecord.taxValue)} SD</span>
//                                     </div>
//                                 </div>

//                                 {/* Footer */}
//                                 <div style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '11px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
//                                     <p style={{ margin: '5px 0' }}>This is a computer generated tax invoice</p>
//                                     <p style={{ margin: '5px 0' }}>Thank you for choosing Solitaire Hotel!</p>
//                                     <p style={{ margin: '5px 0' }}>Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
//                             <button
//                                 onClick={() => setShowFinalBill(false)}
//                                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 onClick={handlePrintFinalBill}
//                                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                             >
//                                 <FaPrint />
//                                 Print Bill
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InvDetails;



// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { api } from '../https';
// import { 
//     FaArrowLeft, FaFileInvoice, FaUser, FaPhone, 
//     FaEnvelope, FaMapMarkerAlt, FaCalendar, FaHashtag,
//     FaMoneyBillWave, FaCreditCard, FaPrint, FaDownload,
//     FaEdit, FaHome, FaUsers, FaIdCard, FaClock, FaReceipt
// } from 'react-icons/fa';
// import { MdOutlinePayment, MdOutlineReceipt } from 'react-icons/md';
// import { BsFillCalendarCheckFill, BsFillCalendarXFill } from 'react-icons/bs';
// import { toast } from 'react-hot-toast';
// import hotel from '../assets/images/solitair.png' 

// const InvDetails = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const billPrintRef = useRef(null);
  
//     const [order, setOrder] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('details');
//     const [generatingBill, setGeneratingBill] = useState(false);
//     const [showFinalBill, setShowFinalBill] = useState(false);
//     const [taxRecord, setTaxRecord] = useState(null);

//     // Fetch order details
//     const fetchOrderDetails = async () => {
//         setLoading(true);
//         try {
//             const response = await api.get(`/api/order/${id}`);
            
//             if (response.data.success) {
//                 setOrder(response.data.data);
//                 console.log('Order fetched:', response.data.data);
//             } else {
//                 toast.error('Failed to fetch order details');
//             }
//         } catch (error) {
//             console.error('Error fetching order:', error);
//             toast.error('Error loading order details');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (id) {
//             fetchOrderDetails();
//         }
//     }, [id]);

//     // Handle back navigation
//     const handleBack = () => {
//         navigate(-1);
//     };

//     // Handle Final Bill generation
//     const handleFinalBill = async () => {
//         if (!order) return;

//         setGeneratingBill(true);
//         try {
//             // Calculate tax (17% fixed)
//             const taxRate = 17;
//             const orderValue = order.bills?.total || 0;
//             const taxValue = (orderValue * taxRate) / 100;

//             const taxData = {
//                 order: order._id,
//                 orderValue: orderValue,
//                 tax: `${taxRate}% VAT`,
//                 taxValue: taxValue,
//             };

//             console.log('Sending tax data:', taxData);

//             const response = await api.post('/api/taxes', taxData);

//             if (response.data.success) {
//                 setTaxRecord(response.data.data);
//                 setShowFinalBill(true);
//                 toast.success('Final bill generated successfully!');
//             } else {
//                 toast.error('Failed to generate final bill');
//             }
//         } catch (error) {
//             console.error('Error generating final bill:', error);
//             toast.error(error.response?.data?.message || 'Error generating final bill');
//         } finally {
//             setGeneratingBill(false);
//         }
//     };

//     // Handle print final bill
//     const handlePrintFinalBill = () => {
//         if (!taxRecord) return;
        
//         const printContent = billPrintRef.current.innerHTML;
//         const WinPrint = window.open("", "", "width=900, height=650");
        
//         WinPrint.document.write(` 
//             <html>
//                 <head>
//                     <title>Final Bill - ${taxRecord.taxNumber}</title>
//                     <style>
//                         @page {
//                             size: A4;
//                             margin: 1.5cm;
//                         }
//                         body { 
//                             font-family: 'Arial', sans-serif; 
//                             padding: 20px; 
//                             background: white;
//                             color: #333;
//                             line-height: 1.5;
//                         }
//                         .bill-container { 
//                             max-width: 100%;
//                             margin: 0 auto;
//                         }
//                         h1 {
//                             color: #059669;
//                             font-size: 28px;
//                             margin-bottom: 5px;
//                             text-align: center;
//                         }
//                         h2 {
//                             color: #047857;
//                             font-size: 20px;
//                             border-bottom: 2px solid #059669;
//                             padding-bottom: 8px;
//                         }
//                         .header {
//                             text-align: center;
//                             margin-bottom: 30px;
//                             border-bottom: 2px solid #059669;
//                             padding-bottom: 15px;
//                         }
//                         .details {
//                             margin-bottom: 20px;
//                         }
//                         .details-grid {
//                             display: grid;
//                             grid-template-columns: repeat(2, 1fr);
//                             gap: 15px;
//                             margin-bottom: 20px;
//                         }
//                         .detail-item {
//                             padding: 10px;
//                             background: #f9fafb;
//                             border-radius: 8px;
//                         }
//                         .detail-label {
//                             font-size: 12px;
//                             color: #6b7280;
//                             margin-bottom: 4px;
//                         }
//                         .detail-value {
//                             font-size: 14px;
//                             font-weight: 600;
//                             color: #1f2937;
//                         }
//                         table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin: 20px 0;
//                         }
//                         th {
//                             background-color: #059669;
//                             color: white;
//                             padding: 12px;
//                             text-align: left;
//                             font-size: 14px;
//                         }
//                         td {
//                             padding: 10px;
//                             border-bottom: 1px solid #e5e7eb;
//                             font-size: 13px;
//                         }
//                         .total-section {
//                             margin-top: 30px;
//                             text-align: right;
//                         }
//                         .total-line {
//                             display: flex;
//                             justify-content: flex-end;
//                             gap: 20px;
//                             margin: 5px 0;
//                         }
//                         .grand-total {
//                             font-size: 18px;
//                             font-weight: bold;
//                             color: #059669;
//                             border-top: 2px solid #059669;
//                             padding-top: 10px;
//                             margin-top: 10px;
//                         }
//                         .footer {
//                             margin-top: 50px;
//                             text-align: center;
//                             font-size: 11px;
//                             color: #6b7280;
//                             border-top: 1px solid #e5e7eb;
//                             padding-top: 15px;
//                         }
//                         .badge {
//                             display: inline-block;
//                             background-color: #059669;
//                             color: white;
//                             padding: 4px 8px;
//                             border-radius: 4px;
//                             font-size: 12px;
//                             font-weight: bold;
//                         }
//                         .tax-info {
//                             background: #f0fdf4;
//                             border: 1px solid #059669;
//                             border-radius: 8px;
//                             padding: 15px;
//                             margin: 20px 0;
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="bill-container">
//                         ${printContent}
//                     </div>
//                 </body>
//             </html>
//         `);
//         WinPrint.document.close();
//         WinPrint.focus();
//         setTimeout(() => {
//             WinPrint.print();
//             WinPrint.close();
//         }, 1000);
//     };

//     // Format date
//     const formatDate = (date) => {
//         if (!date) return 'N/A';
//         return new Date(date).toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     // Format currency
//     const formatCurrency = (amount) => {
//         return Number(amount || 0).toFixed(2);
//     };

//     // Get status badge color
//     const getStatusBadge = (status) => {
//         const statusMap = {
//             'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
//             'Checked In': 'bg-blue-100 text-blue-700 border-blue-200',
//             'Checked Out': 'bg-green-100 text-green-700 border-green-200',
//             'Cancel': 'bg-red-100 text-red-700 border-red-200',
//             'Completed': 'bg-green-100 text-green-700 border-green-200',
//             'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200'
//         };
//         return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
//     };

//     // Calculate total cost of items
//     const totalItemsCost = order?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

//     if (loading) {
//         return (
//             <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading order details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!order) {
//         return (
//             <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-4" />
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h3>
//                     <button
//                         onClick={handleBack}
//                         className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                     >
//                         Go Back
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     const orderValue = order.bills?.total || 0;
//     const taxRate = 17;
//     const taxAmount = (orderValue * taxRate) / 100;

//     return (
//         <div className="min-h-screen w-full bg-gray-50" dir="ltr">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 py-4">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={handleBack}
//                                 className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 text-white"
//                             >
//                                 <FaArrowLeft size={20} />
//                             </button>
//                             <div className="bg-white/20 p-3 rounded-xl">
//                                 <FaFileInvoice className="text-white text-2xl" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold text-white">Order Details</h1>
//                                 <p className="text-green-100 text-sm">Order #{order.orderNo || 'N/A'}</p>
//                             </div>
//                         </div>

//                         {/* Action Buttons */}
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={handleFinalBill}
//                                 disabled={generatingBill}
//                                 className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md ${
//                                     generatingBill 
//                                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                                         : 'bg-white text-green-700 hover:bg-green-50'
//                                 }`}
//                             >
//                                 {generatingBill ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
//                                         <span>Generating...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <MdOutlineReceipt />
//                                         <span>Final Bill</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-7xl mx-auto px-4 py-6">
//                 {/* Status Badge */}
//                 <div className="mb-6 flex justify-between items-center">
//                     <div className="flex items-center gap-3">
//                         <span className="text-sm text-gray-600">Order Status:</span>
//                         <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(order.orderStatus)}`}>
//                             {order.orderStatus || 'N/A'}
//                         </span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                         <FaClock />
//                         <span>Last updated: {formatDate(order.updatedAt)}</span>
//                     </div>
//                 </div>

//                 {/* Tabs */}
//                 <div className="border-b border-gray-200 mb-6">
//                     <div className="flex gap-6">
//                         <button
//                             onClick={() => setActiveTab('details')}
//                             className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
//                                 activeTab === 'details' 
//                                     ? 'border-green-500 text-green-600' 
//                                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                         >
//                             Order Details
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('items')}
//                             className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
//                                 activeTab === 'items' 
//                                     ? 'border-green-500 text-green-600' 
//                                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                         >
//                             Items {order.items?.length > 0 && `(${order.items.length})`}
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('billing')}
//                             className={`cursor-pointer bg-green-100 rounded-md px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
//                                 activeTab === 'billing' 
//                                     ? 'border-green-500 text-green-600' 
//                                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                             }`}
//                         >
//                             Billing Information
//                         </button>
//                     </div>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                     {activeTab === 'details' && (
//                         <div className="space-y-6">
//                             {/* Customer Information */}
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <FaUser className="text-green-600" />
//                                     Customer Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Name</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.name || order.customer?.name || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Email</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.email || order.customer?.email || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Phone</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.phone || order.customer?.phone || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Guests</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.guests || order.guests || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">ID Number</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.Idnumber || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg col-span-2">
//                                         <p className="text-xs text-gray-500 mb-1">Address</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.customerDetails?.address || 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Booking Information */}
//                             <div className="border-t border-gray-200 pt-6">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <FaCalendar className="text-green-600" />
//                                     Booking Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                                     <div className="bg-blue-50 p-4 rounded-lg">
//                                         <p className="text-xs text-blue-600 mb-1">Check In</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {formatDate(order.dateBooking)}
//                                         </p>
//                                     </div>
//                                     <div className="bg-amber-50 p-4 rounded-lg">
//                                         <p className="text-xs text-amber-600 mb-1">Check Out</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {formatDate(order.dateReturn)}
//                                         </p>
//                                     </div>
//                                     <div className="bg-purple-50 p-4 rounded-lg">
//                                         <p className="text-xs text-purple-600 mb-1">Booking Days</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {order.bookingDays || 'N/A'} days
//                                         </p>
//                                     </div>
//                                     <div className="bg-emerald-50 p-4 rounded-lg">
//                                         <p className="text-xs text-emerald-600 mb-1">Seats</p>
//                                         <p className="font-semibold text-gray-800">
//                                             {order.seats || 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Order Information */}
//                             <div className="border-t border-gray-200 pt-6">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                     <FaHashtag className="text-green-600" />
//                                     Order Information
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Order Number</p>
//                                         <p className="font-medium text-gray-800">{order.orderNo || 'N/A'}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Order Type</p>
//                                         <p className="font-medium text-gray-800">{order.orderType || 'N/A'}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Shift</p>
//                                         <p className="font-medium text-gray-800">{order.shift || 'N/A'}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Order Date</p>
//                                         <p className="font-medium text-gray-800">{formatDate(order.orderDate)}</p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">Room</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.room?.roomNumber || order.room || 'N/A'}
//                                         </p>
//                                     </div>
//                                     <div className="bg-gray-50 p-4 rounded-lg">
//                                         <p className="text-xs text-gray-500 mb-1">User</p>
//                                         <p className="font-medium text-gray-800">
//                                             {order.user?.name || order.user || 'N/A'}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {activeTab === 'items' && (
//                         <div>
//                             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                 Order Items
//                             </h3>
//                             {order.items && order.items.length > 0 ? (
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full border-collapse">
//                                         <thead>
//                                             <tr className="bg-gray-100">
//                                                 <th className="border p-3 text-left">#</th>
//                                                 <th className="border p-3 text-left">Item</th>
//                                                 <th className="border p-3 text-center">Quantity</th>
//                                                 <th className="border p-3 text-right">Cost</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {order.items.map((item, index) => (
//                                                 <tr key={index} className="hover:bg-gray-50">
//                                                     <td className="border p-3">{index + 1}</td>
//                                                     <td className="border p-3">{item.name || item.product?.name || 'Item'}</td>
//                                                     <td className="border p-3 text-center">{item.quantity || 0}</td>
//                                                     <td className="border p-3 text-right">{formatCurrency(item.price)} SD</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot>
//                                             <tr className="bg-green-50 font-semibold">
//                                                 <td className="border p-3" colSpan={3}>Total Cost:</td>
//                                                 <td className="border p-3 text-right font-bold text-green-600">
//                                                     {formatCurrency(totalItemsCost)} SD
//                                                 </td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12 bg-gray-50 rounded-lg">
//                                     <p className="text-gray-500">No items found for this order</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeTab === 'billing' && (
//                         <div className="space-y-6">
//                             <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                                 <FaMoneyBillWave className="text-green-600" />
//                                 Billing Summary
//                             </h3>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {/* Payment Information */}
//                                 <div className="bg-gray-50 rounded-xl p-6">
//                                     <h4 className="font-medium text-gray-700 mb-4">Payment Details</h4>
//                                     <div className="space-y-3">
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Payment Method:</span>
//                                             <span className="font-medium text-gray-800 flex items-center gap-1">
//                                                 <FaCreditCard className="text-green-600" />
//                                                 {order.paymentMethod || 'N/A'}
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Payment Amount:</span>
//                                             <span className="font-medium text-gray-800">
//                                                 {formatCurrency(order.payment)} SD
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Bill Summary */}
//                                 <div className="bg-green-50 rounded-xl p-6">
//                                     <h4 className="font-medium text-green-700 mb-4">Bill Summary</h4>
//                                     <div className="space-y-3">
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Subtotal:</span>
//                                             <span className="font-medium text-gray-800">
//                                                 {formatCurrency(order.bills?.total)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Tax (17%):</span>
//                                             <span className="font-medium text-gray-800">
//                                                 {formatCurrency(taxAmount)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center pt-3 border-t border-green-200">
//                                             <span className="font-semibold text-gray-800">Total:</span>
//                                             <span className="font-bold text-lg text-green-700">
//                                                 {formatCurrency(order.bills?.totalWithTax)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center pt-2">
//                                             <span className="text-gray-600">Paid:</span>
//                                             <span className="font-medium text-green-600">
//                                                 {formatCurrency(order.bills?.payed)} SD
//                                             </span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Balance:</span>
//                                             <span className={`font-medium ${order.bills?.balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
//                                                 {formatCurrency(order.bills?.balance)} SD
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Final Bill Modal */}
//             {showFinalBill && taxRecord && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
//                             <div className="flex items-center gap-3">
//                                 <FaReceipt className="text-white text-xl" />
//                                 <h2 className="text-xl font-bold">Final Bill</h2>
//                             </div>
//                             <button
//                                 onClick={() => setShowFinalBill(false)}
//                                 className="p-2 hover:bg-white/20 rounded-lg transition-colors"
//                             >
//                                 <FaArrowLeft size={20} />
//                             </button>
//                         </div>

//                         {/* Bill Content - Printable */}
//                         <div className="flex-1 overflow-y-auto p-6">
//                             <div ref={billPrintRef} className="bg-white p-8">
//                                 {/* Header with Logo */}
//                                 <div className="header">
//                                     <div className="logo-container">
//                                         <img src={hotel} alt="Solitaire Hotel" />
//                                     </div>
//                                     <div className="hotel-info">
//                                         <div className="hotel-name">SOLITAIRE HOTEL</div>
//                                         <div className="hotel-tagline">Luxury Redefined • Premium Hospitality</div>
//                                     </div>
//                                 </div>

//                                 <div className="bill-title">FINAL BILL</div>

//                                 {/* Tax Info */}
//                                 <div className="tax-info">
//                                     <div className="info-grid">
//                                         <div>
//                                             <div className="info-label">Tax Number</div>
//                                             <div className="info-value">{taxRecord.taxNumber}</div>
//                                         </div>
//                                         <div>
//                                             <div className="info-label">Tax Date</div>
//                                             <div className="info-value">{formatDate(taxRecord.taxDate)}</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Order Details */}
//                                 <div className="details-grid">
//                                     <div>
//                                         <div className="info-label">Order Number</div>
//                                         <div className="info-value">{order.orderNo || 'N/A'}</div>
//                                     </div>
//                                     <div>
//                                         <div className="info-label">Customer Name</div>
//                                         <div className="info-value">{order.customerDetails?.name || order.customer?.name || 'N/A'}</div>
//                                     </div>
//                                     <div>
//                                         <div className="info-label">Room</div>
//                                         <div className="info-value">{order.room?.roomNumber || order.room || 'N/A'}</div>
//                                     </div>
//                                     <div>
//                                         <div className="info-label">Booking Period</div>
//                                         <div className="info-value">
//                                             {formatDate(order.dateBooking)} - {formatDate(order.dateReturn)}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Items Table */}
//                                 {order.items && order.items.length > 0 && (
//                                     <table>
//                                         <thead>
//                                             <tr>
//                                                 <th>Item</th>
//                                                 <th>Qty</th>
//                                                 <th>Price</th>
//                                                 <th>Total</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {order.items.map((item, idx) => (
//                                                 <tr key={idx}>
//                                                     <td>{item.name || item.product?.name || 'Item'}</td>
//                                                     <td>{item.quantity || 0}</td>
//                                                     <td>{formatCurrency(item.price)} SD</td>
//                                                     <td>{formatCurrency(item.price * (item.quantity || 1))} SD</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot>
//                                             <tr>
//                                                 <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
//                                                 <td style={{ fontWeight: 'bold', color: '#065f46' }}>
//                                                     {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0))} SD
//                                                 </td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 )}

//                                 {/* Tax Calculation */}
//                                 <div className="total-section">
//                                     <div className="total-row">
//                                         <span>Subtotal:</span>
//                                         <span>{formatCurrency(taxRecord.orderValue)} SD</span>
//                                     </div>
//                                     <div className="total-row">
//                                         <span>Tax ({taxRecord.tax}):</span>
//                                         <span>{formatCurrency(taxRecord.taxValue)} SD</span>
//                                     </div>
//                                     <div className="grand-total">
//                                         <span>Total Amount:</span>
//                                         <span>{formatCurrency(taxRecord.orderValue + taxRecord.taxValue)} SD</span>
//                                     </div>
//                                 </div>

//                                 {/* Footer */}
//                                 <div className="footer">
//                                     <p>This is a computer generated tax invoice</p>
//                                     <p className="mt-1">Thank you for choosing Solitaire Hotel!</p>
//                                     <p className="mt-2">Generated on: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
//                             <button
//                                 onClick={() => setShowFinalBill(false)}
//                                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 onClick={handlePrintFinalBill}
//                                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                             >
//                                 <FaPrint />
//                                 Print Bill
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InvDetails;

