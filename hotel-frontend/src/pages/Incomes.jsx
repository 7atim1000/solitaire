import React ,{useState} from 'react'
import { MdDelete, MdOutlineAddToDrive } from "react-icons/md";
import BackButton from '../components/shared/BackButton';
import { FiEdit3 } from "react-icons/fi";
import { FaMoneyBillWave, FaPlus, FaChartLine, FaCalculator,  FaRegMoneyBillAlt } from 'react-icons/fa';
import { FaArrowTrendUp } from "react-icons/fa6";
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, getIncomes } from '../https';

import { toast } from 'react-toastify'
import IncomeAdd from '../components/incomes/IncomeAdd';
// import BottomNav from '../components/shared/BottomNav';
import { motion } from 'framer-motion';

const Incomes = () => {
    // Modal
    const Button = [
        { label : 'New Income' , icon : <MdOutlineAddToDrive className ='text-white' size={20} />, action :'income' }
    ];
    
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    const handleOpenModal = (action) => {
        if (action === 'income') setIsIncomeModalOpen(true);
    };

    // Fetch Incomes
    const { data: responseData, IsError } = useQuery({
        queryKey: ['incomes'],
        queryFn: async () => {
            return await getIncomes();
        },
        placeholderData: keepPreviousData,
    });

    if (IsError) {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }

    console.log(responseData);

    // remove Income
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedIncome, setSelectedIncome] = useState(null);

    const removeIncome = async (id) => {
        try {
            const response = await api.post('/api/incomes/remove', { id }, )
    
            if (response.data.success){
                toast.success(response.data.message)
                window.location.reload();
            } else{
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    };

    const totalIncomes = responseData?.data.data.length || 0;
    const totalAmount = responseData?.data.data.reduce((sum, income) => sum + (Number(income.amount) || 0), 0) || 0;

    return (
        <section className='min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 md:p-6'>
            <div className='max-w-7xl mx-auto'>
                {/* Header Section */}
                <div className='bg-white rounded-xl shadow-lg mb-6 overflow-hidden border border-emerald-100'>
                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white'>
                        <div className='flex items-center gap-3 mb-4 md:mb-0'>
                            <BackButton className="text-white" />
                            <div className='flex items-center gap-3'>
                                <div className='bg-white/20 p-2 rounded-lg'>
                                    <FaMoneyBillWave className='text-white w-5 h-5' />
                                </div>
                                <div>
                                    <h1 className='text-lg md:text-xl font-bold'>Income Accounts Management</h1>
                                    <p className='text-emerald-100 text-sm'>Track and manage your business incomes</p>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col sm:flex-row items-center gap-4'>
                            <div className='flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg'>
                                <FaArrowTrendUp  className='w-4 h-4 text-emerald-200' />
                                <span className='text-sm font-medium text-emerald-100'>
                                    {totalIncomes} Incomes
                                </span>
                            </div>
                            
                            <button 
                                onClick = {() => handleOpenModal('income')}
                                className='flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition duration-200 cursor-pointer'
                            >
                                <FaPlus className='text-white w-4 h-4' />
                                <span className='text-sm font-medium'>New Income</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-white rounded-xl p-4 border border-emerald-100 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-emerald-100 rounded-lg'>
                                <FaArrowTrendUp className='w-5 h-5 text-emerald-600' />
                            </div>
                            <div>
                                <p className='text-xs text-gray-500'>Total Incomes</p>
                                <p className='text-xl font-bold text-emerald-800'>{totalIncomes}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className='bg-white rounded-xl p-4 border border-emerald-100 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-emerald-100 rounded-lg'>
                                <FaCalculator className='w-5 h-5 text-emerald-600' />
                            </div>
                            <div>
                                <p className='text-xs text-gray-500'>Total Amount</p>
                                <p className='text-xl font-bold text-green-600'>{totalAmount.toFixed(2)} SD</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className='bg-white rounded-xl p-4 border border-emerald-100 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-emerald-100 rounded-lg'>
                                <FaChartLine className='w-5 h-5 text-emerald-600' />
                            </div>
                            <div>
                                <p className='text-xs text-gray-500'>Status</p>
                                <p className='text-sm font-bold text-green-600'>Active Tracking</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className='bg-white rounded-xl p-4 border border-emerald-100 shadow-sm'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-emerald-100 rounded-lg'>
                                <MdOutlineAddToDrive className='w-5 h-5 text-emerald-600' />
                            </div>
                            <div>
                                <p className='text-xs text-gray-500'>Actions</p>
                                <p className='text-sm font-bold text-emerald-800'>Add/Edit/Delete</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Incomes Grid */}
                <div className='bg-white rounded-xl shadow-lg border border-emerald-100 p-4 md:p-6'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-2'>
                            <FaMoneyBillWave className='w-5 h-5 text-emerald-600' />
                            <h2 className='text-lg font-semibold text-gray-800'>All Income Accounts</h2>
                        </div>
                        <div className='text-sm text-gray-500'>
                            Showing {totalIncomes} income accounts
                        </div>
                    </div>

                    {totalIncomes === 0 ? (
                        <div className='text-center py-12'>
                            <div className='mb-4 inline-flex p-4 bg-emerald-50 rounded-full'>
                                <FaArrowTrendUp  className='w-12 h-12 text-emerald-400' />
                            </div>
                            <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Income Accounts Found</h3>
                            <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                                Your income accounts list is empty. Start by adding your first income account to track your business revenues.
                            </p>
                            <button 
                                onClick = {() => handleOpenModal('income')}
                                className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg transition duration-200 cursor-pointer'
                            >
                                <FaPlus className='w-4 h-4' />
                                <span className='font-medium'>Add First Income</span>
                            </button>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                            {responseData?.data.data.map(income => (
                                <motion.div
                                    key={income.incomeName}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className='group bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-300'
                                >
                                    <div className='flex items-start justify-between mb-3'>
                                        <div className='flex items-center gap-3'>
                                            <div className='p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg'>
                                                <FaRegMoneyBillAlt className='text-white w-4 h-4' />
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h3 className='text-sm font-bold text-gray-800 truncate'>
                                                    {income.incomeName}
                                                </h3>
                                                {income.amount && (
                                                    <p className='text-xs text-gray-500 mt-1'>
                                                        Amount: <span className='font-medium text-green-600'>{Number(income.amount).toFixed(2)} SD</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {income.description && (
                                        <div className='mb-3'>
                                            <p className='text-xs text-gray-600 line-clamp-2'>
                                                {income.description}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className='mt-4 pt-3 border-t border-emerald-100'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-3'>
                                                <button
                                                    className='p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition-all duration-200 cursor-pointer'
                                                    title="Edit Income"
                                                >
                                                    <FiEdit3 className='w-4 h-4' />
                                                </button>
                                                
                                                <button
                                                    onClick={() => { setSelectedIncome(income); setDeleteModalOpen(true); }}
                                                    className='p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 cursor-pointer'
                                                    title="Delete Income"
                                                >
                                                    <MdDelete className='w-4 h-4' />
                                                </button>
                                            </div>
                                            
                                            <div className='text-xs text-gray-500'>
                                                ID: {income._id?.slice(-6) || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className='mt-3 text-center'>
                                        <div className='text-xs text-gray-400 bg-emerald-50 px-2 py-1 rounded-full inline-block'>
                                            Income Account
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className='mt-6 bg-white rounded-xl shadow-lg border border-emerald-100 p-4'>
                    <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                        <div className='text-sm text-gray-600'>
                            <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 bg-emerald-500 rounded-full'></div>
                                <span>Total: {totalIncomes} income accounts • Last updated: Just now</span>
                            </div>
                        </div>
                        <div className='text-xs text-gray-500'>
                            Track incomes to monitor business growth
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isIncomeModalOpen && <IncomeAdd setIsIncomeModalOpen={setIsIncomeModalOpen} />}
            
            {/* <BottomNav /> */}

            <ConfirmModal
                open={deleteModalOpen}
                IncomeName={selectedIncome?.incomeName}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    removeIncome(selectedIncome._id);
                    setDeleteModalOpen(false);
                }}
            />
        </section>
    );
};

const ConfirmModal = ({ open, onClose, onConfirm, IncomeName}) => {
    if (!open) return null;
    return (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-emerald-50 rounded-2xl shadow-2xl border border-emerald-200 w-full max-w-md'
            >
                <div className='p-6'>
                    <div className='text-center mb-6'>
                        <div className='mb-4 inline-flex p-3 bg-red-100 rounded-full'>
                            <MdDelete className='w-8 h-8 text-red-600' />
                        </div>
                        <h3 className='text-lg font-bold text-gray-800 mb-2'>Delete Income Account</h3>
                        <p className='text-gray-600'>
                            Are you sure you want to delete <span className='font-semibold text-red-600'>{IncomeName}</span>?
                        </p>
                        <p className='text-sm text-gray-500 mt-2'>
                            This action cannot be undone. All associated income records will be removed.
                        </p>
                    </div>
                    
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <button
                            onClick={onClose}
                            className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 cursor-pointer font-medium'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className='flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition duration-200 cursor-pointer font-medium'
                        >
                            Delete Income
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Incomes;