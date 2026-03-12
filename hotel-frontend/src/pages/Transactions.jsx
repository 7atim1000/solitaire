import React, {useState, useEffect, useRef} from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { MdPrint } from 'react-icons/md';
import { api } from '../https';
import { toast } from 'react-toastify'
import { 
    MdDeleteForever, 
    MdFormatListBulletedAdd, 
    MdSearch, 
    MdFilterList,
    MdTrendingUp,
    MdTrendingDown,
    MdAttachMoney,
    MdAccountBalance,
    MdBarChart,
    MdCalendarToday
} from 'react-icons/md';
import { BiSolidEditAlt } from 'react-icons/bi';
import { FaUsers, FaExchangeAlt } from 'react-icons/fa';
import BackButton from '../components/shared/BackButton';
import AddTransaction from '../components/transactions/AddTransaction';
import TransactionUpdate from '../components/transactions/TransactionUpdate';
import {Progress} from 'antd'  
import hotel from '../assets/images/solitair.png'  

const Transactions = () => {
    const Button = [
        { label: 'New Transaction', icon: <MdFormatListBulletedAdd className='text-white' size={20} />, action: 'transaction' }
    ];

    const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    
    const handleOpenModal = (action) => {
        if (action === 'transaction') setIsAddTransactionModalOpen(true);
    };

    // fetch
    const [list, setList] = useState([]);
    const [search, setSearch] = useState(''); 
    const [sort, setSort] = useState('-createdAt');
    const [frequency, setFrequency] = useState(366);
    const [type, setType] = useState('all');
    const [shift, setShift] = useState('all');

    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    });

    const [isEditTransactionModal, setIsEditTransactionModal] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
        
    const fetchTransactions = async (search = '') => {
        try {
            const response = await api.post('/api/transactions/get-transactions',
                {
                    frequency,
                    type,
                    shift,
                    search,
                    sort,
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage
                }
            );

            if (response.data.success) {
                setList(response.data.data || response.data.transactions || []);
                console.log(response.data.data)
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        currentPage: response.data.pagination.currentPage ?? prev.currentPage,
                        itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
                        totalItems: response.data.pagination.total ?? prev.totalItems,
                        totalPages: response.data.pagination.totalPages ?? prev.totalPages
                    }));
                }
            } else {
                toast.error(response.data.message || 'Transactions is not found')
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.message)
            }
            console.log(error)
        }
    }

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            fetchTransactions();
        }
    }, [frequency, shift, type, search, sort, pagination.currentPage, pagination.itemsPerPage]);

    const handleEdit = (transaction) => {
        setCurrentTransaction(transaction);
        setIsEditTransactionModal(true);
    };

    // Removing
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const removeTransaction = async (id) => {
        try {
            const response = await api.post('/api/transactions/remove', { id },)
            if (response.data.success) {
                toast.success(response.data.message)
                await fetchTransactions();
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    };

    // search - sorting - Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, sort]);

    // pagination
    const PaginationControls = () => {
        const handlePageChange = (newPage) => {
            setPagination(prev => ({
                ...prev,
                currentPage: newPage
            }));
        };

        const handleItemsPerPageChange = (newItemsPerPage) => {
            setPagination(prev => ({
                ...prev,
                itemsPerPage: newItemsPerPage,
                currentPage: 1
            }));
        };

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm text-sm">
                <div className="mb-3 sm:mb-0 text-emerald-700 font-medium">
                    Showing
                    <span className='font-bold text-emerald-800 mx-1'>{list.length}</span>
                    of
                    <span className='font-bold text-emerald-800 mx-1'>{pagination.totalItems}</span>
                    records
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-2 text-emerald-700 font-medium">
                        Page
                        <span className='font-bold text-emerald-800 mx-1'>{pagination.currentPage}</span>
                        of
                        <span className='font-bold text-emerald-800 mx-1'>{pagination.totalPages}</span>
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        Next
                    </button>
                    <select
                        value={pagination.itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                </div>
            </div>
        );
    };

    // Percentage and count
    const totalTransaction = list.length;
    const totalIncomeTransactions = list.filter((transaction) => transaction.type === "Income");
    const totalExpenseTransactions = list.filter((transaction) => transaction.type === "Expense");
    const totalIncomePercent = (totalIncomeTransactions.length / totalTransaction) * 100;
    const totalExpensePercent = (totalExpenseTransactions.length / totalTransaction) * 100;

    // Total amount 
    const totalTurnover = list.reduce((acc, transaction) => acc + transaction.amount, 0);
    const totalIncomeTurnover = list.filter(transaction => transaction.type === 'Income').reduce((acc, transaction) => acc + transaction.amount, 0);
    const totalExpenseTurnover = list.filter(transaction => transaction.type === 'Expense').reduce((acc, transaction) => acc + transaction.amount, 0);

    const totalIncomeTurnoverPercent = (totalIncomeTurnover / totalTurnover) * 100;
    const totalExpenseTurnoverPercent = (totalExpenseTurnover / totalTurnover) * 100;

    // Printing
    const invoiceRef = useRef(null)
    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");

        WinPrint.document.write(` 
            <html>
                <head>
                    <title>Solitair Hotel - Transactions Report</title>
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
                        .report-container { 
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
                        .report-title {
                            font-size: 28px;
                            font-weight: bold;
                            color: #065f46;
                            margin-bottom: 8px;
                            text-align: center;
                        }
                        .report-date {
                            text-align: center;
                            color: #6b7280;
                            font-size: 14px;
                            margin-bottom: 30px;
                        }
                        .summary-section {
                            display: grid;
                            grid-template-columns: repeat(4, 1fr);
                            gap: 15px;
                            margin-bottom: 30px;
                        }
                        .summary-card {
                            background: #f0fdf4;
                            border: 1px solid #86efac;
                            border-radius: 8px;
                            padding: 15px;
                        }
                        .summary-label {
                            font-size: 12px;
                            color: #047857;
                            margin-bottom: 5px;
                        }
                        .summary-value {
                            font-size: 20px;
                            font-weight: bold;
                            color: #065f46;
                        }
                        .summary-sub {
                            font-size: 11px;
                            color: #6b7280;
                            margin-top: 5px;
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
                        .type-badge {
                            padding: 4px 8px;
                            border-radius: 4px;
                            font-size: 11px;
                            font-weight: 600;
                        }
                        .type-income {
                            background: #d1fae5;
                            color: #065f46;
                        }
                        .type-expense {
                            background: #fee2e2;
                            color: #991b1b;
                        }
                        .shift-morning {
                            color: #b45309;
                            font-weight: 600;
                        }
                        .shift-evening {
                            color: #1e40af;
                            font-weight: 600;
                        }
                        .amount {
                            font-weight: 600;
                        }
                        tfoot tr {
                            background: #f0fdf4;
                            font-weight: 600;
                        }
                        tfoot td {
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
                        .print-hide {
                            display: none;
                        }
                        @media print {
                            body { 
                                padding: 0; 
                                background: white;
                            }
                            .report-container {
                                box-shadow: none;
                                border: none;
                                padding: 20px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="header">
                            <div class="logo-container">
                                <img src="${hotel}" alt="Solitair Hotel" />
                            </div>
                            <div class="hotel-info">
                                <div class="hotel-name">Solitair Hotel</div>
                                <div class="hotel-tagline">Luxury & Comfort</div>
                            </div>
                        </div>
                        <div class="report-title">TRANSACTIONS REPORT</div>
                        <div class="report-date">
                            Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>

                        <div class="summary-section">
                            <div class="summary-card">
                                <div class="summary-label">Total Transactions</div>
                                <div class="summary-value">${totalTransaction}</div>
                                <div class="summary-sub">Income: ${totalIncomeTransactions.length} | Expense: ${totalExpenseTransactions.length}</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">Total Turnover</div>
                                <div class="summary-value">${totalTurnover.toFixed(2)} SD</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">Total Income</div>
                                <div class="summary-value">${totalIncomeTurnover.toFixed(2)} SD</div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-label">Total Expense</div>
                                <div class="summary-value">${totalExpenseTurnover.toFixed(2)} SD</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Shift</th>
                                    <th>Amount</th>
                                    <th>Category</th>
                                    <th>Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${list.map(transaction => `
                                    <tr>
                                        <td>${transaction.date ? new Date(transaction.date).toLocaleDateString('en-GB') : 'N/A'}</td>
                                        <td>
                                            <span class="type-badge ${transaction.type === 'Income' ? 'type-income' : 'type-expense'}">
                                                ${transaction.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="${transaction.shift === 'Morning' ? 'shift-morning' : 'shift-evening'}">
                                                ${transaction.shift || 'N/A'}
                                            </span>
                                        </td>
                                        <td class="amount">${transaction.amount.toFixed(2)} SD</td>
                                        <td>${transaction.category || 'N/A'}</td>
                                        <td>${transaction.refrence || 'N/A'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="text-align: right"><strong>Totals:</strong></td>
                                    <td><strong>${totalTurnover.toFixed(2)} SD</strong></td>
                                    <td colspan="2"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="text-align: right">Income:</td>
                                    <td>${totalIncomeTurnover.toFixed(2)} SD</td>
                                    <td colspan="2"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="text-align: right">Expense:</td>
                                    <td>${totalExpenseTurnover.toFixed(2)} SD</td>
                                    <td colspan="2"></td>
                                </tr>
                                <tr>
                                    <td colspan="3" style="text-align: right"><strong>Net Balance:</strong></td>
                                    <td><strong>${(totalIncomeTurnover - totalExpenseTurnover).toFixed(2)} SD</strong></td>
                                    <td colspan="2"></td>
                                </tr>
                            </tfoot>
                        </table>

                        <div class="footer">
                            <p>This is an official transactions report generated by Solitair Hotel Management System</p>
                            <p>Report includes transactions from ${frequency === 366 ? 'All Time' : `Last ${frequency} Days`} | Type: ${type === 'all' ? 'All Types' : type} | Shift: ${shift === 'all' ? 'All Shifts' : shift}</p>
                            <p>Solitair Hotel • Luxury & Comfort • Generated on ${new Date().toLocaleDateString('en-GB')}</p>
                        </div>
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

    return(
        <section className='w-full bg-gradient-to-br from-emerald-50 to-white min-h-screen'>
            {/* Main Header */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 py-4 lg:px-8 lg:py-6 bg-white shadow-lg rounded-b-2xl border-b border-emerald-100'>
                <div className='flex items-center gap-3'>
                    <BackButton />
                    <div className='flex flex-col'>
                        <h1 className='text-2xl lg:text-3xl font-bold text-emerald-900'>Transactions Management</h1>
                        <p className='text-sm text-emerald-600 mt-1'>Monitor and manage financial transactions</p>
                    </div>
                </div>
                
                <div className='flex gap-3 items-center mt-4 lg:mt-0'>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-lg transition duration-200 cursor-pointer"
                    >
                        <MdPrint className="w-4 h-4" />
                        <span className='text-sm font-medium'>Print Report</span>
                    </motion.button>

                    {Button.map(({ label, icon, action }) => {
                        return (
                            <button
                                className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-white cursor-pointer font-semibold text-sm flex items-center gap-2 rounded-xl border border-emerald-500 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5'
                                onClick={() => handleOpenModal(action)}
                                key={action}
                            >
                                {label} {icon}
                            </button>
                        )
                    })}
                </div>

                {isAddTransactionModalOpen &&
                <AddTransaction 
                setIsAddTransactionModalOpen= {setIsAddTransactionModalOpen} 
                fetchTransactions= {fetchTransactions}
                />} 
            </div>

            {/* Statistics Cards */}
            <div className='px-4 lg:px-8 mt-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {/* Total Transactions Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Total Transactions</p>
                                <h3 className='text-2xl font-bold text-emerald-900 mt-1'>{totalTransaction}</h3>
                            </div>
                            <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
                                <FaExchangeAlt className='w-6 h-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>

                    {/* Total Income Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Total Income</p>
                                <h3 className='text-2xl font-bold text-emerald-900 mt-1'>{totalIncomeTurnover.toFixed(2)} <span className='text-emerald-500 text-sm'>SD</span></h3>
                                <p className='text-emerald-500 text-xs mt-1'>{totalIncomeTransactions.length} transactions</p>
                            </div>
                            <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
                                <MdTrendingUp className='w-6 h-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>

                    {/* Total Expense Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Total Expense</p>
                                <h3 className='text-2xl font-bold text-amber-600 mt-1'>{totalExpenseTurnover.toFixed(2)} <span className='text-amber-500 text-sm'>SD</span></h3>
                                <p className='text-amber-500 text-xs mt-1'>{totalExpenseTransactions.length} transactions</p>
                            </div>
                            <div className='w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center'>
                                <MdTrendingDown className='w-6 h-6 text-amber-600' />
                            </div>
                        </div>
                    </div>

                    {/* Net Balance Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Net Balance</p>
                                <h3 className={`text-2xl font-bold ${(totalIncomeTurnover - totalExpenseTurnover) >= 0 ? 'text-emerald-600' : 'text-amber-600'} mt-1`}>
                                    {(totalIncomeTurnover - totalExpenseTurnover).toFixed(2)} <span className='text-emerald-500 text-sm'>SD</span>
                                </h3>
                                <p className='text-emerald-500 text-xs mt-1'>Income - Expense</p>
                            </div>
                            <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
                                <MdAccountBalance className='w-6 h-6 text-emerald-600' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className='px-4 lg:px-8 mt-6'>
                <div className='bg-white rounded-xl shadow-md p-4 border border-emerald-100'>
                    <div className='flex flex-col lg:flex-row gap-4'>
                        {/* Search Input */}
                        <div className='flex-1'>
                            <div className='relative'>
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className='w-full px-4 py-3 pl-12 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                                />
                                <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                    <MdSearch className='w-5 h-5 text-emerald-500' />
                                </div>
                            </div>
                        </div>

                        {/* Filter Row */}
                        <div className='flex flex-col sm:flex-row gap-3'>
                            {/* Date Range */}
                            <div className='relative'>
                                <select 
                                    id='frequency' 
                                    value={frequency} 
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
                                >
                                    <option value='1'>Last 1 Day</option>
                                    <option value='7'>Last 7 Days</option>
                                    <option value='30'>Last 30 Days</option>
                                    <option value='90'>Last 90 Days</option>
                                    <option value='366'>All Time</option>
                                </select>
                                <MdCalendarToday className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>

                            {/* Type Filter */}
                            <div className='relative'>
                                <select 
                                    id='type' 
                                    value={type} 
                                    onChange={(e) => setType(e.target.value)}
                                    className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
                                >
                                    <option value='all'>All Types</option>
                                    <option value='Income'>Income</option>
                                    <option value='Expense'>Expense</option>
                                </select>
                                <MdFilterList className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>

                            {/* Shift Filter */}
                            <div className='relative'>
                                <select 
                                    id='shift' 
                                    value={shift} 
                                    onChange={(e) => setShift(e.target.value)}
                                    className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
                                >
                                    <option value='all'>All Shifts</option>
                                    <option value='Morning'>Morning</option>
                                    <option value='Evening'>Evening</option>
                                </select>
                                <FaUsers className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>

                            {/* Sort Filter */}
                            <div className='relative'>
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                                    }}
                                    className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
                                >
                                    <option value='-createdAt'>Newest First</option>
                                    <option value='createdAt'>Oldest First</option>
                                    <option value='type'>Type A-Z</option>
                                    <option value='-type'>Type Z-A</option>
                                    <option value='amount'>Amount Low-High</option>
                                    <option value='-amount'>Amount High-Low</option>
                                </select>
                                <MdBarChart className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='px-4 lg:px-8 mt-6 mb-8' >
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    {/* Transactions Table - Takes 3/4 width */}
                    <div className='lg:col-span-3'>
                        <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100'>
                            <div className='overflow-x-auto'>
                                <table className='w-full' >
                                    <thead className='bg-gradient-to-r from-emerald-500 to-emerald-600'>
                                        <tr className='text-white text-sm font-semibold'>
                                            <th className='p-4 text-left'>Date</th>
                                            <th className='p-4 text-left'>Type</th>
                                            <th className='p-4 text-left'>Shift</th>
                                            <th className='p-4 text-left'>Amount</th>
                                            <th className='p-4 text-left'>Category</th>
                                            <th className='p-4 text-left'>Reference</th>
                                            <th className='p-4 text-left'>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {list.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className='p-8 text-center'>
                                                    <div className='flex flex-col items-center justify-center py-8'>
                                                        <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4'>
                                                            <MdAttachMoney className='w-8 h-8 text-emerald-500' />
                                                        </div>
                                                        <p className='text-emerald-600 font-medium text-lg'>No transactions found</p>
                                                        <p className='text-emerald-400 text-sm mt-2'>Start by adding your first transaction!</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : list.map((transaction, index) => (
                                            <tr
                                                key={transaction._id}
                                                className={`border-b border-emerald-50 hover:bg-emerald-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`}
                                            >
                                                <td className='p-4 font-medium text-emerald-900'>
                                                    {transaction.date ? new Date(transaction.date).toLocaleDateString('en-GB') : 'N/A'}
                                                </td>
                                                <td className='p-4'>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        transaction.type === 'Income' 
                                                            ? 'bg-emerald-100 text-emerald-700' 
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {transaction.type}
                                                    </span>
                                                </td>
                                                <td className='p-4'>
                                                    <span className={`font-medium ${
                                                        transaction.shift === 'Morning' 
                                                            ? 'text-amber-600' 
                                                            : 'text-blue-600'
                                                    }`}>
                                                        {transaction.shift}
                                                    </span>
                                                </td>
                                                <td className='p-4 font-bold text-emerald-900'>
                                                    {transaction.amount.toFixed(2)} SD
                                                </td>
                                                <td className='p-4 text-emerald-700'>{transaction.category}</td>
                                                <td className='p-4 text-emerald-700'>{transaction.refrence}</td>
                                                <td className='p-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <button className='p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 hover:scale-105'
                                                        onClick={() => handleEdit(transaction)}
                                                        >
                                                            <BiSolidEditAlt size={18} />
                                                        </button>
                                                        <button className='p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-105'
                                                            onClick={() => { setSelectedTransaction(transaction); setDeleteModalOpen(true); }}
                                                        >
                                                            <MdDeleteForever size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {list.length > 0 && (
                                <div className='p-4'>
                                    <PaginationControls />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics Sidebar - Takes 1/4 width */}
                    <div className='lg:col-span-1'>
                        <div ref={invoiceRef} className='bg-white rounded-xl shadow-lg border border-emerald-100 p-5'>
                            <h3 className='text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2'>
                                <MdBarChart className='w-5 h-5' />
                                Financial Overview
                            </h3>

                            {/* Summary Stats */}
                            <div className='space-y-6'>
                                {/* Transaction Count */}
                                <div className='bg-emerald-50 rounded-lg p-4 border border-emerald-200'>
                                    <div className='flex justify-between items-center mb-3'>
                                        <span className='text-sm font-medium text-emerald-700'>Total Transactions</span>
                                        <span className='font-bold text-emerald-900'>{totalTransaction}</span>
                                    </div>
                                    <div className='flex justify-between items-center mb-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
                                            <span className='text-xs text-emerald-700'>Income</span>
                                        </div>
                                        <span className='font-medium text-emerald-900'>{totalIncomeTransactions.length}</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
                                        <div className='flex items-center gap-2'>
                                            <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                                            <span className='text-xs text-red-700'>Expense</span>
                                        </div>
                                        <span className='font-medium text-red-700'>{totalExpenseTransactions.length}</span>
                                    </div>
                                </div>

                                {/* Amount Totals */}
                                <div className='bg-emerald-50 rounded-lg p-4 border border-emerald-200'>
                                    <h4 className='text-sm font-semibold text-emerald-800 mb-3'>Amount Totals</h4>
                                    <div className='space-y-3'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-emerald-700'>Total Turnover</span>
                                            <span className='font-bold text-emerald-900'>{totalTurnover.toFixed(2)} SD</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-emerald-700'>Total Income</span>
                                            <span className='font-medium text-emerald-600'>{totalIncomeTurnover.toFixed(2)} SD</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-xs text-red-700'>Total Expense</span>
                                            <span className='font-medium text-red-600'>{totalExpenseTurnover.toFixed(2)} SD</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Percentage Charts */}
                                <div className='bg-emerald-50 rounded-lg p-4 border border-emerald-200'>
                                    <h4 className='text-sm font-semibold text-emerald-800 mb-4'>Distribution</h4>
                                    <div className='flex flex-col items-center space-y-6'>
                                        <div className='text-center'>
                                            <Progress 
                                                type="circle" 
                                                strokeColor={'#10b981'} 
                                                size={100} 
                                                percent={totalIncomeTurnoverPercent.toFixed(0)} 
                                                format={percent => (
                                                    <div className='text-center'>
                                                        <div className='text-lg font-bold text-emerald-700'>{percent}%</div>
                                                        <div className='text-xs text-emerald-600'>Income</div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div className='text-center'>
                                            <Progress 
                                                type="circle" 
                                                strokeColor={'#ef4444'} 
                                                size={100} 
                                                percent={totalExpenseTurnoverPercent.toFixed(0)} 
                                                format={percent => (
                                                    <div className='text-center'>
                                                        <div className='text-lg font-bold text-red-700'>{percent}%</div>
                                                        <div className='text-xs text-red-600'>Expense</div>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Net Balance */}
                                <div className={`rounded-lg p-4 border ${
                                    (totalIncomeTurnover - totalExpenseTurnover) >= 0 
                                        ? 'bg-emerald-50 border-emerald-200' 
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-sm font-semibold text-emerald-800'>Net Balance</p>
                                            <p className={`text-2xl font-bold ${
                                                (totalIncomeTurnover - totalExpenseTurnover) >= 0 
                                                    ? 'text-emerald-600' 
                                                    : 'text-red-600'
                                            }`}>
                                                {(totalIncomeTurnover - totalExpenseTurnover).toFixed(2)} SD
                                            </p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            (totalIncomeTurnover - totalExpenseTurnover) >= 0 
                                                ? 'bg-emerald-100' 
                                                : 'bg-red-100'
                                        }`}>
                                            {totalIncomeTurnover >= totalExpenseTurnover ? (
                                                <MdTrendingUp className='w-6 h-6 text-emerald-600' />
                                            ) : (
                                                <MdTrendingDown className='w-6 h-6 text-red-600' />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {isEditTransactionModal && currentTransaction && (
                <TransactionUpdate
                    transaction={currentTransaction}
                    setIsEditTransactionModal={setIsEditTransactionModal}
                    fetchTransactions={fetchTransactions}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                Type={selectedTransaction?.type}
                Amount={selectedTransaction?.amount}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    removeTransaction(selectedTransaction._id);
                    setDeleteModalOpen(false);
                }}
            />
        </section>
    );
};

// Delete Confirmation Modal
const ConfirmModal = ({ open, onClose, onConfirm, Type, Amount }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-emerald-100">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <MdDeleteForever className="w-6 h-6 text-red-500" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-emerald-900 text-center mb-2">Confirm Deletion</h2>
                <p className="text-emerald-700 text-center mb-6">
                    Are you sure you want to remove this 
                    <span className={`font-bold mx-1 ${Type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Type}
                    </span>
                    transaction?
                </p>
                <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                    <div className="text-center">
                        <p className="text-sm text-red-600 mb-1">Amount to be removed:</p>
                        <p className="text-2xl font-bold text-red-700">{Amount?.toFixed(2)} SD</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        className="flex-1 px-4 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all duration-200"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Transactions;


// import React, {useState, useEffect, useRef} from 'react'
// import { motion, AnimatePresence } from 'framer-motion';
// import { MdPrint } from 'react-icons/md';
// import { api } from '../https';
// import { toast } from 'react-toastify'
// import { 
//     MdDeleteForever, 
//     MdFormatListBulletedAdd, 
//     MdSearch, 
//     MdFilterList,
//     MdTrendingUp,
//     MdTrendingDown,
//     MdAttachMoney,
//     MdAccountBalance,
//     MdBarChart,
//     MdCalendarToday
// } from 'react-icons/md';
// import { BiSolidEditAlt } from 'react-icons/bi';
// import { FaUsers, FaExchangeAlt } from 'react-icons/fa';
// import BackButton from '../components/shared/BackButton';
// import AddTransaction from '../components/transactions/AddTransaction';
// import TransactionUpdate from '../components/transactions/TransactionUpdate';

// import {Progress} from 'antd'  
// import hotel from '../assets/images/solitair.png'  

// const Transactions = () => {
//     const Button = [
//         { label: 'New Transaction', icon: <MdFormatListBulletedAdd className='text-white' size={20} />, action: 'transaction' }
//     ];

//     const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
    
//     const handleOpenModal = (action) => {
//         if (action === 'transaction') setIsAddTransactionModalOpen(true);
//     };

//     // fetch
//     const [list, setList] = useState([]);
//     const [search, setSearch] = useState(''); 
//     const [sort, setSort] = useState('-createdAt');
//     const [frequency, setFrequency] = useState(366);
//     const [type, setType] = useState('all');
//     const [shift, setShift] = useState('all');

//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         itemsPerPage: 10,
//         totalItems: 0,
//         totalPages: 1
//     });

//     const [isEditTransactionModal, setIsEditTransactionModal] = useState(false);
//     const [currentTransaction, setCurrentTransaction] = useState(null);
        


//     const fetchTransactions = async (search = '') => {
//         try {

//             const response = await api.post('/api/transactions/get-transactions',
//                 // { sort }, { params: {search} }
//                 {
//                     frequency,
//                     type,
//                     shift,
//                     search,
//                     sort,
//                     page: pagination.currentPage,
//                     limit: pagination.itemsPerPage
//                 }
//             );

//             if (response.data.success) {
//                 //setList(response.data.employees)
//                 setList(response.data.data || response.data.transactions || []);
//                 console.log(response.data.data)
//                 // Only update pagination if the response contains valid data
//                 if (response.data.pagination) {
//                     setPagination(prev => ({
//                         ...prev,  // Keep existing values
//                         currentPage: response.data.pagination.currentPage ?? prev.currentPage,
//                         itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
//                         totalItems: response.data.pagination.total ?? prev.totalItems,
//                         totalPages: response.data.pagination.totalPages ?? prev.totalPages
//                     }));
//                 }


//             } else {
//                 toast.error(response.data.message || 'Transactions is not found')
//             }

//         } catch (error) {
//             // Show backend error message if present in error.response
//             if (error.response && error.response.data && error.response.data.message) {
//                 toast.error(error.response.data.message);
//             } else {
//                 toast.error(error.message)
//             }
//             console.log(error)
//         }
//     }

 
//     const isInitialMount = useRef(true);

//     useEffect(() => {
//         if (isInitialMount.current) {
//             isInitialMount.current = false;
//         } else {
//             fetchTransactions();
//         }
//     }, [frequency, shift, type, search, sort, pagination.currentPage, pagination.itemsPerPage]);

//     const handleEdit = (transaction) => {
//         setCurrentTransaction(transaction);
//         setIsEditTransactionModal(true);
//     };

//     // Removing
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);    // for remove
//     const [selectedTransaction, setSelectedTransaction] = useState(null);   // for remove

//     const removeTransaction = async (id) => {

//         try {
//             const response = await api.post('/api/transactions/remove', { id },)
//             if (response.data.success) {
//                 toast.success(response.data.message)

//                 //Update the LIST after Remove
//                 await fetchTransactions();

//             } else {
//                 toast.error(response.data.message)
//             }

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     };


//     // search - sorting - Debounce search to avoid too many API calls
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             fetchTransactions(search);
//         }, 500); // 500ms delay

//         return () => clearTimeout(timer);
//     }, [search, sort]);

    

//     // pagination
//     const PaginationControls = () => {

//         const handlePageChange = (newPage) => {
//             setPagination(prev => ({
//                 ...prev,
//                 currentPage: newPage
//             }));
//         };

//         const handleItemsPerPageChange = (newItemsPerPage) => {
//             setPagination(prev => ({
//                 ...prev,
//                 itemsPerPage: newItemsPerPage,
//                 currentPage: 1  // Reset to first page only when items per page changes
//             }));
//         };


//         return (
//             <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm text-sm">
//                 <div className="mb-3 sm:mb-0 text-emerald-700 font-medium">
//                     Showing
//                     <span className='font-bold text-emerald-800 mx-1'>{list.length}</span>
//                     of
//                     <span className='font-bold text-emerald-800 mx-1'>{pagination.totalItems}</span>
//                     records
//                 </div>
//                 <div className="flex flex-wrap gap-2 items-center">
//                     <button
//                         onClick={() => handlePageChange(pagination.currentPage - 1)}
//                         disabled={pagination.currentPage === 1}
//                         className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//                     >
//                         Previous
//                     </button>

//                     <span className="px-3 py-2 text-emerald-700 font-medium">
//                         Page
//                         <span className='font-bold text-emerald-800 mx-1'>{pagination.currentPage}</span>
//                         of
//                         <span className='font-bold text-emerald-800 mx-1'>{pagination.totalPages}</span>
//                     </span>

//                     <button
//                         onClick={() => handlePageChange(pagination.currentPage + 1)}
//                         disabled={pagination.currentPage === pagination.totalPages}
//                         className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//                     >
//                         Next
//                     </button>

//                     <select
//                         value={pagination.itemsPerPage}
//                         onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//                         className="px-3 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
//                     >
//                         <option value="5">5 per page</option>
//                         <option value="10">10 per page</option>
//                         <option value="20">20 per page</option>
//                         <option value="50">50 per page</option>
//                     </select>
//                 </div>
//             </div>
//         );
//     };


//     // Percentage and count
//     const totalTransaction = list.length;

//     const totalIncomeTransactions = list.filter(
//         (transaction) => transaction.type === "Income"
//     );
//     const totalExpenseTransactions = list.filter(
//         (transaction) => transaction.type === "Expense"
//     );
//     const totalIncomePercent = (totalIncomeTransactions.length / totalTransaction) * 100;
//     const totalExpensePercent = (totalExpenseTransactions.length / totalTransaction) * 100;

//     // Total amount 
//     const totalTurnover = list.reduce((acc, transaction) => acc + transaction.amount, 0);
//     const totalIncomeTurnover = list.filter(transaction => transaction.type === 'Income').reduce((acc, transaction) => acc + transaction.amount, 0);
//     const totalExpenseTurnover = list.filter(transaction => transaction.type === 'Expense').reduce((acc, transaction) => acc + transaction.amount, 0);

//     const totalIncomeTurnoverPercent = (totalIncomeTurnover / totalTurnover) * 100;
//     const totalExpenseTurnoverPercent = (totalExpenseTurnover / totalTurnover) * 100;

//     // Printing
//         const invoiceRef = useRef(null)
//         const handlePrint = () => {
//             const printContent = invoiceRef.current.innerHTML;
//             const WinPrint = window.open("", "", "width=900, height=650");
    
//             WinPrint.document.write(` 
//                 <html>
//                     <head>
//                         <title>Transactions Management</title>
//                         <style>
//                             body { font-family: Arial, sans-serif; padding: 20px; }
//                             .receipt-container { width: 100%; }
//                             h2 { text-align: center; }
//                             table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//                             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//                             th { background-color: #f2f2f2; }
//                             .IdTd {display: none ;}
//                             .buttonTd {display: none ;}
//                             .buttonTr {display: none ;}
//                             .userTr {display: none ;}
//                             .userTd {display: none ;}
//                             .footTd {display: none ;}
//                             .controls { display: none; }
//                             .button { display: none; }
//                             .backButton {display: none; }
//                             .search {display : none; } 
//                         </style>
//                     </head>
//                     <body>
//                         ${printContent}
//                     </body>
//                 </html>
//             `);
    
//             WinPrint.document.close();
//             WinPrint.focus();
//             setTimeout(() => {
//                 WinPrint.print();
//                 WinPrint.close();
//             }, 1000);
//         };

//     return(
//         <section className='w-full bg-gradient-to-br from-emerald-50 to-white min-h-screen'>
//             {/* Main Header */}
//             <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 py-4 lg:px-8 lg:py-6 bg-white shadow-lg rounded-b-2xl border-b border-emerald-100'>
//                 <div className='flex items-center gap-3'>
//                     <BackButton />
//                     <div className='flex flex-col'>
//                         <h1 className='text-2xl lg:text-3xl font-bold text-emerald-900'>Transactions Management</h1>
//                         <p className='text-sm text-emerald-600 mt-1'>Monitor and manage financial transactions</p>
//                     </div>
//                 </div>
                 

                
//                 <div className='flex gap-3 items-center mt-4 lg:mt-0'>
                    
//                     <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handlePrint}
//                         className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-lg transition duration-200 cursor-pointer"
//                     >
//                         <MdPrint className="w-4 h-4" />
//                         <span className='text-sm font-medium'>Print Report</span>
//                     </motion.button>


                    
//                     {Button.map(({ label, icon, action }) => {
//                         return (
//                             <button
//                                 className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-white cursor-pointer font-semibold text-sm flex items-center gap-2 rounded-xl border border-emerald-500 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5'
//                                 onClick={() => handleOpenModal(action)}
//                                 key={action}
//                             >
//                                 {label} {icon}
//                             </button>
//                         )
//                     })}
//                 </div>

//                 {isAddTransactionModalOpen &&
//                 <AddTransaction 
//                 setIsAddTransactionModalOpen= {setIsAddTransactionModalOpen} 
//                 fetchTransactions= {fetchTransactions}
//                 />} 
//             </div>

//             {/* Statistics Cards */}
//             <div className='px-4 lg:px-8 mt-6'>
//                 <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
//                     {/* Total Transactions Card */}
//                     <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
//                         <div className='flex items-center justify-between'>
//                             <div>
//                                 <p className='text-emerald-600 text-sm font-medium'>Total Transactions</p>
//                                 <h3 className='text-2xl font-bold text-emerald-900 mt-1'>{totalTransaction}</h3>
//                             </div>
//                             <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
//                                 <FaExchangeAlt className='w-6 h-6 text-emerald-600' />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Total Income Card */}
//                     <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
//                         <div className='flex items-center justify-between'>
//                             <div>
//                                 <p className='text-emerald-600 text-sm font-medium'>Total Income</p>
//                                 <h3 className='text-2xl font-bold text-emerald-900 mt-1'>{totalIncomeTurnover.toFixed(2)} <span className='text-emerald-500 text-sm'>SD</span></h3>
//                                 <p className='text-emerald-500 text-xs mt-1'>{totalIncomeTransactions.length} transactions</p>
//                             </div>
//                             <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
//                                 <MdTrendingUp className='w-6 h-6 text-emerald-600' />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Total Expense Card */}
//                     <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
//                         <div className='flex items-center justify-between'>
//                             <div>
//                                 <p className='text-emerald-600 text-sm font-medium'>Total Expense</p>
//                                 <h3 className='text-2xl font-bold text-amber-600 mt-1'>{totalExpenseTurnover.toFixed(2)} <span className='text-amber-500 text-sm'>SD</span></h3>
//                                 <p className='text-amber-500 text-xs mt-1'>{totalExpenseTransactions.length} transactions</p>
//                             </div>
//                             <div className='w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center'>
//                                 <MdTrendingDown className='w-6 h-6 text-amber-600' />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Net Balance Card */}
//                     <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
//                         <div className='flex items-center justify-between'>
//                             <div>
//                                 <p className='text-emerald-600 text-sm font-medium'>Net Balance</p>
//                                 <h3 className={`text-2xl font-bold ${(totalIncomeTurnover - totalExpenseTurnover) >= 0 ? 'text-emerald-600' : 'text-amber-600'} mt-1`}>
//                                     {(totalIncomeTurnover - totalExpenseTurnover).toFixed(2)} <span className='text-emerald-500 text-sm'>SD</span>
//                                 </h3>
//                                 <p className='text-emerald-500 text-xs mt-1'>Income - Expense</p>
//                             </div>
//                             <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
//                                 <MdAccountBalance className='w-6 h-6 text-emerald-600' />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Filters and Search */}
//             <div className='px-4 lg:px-8 mt-6'>
//                 <div className='bg-white rounded-xl shadow-md p-4 border border-emerald-100'>
//                     <div className='flex flex-col lg:flex-row gap-4'>
//                         {/* Search Input */}
//                         <div className='flex-1'>
//                             <div className='relative'>
//                                 <input
//                                     type="text"
//                                     placeholder="Search transactions..."
//                                     value={search}
//                                     onChange={(e) => setSearch(e.target.value)}
//                                     className='w-full px-4 py-3 pl-12 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
//                                 />
//                                 <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
//                                     <MdSearch className='w-5 h-5 text-emerald-500' />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Filter Row */}
//                         <div className='flex flex-col sm:flex-row gap-3'>
//                             {/* Date Range */}
//                             <div className='relative'>
//                                 <select 
//                                     id='frequency' 
//                                     value={frequency} 
//                                     onChange={(e) => setFrequency(e.target.value)}
//                                     className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
//                                 >
//                                     <option value='1'>Last 1 Day</option>
//                                     <option value='7'>Last 7 Days</option>
//                                     <option value='30'>Last 30 Days</option>
//                                     <option value='90'>Last 90 Days</option>
//                                     <option value='366'>All Time</option>
//                                 </select>
//                                 <MdCalendarToday className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
//                             </div>

//                             {/* Type Filter */}
//                             <div className='relative'>
//                                 <select 
//                                     id='type' 
//                                     value={type} 
//                                     onChange={(e) => setType(e.target.value)}
//                                     className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
//                                 >
//                                     <option value='all'>All Types</option>
//                                     <option value='Income'>Income</option>
//                                     <option value='Expense'>Expense</option>
//                                 </select>
//                                 <MdFilterList className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
//                             </div>

//                             {/* Shift Filter */}
//                             <div className='relative'>
//                                 <select 
//                                     id='shift' 
//                                     value={shift} 
//                                     onChange={(e) => setShift(e.target.value)}
//                                     className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
//                                 >
//                                     <option value='all'>All Shifts</option>
//                                     <option value='Morning'>Morning</option>
//                                     <option value='Evening'>Evening</option>
//                                 </select>
//                                 <FaUsers className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
//                             </div>

//                             {/* Sort Filter */}
//                             <div className='relative'>
//                                 <select
//                                     value={sort}
//                                     onChange={(e) => {
//                                         setSort(e.target.value);
//                                         setPagination(prev => ({ ...prev, currentPage: 1 }));
//                                     }}
//                                     className='w-full px-4 py-3 pl-10 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
//                                 >
//                                     <option value='-createdAt'>Newest First</option>
//                                     <option value='createdAt'>Oldest First</option>
//                                     <option value='type'>Type A-Z</option>
//                                     <option value='-type'>Type Z-A</option>
//                                     <option value='amount'>Amount Low-High</option>
//                                     <option value='-amount'>Amount High-Low</option>
//                                 </select>
//                                 <MdBarChart className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600' />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className='px-4 lg:px-8 mt-6 mb-8' >
//                 <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
//                     {/* Transactions Table - Takes 3/4 width */}
//                     <div className='lg:col-span-3' ref={invoiceRef}>
//                         <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100'>
//                             <div className='overflow-x-auto'>
//                                 <table className='w-full' >
//                                     <thead className='bg-gradient-to-r from-emerald-500 to-emerald-600'>
//                                         <tr className='text-white text-sm font-semibold'>
//                                             <th className='p-4 text-left'>Date</th>
//                                             <th className='p-4 text-left'>Type</th>
//                                             <th className='p-4 text-left'>Shift</th>
//                                             <th className='p-4 text-left'>Amount</th>
//                                             <th className='p-4 text-left'>Category</th>
//                                             <th className='p-4 text-left'>Reference</th>
//                                             <th className='p-4 text-left'>Actions</th>
//                                         </tr>
//                                     </thead>

//                                     <tbody>
//                                         {list.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan="7" className='p-8 text-center'>
//                                                     <div className='flex flex-col items-center justify-center py-8'>
//                                                         <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4'>
//                                                             <MdAttachMoney className='w-8 h-8 text-emerald-500' />
//                                                         </div>
//                                                         <p className='text-emerald-600 font-medium text-lg'>No transactions found</p>
//                                                         <p className='text-emerald-400 text-sm mt-2'>Start by adding your first transaction!</p>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ) : list.map((transaction, index) => (
//                                             <tr
//                                                 key={transaction._id}
//                                                 className={`border-b border-emerald-50 hover:bg-emerald-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`}
//                                             >
//                                                 <td className='p-4 font-medium text-emerald-900'>
//                                                     {transaction.date ? new Date(transaction.date).toLocaleDateString('en-GB') : 'N/A'}
//                                                 </td>
//                                                 <td className='p-4'>
//                                                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                                         transaction.type === 'Income' 
//                                                             ? 'bg-emerald-100 text-emerald-700' 
//                                                             : 'bg-red-100 text-red-700'
//                                                     }`}>
//                                                         {transaction.type}
//                                                     </span>
//                                                 </td>
//                                                 <td className='p-4'>
//                                                     <span className={`font-medium ${
//                                                         transaction.shift === 'Morning' 
//                                                             ? 'text-amber-600' 
//                                                             : 'text-blue-600'
//                                                     }`}>
//                                                         {transaction.shift}
//                                                     </span>
//                                                 </td>
//                                                 <td className='p-4 font-bold text-emerald-900'>
//                                                     {transaction.amount.toFixed(2)} SD
//                                                 </td>
//                                                 <td className='p-4 text-emerald-700'>{transaction.category}</td>
//                                                 <td className='p-4 text-emerald-700'>{transaction.refrence}</td>
//                                                 <td className='p-4'>
//                                                     <div className='flex items-center gap-2'>
//                                                         <button className='p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 hover:scale-105'
//                                                         onClick={() => handleEdit(transaction)}
//                                                         >
//                                                             <BiSolidEditAlt size={18} />
//                                                         </button>
//                                                         <button className='p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-105'
//                                                             onClick={() => { setSelectedTransaction(transaction); setDeleteModalOpen(true); }}
//                                                         >
//                                                             <MdDeleteForever size={18} />
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>

//                             {/* Pagination */}
//                             {list.length > 0 && (
//                                 <div className='p-4'>
//                                     <PaginationControls />
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Statistics Sidebar - Takes 1/4 width */}
//                     <div className='lg:col-span-1'>
//                         <div className='bg-white rounded-xl shadow-lg border border-emerald-100 p-5'>
//                             <h3 className='text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2'>
//                                 <MdBarChart className='w-5 h-5' />
//                                 Financial Overview
//                             </h3>

//                             {/* Summary Stats */}
//                             <div className='space-y-6'>
//                                 {/* Transaction Count */}
//                                 <div className='bg-emerald-50 rounded-lg p-4 border border-emerald-200'>
//                                     <div className='flex justify-between items-center mb-3'>
//                                         <span className='text-sm font-medium text-emerald-700'>Total Transactions</span>
//                                         <span className='font-bold text-emerald-900'>{totalTransaction}</span>
//                                     </div>
//                                     <div className='flex justify-between items-center mb-2'>
//                                         <div className='flex items-center gap-2'>
//                                             <div className='w-3 h-3 bg-emerald-500 rounded-full'></div>
//                                             <span className='text-xs text-emerald-700'>Income</span>
//                                         </div>
//                                         <span className='font-medium text-emerald-900'>{totalIncomeTransactions.length}</span>
//                                     </div>
//                                     <div className='flex justify-between items-center'>
//                                         <div className='flex items-center gap-2'>
//                                             <div className='w-3 h-3 bg-red-500 rounded-full'></div>
//                                             <span className='text-xs text-red-700'>Expense</span>
//                                         </div>
//                                         <span className='font-medium text-red-700'>{totalExpenseTransactions.length}</span>
//                                     </div>
//                                 </div>

//                                 {/* Amount Totals */}
//                                 <div className='bg-emerald-50 rounded-lg p-4 border border-emerald-200'>
//                                     <h4 className='text-sm font-semibold text-emerald-800 mb-3'>Amount Totals</h4>
//                                     <div className='space-y-3'>
//                                         <div className='flex justify-between items-center'>
//                                             <span className='text-xs text-emerald-700'>Total Turnover</span>
//                                             <span className='font-bold text-emerald-900'>{totalTurnover.toFixed(2)} SD</span>
//                                         </div>
//                                         <div className='flex justify-between items-center'>
//                                             <span className='text-xs text-emerald-700'>Total Income</span>
//                                             <span className='font-medium text-emerald-600'>{totalIncomeTurnover.toFixed(2)} SD</span>
//                                         </div>
//                                         <div className='flex justify-between items-center'>
//                                             <span className='text-xs text-red-700'>Total Expense</span>
//                                             <span className='font-medium text-red-600'>{totalExpenseTurnover.toFixed(2)} SD</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Percentage Charts */}
//                                 <div className='bg-emerald-50 rounded-lg p-4 border border-emerald-200'>
//                                     <h4 className='text-sm font-semibold text-emerald-800 mb-4'>Distribution</h4>
//                                     <div className='flex flex-col items-center space-y-6'>
//                                         <div className='text-center'>
//                                             <Progress 
//                                                 type="circle" 
//                                                 strokeColor={'#10b981'} 
//                                                 size={100} 
//                                                 percent={totalIncomeTurnoverPercent.toFixed(0)} 
//                                                 format={percent => (
//                                                     <div className='text-center'>
//                                                         <div className='text-lg font-bold text-emerald-700'>{percent}%</div>
//                                                         <div className='text-xs text-emerald-600'>Income</div>
//                                                     </div>
//                                                 )}
//                                             />
//                                         </div>
//                                         <div className='text-center'>
//                                             <Progress 
//                                                 type="circle" 
//                                                 strokeColor={'#ef4444'} 
//                                                 size={100} 
//                                                 percent={totalExpenseTurnoverPercent.toFixed(0)} 
//                                                 format={percent => (
//                                                     <div className='text-center'>
//                                                         <div className='text-lg font-bold text-red-700'>{percent}%</div>
//                                                         <div className='text-xs text-red-600'>Expense</div>
//                                                     </div>
//                                                 )}
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Net Balance */}
//                                 <div className={`rounded-lg p-4 border ${
//                                     (totalIncomeTurnover - totalExpenseTurnover) >= 0 
//                                         ? 'bg-emerald-50 border-emerald-200' 
//                                         : 'bg-red-50 border-red-200'
//                                 }`}>
//                                     <div className='flex items-center justify-between'>
//                                         <div>
//                                             <p className='text-sm font-semibold text-emerald-800'>Net Balance</p>
//                                             <p className={`text-2xl font-bold ${
//                                                 (totalIncomeTurnover - totalExpenseTurnover) >= 0 
//                                                     ? 'text-emerald-600' 
//                                                     : 'text-red-600'
//                                             }`}>
//                                                 {(totalIncomeTurnover - totalExpenseTurnover).toFixed(2)} SD
//                                             </p>
//                                         </div>
//                                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                                             (totalIncomeTurnover - totalExpenseTurnover) >= 0 
//                                                 ? 'bg-emerald-100' 
//                                                 : 'bg-red-100'
//                                         }`}>
//                                             {totalIncomeTurnover >= totalExpenseTurnover ? (
//                                                 <MdTrendingUp className='w-6 h-6 text-emerald-600' />
//                                             ) : (
//                                                 <MdTrendingDown className='w-6 h-6 text-red-600' />
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
            
//             {isEditTransactionModal && currentTransaction && (
//                 <TransactionUpdate
//                     transaction={currentTransaction}
//                     setIsEditTransactionModal={setIsEditTransactionModal}
//                     fetchTransactions={fetchTransactions}
//                 />
//             )}

//             {/* Delete Confirmation Modal */}
//             <ConfirmModal
//                 open={deleteModalOpen}
//                 Type={selectedTransaction?.type}
//                 Amount={selectedTransaction?.amount}
//                 onClose={() => setDeleteModalOpen(false)}
//                 onConfirm={() => {
//                     removeTransaction(selectedTransaction._id);
//                     setDeleteModalOpen(false);
//                 }}
//             />
//         </section>
//     );
// };



// // Delete Confirmation Modal
// const ConfirmModal = ({ open, onClose, onConfirm, Type, Amount }) => {
//     if (!open) return null;
//     return (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
//             <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-emerald-100">
//                 <div className="flex items-center justify-center mb-6">
//                     <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
//                         <MdDeleteForever className="w-6 h-6 text-red-500" />
//                     </div>
//                 </div>
//                 <h2 className="text-xl font-bold text-emerald-900 text-center mb-2">Confirm Deletion</h2>
//                 <p className="text-emerald-700 text-center mb-6">
//                     Are you sure you want to remove this 
//                     <span className={`font-bold mx-1 ${Type === 'Income' ? 'text-emerald-600' : 'text-red-600'}`}>
//                         {Type}
//                     </span>
//                     transaction?
//                 </p>
//                 <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
//                     <div className="text-center">
//                         <p className="text-sm text-red-600 mb-1">Amount to be removed:</p>
//                         <p className="text-2xl font-bold text-red-700">{Amount?.toFixed(2)} SD</p>
//                     </div>
//                 </div>
//                 <div className="flex gap-3">
//                     <button
//                         className="flex-1 px-4 py-3 bg-emerald-50 text-emerald-700 font-medium rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-all duration-200"
//                         onClick={onClose}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
//                         onClick={onConfirm}
//                     >
//                         Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Transactions;
