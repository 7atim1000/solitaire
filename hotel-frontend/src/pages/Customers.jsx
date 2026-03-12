import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCustomer } from '../redux/slices/customerSlice';

import { MdDeleteForever, MdOutlineAddToDrive } from "react-icons/md";
import { LiaEditSolid } from "react-icons/lia";
import { PiListMagnifyingGlassFill } from "react-icons/pi";
import { FaCcAmazonPay } from 'react-icons/fa6';

import { api } from '../https';
import { toast } from 'react-toastify'
import BackButton from '../components/shared/BackButton';
import CustomerAddModal from '../components/customers/CustomerAddModal';
import CustomerPayment from '../components/customers/CustomerPayment';
import OrdersDetails from '../components/customers/OrdersDetails';
import BottomNav from '../components/shared/BottomNav';
import CustomerUpdate from '../components/customers/CustomerUpdate';

const Customers = () => {
    const dispatch = useDispatch();

    const addBtn = [{ label: 'New Guest', action: 'customer', icon: <MdOutlineAddToDrive className='text-white' size={20} /> }]

    const [isAddCustomerModal, setIsAddCustomerModal] = useState(false);
    const handleAddCustomreModalOpen = (action) => {
        if (action === 'customer') setIsAddCustomerModal(true)
    };

    // fetch customers
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    });
    
    const [isEditCustomerModal, setIsEditCustomerModal] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);

    const fetchCustomers = async (search = '') => {
        try {
            const response = await api.post('/api/customers/fetch',
                {
                    search,
                    sort,
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage
                }
            );

            if (response.data.success) {
                setList(response.data.customers || response.data.data || []);
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,  // Keep existing values
                        currentPage: response.data.pagination.currentPage ?? prev.currentPage,
                        itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
                        totalItems: response.data.pagination.total ?? prev.totalItems,
                        totalPages: response.data.pagination.totalPages ?? prev.totalPages
                    }));
                };

            } else {
                toast.error(response.data.message || 'Empty customers list')
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            fetchCustomers();
        }
    }, [search, sort, pagination.currentPage, pagination.itemsPerPage]);

    // search - sorting - Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(search);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [search, sort]);

    
    // Handle edit
    const handleEdit = (customer) => {
        setCurrentCustomer(customer);
        setIsEditCustomerModal(true);
    };

    // remove 
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const removeCustomer = async (id) => {
        try {
            const response = await api.post('/api/customers/remove', { id },)

            if (response.data.success) {
                toast.success(response.data.message)

                //Update the LIST after Remove
                await fetchCustomers();

            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    };

    const detailsButton = [
        { label: '', icon: <PiListMagnifyingGlassFill className='text-emerald-500' size={20} />, action: 'details' }
    ]

    const [isDetailsModal, setIsDetailsModal] = useState(false);
    const handleDetailsModal = (customerId, customerName, balance, action) => {
        dispatch(setCustomer({ customerId, customerName, balance }));
        if (action === 'details') setIsDetailsModal(true);
    };

    const paymentButton = [
        { label: '', icon: <FaCcAmazonPay className='text-emerald-500' size={20} />, action: 'payment' }
    ]

    const [isPaymentModal, setIsPaymentModal] = useState(false);
    const handlePaymentModal = (customerId, customerName, email, contactNo, balance, action) => {
        dispatch(setCustomer({ customerId, customerName, email, contactNo, balance }));
        if (action === 'payment') setIsPaymentModal(true);
    };

    // Calculate statistics
    const totalGuests = list.length;
    const totalBalance = list.reduce((acc, customer) => acc + customer.balance, 0);
    const guestsWithBalance = list.filter(customer => customer.balance > 0).length;
    const guestsWithNoBalance = list.filter(customer => customer.balance === 0).length;

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
                currentPage: 1  // Reset to first page only when items per page changes
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

    return (
        <section className='w-full bg-gradient-to-br from-emerald-50 to-white min-h-screen'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-4 py-4 lg:px-8 lg:py-6 bg-white shadow-lg rounded-b-2xl border-b border-emerald-100'>
                <div className='flex items-center gap-3'>
                    <BackButton />
                    <div className='flex flex-col'>
                        <h1 className='text-2xl lg:text-3xl font-bold text-emerald-900'>Guests Management</h1>
                        <p className='text-sm text-emerald-600 mt-1'>Manage your guests efficiently</p>
                    </div>
                </div>

                <div className='flex gap-3 items-center'>
                    {addBtn.map(({ label, icon, action }) => {
                        return (
                            <button
                                className='bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-white cursor-pointer font-semibold text-sm flex items-center gap-2 rounded-xl border border-emerald-500 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5'
                                onClick={() => handleAddCustomreModalOpen(action)}
                                key={action}
                            >
                                {label} {icon}
                            </button>
                        )
                    })}
                </div>

                {isAddCustomerModal &&
                    <CustomerAddModal
                        setIsAddCustomerModal={setIsAddCustomerModal}
                        fetchCustomers={fetchCustomers}
                    />
                }
            </div>

            {/** Statistics Header - ADDED SECTION */}
            <div className='px-4 lg:px-8 mt-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {/* Total Guests Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Total Guests</p>
                                <h3 className='text-2xl font-bold text-emerald-900 mt-1'>{totalGuests}</h3>
                            </div>
                            <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
                                <svg className='w-6 h-6 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a4 4 0 11-8 0 4 4 0 018 0z' />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Balance Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Total Balance</p>
                                <h3 className='text-2xl font-bold text-emerald-900 mt-1'>{totalBalance.toFixed(2)} <span className='text-emerald-500 text-sm'>SD</span></h3>
                            </div>
                            <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
                                <svg className='w-6 h-6 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Guests with Balance Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Guests with Balance</p>
                                <h3 className='text-2xl font-bold text-amber-600 mt-1'>{guestsWithBalance}</h3>
                                <p className='text-emerald-500 text-xs mt-1'>Outstanding payments</p>
                            </div>
                            <div className='w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center'>
                                <svg className='w-6 h-6 text-amber-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Guests with No Balance Card */}
                    <div className='bg-white rounded-xl shadow-md p-5 border border-emerald-100 hover:shadow-lg transition-all duration-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-emerald-600 text-sm font-medium'>Guests with No Balance</p>
                                <h3 className='text-2xl font-bold text-emerald-600 mt-1'>{guestsWithNoBalance}</h3>
                                <p className='text-emerald-500 text-xs mt-1'>All payments cleared</p>
                            </div>
                            <div className='w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center'>
                                <svg className='w-6 h-6 text-emerald-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/** Search and Filters */}
            <div className='px-4 lg:px-8 mt-6'>
                <div className='bg-white rounded-xl shadow-md p-4 border border-emerald-100'>
                    <div className='flex flex-col md:flex-row gap-4'>
                        <div className='flex-1'>
                            <div className='relative'>
                                <input
                                    type='text'
                                    placeholder='Search guests by name, email, or contact...'
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className='w-full px-4 py-3 pl-12 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                                />
                                <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                    <svg className='w-5 h-5 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className='md:w-48'>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className='w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200'
                            >
                                <option value='-createdAt'>Newest First</option>
                                <option value='createdAt'>Oldest First</option>
                                <option value='customerName'>Name A-Z</option>
                                <option value='-customerName'>Name Z-A</option>
                                <option value='balance'>Balance Low-High</option>
                                <option value='-balance'>Balance High-Low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/** table */}
            <div className='px-4 lg:px-8 mt-6 mb-8'>
                <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='bg-gradient-to-r from-emerald-500 to-emerald-600'>
                                <tr className='text-white text-sm font-semibold'>
                                    <th className='p-4 text-left'>Name</th>
                                    <th className='p-4 text-left'>ID Number</th>
                                    <th className='p-4 text-left'>Email</th>
                                    <th className='p-4 text-left'>Contact No</th>
                                    <th className='p-4 text-left'>Address</th>
                                    <th className='p-4 text-left'>Balance</th>
                                    <th className='p-4 text-left'>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {list.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan="7" className='p-8 text-center'>
                                                <div className='flex flex-col items-center justify-center py-8'>
                                                    <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4'>
                                                        <svg className='w-8 h-8 text-emerald-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 0a4 4 0 11-8 0 4 4 0 018 0z' />
                                                        </svg>
                                                    </div>
                                                    <p className='text-emerald-600 font-medium text-lg'>No guests found</p>
                                                    <p className='text-emerald-400 text-sm mt-2'>Start by adding your first guest!</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    : list.map((customer, index) => (
                                        <tr
                                            key={customer._id}
                                            className={`border-b border-emerald-50 hover:bg-emerald-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}`}
                                        >
                                            <td className='p-4 font-medium text-emerald-900'>{customer.customerName}</td>
                                            <td className='p-4 text-emerald-700'>{customer.Idnumber}</td>
                                            <td className='p-4 text-emerald-700'>{customer.email}</td>
                                            <td className='p-4 text-emerald-700'>{customer.contactNo}</td>
                                            <td className='p-4 text-emerald-700 max-w-xs truncate' title={customer.address}>
                                                {customer.address}
                                            </td>
                                            <td className='p-4'>
                                                <span className={`font-bold ${customer.balance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {(Number(customer.balance) || 0).toFixed(2)}
                                                    <span className='text-emerald-500 ml-1'>SD</span>
                                                </span>
                                            </td>
                                            <td className='p-4'>
                                                <div className='flex items-center gap-2'>
                                                    <button className='p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 hover:scale-105'
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        <LiaEditSolid size={18} />
                                                    </button>
                                                    <button className='p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200 hover:scale-105'
                                                        onClick={() => { setSelectedCustomer(customer); setDeleteModalOpen(true); }}
                                                    >
                                                        <MdDeleteForever size={18} />
                                                    </button>
                                                    {detailsButton.map(({ label, icon, action }) => (
                                                        <button
                                                            key={action}
                                                            className='p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 hover:scale-105'
                                                            onClick={() => handleDetailsModal(customer._id, customer.customerName, customer.balance, action)}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                    {paymentButton.map(({ label, icon, action }) => (
                                                        <button
                                                            key={action}
                                                            className='p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-all duration-200 hover:scale-105'
                                                            onClick={() => handlePaymentModal(customer._id, customer.customerName, customer.email, customer.contactNo, customer.balance, action)}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                            <tfoot className='bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'>
                                <tr>
                                    <td className="p-4 font-bold">{list.length}<span className='font-normal opacity-90 ml-1'>guests</span></td>
                                    <td className="p-4" colSpan={4}></td>
                                    <td className="p-4 font-bold">
                                        {list.reduce((acc, customer) => acc + customer.balance, 0).toFixed(2)}
                                        <span className='font-normal opacity-90 ml-1'>SD</span>
                                    </td>
                                    <td className="p-4"></td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Pagination */}
                        {list.length > 0 && (
                            <div className='p-4'>
                                <PaginationControls />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isDetailsModal &&
                <OrdersDetails
                    setIsDetailsModal={setIsDetailsModal}
                />
            }

            {isPaymentModal &&
                <CustomerPayment
                    setIsPaymentModal={setIsPaymentModal}
                    fetchCustomers={fetchCustomers}
                />
            }

            <ConfirmModal
                open={deleteModalOpen}
                customerName={selectedCustomer?.customerName}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    removeCustomer(selectedCustomer._id);
                    setDeleteModalOpen(false);
                }}
            />

            {isEditCustomerModal && currentCustomer && (
                <CustomerUpdate
                    customer= {currentCustomer}
                    setIsEditCustomerModal= {setIsEditCustomerModal}
                    fetchCustomers= {fetchCustomers}
                />
            )}

        </section>
    );
};

const ConfirmModal = ({ open, onClose, onConfirm, customerName }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-emerald-100">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-emerald-900 text-center mb-2">Confirm Deletion</h2>
                <p className="text-emerald-700 text-center mb-6">
                    Are you sure you want to remove <span className="font-bold text-red-500">{customerName}</span>? This action cannot be undone.
                </p>
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

export default Customers;

// import React, { useState, useEffect, useRef } from 'react';
// import { useDispatch } from 'react-redux';
// import { setCustomer } from '../redux/slices/customerSlice';

// import { MdDeleteForever, MdOutlineAddToDrive } from "react-icons/md";
// import { LiaEditSolid } from "react-icons/lia";
// import { PiListMagnifyingGlassFill } from "react-icons/pi";
// import { FaCcAmazonPay } from 'react-icons/fa6';

// import { api } from '../https';
// import { toast } from 'react-toastify'
// import BackButton from '../components/shared/BackButton';
// import CustomerAddModal from '../components/customers/CustomerAddModal';
// import CustomerPayment from '../components/customers/CustomerPayment';
// import OrdersDetails from '../components/customers/OrdersDetails';
// import BottomNav from '../components/shared/BottomNav';

// const Customers = () => {
//     const dispatch = useDispatch();

//     const addBtn = [{ label: 'New Guest', action: 'customer', icon: <MdOutlineAddToDrive className='text-emerald-600' size={20} /> }]

//     const [isAddCustomerModal, setIsAddCustomerModal] = useState(false);
//     const handleAddCustomreModalOpen = (action) => {
//         if (action === 'customer') setIsAddCustomerModal(true)
//     };

//    // fetch customers
//     const [list, setList] = useState([]);
//     const [search, setSearch] = useState('');
//     const [sort, setSort] = useState('-createdAt');
//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         itemsPerPage: 10,
//         totalItems: 0,
//         totalPages: 1
//     });


//     const fetchCustomers = async (search = '') => {
//         try {
//             const response = await api.post('/api/customers/fetch',
//                 {
//                     search,
//                     sort,
//                     page: pagination.currentPage,
//                     limit: pagination.itemsPerPage
//                 }
//             );

//             if (response.data.success) {
//                 setList(response.data.customers || response.data.data || []);
//                 if (response.data.pagination) {
//                     setPagination(prev => ({
//                         ...prev,  // Keep existing values
//                         currentPage: response.data.pagination.currentPage ?? prev.currentPage,
//                         itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
//                         totalItems: response.data.pagination.total ?? prev.totalItems,
//                         totalPages: response.data.pagination.totalPages ?? prev.totalPages
//                     }));
//                 };


//             } else {
//                 toast.error(response.data.message || 'Empty customers list')
//             }

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     }


//     const isInitialMount = useRef(true);
//     useEffect(() => {
//         if (isInitialMount.current) {
//             isInitialMount.current = false;
//         } else {
//             fetchCustomers();
//         }
//     }, [search, sort, pagination.currentPage, pagination.itemsPerPage]);


//     // search - sorting - Debounce search to avoid too many API calls
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             fetchCustomers(search);
//         }, 500); // 500ms delay

//         return () => clearTimeout(timer);
//     }, [search, sort]);


//     // remove 
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//     const [selectedCustomer, setSelectedCustomer] = useState(null);


//     const removeCustomer = async (id) => {

//         try {
//             const response = await api.post('/api/customers/remove', { id },)

//             if (response.data.success) {
//                 toast.success(response.data.message)

//                 //Update the LIST after Remove
//                 await fetchCustomers();

//             } else {
//                 toast.error(response.data.message)
//             }

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     };

//      const detailsButton = [
//             { label: '', icon: <PiListMagnifyingGlassFill className='text-green-600' size={20} />, action: 'details' }
//         ]
    
//     const [isDetailsModal, setIsDetailsModal] = useState(false);
//     const handleDetailsModal = (customerId, customerName, balance, action) => {
//         dispatch(setCustomer({ customerId, customerName, balance }));
//         if (action === 'details') setIsDetailsModal(true);
//     };


//     const paymentButton = [
//         { label: '', icon: <FaCcAmazonPay className='text-sky-600' size={20} />, action: 'payment' }
//     ]

//     const [isPaymentModal, setIsPaymentModal] = useState(false);
//     const handlePaymentModal = (customerId, customerName, email, contactNo, balance, action) => {
//         dispatch(setCustomer({ customerId, customerName, email, contactNo, balance }));
//         if (action === 'payment') setIsPaymentModal(true);
//     };


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


//         return (  //[#0ea5e9]
//             <div className="flex justify-between items-center mt-2 py-2 px-5 bg-white shadow-lg/30 rounded-lg text-xs font-medium border border-gray-200">
//                 <div>
//                     Showing
//                     <span className='text-blue-600'> {list.length} </span>
//                     of
//                     <span className='text-blue-600'> {pagination.totalItems} </span>
//                     records
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => handlePageChange(pagination.currentPage - 1)}
//                         disabled={pagination.currentPage === 1}
//                         className="px-2 py-1 shadow-lg/30 border border-gray-300 text-xs font-normal disabled:opacity-50 cursor-pointer hover:bg-gray-50 rounded"
//                     >
//                         Previous
//                     </button>

//                     <span className="px-3 py-1">
//                         Page
//                         <span className='text-blue-600'> {pagination.currentPage} </span>
//                         of
//                         <span className='text-blue-600'> {pagination.totalPages} </span>
//                     </span>

//                     <button
//                         onClick={() => handlePageChange(pagination.currentPage + 1)}
//                         disabled={pagination.currentPage === pagination.totalPages}
//                         className="px-2 py-1 shadow-lg/30 border border-gray-300 text-xs font-normal disabled:opacity-50 cursor-pointer hover:bg-gray-50 rounded"
//                     >
//                         Next
//                     </button>

//                     <select
//                         value={pagination.itemsPerPage}
//                         onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//                         className="border border-gray-300 px-2 font-normal shadow-lg/30 cursor-pointer rounded"
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


//     return (

//         <section className ='w-full bg-gray-50 overflow-y-scroll scrollbar-hidden h-[calc(100vh)]'>
//             <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between px-2 py-2 md:px-8 md:py-4 shadow-lg bg-white'>
//                 <div className='flex items-center gap-2'>
//                     <BackButton />
//                     <h1 className='text-2xl max-md:text-xl font-bold text-[#1a1a1a]'>Guests Management</h1>
//                 </div>

//                 <div className='flex gap-2 items-center'>
//                     {addBtn.map(({ label, icon, action }) => {
//                         return (
//                             <button className='bg-white px-4 py-2 text-[#1a1a1a] cursor-pointer font-semibold text-md flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-500 transition-colors'
//                                 onClick={() => handleAddCustomreModalOpen(action)}
//                                 key={action}
//                             >
//                                 {label} {icon}
//                             </button>
//                         )
//                     })}

//                 </div>

//                 {isAddCustomerModal && 
//                     <CustomerAddModal 
//                     setIsAddCustomerModal= {setIsAddCustomerModal}
//                     fetchCustomers ={fetchCustomers}
//                  />
//                 } 
                
//             </div>


//             {/** table  */}
//             <div className='mt-5 bg-white py-1 px-10'>
//                 <div className='overflow-x-auto'>
//                     <table className='text-left w-full'>
//                         <thead className=''>
//                             <tr className='bg-white border-b-2 border-emerald-600 text-emerald-600 text-xs font-normal'>
//                                 <th className='p-1'>Name</th>
//                                 <th className='p-1'>ID Number</th>
//                                 <th className ='p-1'>Email</th>
//                                 <th className='p-1'>Contact No</th>
//                                 <th className='p-1'>Address</th>
//                                 <th className='p-1'>Balance</th>
//                                 <th className='p-1'></th>
//                             </tr>
//                         </thead>

//                         <tbody>

//                             {list.length === 0
//                                 ? (<p className='ml-5 mt-5 text-xs text-[#be3e3f] flex items-start justify-start'>Your customers list is empty . Start adding customers !</p>)
//                                 : list.map((customer, index) => (

//                                     <tr
//                                         // key ={index}
//                                         className='border-b-3 border-[#f5f5f5] text-xs font-normal text-[#1a1a1a] 
//                                             hover:bg-emerald-50 cursor-pointer'
//                                     >
//                                         <td className='p-1' hidden>{customer._id}</td>
//                                         <td className='p-1'>{customer.customerName}</td>
//                                          <td className='p-1'>{customer.Idnumber}</td>
//                                         <td className='p-1'>{customer.email}</td>
//                                         <td className='p-1'>{customer.contactNo}</td>
//                                         <td className='p-1'>{customer.address}</td>
//                                         <td className={`p-1 ${customer.balance === 0 ? 'text-[#1a1a1a]' : 'text-[#be3e3f]'} text-sm font-bold`}>  {(Number(customer.balance) || 0).toFixed(2)}
//                                             <span className ='text-emerald-600'> AED</span>
//                                         </td>
//                                         <td className='p-2'>

//                                             <button className={`text-sky-600 cursor-pointer text-sm font-semibold `}>
//                                                 <LiaEditSolid size={20} className='w-5 h-5 text-sky-600 rounded-full'
//                                                 // onClick={() => setIsItemEditModalOpen(true)}
//                                                 />
//                                             </button>
//                                             <button className={`text-[#be3e3f] cursor-pointer text-sm font-semibold`}>
//                                                 <MdDeleteForever
//                                                     onClick={() => { setSelectedCustomer(customer); setDeleteModalOpen(true); }} size={20}
//                                                     className='w-5 h-5 text-[#be3e3f] rounded-full'
//                                                 />
//                                             </button>

//                                             {detailsButton.map(({ label, icon, action }) => {
//                                                 return (
//                                                     <button className='cursor-pointer 
//                                                 py-1 rounded-lg text-emerald-600 font-semibold text-xs'
//                                                         onClick={() => handleDetailsModal(customer._id, customer.customerName, customer.balance, action)}
//                                                     >
//                                                         {label} {icon}
//                                                     </button>
//                                                 )
//                                             })}


//                                             {paymentButton.map(({ label, icon, action }) => {
//                                                 return (
//                                                     <button className='cursor-pointer 
//                                                     py-1 rounded-lg  text-xs font-semibold ml-1'
//                                                         onClick={() => handlePaymentModal(customer._id, customer.customerName, customer.email, customer.contactNo, customer.balance, action)}
//                                                     >
//                                                         {label} {icon}
//                                                     </button>
//                                                 )
//                                             })}

//                                         </td>

//                                     </tr>

//                                 ))}
//                         </tbody>
//                         <tfoot>
//                             <tr className="bg-emerald-50 border-t-2 border-emerald-600 text-emerald-600 text-xs font-semibold">
                                
//                                 <td className="p-2">{list.length}<span className ='font-normal text-xs text-[#1a1a1a]'> guests</span></td>

//                                 <td className="p-2" colSpan={4}></td>
//                                 <td className="p-2">{list.reduce((acc, customer) => acc + customer.balance, 0).toFixed(2)}
//                                     <span className ='text-xs text-[#1a1a1a]'></span>
//                                 </td>
//                                 <td className="p-2" colSpan={1}></td>
//                             </tr>
//                         </tfoot>
//                     </table>

//                     {/* Pagination  */}
//                     {list.length > 0 && <PaginationControls />}

//                 </div>
//             </div>

//             {isDetailsModal && 
//                 <OrdersDetails 
//                 setIsDetailsModal= {setIsDetailsModal} />
//             }
            
//             {isPaymentModal && 
//                 <CustomerPayment
//                 setIsPaymentModal= {setIsPaymentModal} 
//                 fetchCustomers ={fetchCustomers}
//                 />
//             } 




//             <ConfirmModal
//                 open={deleteModalOpen}
//                 customerName={selectedCustomer?.customerName}
//                 onClose={() => setDeleteModalOpen(false)}
//                 onConfirm={() => {
//                     removeCustomer(selectedCustomer._id);
//                     setDeleteModalOpen(false);
//                 }}
//             />

//             <BottomNav />
//         </section>

//     );
// };


// const ConfirmModal = ({ open, onClose, onConfirm, customerName }) => {
//   if (!open) return null;
//   return (
//        <div
//       className="fixed inset-0 flex items-center justify-center z-50"
//       style={{ backgroundColor: 'rgba(56, 2, 2, 0.4)' }}  //rgba(0,0,0,0.4)
//     >
      
//       <div className="bg-white rounded-lg p-6 shadow-lg min-w-[300px]">
//         {/* <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2> */}
//         <p className="mb-6">Are you sure you want to remove <span className="font-semibold text-red-600">{customerName}</span>?</p>
//         <div className="flex justify-end gap-3">
//           <button
//             className="px-4 py-2 rounded bg-white hover:bg-gray-300 cursor-pointer shadow-lg/30"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="px-4 py-2 rounded bg-red-600 text-white hover:bg-[#be3e3f] cursor-pointer shadow-lg/30"
//             onClick={onConfirm}
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default Customers ;


