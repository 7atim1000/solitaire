import React, { useState, useEffect, useContext, useRef } from 'react';
import { api } from '../https';
import { toast } from 'react-hot-toast';
import { 
    FaFileInvoice, FaSearch, FaFilter, FaCalendar, 
    FaPrint, FaDownload, FaEye, FaMoneyBillWave,
    FaArrowLeft, FaArrowRight, FaChartLine, FaPercentage,
    FaTimes, FaFilePdf
} from 'react-icons/fa';
import { MdOutlineReceipt, MdOutlineDateRange } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import hotel from '../assets/images/solitair.png' 

const TaxesReport = () => {
    const printRef = useRef(null);

    // State
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({
        totalOrderValue: 0,
        totalTaxValue: 0,
        count: 0
    });
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        search: '',
        sortBy: 'taxDate',
        sortOrder: 'desc',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTax, setSelectedTax] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printDateRange, setPrintDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Fetch taxes
    const fetchTaxes = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();
            
            // Add pagination
            params.append('page', filters.page.toString());
            params.append('limit', filters.limit.toString());
            params.append('sortBy', filters.sortBy);
            params.append('sortOrder', filters.sortOrder);
            
            // Add filters if they have values
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.search) params.append('search', filters.search);
            
            console.log('Fetching taxes with params:', params.toString());
            
            const response = await api.get(`/api/taxes?${params.toString()}`);
            
            if (response.data.success) {
                setTaxes(response.data.data.taxes || []);
                setPagination(response.data.data.pagination || {
                    currentPage: filters.page,
                    totalPages: 1,
                    totalItems: response.data.data.taxes?.length || 0,
                    itemsPerPage: filters.limit
                });
                setSummary(response.data.data.summary || {
                    totalOrderValue: 0,
                    totalTaxValue: 0,
                    count: 0
                });
                
                console.log(`✅ Found ${response.data.data.taxes?.length} tax records`);
            } else {
                toast.error('Failed to fetch tax records');
            }
        } catch (error) {
            console.error('Error fetching taxes:', error);
            toast.error('Error loading tax records');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchTaxes();
    }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page on filter change
        }));
    };

    // Handle search
    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchTaxes();
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    // Handle sort change
    const handleSortChange = (sortBy) => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
            page: 1
        }));
    };

    // Handle view details
    const handleViewDetails = (tax) => {
        setSelectedTax(tax);
        setShowDetailsModal(true);
    };

    // Handle print report
    const handlePrintReport = () => {
        setPrintDateRange({
            startDate: filters.startDate,
            endDate: filters.endDate
        });
        setShowPrintModal(true);
    };

    // Handle print with custom date range
    const handlePrintWithDateRange = async () => {
        setShowPrintModal(false);
        
        // Fetch all taxes for the selected date range (no pagination)
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('limit', '1000'); // Get up to 1000 records
            
            if (printDateRange.startDate) params.append('startDate', printDateRange.startDate);
            if (printDateRange.endDate) params.append('endDate', printDateRange.endDate);
            
            const response = await api.get(`/api/taxes?${params.toString()}`);
            
            if (response.data.success) {
                const allTaxes = response.data.data.taxes || [];
                const summaryData = response.data.data.summary || {
                    totalOrderValue: 0,
                    totalTaxValue: 0,
                    count: 0
                };
                
                // Store in a ref for printing
                printAllTaxes(allTaxes, summaryData);
            } else {
                toast.error('Failed to fetch tax records for printing');
            }
        } catch (error) {
            console.error('Error fetching taxes for print:', error);
            toast.error('Error loading tax records for printing');
        } finally {
            setLoading(false);
        }
    };

    // Print all taxes function
    const printAllTaxes = (taxesData, summaryData) => {
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        
        const startDateStr = printDateRange.startDate 
            ? new Date(printDateRange.startDate).toLocaleDateString('en-GB') 
            : 'All Time';
        const endDateStr = printDateRange.endDate 
            ? new Date(printDateRange.endDate).toLocaleDateString('en-GB') 
            : 'Present';
        
        const formatCurrency = (amount) => Number(amount || 0).toFixed(2);
        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('en-GB');
        };

        const calculateTaxRate = (orderValue, taxValue) => {
            if (!orderValue || orderValue === 0) return '0.00';
            return ((taxValue / orderValue) * 100).toFixed(2);
        };

        printWindow.document.write(`
            <html>
                <head>
                    <title>Solitaire Hotel - Tax Report</title>
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
                        
                        .report-container { 
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
                        
                        .report-title {
                            font-size: 28px;
                            font-weight: bold;
                            color: #065f46;
                            text-align: center;
                            margin-bottom: 25px;
                            letter-spacing: 1px;
                        }
                        
                        .date-range {
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 8px;
                            padding: 15px;
                            margin-bottom: 25px;
                            text-align: center;
                            font-weight: 600;
                            color: #065f46;
                            font-size: 16px;
                        }
                        
                        .summary-section {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        
                        .summary-card {
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                        }
                        
                        .summary-card .label {
                            font-size: 14px;
                            color: #047857;
                            margin-bottom: 8px;
                            font-weight: 500;
                        }
                        
                        .summary-card .value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #065f46;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 25px 0;
                            font-size: 12px;
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
                        
                        tbody tr:hover {
                            background-color: #f9fafb;
                        }
                        
                        .text-right {
                            text-align: right;
                        }
                        
                        .total-row {
                            background-color: #f0fdf4;
                            font-weight: 600;
                        }
                        
                        .total-row td {
                            border-top: 2px solid #10b981;
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
                        
                        @media print {
                            body { 
                                padding: 0; 
                                background: white;
                            }
                            .report-container {
                                box-shadow: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${hotel}" alt="Solitaire Hotel" />
                            </div>
                            <div class="hotel-info">
                                <div class="hotel-name">SOLITAIRE HOTEL</div>
                                <div class="hotel-tagline">Luxury Redefined • Premium Hospitality</div>
                            </div>
                        </div>
                        
                        <div class="report-title">TAX REPORT</div>
                        
                        <div class="date-range">
                            Period: ${startDateStr} - ${endDateStr}
                        </div>

                        <div class="summary-section">
                            <div class="summary-card">
                                <div class="label">Total Records</div>
                                <div class="value">${summaryData.count}</div>
                            </div>
                            <div class="summary-card">
                                <div class="label">Total Order Value</div>
                                <div class="value">${formatCurrency(summaryData.totalOrderValue)} SD</div>
                            </div>
                            <div class="summary-card">
                                <div class="label">Total Tax Collected</div>
                                <div class="value">${formatCurrency(summaryData.totalTaxValue)} SD</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Tax Number</th>
                                    <th>Date</th>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Room</th>
                                    <th class="text-right">Order Value</th>
                                    <th>Tax Type</th>
                                    <th class="text-right">Tax Value</th>
                                    <th class="text-right">Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${taxesData.map(tax => `
                                    <tr>
                                        <td>${tax.taxNumber || 'N/A'}</td>
                                        <td>${formatDate(tax.taxDate)}</td>
                                        <td>${tax.order?.orderNo || 'N/A'}</td>
                                        <td>${tax.order?.customer?.name || tax.order?.customerDetails?.name || 'N/A'}</td>
                                        <td>${tax.order?.room?.roomNumber || tax.order?.room || 'N/A'}</td>
                                        <td class="text-right">${formatCurrency(tax.orderValue)} SD</td>
                                        <td>${tax.tax || 'VAT'}</td>
                                        <td class="text-right">${formatCurrency(tax.taxValue)} SD</td>
                                        <td class="text-right">${calculateTaxRate(tax.orderValue, tax.taxValue)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="5" class="text-right"><strong>TOTAL</strong></td>
                                    <td class="text-right"><strong>${formatCurrency(summaryData.totalOrderValue)} SD</strong></td>
                                    <td></td>
                                    <td class="text-right"><strong>${formatCurrency(summaryData.totalTaxValue)} SD</strong></td>
                                    <td class="text-right"><strong>${summaryData.totalOrderValue > 0 ? ((summaryData.totalTaxValue / summaryData.totalOrderValue) * 100).toFixed(2) : '0.00'}%</strong></td>
                                </tr>
                            </tfoot>
                        </table>

                        <div class="footer">
                            <p>This is a computer generated tax report</p>
                            <p>Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <p>Solitaire Hotel • Luxury Redefined • Premium Hospitality</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format short date
    const formatShortDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return Number(amount || 0).toFixed(2);
    };

    // Calculate tax rate
    const calculateTaxRate = (orderValue, taxValue) => {
        if (!orderValue || orderValue === 0) return '0.00';
        return ((taxValue / orderValue) * 100).toFixed(2);
    };

    // Get sort icon
    const getSortIcon = (field) => {
        if (filters.sortBy !== field) return '↕️';
        return filters.sortOrder === 'desc' ? '↓' : '↑';
    };

    return (
        <div className="min-h-screen w-full bg-gray-50" dir="ltr">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaFileInvoice className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Taxes Report</h1>
                                <p className="text-green-100 text-sm">View and manage all tax records</p>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-4">
                                <div className="text-white">
                                    <p className="text-xs text-green-200">Total Tax</p>
                                    <p className="text-lg font-bold">{formatCurrency(summary.totalTaxValue)} SD</p>
                                </div>
                                <div className="w-px h-8 bg-white/20"></div>
                                <div className="text-white">
                                    <p className="text-xs text-green-200">Records</p>
                                    <p className="text-lg font-bold">{summary.count}</p>
                                </div>
                            </div>
                            
                            {/* Print Report Button */}
                            <button
                                onClick={handlePrintReport}
                                className="flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md"
                            >
                                <FaPrint />
                                <span>Print Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Filters Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
                    <div 
                        className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center gap-2">
                            <FaFilter />
                            <span className="font-medium">Search & Filter Options</span>
                        </div>
                        <span>{showFilters ? '▲' : '▼'}</span>
                    </div>
                    
                    {showFilters && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="search"
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            placeholder="Tax number, type..."
                                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                {/* Date Range - Start */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Date Range - End */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Items Per Page */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Items Per Page
                                    </label>
                                    <select
                                        name="limit"
                                        value={filters.limit}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSearch}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                                >
                                    <FaSearch />
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Order Value</p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalOrderValue)} SD</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <FaMoneyBillWave className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Tax Collected</p>
                                <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalTaxValue)} SD</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaPercentage className="text-blue-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Average Tax Rate</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {summary.totalOrderValue > 0 
                                        ? ((summary.totalTaxValue / summary.totalOrderValue) * 100).toFixed(2) 
                                        : '0.00'}%
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FaChartLine className="text-purple-600 text-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Taxes Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th 
                                        className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
                                        onClick={() => handleSortChange('taxNumber')}
                                    >
                                        Tax Number {getSortIcon('taxNumber')}
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
                                        onClick={() => handleSortChange('taxDate')}
                                    >
                                        Date {getSortIcon('taxDate')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order #</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room</th>
                                    <th 
                                        className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
                                        onClick={() => handleSortChange('orderValue')}
                                    >
                                        Order Value {getSortIcon('orderValue')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tax Type</th>
                                    <th 
                                        className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
                                        onClick={() => handleSortChange('taxValue')}
                                    >
                                        Tax Value {getSortIcon('taxValue')}
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Rate</th>
                                    {/* <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                            </div>
                                            <p className="mt-2 text-gray-500">Loading tax records...</p>
                                        </td>
                                    </tr>
                                ) : taxes.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-3" />
                                            <p className="text-gray-500">No tax records found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    taxes.map((tax) => (
                                        <tr key={tax._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-green-600">
                                                    {tax.taxNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {formatShortDate(tax.taxDate)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {tax.order?.orderNo || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {tax.order?.customer?.name || tax.order?.customerDetails?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {tax.order?.room?.roomNo || tax.order?.room || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(tax.orderValue)} SD
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {tax.tax || 'VAT'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {formatCurrency(tax.taxValue)} SD
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-medium text-purple-600">
                                                    {calculateTaxRate(tax.orderValue, tax.taxValue)}%
                                                </span>
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(tax)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Print"
                                                    >
                                                        <FaPrint size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Download"
                                                    >
                                                        <FaDownload size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                        title="Options"
                                                    >
                                                        <BsThreeDotsVertical size={18} />
                                                    </button>
                                                </div>
                                            </td> */}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
                                >
                                    <FaArrowLeft size={14} />
                                    Previous
                                </button>
                                <span className="px-4 py-1 bg-green-600 text-white rounded-lg">
                                    {pagination.currentPage}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
                                >
                                    Next
                                    <FaArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print Date Range Modal */}
            {showPrintModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">Print Tax Report</h2>
                            <button
                                onClick={() => setShowPrintModal(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">Select date range for the report:</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        From Date
                                    </label>
                                    <input
                                        type="date"
                                        value={printDateRange.startDate}
                                        onChange={(e) => setPrintDateRange({...printDateRange, startDate: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        To Date
                                    </label>
                                    <input
                                        type="date"
                                        value={printDateRange.endDate}
                                        onChange={(e) => setPrintDateRange({...printDateRange, endDate: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePrintWithDateRange}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <FaPrint />
                                    Generate Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedTax && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <FaFileInvoice className="text-white text-xl" />
                                <h2 className="text-xl font-bold">Tax Details</h2>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                {/* Tax Information */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-green-700 mb-3">Tax Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Tax Number</p>
                                            <p className="font-medium text-gray-800">{selectedTax.taxNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Tax Date</p>
                                            <p className="font-medium text-gray-800">{formatDate(selectedTax.taxDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Tax Type</p>
                                            <p className="font-medium text-gray-800">{selectedTax.tax || 'VAT'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Tax Rate</p>
                                            <p className="font-medium text-gray-800">
                                                {calculateTaxRate(selectedTax.orderValue, selectedTax.taxValue)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Information */}
                                {selectedTax.order && (
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-blue-700 mb-3">Order Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Order Number</p>
                                                <p className="font-medium text-gray-800">{selectedTax.order.orderNo || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Customer</p>
                                                <p className="font-medium text-gray-800">
                                                    {selectedTax.order.customer?.name || selectedTax.order.customerDetails?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Room</p>
                                                <p className="font-medium text-gray-800">
                                                    {selectedTax.order.room?.roomNumber || selectedTax.order.room || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Booking Period</p>
                                                <p className="font-medium text-gray-800">
                                                    {formatShortDate(selectedTax.order.dateBooking)} - {formatShortDate(selectedTax.order.dateReturn)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Financial Summary */}
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-purple-700 mb-3">Financial Summary</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Order Value:</span>
                                            <span className="font-medium text-gray-800">{formatCurrency(selectedTax.orderValue)} SD</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Tax Value ({selectedTax.tax || 'VAT'}):</span>
                                            <span className="font-medium text-blue-600">{formatCurrency(selectedTax.taxValue)} SD</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                                            <span className="font-semibold text-gray-800">Total:</span>
                                            <span className="font-bold text-lg text-purple-700">
                                                {formatCurrency(selectedTax.orderValue + selectedTax.taxValue)} SD
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="text-xs text-gray-400 flex justify-between pt-2">
                                    <span>Created: {formatDate(selectedTax.createdAt)}</span>
                                    <span>Updated: {formatDate(selectedTax.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <FaPrint />
                                Print
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxesReport;


// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { api } from '../https';
// import { toast } from 'react-hot-toast';
// import { 
//     FaFileInvoice, FaSearch, FaFilter, FaCalendar, 
//     FaPrint, FaDownload, FaEye, FaMoneyBillWave,
//     FaArrowLeft, FaArrowRight, FaChartLine, FaPercentage,
//     FaTimes, FaFilePdf
// } from 'react-icons/fa';
// import { MdOutlineReceipt, MdOutlineDateRange } from 'react-icons/md';
// import { BsThreeDotsVertical } from 'react-icons/bs';
// import hotel from '../assets/images/solitair.png' 

// const TaxesReport = () => {
//     const printRef = useRef(null);

//     // State
//     const [taxes, setTaxes] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [summary, setSummary] = useState({
//         totalOrderValue: 0,
//         totalTaxValue: 0,
//         count: 0
//     });
//     const [filters, setFilters] = useState({
//         startDate: '',
//         endDate: '',
//         search: '',
//         sortBy: 'taxDate',
//         sortOrder: 'desc',
//         page: 1,
//         limit: 10
//     });
//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         totalPages: 1,
//         totalItems: 0,
//         itemsPerPage: 10
//     });
//     const [showFilters, setShowFilters] = useState(false);
//     const [selectedTax, setSelectedTax] = useState(null);
//     const [showDetailsModal, setShowDetailsModal] = useState(false);
//     const [showPrintModal, setShowPrintModal] = useState(false);
//     const [printDateRange, setPrintDateRange] = useState({
//         startDate: '',
//         endDate: ''
//     });

//     // Fetch taxes
//     const fetchTaxes = async () => {
//         setLoading(true);
//         try {
//             // Build query parameters
//             const params = new URLSearchParams();
            
//             // Add pagination
//             params.append('page', filters.page.toString());
//             params.append('limit', filters.limit.toString());
//             params.append('sortBy', filters.sortBy);
//             params.append('sortOrder', filters.sortOrder);
            
//             // Add filters if they have values
//             if (filters.startDate) params.append('startDate', filters.startDate);
//             if (filters.endDate) params.append('endDate', filters.endDate);
//             if (filters.search) params.append('search', filters.search);
            
//             console.log('Fetching taxes with params:', params.toString());
            
//             const response = await api.get(`/api/taxes?${params.toString()}`);
            
//             if (response.data.success) {
//                 setTaxes(response.data.data.taxes || []);
//                 setPagination(response.data.data.pagination || {
//                     currentPage: filters.page,
//                     totalPages: 1,
//                     totalItems: response.data.data.taxes?.length || 0,
//                     itemsPerPage: filters.limit
//                 });
//                 setSummary(response.data.data.summary || {
//                     totalOrderValue: 0,
//                     totalTaxValue: 0,
//                     count: 0
//                 });
                
//                 console.log(`✅ Found ${response.data.data.taxes?.length} tax records`);
//             } else {
//                 toast.error('Failed to fetch tax records');
//             }
//         } catch (error) {
//             console.error('Error fetching taxes:', error);
//             toast.error('Error loading tax records');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Initial fetch
//     useEffect(() => {
//         fetchTaxes();
//     }, [filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

//     // Handle filter change
//     const handleFilterChange = (e) => {
//         const { name, value } = e.target;
//         setFilters(prev => ({
//             ...prev,
//             [name]: value,
//             page: 1 // Reset to first page on filter change
//         }));
//     };

//     // Handle search
//     const handleSearch = () => {
//         setFilters(prev => ({ ...prev, page: 1 }));
//         fetchTaxes();
//     };

//     // Handle page change
//     const handlePageChange = (newPage) => {
//         if (newPage >= 1 && newPage <= pagination.totalPages) {
//             setFilters(prev => ({ ...prev, page: newPage }));
//         }
//     };

//     // Handle sort change
//     const handleSortChange = (sortBy) => {
//         setFilters(prev => ({
//             ...prev,
//             sortBy,
//             sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
//             page: 1
//         }));
//     };

//     // Handle view details
//     const handleViewDetails = (tax) => {
//         setSelectedTax(tax);
//         setShowDetailsModal(true);
//     };

//     // Handle print report
//     const handlePrintReport = () => {
//         setPrintDateRange({
//             startDate: filters.startDate,
//             endDate: filters.endDate
//         });
//         setShowPrintModal(true);
//     };

//     // Handle print with custom date range
//     const handlePrintWithDateRange = async () => {
//         setShowPrintModal(false);
        
//         // Fetch all taxes for the selected date range (no pagination)
//         setLoading(true);
//         try {
//             const params = new URLSearchParams();
//             params.append('limit', '1000'); // Get up to 1000 records
            
//             if (printDateRange.startDate) params.append('startDate', printDateRange.startDate);
//             if (printDateRange.endDate) params.append('endDate', printDateRange.endDate);
            
//             const response = await api.get(`/api/taxes?${params.toString()}`);
            
//             if (response.data.success) {
//                 const allTaxes = response.data.data.taxes || [];
//                 const summaryData = response.data.data.summary || {
//                     totalOrderValue: 0,
//                     totalTaxValue: 0,
//                     count: 0
//                 };
                
//                 // Store in a ref for printing
//                 printAllTaxes(allTaxes, summaryData);
//             } else {
//                 toast.error('Failed to fetch tax records for printing');
//             }
//         } catch (error) {
//             console.error('Error fetching taxes for print:', error);
//             toast.error('Error loading tax records for printing');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Print all taxes function
//     const printAllTaxes = (taxesData, summaryData) => {
//         // Create a hidden div with the print content
//         const printWindow = window.open('', '_blank', 'width=1200,height=800');
        
//         const startDateStr = printDateRange.startDate 
//             ? new Date(printDateRange.startDate).toLocaleDateString('en-GB') 
//             : 'All Time';
//         const endDateStr = printDateRange.endDate 
//             ? new Date(printDateRange.endDate).toLocaleDateString('en-GB') 
//             : 'Present';
        
//         const formatCurrency = (amount) => Number(amount || 0).toFixed(2);
//         const formatDate = (date) => {
//             if (!date) return 'N/A';
//             return new Date(date).toLocaleDateString('en-GB');
//         };

//         const calculateTaxRate = (orderValue, taxValue) => {
//             if (!orderValue || orderValue === 0) return '0.00';
//             return ((taxValue / orderValue) * 100).toFixed(2);
//         };

//         printWindow.document.write(`
//             <html>
//                 <head>
//                     <title>Tax Report - ${startDateStr} to ${endDateStr}</title>
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
//                         .report-container { 
//                             max-width: 100%;
//                             margin: 0 auto;
//                         }
//                         .header {
//                             text-align: center;
//                             margin-bottom: 30px;
//                             border-bottom: 2px solid #059669;
//                             padding-bottom: 15px;
//                         }
//                         .header h1 {
//                             color: #059669;
//                             font-size: 28px;
//                             margin-bottom: 5px;
//                         }
//                         .header h2 {
//                             color: #047857;
//                             font-size: 18px;
//                             font-weight: normal;
//                             margin-top: 0;
//                         }
//                         .date-range {
//                             background: #f0fdf4;
//                             padding: 10px;
//                             border-radius: 8px;
//                             margin-bottom: 20px;
//                             text-align: center;
//                             font-weight: bold;
//                             color: #047857;
//                         }
//                         .summary-section {
//                             display: grid;
//                             grid-template-columns: repeat(3, 1fr);
//                             gap: 15px;
//                             margin-bottom: 30px;
//                         }
//                         .summary-card {
//                             background: #f9fafb;
//                             border: 1px solid #e5e7eb;
//                             border-radius: 8px;
//                             padding: 15px;
//                             text-align: center;
//                         }
//                         .summary-card .label {
//                             font-size: 12px;
//                             color: #6b7280;
//                             margin-bottom: 5px;
//                         }
//                         .summary-card .value {
//                             font-size: 20px;
//                             font-weight: bold;
//                             color: #059669;
//                         }
//                         table {
//                             width: 100%;
//                             border-collapse: collapse;
//                             margin: 20px 0;
//                             font-size: 12px;
//                         }
//                         th {
//                             background-color: #059669;
//                             color: white;
//                             padding: 10px;
//                             text-align: left;
//                             font-size: 12px;
//                         }
//                         td {
//                             padding: 8px 10px;
//                             border-bottom: 1px solid #e5e7eb;
//                         }
//                         tr:nth-child(even) {
//                             background-color: #f9fafb;
//                         }
//                         .text-right {
//                             text-align: right;
//                         }
//                         .footer {
//                             margin-top: 40px;
//                             text-align: center;
//                             font-size: 10px;
//                             color: #6b7280;
//                             border-top: 1px solid #e5e7eb;
//                             padding-top: 15px;
//                         }
//                         .footer p {
//                             margin: 2px 0;
//                         }
//                         .total-row {
//                             background-color: #f0fdf4;
//                             font-weight: bold;
//                         }
//                         .total-row td {
//                             border-top: 2px solid #059669;
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     <div class="report-container">
//                         <div class="header">
//                             <h1>TAX REPORT</h1>
//                             <h2>Value Added Tax (VAT) Summary</h2>
//                         </div>
                        
//                         <div class="date-range">
//                             Period: ${startDateStr} - ${endDateStr}
//                         </div>

//                         <div class="summary-section">
//                             <div class="summary-card">
//                                 <div class="label">Total Records</div>
//                                 <div class="value">${summaryData.count}</div>
//                             </div>
//                             <div class="summary-card">
//                                 <div class="label">Total Order Value</div>
//                                 <div class="value">${formatCurrency(summaryData.totalOrderValue)} SD</div>
//                             </div>
//                             <div class="summary-card">
//                                 <div class="label">Total Tax Collected</div>
//                                 <div class="value">${formatCurrency(summaryData.totalTaxValue)} SD</div>
//                             </div>
//                         </div>

//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>Tax Number</th>
//                                     <th>Date</th>
//                                     <th>Order #</th>
//                                     <th>Customer</th>
//                                     <th>Room</th>
//                                     <th class="text-right">Order Value</th>
//                                     <th>Tax Type</th>
//                                     <th class="text-right">Tax Value</th>
//                                     <th class="text-right">Rate</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 ${taxesData.map(tax => `
//                                     <tr>
//                                         <td>${tax.taxNumber || 'N/A'}</td>
//                                         <td>${formatDate(tax.taxDate)}</td>
//                                         <td>${tax.order?.orderNo || 'N/A'}</td>
//                                         <td>${tax.order?.customer?.name || tax.order?.customerDetails?.name || 'N/A'}</td>
//                                         <td>${tax.order?.room?.roomNumber || tax.order?.room || 'N/A'}</td>
//                                         <td class="text-right">${formatCurrency(tax.orderValue)} SD</td>
//                                         <td>${tax.tax || 'VAT'}</td>
//                                         <td class="text-right">${formatCurrency(tax.taxValue)} SD</td>
//                                         <td class="text-right">${calculateTaxRate(tax.orderValue, tax.taxValue)}%</td>
//                                     </tr>
//                                 `).join('')}
//                             </tbody>
//                             <tfoot>
//                                 <tr class="total-row">
//                                     <td colspan="5" class="text-right"><strong>TOTAL</strong></td>
//                                     <td class="text-right"><strong>${formatCurrency(summaryData.totalOrderValue)} SD</strong></td>
//                                     <td></td>
//                                     <td class="text-right"><strong>${formatCurrency(summaryData.totalTaxValue)} SD</strong></td>
//                                     <td class="text-right"><strong>${summaryData.totalOrderValue > 0 ? ((summaryData.totalTaxValue / summaryData.totalOrderValue) * 100).toFixed(2) : '0.00'}%</strong></td>
//                                 </tr>
//                             </tfoot>
//                         </table>

//                         <div class="footer">
//                             <p>This is a computer generated tax report</p>
//                             <p>Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
//                             <p>Tax Report - Page 1 of 1</p>
//                         </div>
//                     </div>
//                 </body>
//             </html>
//         `);
        
//         printWindow.document.close();
//         printWindow.focus();
        
//         // Print after a short delay to ensure content is loaded
//         setTimeout(() => {
//             printWindow.print();
//             // Don't close immediately to allow user to cancel print
//             // printWindow.close();
//         }, 500);
//     };

//     // Format date
//     const formatDate = (date) => {
//         if (!date) return 'N/A';
//         const d = new Date(date);
//         return d.toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     // Format short date
//     const formatShortDate = (date) => {
//         if (!date) return 'N/A';
//         const d = new Date(date);
//         return d.toLocaleDateString('en-GB', {
//             day: '2-digit',
//             month: '2-digit',
//             year: 'numeric'
//         });
//     };

//     // Format currency
//     const formatCurrency = (amount) => {
//         return Number(amount || 0).toFixed(2);
//     };

//     // Calculate tax rate
//     const calculateTaxRate = (orderValue, taxValue) => {
//         if (!orderValue || orderValue === 0) return '0.00';
//         return ((taxValue / orderValue) * 100).toFixed(2);
//     };

//     // Get sort icon
//     const getSortIcon = (field) => {
//         if (filters.sortBy !== field) return '↕️';
//         return filters.sortOrder === 'desc' ? '↓' : '↑';
//     };

//     return (
//         <div className="min-h-screen bg-gray-50" dir="ltr">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 py-4">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                         {/* Title */}
//                         <div className="flex items-center gap-3">
//                             <div className="bg-white/20 p-3 rounded-xl">
//                                 <FaFileInvoice className="text-white text-2xl" />
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold text-white">Taxes Report</h1>
//                                 <p className="text-green-100 text-sm">View and manage all tax records</p>
//                             </div>
//                         </div>

//                         {/* Summary Stats */}
//                         <div className="flex items-center gap-4">
//                             <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-4">
//                                 <div className="text-white">
//                                     <p className="text-xs text-green-200">Total Tax</p>
//                                     <p className="text-lg font-bold">{formatCurrency(summary.totalTaxValue)} SD</p>
//                                 </div>
//                                 <div className="w-px h-8 bg-white/20"></div>
//                                 <div className="text-white">
//                                     <p className="text-xs text-green-200">Records</p>
//                                     <p className="text-lg font-bold">{summary.count}</p>
//                                 </div>
//                             </div>
                            
//                             {/* Print Report Button */}
//                             <button
//                                 onClick={handlePrintReport}
//                                 className="flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md"
//                             >
//                                 <FaPrint />
//                                 <span>Print Report</span>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="max-w-7xl mx-auto px-4 py-6">
//                 {/* Filters Card */}
//                 <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
//                     <div 
//                         className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-between cursor-pointer"
//                         onClick={() => setShowFilters(!showFilters)}
//                     >
//                         <div className="flex items-center gap-2">
//                             <FaFilter />
//                             <span className="font-medium">Search & Filter Options</span>
//                         </div>
//                         <span>{showFilters ? '▲' : '▼'}</span>
//                     </div>
                    
//                     {showFilters && (
//                         <div className="p-6">
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                                 {/* Search */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Search
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             name="search"
//                                             value={filters.search}
//                                             onChange={handleFilterChange}
//                                             placeholder="Tax number, type..."
//                                             className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                         />
//                                         <FaSearch className="absolute left-3 top-3 text-gray-400" />
//                                     </div>
//                                 </div>

//                                 {/* Date Range - Start */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         From Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="startDate"
//                                         value={filters.startDate}
//                                         onChange={handleFilterChange}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                     />
//                                 </div>

//                                 {/* Date Range - End */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         To Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="endDate"
//                                         value={filters.endDate}
//                                         onChange={handleFilterChange}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                     />
//                                 </div>

//                                 {/* Items Per Page */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Items Per Page
//                                     </label>
//                                     <select
//                                         name="limit"
//                                         value={filters.limit}
//                                         onChange={handleFilterChange}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                     >
//                                         <option value="5">5</option>
//                                         <option value="10">10</option>
//                                         <option value="20">20</option>
//                                         <option value="50">50</option>
//                                         <option value="100">100</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             {/* Search Button */}
//                             <div className="mt-4 flex justify-end">
//                                 <button
//                                     onClick={handleSearch}
//                                     className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
//                                 >
//                                     <FaSearch />
//                                     <span>Search</span>
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//                     <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 mb-1">Total Order Value</p>
//                                 <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalOrderValue)} SD</p>
//                             </div>
//                             <div className="p-3 bg-green-100 rounded-full">
//                                 <FaMoneyBillWave className="text-green-600 text-xl" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 mb-1">Total Tax Collected</p>
//                                 <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalTaxValue)} SD</p>
//                             </div>
//                             <div className="p-3 bg-blue-100 rounded-full">
//                                 <FaPercentage className="text-blue-600 text-xl" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 mb-1">Average Tax Rate</p>
//                                 <p className="text-2xl font-bold text-gray-800">
//                                     {summary.totalOrderValue > 0 
//                                         ? ((summary.totalTaxValue / summary.totalOrderValue) * 100).toFixed(2) 
//                                         : '0.00'}%
//                                 </p>
//                             </div>
//                             <div className="p-3 bg-purple-100 rounded-full">
//                                 <FaChartLine className="text-purple-600 text-xl" />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Taxes Table */}
//                 <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
//                     <div className="overflow-x-auto">
//                         <table className="w-full">
//                             <thead>
//                                 <tr className="bg-gray-100">
//                                     <th 
//                                         className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
//                                         onClick={() => handleSortChange('taxNumber')}
//                                     >
//                                         Tax Number {getSortIcon('taxNumber')}
//                                     </th>
//                                     <th 
//                                         className="px-6 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
//                                         onClick={() => handleSortChange('taxDate')}
//                                     >
//                                         Date {getSortIcon('taxDate')}
//                                     </th>
//                                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order #</th>
//                                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
//                                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Room</th>
//                                     <th 
//                                         className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
//                                         onClick={() => handleSortChange('orderValue')}
//                                     >
//                                         Order Value {getSortIcon('orderValue')}
//                                     </th>
//                                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tax Type</th>
//                                     <th 
//                                         className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600"
//                                         onClick={() => handleSortChange('taxValue')}
//                                     >
//                                         Tax Value {getSortIcon('taxValue')}
//                                     </th>
//                                     <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Rate</th>
//                                     <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200">
//                                 {loading ? (
//                                     <tr>
//                                         <td colSpan="10" className="px-6 py-12 text-center">
//                                             <div className="flex justify-center">
//                                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
//                                             </div>
//                                             <p className="mt-2 text-gray-500">Loading tax records...</p>
//                                         </td>
//                                     </tr>
//                                 ) : taxes.length === 0 ? (
//                                     <tr>
//                                         <td colSpan="10" className="px-6 py-12 text-center">
//                                             <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-3" />
//                                             <p className="text-gray-500">No tax records found</p>
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     taxes.map((tax) => (
//                                         <tr key={tax._id} className="hover:bg-gray-50 transition-colors">
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm font-medium text-green-600">
//                                                     {tax.taxNumber}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-gray-600">
//                                                     {formatShortDate(tax.taxDate)}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-gray-700">
//                                                     {tax.order?.orderNo || 'N/A'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-gray-700">
//                                                     {tax.order?.customer?.name || tax.order?.customerDetails?.name || 'N/A'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-gray-700">
//                                                     {tax.order?.room?.roomNo || tax.order?.room || 'N/A'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 text-right">
//                                                 <span className="text-sm font-medium text-gray-900">
//                                                     {formatCurrency(tax.orderValue)} SD
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-gray-700">
//                                                     {tax.tax || 'VAT'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 text-right">
//                                                 <span className="text-sm font-medium text-blue-600">
//                                                     {formatCurrency(tax.taxValue)} SD
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 text-right">
//                                                 <span className="text-sm font-medium text-purple-600">
//                                                     {calculateTaxRate(tax.orderValue, tax.taxValue)}%
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="flex items-center justify-center gap-2">
//                                                     <button
//                                                         onClick={() => handleViewDetails(tax)}
//                                                         className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//                                                         title="View Details"
//                                                     >
//                                                         <FaEye size={18} />
//                                                     </button>
//                                                     <button
//                                                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                         title="Print"
//                                                     >
//                                                         <FaPrint size={18} />
//                                                     </button>
//                                                     <button
//                                                         className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
//                                                         title="Download"
//                                                     >
//                                                         <FaDownload size={18} />
//                                                     </button>
//                                                     <button
//                                                         className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
//                                                         title="Options"
//                                                     >
//                                                         <BsThreeDotsVertical size={18} />
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     {pagination.totalPages > 1 && (
//                         <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
//                             <div className="text-sm text-gray-600">
//                                 Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems}
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() => handlePageChange(pagination.currentPage - 1)}
//                                     disabled={pagination.currentPage === 1}
//                                     className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
//                                 >
//                                     <FaArrowLeft size={14} />
//                                     Previous
//                                 </button>
//                                 <span className="px-4 py-1 bg-green-600 text-white rounded-lg">
//                                     {pagination.currentPage}
//                                 </span>
//                                 <button
//                                     onClick={() => handlePageChange(pagination.currentPage + 1)}
//                                     disabled={pagination.currentPage === pagination.totalPages}
//                                     className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1"
//                                 >
//                                     Next
//                                     <FaArrowRight size={14} />
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Print Date Range Modal */}
//             {showPrintModal && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//                         <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
//                             <h2 className="text-xl font-bold">Print Tax Report</h2>
//                             <button
//                                 onClick={() => setShowPrintModal(false)}
//                                 className="p-1 hover:bg-white/20 rounded-lg transition-colors"
//                             >
//                                 <FaTimes size={20} />
//                             </button>
//                         </div>
                        
//                         <div className="p-6">
//                             <p className="text-gray-600 mb-4">Select date range for the report:</p>
                            
//                             <div className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         From Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={printDateRange.startDate}
//                                         onChange={(e) => setPrintDateRange({...printDateRange, startDate: e.target.value})}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                     />
//                                 </div>
                                
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         To Date
//                                     </label>
//                                     <input
//                                         type="date"
//                                         value={printDateRange.endDate}
//                                         onChange={(e) => setPrintDateRange({...printDateRange, endDate: e.target.value})}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                                     />
//                                 </div>
//                             </div>
                            
//                             <div className="flex justify-end gap-3 mt-6">
//                                 <button
//                                     onClick={() => setShowPrintModal(false)}
//                                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handlePrintWithDateRange}
//                                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                                 >
//                                     <FaPrint />
//                                     Generate Report
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Details Modal */}
//             {showDetailsModal && selectedTax && (
//                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white flex justify-between items-center">
//                             <div className="flex items-center gap-3">
//                                 <FaFileInvoice className="text-white text-xl" />
//                                 <h2 className="text-xl font-bold">Tax Details</h2>
//                             </div>
//                             <button
//                                 onClick={() => setShowDetailsModal(false)}
//                                 className="p-2 hover:bg-white/20 rounded-lg transition-colors"
//                             >
//                                 <FaArrowLeft size={20} />
//                             </button>
//                         </div>

//                         {/* Modal Content */}
//                         <div className="flex-1 overflow-y-auto p-6">
//                             <div className="space-y-6">
//                                 {/* Tax Information */}
//                                 <div className="bg-green-50 rounded-xl p-4">
//                                     <h3 className="font-semibold text-green-700 mb-3">Tax Information</h3>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div>
//                                             <p className="text-xs text-gray-500">Tax Number</p>
//                                             <p className="font-medium text-gray-800">{selectedTax.taxNumber}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs text-gray-500">Tax Date</p>
//                                             <p className="font-medium text-gray-800">{formatDate(selectedTax.taxDate)}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs text-gray-500">Tax Type</p>
//                                             <p className="font-medium text-gray-800">{selectedTax.tax || 'VAT'}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-xs text-gray-500">Tax Rate</p>
//                                             <p className="font-medium text-gray-800">
//                                                 {calculateTaxRate(selectedTax.orderValue, selectedTax.taxValue)}%
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Order Information */}
//                                 {selectedTax.order && (
//                                     <div className="bg-blue-50 rounded-xl p-4">
//                                         <h3 className="font-semibold text-blue-700 mb-3">Order Information</h3>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Order Number</p>
//                                                 <p className="font-medium text-gray-800">{selectedTax.order.orderNo || 'N/A'}</p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Customer</p>
//                                                 <p className="font-medium text-gray-800">
//                                                     {selectedTax.order.customer?.name || selectedTax.order.customerDetails?.name || 'N/A'}
//                                                 </p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Room</p>
//                                                 <p className="font-medium text-gray-800">
//                                                     {selectedTax.order.room?.roomNumber || selectedTax.order.room || 'N/A'}
//                                                 </p>
//                                             </div>
//                                             <div>
//                                                 <p className="text-xs text-gray-500">Booking Period</p>
//                                                 <p className="font-medium text-gray-800">
//                                                     {formatShortDate(selectedTax.order.dateBooking)} - {formatShortDate(selectedTax.order.dateReturn)}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Financial Summary */}
//                                 <div className="bg-purple-50 rounded-xl p-4">
//                                     <h3 className="font-semibold text-purple-700 mb-3">Financial Summary</h3>
//                                     <div className="space-y-2">
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Order Value:</span>
//                                             <span className="font-medium text-gray-800">{formatCurrency(selectedTax.orderValue)} SD</span>
//                                         </div>
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600">Tax Value ({selectedTax.tax || 'VAT'}):</span>
//                                             <span className="font-medium text-blue-600">{formatCurrency(selectedTax.taxValue)} SD</span>
//                                         </div>
//                                         <div className="flex justify-between items-center pt-2 border-t border-purple-200">
//                                             <span className="font-semibold text-gray-800">Total:</span>
//                                             <span className="font-bold text-lg text-purple-700">
//                                                 {formatCurrency(selectedTax.orderValue + selectedTax.taxValue)} SD
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Timestamps */}
//                                 <div className="text-xs text-gray-400 flex justify-between pt-2">
//                                     <span>Created: {formatDate(selectedTax.createdAt)}</span>
//                                     <span>Updated: {formatDate(selectedTax.updatedAt)}</span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
//                             <button
//                                 onClick={() => setShowDetailsModal(false)}
//                                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                             >
//                                 <FaPrint />
//                                 Print
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TaxesReport;