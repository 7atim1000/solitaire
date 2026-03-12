// Added overflow-x-auto scrollbar-hide to the table container
import React, { useState, useEffect, useRef } from 'react';
import BackButton from '../components/shared/BackButton';
import { api } from '../https';
import InvoiceDetails from '../components/invoice/InvoiceDetails';
import { FaSearch, FaFilter, FaCalendarAlt, FaSortAmountDown, FaPrint, FaSync, FaReceipt, FaFileInvoice, FaShoppingBag, FaMoneyBillWave, FaHotel } from 'react-icons/fa';

const Invoices = () => {
    // State declarations
    const [allInvoices, setAllInvoices] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    });
    
    // Filter states
    const [orderType, setOrderType] = useState('Invoice');
    const [frequency, setFrequency] = useState('365');
    const [orderStatus, setOrderStatus] = useState('all');
    const [shift, setShift] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [isLoading, setIsLoading] = useState(false);
    
    // Refs for printing
    const tableRef = useRef(null);
    const printRef = useRef(null);

    // Fetch invoices
    const getOrders = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('/api/order/fetch', {
                frequency,
                orderType,
                orderStatus: orderStatus === 'all' ? '' : orderStatus,
                shift: shift === 'all' ? '' : shift,
                search,
                sort,
                page: pagination.currentPage,
                limit: pagination.itemsPerPage
            });

            const invoices = res.data?.data || res.data?.orders || [];
            setAllInvoices(invoices);
            
            // Update pagination
            if (res.data?.pagination) {
                setPagination(res.data.pagination);
            } else {
                setPagination(prev => ({
                    ...prev,
                    totalItems: invoices.length,
                    totalPages: Math.ceil(invoices.length / prev.itemsPerPage)
                }));
            }

        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getOrders();
    }, [frequency, orderType, orderStatus, shift, search, sort, pagination.currentPage]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== '') {
                getOrders();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Refresh function
    const refreshOrderList = () => {
        getOrders();
    };

    // Print function
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        
        const printWindow = window.open('', '_blank', 'width=900,height=650');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Solitaire Hotel - Invoices Report</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Poppins', sans-serif;
                            background: #fff;
                            color: #333;
                            padding: 20px;
                            line-height: 1.6;
                        }
                        
                        .print-header {
                            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
                            color: white;
                            padding: 30px 40px;
                            border-radius: 12px;
                            margin-bottom: 30px;
                            text-align: center;
                        }
                        
                        .hotel-name {
                            font-size: 32px;
                            font-weight: 700;
                            letter-spacing: 1px;
                            margin-bottom: 5px;
                        }
                        
                        .hotel-tagline {
                            font-size: 14px;
                            opacity: 0.9;
                            margin-bottom: 15px;
                        }
                        
                        .report-title {
                            font-size: 24px;
                            font-weight: 600;
                            margin: 20px 0;
                            color: #059669;
                            text-align: center;
                        }
                        
                        .report-info {
                            background: #f0fdf4;
                            border: 1px solid #d1fae5;
                            border-radius: 10px;
                            padding: 20px;
                            margin-bottom: 25px;
                        }
                        
                        .info-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 15px;
                            margin-bottom: 20px;
                        }
                        
                        .info-item {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        
                        .info-label {
                            font-weight: 500;
                            color: #374151;
                            min-width: 120px;
                        }
                        
                        .info-value {
                            color: #059669;
                            font-weight: 500;
                        }
                        
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 25px 0;
                        }
                        
                        .print-table th {
                            background: #f0fdf4;
                            color: #059669;
                            font-weight: 600;
                            padding: 12px 15px;
                            text-align: left;
                            border-bottom: 2px solid #d1fae5;
                        }
                        
                        .print-table td {
                            padding: 12px 15px;
                            border-bottom: 1px solid #e5e7eb;
                        }
                        
                        .print-table tr:hover {
                            background: #f9fafb;
                        }
                        
                        .total-section {
                            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                            border-radius: 10px;
                            padding: 25px;
                            margin: 25px 0;
                            border: 1px solid #d1fae5;
                        }
                        
                        .total-row {
                            display: flex;
                            justify-content: space-between;
                            padding: 8px 0;
                            border-bottom: 1px solid #d1fae5;
                        }
                        
                        .grand-total {
                            font-size: 20px;
                            font-weight: 700;
                            color: #059669;
                            margin-top: 10px;
                            padding-top: 10px;
                            border-top: 2px solid #059669;
                        }
                        
                        .print-footer {
                            text-align: center;
                            padding: 30px;
                            color: #6b7280;
                            font-style: italic;
                            margin-top: 40px;
                            border-top: 1px solid #e5e7eb;
                        }
                        
                        @media print {
                            body {
                                background: white !important;
                            }
                            
                            .no-print {
                                display: none !important;
                            }
                            
                            .print-header {
                                box-shadow: none;
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
        
        printWindow.onload = function() {
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    // Calculate totals for footer
    const calculateTotals = () => {
        return allInvoices.reduce((acc, invoice) => {
            acc.totalAmount += invoice.bills?.totalWithTax || 0;
            acc.totalTax += invoice.bills?.tax || 0;
            acc.totalPayed += invoice.bills?.payed || 0;
            acc.totalBalance += invoice.bills?.balance || 0;
            return acc;
        }, {
            totalAmount: 0,
            totalTax: 0,
            totalPayed: 0,
            totalBalance: 0
        });
    };

    const totals = calculateTotals();

    // Calculate counts for stats cards
    const stats = {
        totalInvoices: allInvoices.length,
        inProgress: allInvoices.filter(inv => inv.orderStatus === 'In Progress').length,
        checkedIn: allInvoices.filter(inv => inv.orderStatus === 'Checked In').length,
        cancelled: allInvoices.filter(inv => inv.orderStatus === 'Cancel').length,
        checkedOut: allInvoices.filter(inv => inv.orderStatus === 'Checked Out').length
    };

    return (
        // Main container with proper sidebar adjustment
        <div className="flex-1 overflow-hidden">
            <section className='w-full bg-gradient-to-br from-emerald-50 to-white min-h-screen overflow-hidden'>
                {/* Main Container with responsive width */}
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 mx-1 overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <BackButton />
                            <div>
                                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">
                                    Invoices Management
                                </h1>
                                <p className="text-xs md:text-sm text-emerald-600 mt-1">
                                    Manage and track all booking invoices
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={refreshOrderList}
                                disabled={isLoading}
                                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors duration-200"
                            >
                                <FaSync className={`${isLoading ? 'animate-spin' : ''}`} />
                                <span className="text-xs md:text-sm font-medium">Refresh</span>
                            </button>
                            
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
                            >
                                <FaPrint />
                                <span className="text-xs md:text-sm font-medium">Print</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards - FIXED with correct status names */}
                    {/* Stats Cards - Improved Design */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
                        {/* Total Revenue */}
                        <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 md:p-5 border border-emerald-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-emerald-700 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        Total Revenue
                                    </p>
                                    <p className="text-xl md:text-sm font-bold text-emerald-800">
                                        {totals.totalPayed.toFixed(2)} <span className="text-xs md:text-sm font-medium text-emerald-600">SD</span>
                                    </p>
                                </div>
                                <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <FaMoneyBillWave className="text-emerald-600" size={22} />
                                </div>
                            </div>
                            <div className="mt-2 h-1 w-full bg-emerald-200 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="group bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 md:p-5 border border-amber-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-amber-700 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        In Progress
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-amber-800">
                                        {stats.inProgress}
                                    </p>
                                </div>
                                <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="text-amber-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 h-1 w-full bg-amber-200 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-amber-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Checked In */}
                        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 md:p-5 border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-blue-700 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                        Checked In
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-blue-800">
                                        {stats.checkedIn}
                                    </p>
                                </div>
                                <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                        <line x1="22" y1="21" x2="2" y2="21" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                                <div className="h-full w-4/5 bg-blue-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Checked Out */}
                        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 md:p-5 border border-purple-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-purple-700 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                        Checked Out
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-purple-800">
                                        {stats.checkedOut}
                                    </p>
                                </div>
                                <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="text-purple-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                                        <line x1="12" y1="13" x2="12" y2="17" />
                                        <line x1="9" y1="15" x2="15" y2="15" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 h-1 w-full bg-purple-200 rounded-full overflow-hidden">
                                <div className="h-full w-2/5 bg-purple-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Cancelled */}
                        <div className="group bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 md:p-5 border border-red-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-red-700 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                        Cancelled
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-red-800">
                                        {stats.cancelled}
                                    </p>
                                </div>
                                <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="text-red-600" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 h-1 w-full bg-red-200 rounded-full overflow-hidden">
                                <div className="h-full w-1/5 bg-red-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Total Invoices (Optional - Add if you want) */}
                        <div className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                                        Total Invoices
                                    </p>
                                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                                        {stats.totalInvoices}
                                    </p>
                                </div>
                                <div className="bg-white p-2.5 md:p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                                    <FaReceipt className="text-gray-600" size={22} />
                                </div>
                            </div>
                            <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-gray-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    {/* Search and Filter Bar */}
                    <div className="space-y-4 mb-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-emerald-400" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search invoices by customer, room, or ID..."
                                className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border-2 border-emerald-200 rounded-xl text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all text-sm md:text-base"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Filters - Responsive layout */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            {/* Frequency Filter */}
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt className="text-emerald-600 hidden sm:block" size={14} />
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="1">Today</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 90 Days</option>
                                    <option value="365">All Time</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <FaFilter className="text-emerald-600 hidden sm:block" size={14} />
                                <select
                                    value={orderStatus}
                                    onChange={(e) => setOrderStatus(e.target.value)}
                                    className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Checked In">Checked In</option>
                                    <option value="Cancel">Cancelled</option>
                                    <option value="Checked Out">Checked Out</option>
                                </select>
                            </div>

                            {/* Shift Filter */}
                            <div className="flex items-center gap-2">
                                <FaHotel className="text-emerald-600 hidden sm:block" size={14} />
                                <select
                                    value={shift}
                                    onChange={(e) => setShift(e.target.value)}
                                    className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="all">All Shifts</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Evening">Evening</option>
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div className="flex items-center gap-2">
                                <FaSortAmountDown className="text-emerald-600 hidden sm:block" size={14} />
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                                    }}
                                    className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="-createdAt">Newest First</option>
                                    <option value="createdAt">Oldest First</option>
                                    <option value="orderStatus">By Status</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Print Content (Hidden for display, used for printing) */}
                    <div ref={printRef} className="hidden">
                        <div className="print-header">
                            <h1 className="hotel-name">SOLITAIRE HOTEL</h1>
                            <p className="hotel-tagline">Luxury Redefined • Premium Hospitality</p>
                            <div className="mt-4">
                                <p>123 Luxury Street, City Center</p>
                                <p>Phone: +1 234 567 8900 • Email: info@solitairehotel.com</p>
                            </div>
                        </div>

                        <h2 className="report-title">Invoices Report</h2>

                        <div className="report-info">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Report Date:</span>
                                    <span className="info-value">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Period:</span>
                                    <span className="info-value">
                                        {frequency === '365' ? 'All Time' : `Last ${frequency} days`}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Status:</span>
                                    <span className="info-value">
                                        {orderStatus === 'all' ? 'All Status' : orderStatus}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Total Invoices:</span>
                                    <span className="info-value">{allInvoices.length}</span>
                                </div>
                            </div>
                        </div>

                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Room</th>
                                    <th>Status</th>
                                    <th>Total (SD)</th>
                                    <th>Paid (SD)</th>
                                    <th>Balance (SD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allInvoices.map((invoice) => (
                                    <tr key={invoice._id}>
                                        <td>{invoice.orderNo}</td>
                                        <td>{new Date(invoice.orderDate || invoice.createdAt).toLocaleDateString('en-GB')}</td>
                                        <td>{invoice.customerDetails?.name || 'N/A'}</td>
                                        <td>{invoice.room?.roomNo || 'N/A'}</td>
                                        <td>{invoice.orderStatus}</td>
                                        <td>{(invoice.bills?.totalWithTax || 0).toFixed(2)}</td>
                                        <td>{(invoice.bills?.payed || 0).toFixed(2)}</td>
                                        <td>{(invoice.bills?.balance || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" className="font-bold text-right">Totals:</td>
                                    <td className="font-bold">{totals.totalAmount.toFixed(2)} SD</td>
                                    <td className="font-bold">{totals.totalPayed.toFixed(2)} SD</td>
                                    <td className="font-bold">{totals.totalBalance.toFixed(2)} SD</td>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="print-footer">
                            <p className="text-lg font-semibold text-emerald-700 mb-2">
                                Thank You for Choosing Solitaire Hotel!
                            </p>
                            <p className="text-gray-600">This report was generated on {new Date().toLocaleString()}</p>
                            <p className="text-sm text-gray-500 mt-4">For any inquiries, please contact: +1 234 567 8900</p>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8 md:p-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-emerald-600 mx-auto"></div>
                                <p className="mt-3 text-emerald-600">Loading invoices...</p>
                            </div>
                        </div>
                    ) : allInvoices.length === 0 ? (
                        <div className="text-center py-8 md:py-12">
                            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                <FaReceipt className="text-emerald-600" size={24} />
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-emerald-800 mb-2">No Invoices Found</h3>
                            <p className="text-emerald-600">Try adjusting your filters or create a new invoice.</p>
                        </div>
                    ) : (
                        // Table container WITHOUT horizontal scrollbar
                        <div className="overflow-x-auto scrollbar-hide" ref={tableRef}>
                            <table className="w-full min-w-max">
                                <thead className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                                    <tr>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Date</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">By</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Shift</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Room</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Customer</th>
                                        {/* <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Total</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Tax</th> */}
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Total</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Paid</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Payment</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Balance</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Status</th>
                                        <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"></th>
                                        
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-emerald-100">
                                    {allInvoices.map((invoice) => (
                                        <InvoiceDetails
                                            key={invoice._id}
                                            id={invoice._id}
                                            
                                            date={invoice.orderDate}
                                            dateBooking={invoice.dateBooking}
                                            dateReturn={invoice.dateReturn}

                                            number={invoice.orderNo}
                                            shift={invoice.shift}
                                            // ✅ FIX: Pass room ID for updates and room number for display
                                            roomId={invoice.room?._id}  // MongoDB ID for updates
                                            roomNumber={invoice.room?.roomNo || 'N/A'}  // Room number for display
                                            customer={invoice.customerDetails?.name}
                                            phone={invoice.customerDetails?.phone}
                                            total={invoice.bills?.total}
                                            tax={invoice.bills?.tax}
                                            totalWithTax={invoice.bills?.totalWithTax}
                                            payed={invoice.bills?.payed}
                                            balance={invoice.bills?.balance}
                                            payment={invoice.paymentMethod}
                                            status={invoice.orderStatus}
                                            items={invoice.items}
                                            customerId={invoice.customer}
                                            user={invoice.user?.name}
                                            onStatusUpdate={refreshOrderList}
                                        />
                                    ))}
                                </tbody>
                                {/* Table Footer */}
                                <tfoot className="bg-gradient-to-r from-emerald-50 to-green-50 border-t-2 border-emerald-200">
                                    <tr>
                                        <td colSpan="5" className="px-4 py-3 text-right font-bold text-emerald-800 whitespace-nowrap">
                                            Totals:
                                        </td>
                                        {/* <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
                                            {totals.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
                                            {totals.totalTax.toFixed(2)}
                                        </td> */}
                                        <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
                                            {totals.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
                                            {totals.totalPayed.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
                                            -
                                        </td>
                                        <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
                                            {totals.totalBalance.toFixed(2)}
                                        </td>
                                        <td colSpan="2" className="px-4 py-3 text-center text-xs md:text-sm text-emerald-600 whitespace-nowrap">
                                            {allInvoices.length} invoices
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && allInvoices.length > 0 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-emerald-100">
                            <div className="text-xs md:text-sm text-emerald-600 mb-2 sm:mb-0">
                                Showing {allInvoices.length} of {pagination.totalItems} invoices
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                    disabled={pagination.currentPage === 1}
                                    className="px-2 py-1 md:px-3 md:py-1.5 bg-emerald-100 text-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 text-xs md:text-sm"
                                >
                                    Previous
                                </button>
                                <span className="px-2 py-1 md:px-3 md:py-1.5 bg-emerald-600 text-white rounded-lg text-xs md:text-sm">
                                    {pagination.currentPage}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="px-2 py-1 md:px-3 md:py-1.5 bg-emerald-100 text-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 text-xs md:text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Invoices;


// // Added overflow-x-auto scrollbar-hide to the table container
// import React, { useState, useEffect, useRef } from 'react';
// import BackButton from '../components/shared/BackButton';
// import { api } from '../https';
// import InvoiceDetails from '../components/invoice/InvoiceDetails';
// import { FaSearch, FaFilter, FaCalendarAlt, FaSortAmountDown, FaPrint, FaSync, FaReceipt, FaFileInvoice, FaShoppingBag, FaMoneyBillWave, FaHotel } from 'react-icons/fa';

// const Invoices = () => {
//     // State declarations
//     const [allInvoices, setAllInvoices] = useState([]);
//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         itemsPerPage: 10,
//         totalItems: 0,
//         totalPages: 1
//     });
    
//     // Filter states
//     const [orderType, setOrderType] = useState('Invoice');
//     const [frequency, setFrequency] = useState('365');
//     const [orderStatus, setOrderStatus] = useState('all');
//     const [shift, setShift] = useState('all');
//     const [search, setSearch] = useState('');
//     const [sort, setSort] = useState('-createdAt');
//     const [isLoading, setIsLoading] = useState(false);
    
//     // Refs for printing
//     const tableRef = useRef(null);
//     const printRef = useRef(null);

//     // Fetch invoices
//     const getOrders = async () => {
//         setIsLoading(true);
//         try {
//             const res = await api.post('/api/order/fetch', {
//                 frequency,
//                 orderStatus: orderStatus === 'all' ? '' : orderStatus,
//                 shift: shift === 'all' ? '' : shift,
//                 search,
//                 sort,
//                 page: pagination.currentPage,
//                 limit: pagination.itemsPerPage
//             });

//             const invoices = res.data?.data || res.data?.orders || [];
//             setAllInvoices(invoices);
            
//             // Update pagination
//             if (res.data?.pagination) {
//                 setPagination(res.data.pagination);
//             } else {
//                 setPagination(prev => ({
//                     ...prev,
//                     totalItems: invoices.length,
//                     totalPages: Math.ceil(invoices.length / prev.itemsPerPage)
//                 }));
//             }

//         } catch (error) {
//             console.error('Error fetching invoices:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         getOrders();
//     }, [frequency, orderStatus, shift, search, sort, pagination.currentPage]);

//     // Debounced search
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (search !== '') {
//                 getOrders();
//             }
//         }, 500);

//         return () => clearTimeout(timer);
//     }, [search]);

//     // Refresh function
//     const refreshOrderList = () => {
//         getOrders();
//     };

//     // Print function
//     const handlePrint = () => {
//         const printContent = printRef.current.innerHTML;
//         const originalContent = document.body.innerHTML;
        
//         const printWindow = window.open('', '_blank', 'width=900,height=650');
//         printWindow.document.write(`
//             <!DOCTYPE html>
//             <html>
//                 <head>
//                     <title>Solitaire Hotel - Invoices Report</title>
//                     <style>
//                         @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                        
//                         * {
//                             margin: 0;
//                             padding: 0;
//                             box-sizing: border-box;
//                         }
                        
//                         body {
//                             font-family: 'Poppins', sans-serif;
//                             background: #fff;
//                             color: #333;
//                             padding: 20px;
//                             line-height: 1.6;
//                         }
                        
//                         .print-header {
//                             background: linear-gradient(135deg, #059669 0%, #10b981 100%);
//                             color: white;
//                             padding: 30px 40px;
//                             border-radius: 12px;
//                             margin-bottom: 30px;
//                             text-align: center;
//                         }
                        
//                         .hotel-name {
//                             font-size: 32px;
//                             font-weight: 700;
//                             letter-spacing: 1px;
//                             margin-bottom: 5px;
//                         }
                        
//                         .hotel-tagline {
//                             font-size: 14px;
//                             opacity: 0.9;
//                             margin-bottom: 15px;
//                         }
                        
//                         .report-title {
//                             font-size: 24px;
//                             font-weight: 600;
//                             margin: 20px 0;
//                             color: #059669;
//                             text-align: center;
//                         }
                        
//                         .report-info {
//                             background: #f0fdf4;
//                             border: 1px solid #d1fae5;
//                             border-radius: 10px;
//                             padding: 20px;
//                             margin-bottom: 25px;
//                         }
                        
//                         .info-grid {
//                             display: grid;
//                             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//                             gap: 15px;
//                             margin-bottom: 20px;
//                         }
                        
//                         .info-item {
//                             display: flex;
//                             align-items: center;
//                             gap: 10px;
//                         }
                        
//                         .info-label {
//                             font-weight: 500;
//                             color: #374151;
//                             min-width: 120px;
//                         }
                        
//                         .info-value {
//                             color: #059669;
//                             font-weight: 500;
//                         }
                        
//                         .print-table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin: 25px 0;
//                         }
                        
//                         .print-table th {
//                             background: #f0fdf4;
//                             color: #059669;
//                             font-weight: 600;
//                             padding: 12px 15px;
//                             text-align: left;
//                             border-bottom: 2px solid #d1fae5;
//                         }
                        
//                         .print-table td {
//                             padding: 12px 15px;
//                             border-bottom: 1px solid #e5e7eb;
//                         }
                        
//                         .print-table tr:hover {
//                             background: #f9fafb;
//                         }
                        
//                         .total-section {
//                             background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
//                             border-radius: 10px;
//                             padding: 25px;
//                             margin: 25px 0;
//                             border: 1px solid #d1fae5;
//                         }
                        
//                         .total-row {
//                             display: flex;
//                             justify-content: space-between;
//                             padding: 8px 0;
//                             border-bottom: 1px solid #d1fae5;
//                         }
                        
//                         .grand-total {
//                             font-size: 20px;
//                             font-weight: 700;
//                             color: #059669;
//                             margin-top: 10px;
//                             padding-top: 10px;
//                             border-top: 2px solid #059669;
//                         }
                        
//                         .print-footer {
//                             text-align: center;
//                             padding: 30px;
//                             color: #6b7280;
//                             font-style: italic;
//                             margin-top: 40px;
//                             border-top: 1px solid #e5e7eb;
//                         }
                        
//                         @media print {
//                             body {
//                                 background: white !important;
//                             }
                            
//                             .no-print {
//                                 display: none !important;
//                             }
                            
//                             .print-header {
//                                 box-shadow: none;
//                                 padding: 20px;
//                             }
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     ${printContent}
//                 </body>
//             </html>
//         `);
//         printWindow.document.close();
        
//         printWindow.onload = function() {
//             printWindow.focus();
//             setTimeout(() => {
//                 printWindow.print();
//                 printWindow.close();
//             }, 500);
//         };
//     };

//     // Calculate totals for footer
//     const calculateTotals = () => {
//         return allInvoices.reduce((acc, invoice) => {
//             acc.totalAmount += invoice.bills?.totalWithTax || 0;
//             acc.totalTax += invoice.bills?.tax || 0;
//             acc.totalPayed += invoice.bills?.payed || 0;
//             acc.totalBalance += invoice.bills?.balance || 0;
//             return acc;
//         }, {
//             totalAmount: 0,
//             totalTax: 0,
//             totalPayed: 0,
//             totalBalance: 0
//         });
//     };

//     const totals = calculateTotals();

//     return (
//         // Main container with proper sidebar adjustment
//         <div className="flex-1 overflow-hidden">
//             <section className='w-full bg-gradient-to-br from-emerald-50 to-white min-h-screen overflow-hidden'>
//                 {/* Main Container with responsive width */}
//                 <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 mx-1  overflow-hidden">
//                     {/* Header */}
//                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//                         <div className="flex items-center gap-3">
//                             <BackButton />
//                             <div>
//                                 <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">
//                                     Invoices Management
//                                 </h1>
//                                 <p className="text-xs md:text-sm text-emerald-600 mt-1">
//                                     Manage and track all booking invoices
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={refreshOrderList}
//                                 disabled={isLoading}
//                                 className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors duration-200"
//                             >
//                                 <FaSync className={`${isLoading ? 'animate-spin' : ''}`} />
//                                 <span className="text-xs md:text-sm font-medium">Refresh</span>
//                             </button>
                            
//                             <button
//                                 onClick={handlePrint}
//                                 className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
//                             >
//                                 <FaPrint />
//                                 <span className="text-xs md:text-sm font-medium">Print</span>
//                             </button>
//                         </div>
//                     </div>

//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">

//                         <div className="bg-gradient-to-r from-black-50 to-black-50 rounded-xl p-3 md:p-4 border border-emerald-100">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs md:text-sm text-[#1a1a1qa] mb-1">Total Invoices</p>
//                                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">{allInvoices.length}</p>
//                                 </div>
//                                 <div className="bg-emerald-100 p-2 md:p-3 rounded-lg">
//                                     <FaReceipt className="text-emerald-600" size={20} />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-3 md:p-4 border border-emerald-100">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs md:text-sm text-emerald-600 mb-1">Total Revenue</p>
//                                     <p className="text-xl md:text-2xl lg:text-lg font-bold text-emerald-800">
//                                         {totals.totalAmount.toFixed(2)} SD
//                                     </p>
//                                 </div>
//                                 <div className="bg-emerald-100 p-2 md:p-3 rounded-lg">
//                                     <FaMoneyBillWave className="text-emerald-600" size={20} />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-r from-orange-50 to-orange-50 rounded-xl p-3 md:p-4 border border-emerald-100">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs md:text-sm text-emerald-600 mb-1">In Progress</p>
//                                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">
//                                         {allInvoices.filter(inv => inv.orderStatus === 'In Progress').length}
//                                     </p>
//                                 </div>
//                                 <div className="bg-blue-100 p-2 md:p-3 rounded-lg">
//                                     <FaShoppingBag className="text-blue-600" size={20} />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 md:p-4 border border-emerald-100">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs md:text-sm text-emerald-600 mb-1">CheckedIn</p>
//                                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">
//                                         {allInvoices.filter(inv => inv.orderStatus === 'checkedIn').length}
//                                     </p>
//                                 </div>
//                                 <div className="bg-green-100 p-2 md:p-3 rounded-lg">
//                                     <FaFileInvoice className="text-green-600" size={20} />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-r from-red-50 to-red-50 rounded-xl p-3 md:p-4 border border-emerald-100">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs md:text-sm text-red-600 mb-1">Cancelled</p>
//                                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">
//                                         {allInvoices.filter(inv => inv.orderStatus === 'Cancel').length}
//                                     </p>
//                                 </div>
//                                 <div className="bg-green-100 p-2 md:p-3 rounded-lg">
//                                     <FaFileInvoice className="text-red-600" size={20} />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-gradient-to-r from-red-50 to-red-50 rounded-xl p-3 md:p-4 border border-emerald-100">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs md:text-sm text-red-600 mb-1">Checked Out</p>
//                                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-800">
//                                         {allInvoices.filter(inv => inv.orderStatus === 'Checked Out').length}
//                                     </p>
//                                 </div>
//                                 <div className="bg-green-100 p-2 md:p-3 rounded-lg">
//                                     <FaFileInvoice className="text-red-600" size={20} />
//                                 </div>
//                             </div>
//                         </div>

//                     </div>

//                     {/* Search and Filter Bar */}
//                     <div className="space-y-4 mb-6">
//                         {/* Search Bar */}
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <FaSearch className="text-emerald-400" size={18} />
//                             </div>
//                             <input
//                                 type="text"
//                                 placeholder="Search invoices by customer, room, or ID..."
//                                 className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border-2 border-emerald-200 rounded-xl text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all text-sm md:text-base"
//                                 value={search}
//                                 onChange={(e) => setSearch(e.target.value)}
//                             />
//                         </div>

//                         {/* Filters - Responsive layout */}
//                         <div className="flex flex-wrap items-center gap-2 md:gap-4">
//                             <div className="flex items-center gap-2">
//                                 <FaCalendarAlt className="text-emerald-600 hidden sm:block" size={14} />
//                                 <select
//                                     value={frequency}
//                                     onChange={(e) => setFrequency(e.target.value)}
//                                     className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
//                                 >
//                                     <option value="1">Today</option>
//                                     <option value="7">Last 7 Days</option>
//                                     <option value="30">Last 30 Days</option>
//                                     <option value="90">Last 90 Days</option>
//                                     <option value="365">All Time</option>
//                                 </select>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <FaFilter className="text-emerald-600 hidden sm:block" size={14} />
//                                 <select
//                                     value={orderStatus}
//                                     onChange={(e) => setOrderStatus(e.target.value)}
//                                     className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
//                                 >
//                                     <option value="all">All Status</option>
//                                     <option value="In Progress">In Progress</option>
//                                     <option value="Checked In">Checked In</option>
//                                     <option value="Cancel">Cancelled</option>
//                                     <option value="Checked Out">Checked Out</option>
//                                 </select>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <FaHotel className="text-emerald-600 hidden sm:block" size={14} />
//                                 <select
//                                     value={shift}
//                                     onChange={(e) => setShift(e.target.value)}
//                                     className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
//                                 >
//                                     <option value="all">All Shifts</option>
//                                     <option value="Morning">Morning</option>
//                                     <option value="Evening">Evening</option>
//                                 </select>
//                             </div>

//                             <div className="flex items-center gap-2">
//                                 <FaSortAmountDown className="text-emerald-600 hidden sm:block" size={14} />
//                                 <select
//                                     value={sort}
//                                     onChange={(e) => {
//                                         setSort(e.target.value);
//                                         setPagination(prev => ({ ...prev, currentPage: 1 }));
//                                     }}
//                                     className="border-2 border-emerald-200 rounded-lg px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm text-emerald-700 focus:border-emerald-500 focus:outline-none"
//                                 >
//                                     <option value="-createdAt">Newest First</option>
//                                     <option value="createdAt">Oldest First</option>
//                                     <option value="orderStatus">By Status</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Print Content (Hidden for display, used for printing) */}
//                     <div ref={printRef} className="hidden">
//                         <div className="print-header">
//                             <h1 className="hotel-name">SOLITAIRE HOTEL</h1>
//                             <p className="hotel-tagline">Luxury Redefined • Premium Hospitality</p>
//                             <div className="mt-4">
//                                 <p>123 Luxury Street, City Center</p>
//                                 <p>Phone: +1 234 567 8900 • Email: info@solitairehotel.com</p>
//                             </div>
//                         </div>

//                         <h2 className="report-title">Invoices Report</h2>

//                         <div className="report-info">
//                             <div className="info-grid">
//                                 <div className="info-item">
//                                     <span className="info-label">Report Date:</span>
//                                     <span className="info-value">{new Date().toLocaleDateString()}</span>
//                                 </div>
//                                 <div className="info-item">
//                                     <span className="info-label">Period:</span>
//                                     <span className="info-value">
//                                         {frequency === '365' ? 'All Time' : `Last ${frequency} days`}
//                                     </span>
//                                 </div>
//                                 <div className="info-item">
//                                     <span className="info-label">Status:</span>
//                                     <span className="info-value">
//                                         {orderStatus === 'all' ? 'All Status' : orderStatus}
//                                     </span>
//                                 </div>
//                                 <div className="info-item">
//                                     <span className="info-label">Total Invoices:</span>
//                                     <span className="info-value">{allInvoices.length}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <table className="print-table">
//                             <thead>
//                                 <tr>
//                                     <th>Invoice #</th>
//                                     <th>Date</th>
//                                     <th>Customer</th>
//                                     <th>Room</th>
//                                     <th>Status</th>
//                                     <th>Total (SD)</th>
//                                     <th>Paid (SD)</th>
//                                     <th>Balance (SD)</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {allInvoices.map((invoice) => (
//                                     <tr key={invoice._id}>
//                                         <td>{invoice.orderNo}</td>
//                                         <td>{new Date(invoice.orderDate || invoice.createdAt).toLocaleDateString('en-GB')}</td>
//                                         <td>{invoice.customerDetails?.name || 'N/A'}</td>
//                                         <td>{invoice.room?.roomNo || 'N/A'}</td>
//                                         <td>{invoice.orderStatus}</td>
//                                         <td>{(invoice.bills?.totalWithTax || 0).toFixed(2)}</td>
//                                         <td>{(invoice.bills?.payed || 0).toFixed(2)}</td>
//                                         <td>{(invoice.bills?.balance || 0).toFixed(2)}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                             <tfoot>
//                                 <tr>
//                                     <td colSpan="5" className="font-bold text-right">Totals:</td>
//                                     <td className="font-bold">{totals.totalAmount.toFixed(2)} SD</td>
//                                     <td className="font-bold">{totals.totalPayed.toFixed(2)} SD</td>
//                                     <td className="font-bold">{totals.totalBalance.toFixed(2)} SD</td>
//                                 </tr>
//                             </tfoot>
//                         </table>

//                         <div className="print-footer">
//                             <p className="text-lg font-semibold text-emerald-700 mb-2">
//                                 Thank You for Choosing Solitaire Hotel!
//                             </p>
//                             <p className="text-gray-600">This report was generated on {new Date().toLocaleString()}</p>
//                             <p className="text-sm text-gray-500 mt-4">For any inquiries, please contact: +1 234 567 8900</p>
//                         </div>
//                     </div>

//                     {/* Loading State */}
//                     {isLoading ? (
//                         <div className="flex justify-center items-center p-8 md:p-12">
//                             <div className="text-center">
//                                 <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-emerald-600 mx-auto"></div>
//                                 <p className="mt-3 text-emerald-600">Loading invoices...</p>
//                             </div>
//                         </div>
//                     ) : allInvoices.length === 0 ? (
//                         <div className="text-center py-8 md:py-12">
//                             <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
//                                 <FaReceipt className="text-emerald-600" size={24} />
//                             </div>
//                             <h3 className="text-base md:text-lg font-semibold text-emerald-800 mb-2">No Invoices Found</h3>
//                             <p className="text-emerald-600">Try adjusting your filters or create a new invoice.</p>
//                         </div>
//                     ) : (
//                         // Table container WITHOUT horizontal scrollbar
//                         <div className="overflow-x-auto scrollbar-hide" ref={tableRef}>
//                             <table className="w-full min-w-max">
//                                 <thead className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
//                                     <tr>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Date</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">By</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Shift</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Room</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Customer</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Total</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Tax</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Grand Total</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Paid</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Payment</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Balance</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Status</th>
//                                         <th className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-emerald-100">
//                                     {allInvoices.map((invoice) => (
//                                         <InvoiceDetails
//                                             key={invoice._id}
//                                             id={invoice._id}
//                                             date={invoice.orderDate}
//                                             number={invoice.orderNo}
//                                             shift={invoice.shift}
//                                             // room={invoice.room?.roomNo || 'N/A'}
//                                             // ✅ FIX: Pass the room ID for updates, and room number for display
//                                             roomId={invoice.room?._id}  // Pass the ID for updates
//                                             roomNumber={invoice.room?.roomNo || 'N/A'}
//                                             customer={invoice.customerDetails?.name}
//                                             phone={invoice.customerDetails?.phone}
//                                             total={invoice.bills?.total}
//                                             tax={invoice.bills?.tax}
//                                             totalWithTax={invoice.bills?.totalWithTax}
//                                             payed={invoice.bills?.payed}
//                                             balance={invoice.bills?.balance}
//                                             payment={invoice.paymentMethod}
//                                             status={invoice.orderStatus}
//                                             items={invoice.items}
//                                             customerId={invoice.customer}
//                                             user={invoice.user?.name}
//                                             onStatusUpdate={refreshOrderList}
//                                         />
//                                     ))}
//                                 </tbody>
//                                 {/* Table Footer */}
//                                 <tfoot className="bg-gradient-to-r from-emerald-50 to-green-50 border-t-2 border-emerald-200">
//                                     <tr>
//                                         <td colSpan="5" className="px-4 py-3 text-right font-bold text-emerald-800 whitespace-nowrap">
//                                             Totals:
//                                         </td>
//                                         <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
//                                             {totals.totalAmount.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
//                                             {totals.totalTax.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
//                                             {totals.totalAmount.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
//                                             {totals.totalPayed.toFixed(2)}
//                                         </td>
//                                         <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
//                                             -
//                                         </td>
//                                         <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">
//                                             {totals.totalBalance.toFixed(2)}
//                                         </td>
//                                         <td colSpan="2" className="px-4 py-3 text-center text-xs md:text-sm text-emerald-600 whitespace-nowrap">
//                                             {allInvoices.length} invoices
//                                         </td>
//                                     </tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//                     )}

//                     {/* Pagination */}
//                     {!isLoading && allInvoices.length > 0 && (
//                         <div className="flex flex-col sm:flex-row justify-between items-center mt-4 md:mt-6 pt-4 md:pt-6 border-t border-emerald-100">
//                             <div className="text-xs md:text-sm text-emerald-600 mb-2 sm:mb-0">
//                                 Showing {allInvoices.length} of {pagination.totalItems} invoices
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
//                                     disabled={pagination.currentPage === 1}
//                                     className="px-2 py-1 md:px-3 md:py-1.5 bg-emerald-100 text-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 text-xs md:text-sm"
//                                 >
//                                     Previous
//                                 </button>
//                                 <span className="px-2 py-1 md:px-3 md:py-1.5 bg-emerald-600 text-white rounded-lg text-xs md:text-sm">
//                                     {pagination.currentPage}
//                                 </span>
//                                 <button
//                                     onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
//                                     disabled={pagination.currentPage === pagination.totalPages}
//                                     className="px-2 py-1 md:px-3 md:py-1.5 bg-emerald-100 text-emerald-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 text-xs md:text-sm"
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </section>
//         </div>
//     );
// };

// export default Invoices;
