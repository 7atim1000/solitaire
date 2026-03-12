import React, { useState, useEffect, useRef } from 'react';
import { MdDeleteForever, MdOutlineAddToDrive } from "react-icons/md";
import { LiaEditSolid } from "react-icons/lia";
import { FiSearch, FiFilter } from "react-icons/fi";
import { api } from '../https';
import { toast } from 'react-toastify';
import BackButton from '../components/shared/BackButton';
import ServiceAddModal from '../components/services/ServiceAddModal';
import BottomNav from '../components/shared/BottomNav';

const Services = () => {
    const addBtn = [{ label: 'New Items', action: 'items', icon: <MdOutlineAddToDrive className='text-white' size={20} /> }];

    const [isAddItemModal, setIsAddItemModal] = useState(false);
    const handleAddItemModal = (action) => {
        if (action === 'items') setIsAddItemModal(true);
    };

    // Fetch items
    const [list, setList] = useState([]);
    const [category, setCategory] = useState('all');
    const [serviceName, setServiceName] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    });
    
    const [showFilters, setShowFilters] = useState(false);

    const fetchItems = async () => {
        try {
            const response = await api.post('/api/service/fetch',
                {
                    category,
                    serviceName,
                    search,
                    sort,
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage
                }
            );

            if (response.data.success) {
                setList(response.data.services || response.data.data || []);
                
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
                toast.error(response.data.message || 'Empty items list');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            fetchItems();
        }
    }, [category, search, sort, pagination.currentPage, pagination.itemsPerPage]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems();
        }, 500);

        return () => clearTimeout(timer);
    }, [search, sort]);

    // Remove item
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const removeItem = async (id) => {
        try {
            const response = await api.post('/api/service/remove', { id });

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchItems();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // Pagination Controls Component
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
            <div className="  flex-col sm:flex-row justify-between items-center gap-4 mt-4 py-3 px-4 bg-white rounded-lg shadow-sm border border-emerald-100 text-xs font-medium">
                <div className="text-gray-600 ">
                    Showing <span className='text-emerald-600 font-semibold'>{list.length}</span> of{' '}
                    <span className='text-emerald-600 font-semibold'>{pagination.totalItems}</span> records
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg
                                 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 
                                 disabled:cursor-not-allowed transition-colors text-xs"
                    >
                        Previous
                    </button>

                    <span className="px-3 py-1.5 bg-emerald-50 rounded-lg text-emerald-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg
                                 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50 
                                 disabled:cursor-not-allowed transition-colors text-xs"
                    >
                        Next
                    </button>

                    <select
                        value={pagination.itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-emerald-200 rounded-lg px-3 py-1.5 
                                 text-emerald-700 bg-white focus:outline-none 
                                 focus:ring-2 focus:ring-emerald-500 text-xs"
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
        <section className='w-full h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-green-50'>
            {/* Header */}
            <div className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 px-4 sm:px-6 py-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <BackButton />
                        <h1 className='text-lg sm:text-xl font-bold text-gray-800'>
                            Items Management
                        </h1>
                        <span className='hidden sm:inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium'>
                            {pagination.totalItems} Total Items
                        </span>
                    </div>

                    <div className='flex items-center gap-2'>
                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className='sm:hidden p-2 bg-white border border-emerald-200 rounded-lg
                                     text-emerald-600 hover:bg-emerald-50 transition-colors'
                        >
                            <FiFilter size={18} />
                        </button>

                        {/* Add button */}
                        {addBtn.map(({ label, icon, action }) => (
                            <button
                                key={action}
                                className='group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 
                                         hover:from-emerald-700 hover:to-green-700 text-white px-4 sm:px-5 py-2 
                                         rounded-lg shadow-md hover:shadow-lg transition-all duration-200'
                                onClick={() => handleAddItemModal(action)}
                            >
                                <span className='text-sm font-medium hidden sm:inline'>{label}</span>
                                <span className='text-sm font-medium sm:hidden'>Add</span>
                                <span className='group-hover:scale-110 transition-transform'>
                                    {icon}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mobile total count */}
                <div className='sm:hidden mt-2 flex justify-between items-center'>
                    <span className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium'>
                        {pagination.totalItems} Total Items
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className='px-4 sm:px-6 py-3 bg-white/50 border-b border-emerald-100'>
                <div className='flex flex-col gap-3'>
                    {/* Search bar */}
                    <div className='relative'>
                        <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
                        <input
                            type='text'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Search items by name, category...'
                            className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500 
                                     focus:border-transparent bg-white text-sm'
                        />
                    </div>

                    {/* Filter options - responsive */}
                    {/* <div className={`${showFilters ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row gap-3`}>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className='flex-1 px-3 py-2 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500
                                     bg-white text-sm'
                        >
                            <option value="all">All Categories</option>
                            <option value="food">Food & Beverage</option>
                            <option value="amenities">Amenities</option>
                            <option value="services">Services</option>
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className='flex-1 px-3 py-2 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500
                                     bg-white text-sm'
                        >
                            <option value="-createdAt">Newest First</option>
                            <option value="createdAt">Oldest First</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="serviceName">Name: A to Z</option>
                            <option value="-serviceName">Name: Z to A</option>
                        </select>
                    </div> */}
                </div>
            </div>

            {isAddItemModal && (
                <ServiceAddModal 
                    setIsAddItemModal={setIsAddItemModal} 
                    fetchItems={fetchItems}
                />
            )}

            {/* Table Section */}
            <div className='flex-1 overflow-auto p-4 sm:p-6'>
                <div className='bg-white rounded-xl shadow-lg border border-emerald-100 overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead>
                                <tr className='bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs sm:text-sm'>
                                    <th className='p-3 text-left font-medium'>Category</th>
                                    <th className='p-3 text-left font-medium'>Item Name</th>
                                    <th className='p-3 text-left font-medium'>Quantity</th>
                                    <th className='p-3 text-left font-medium'>Price</th>
                                    <th className='p-3 text-left font-medium'>Unit</th>
                                    <th className='p-3 text-center font-medium'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className='p-8 text-center'>
                                            <div className='flex flex-col items-center justify-center'>
                                                <div className='w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3'>
                                                    <MdOutlineAddToDrive className='text-emerald-600' size={30} />
                                                </div>
                                                <p className='text-gray-600 mb-2'>Your items list is empty!</p>
                                                <button
                                                    onClick={() => handleAddItemModal('items')}
                                                    className='text-emerald-600 font-medium hover:text-emerald-700 
                                                             underline underline-offset-2'
                                                >
                                                    Start adding items
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    list.map((item, index) => (
                                        <tr
                                            key={item._id || index}
                                            className='border-b border-gray-100 hover:bg-emerald-50/50 
                                                     transition-colors text-xs sm:text-sm'
                                        >
                                            <td className='p-3'>
                                                <span className='px-2 py-1 bg-emerald-100 text-emerald-700 
                                                               rounded-full text-xs font-medium'>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className='p-3 font-medium text-gray-800'>{item.serviceName}</td>
                                            <td className='p-3'>
                                                <span className='font-medium'>{item.qty}</span>
                                            </td>
                                            <td className='p-3'>
                                                <span className='font-medium'>{item.price}</span>
                                                <span className='text-emerald-600 text-xs ml-1'>AED</span>
                                            </td>
                                            <td className='p-3 text-gray-600'>{item.unit}</td>
                                            <td className='p-3'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    {/* <button
                                                        className='p-2 hover:bg-emerald-100 rounded-lg 
                                                                 transition-colors group'
                                                        title='Edit'
                                                    >
                                                        <LiaEditSolid 
                                                            size={18} 
                                                            className='text-emerald-600 group-hover:scale-110 
                                                                     transition-transform'
                                                        />
                                                    </button> */}
                                                    <button
                                                        className='p-2 hover:bg-red-100 rounded-lg 
                                                                 transition-colors group'
                                                        title='Delete'
                                                        onClick={() => {
                                                            setSelectedService(item);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <MdDeleteForever 
                                                            size={18} 
                                                            className='text-red-500 group-hover:scale-110 
                                                                     transition-transform'
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {list.length > 0 && (
                                <tfoot>
                                    <tr className='bg-emerald-50 border-t-2 border-emerald-200'>
                                        <td className='p-3'></td>
                                        <td className='p-3 font-semibold text-gray-700'>
                                            {list.length} <span className='font-normal text-gray-600'>Items</span>
                                        </td>
                                        <td className='p-3' colSpan="4"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {list.length > 0 && <PaginationControls />}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                serviceName={selectedService?.serviceName}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    removeItem(selectedService?._id);
                    setDeleteModalOpen(false);
                }}
            />

            
        </section>
    );
};

// Enhanced ConfirmModal
const ConfirmModal = ({ open, onClose, onConfirm, serviceName }) => {
    if (!open) return null;
    
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(5, 24, 1, 0.6)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MdDeleteForever size={24} />
                        Confirm Delete
                    </h3>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to remove this item?
                    </p>
                    <p className="text-lg font-semibold text-red-600 mb-6 bg-red-50 p-3 rounded-lg">
                        {serviceName}
                    </p>
                    
                    {/* Modal Footer */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            className="px-6 py-2.5 rounded-lg border-2 border-gray-200 
                                     hover:bg-gray-50 font-medium text-gray-700 
                                     transition-colors cursor-pointer order-2 sm:order-1"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 
                                     text-white font-medium hover:from-red-600 hover:to-red-700 
                                     shadow-md hover:shadow-lg transition-all cursor-pointer 
                                     order-1 sm:order-2"
                            onClick={onConfirm}
                        >
                            Delete Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;