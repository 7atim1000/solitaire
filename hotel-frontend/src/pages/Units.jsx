import React, { useState, useEffect } from 'react';
import { MdDeleteForever, MdOutlineAddToDrive } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import { api } from '../https';
import { toast } from 'react-toastify';
import BackButton from '../components/shared/BackButton';
import { getBgColor } from '../utils';
import UnitAddModal from '../components/units/UnitAddModal';


const Units = () => {
    const addBtn = [{ label: 'New Unit', action: 'unit', icon: <MdOutlineAddToDrive className='text-white' size={20} /> }];

    const [isAddUnitModal, setIsAddUnitModal] = useState(false);
    const handleAddUnitModalOpen = (action) => {
        if (action === 'unit') setIsAddUnitModal(true);
    };

    const [list, setList] = useState([]);
    const fetchUnits = async () => {
        try {
            const response = await api.get('/api/unit/');
            if (response.data.success) {
                setList(response.data.units);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);

    const removeUnit = async (id) => {
        try {
            const response = await api.post('/api/unit/remove', { id });
            if (response.data.success) {
                toast.success(response.data.message);
                await fetchUnits();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    return (
        <section className='h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-green-50 w-full'>
            {/* Header */}
            <div className='bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100 px-4 sm:px-6 py-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <BackButton />
                        <h1 className='text-lg sm:text-xl font-bold text-gray-800'>
                            Units Management
                        </h1>
                        <span className='hidden sm:inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium'>
                            {list.length} {list.length === 1 ? 'Unit' : 'Units'}
                        </span>
                    </div>

                    <div className='flex items-center'>
                        {addBtn.map(({ label, icon, action }) => (
                            <button
                                key={action}
                                className='group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 
                                         hover:from-emerald-700 hover:to-green-700 text-white px-4 sm:px-5 py-2 
                                         rounded-lg shadow-md hover:shadow-lg transition-all duration-200'
                                onClick={() => handleAddUnitModalOpen(action)}
                            >
                                <span className='text-sm font-medium'>{label}</span>
                                <span className='group-hover:scale-110 transition-transform'>
                                    {icon}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Mobile unit count */}
                <div className='sm:hidden mt-2 flex justify-end'>
                    <span className='px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium'>
                        {list.length} {list.length === 1 ? 'Unit' : 'Units'}
                    </span>
                </div>
            </div>

            {isAddUnitModal && <UnitAddModal setIsAddUnitModal={setIsAddUnitModal} fetchUnits={fetchUnits} />}

            {/* Units Grid */}
            <div className='flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6'>
                {list.length === 0 ? (
                    <div className='flex flex-col items-center justify-center h-full min-h-[400px]'>
                        <div className='bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md mx-auto shadow-xl border border-emerald-100'>
                            <div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <MdOutlineAddToDrive className='text-emerald-600' size={40} />
                            </div>
                            <h3 className='text-xl font-bold text-gray-800 mb-2'>No Units Yet</h3>
                            <p className='text-gray-600 mb-6'>Your units list is empty. Start adding your first unit!</p>
                            <button
                                onClick={() => handleAddUnitModalOpen('unit')}
                                className='inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 
                                         text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg 
                                         transition-all duration-200'
                            >
                                <MdOutlineAddToDrive size={20} />
                                Add New Unit
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
                        {list.map((unit) => (
                            <div
                                key={unit._id}
                                className='group relative bg-white rounded-xl shadow-md hover:shadow-xl 
                                         transition-all duration-300 overflow-hidden border border-emerald-100'
                            >
                                {/* Color strip */}
                                <div 
                                    className='h-2 w-full'
                                    style={{ backgroundColor: getBgColor() }}
                                />
                                
                                <div className='p-4'>
                                    <div className='flex items-start justify-between mb-3'>
                                        <div>
                                            <h3 className='font-bold text-gray-800 text-lg line-clamp-1'>
                                                {unit.unitName}
                                            </h3>
                                            {unit.unitCode && (
                                                <p className='text-xs text-gray-500 mt-0.5'>
                                                    Code: {unit.unitCode}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Action buttons */}
                                        <div className='flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                                                    transition-opacity duration-200'>
                                            {/* <button
                                                className='p-2 hover:bg-emerald-50 rounded-lg transition-colors'
                                                title='Edit'
                                            >
                                                <FiEdit3 className='text-emerald-600' size={18} />
                                            </button> */}
                                            <button
                                                className='p-2 hover:bg-red-50 rounded-lg transition-colors'
                                                title='Delete'
                                                onClick={() => {
                                                    setSelectedUnit(unit);
                                                    setDeleteModalOpen(true);
                                                }}
                                            >
                                                <MdDeleteForever className='text-red-500' size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Unit details */}
                                    <div className='space-y-1 text-sm text-gray-600'>
                                        {unit.floor && (
                                            <p className='flex items-center gap-2'>
                                                <span className='font-medium'>Floor:</span> 
                                                <span>{unit.floor}</span>
                                            </p>
                                        )}
                                        {unit.capacity && (
                                            <p className='flex items-center gap-2'>
                                                <span className='font-medium'>Capacity:</span> 
                                                <span>{unit.capacity} persons</span>
                                            </p>
                                        )}
                                        {unit.status && (
                                            <p className='flex items-center gap-2'>
                                                <span className='font-medium'>Status:</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${unit.status === 'available' ? 'bg-green-100 text-green-700' : 
                                                      unit.status === 'occupied' ? 'bg-orange-100 text-orange-700' : 
                                                      'bg-gray-100 text-gray-700'}`}>
                                                    {unit.status}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Mobile action buttons */}
                                <div className='sm:hidden flex justify-end gap-2 p-3 bg-gray-50 border-t border-gray-100'>
                                    {/* <button
                                        className='flex-1 flex items-center justify-center gap-2 px-3 py-2 
                                                 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium'
                                    >
                                        <FiEdit3 size={16} />
                                        Edit
                                    </button> */}
                                    <button
                                        className='flex-1 flex items-center justify-center gap-2 px-3 py-2 
                                                 bg-red-50 text-red-600 rounded-lg text-sm font-medium'
                                        onClick={() => {
                                            setSelectedUnit(unit);
                                            setDeleteModalOpen(true);
                                        }}
                                    >
                                        <MdDeleteForever size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                unitName={selectedUnit?.unitName}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => {
                    removeUnit(selectedUnit?._id);
                    setDeleteModalOpen(false);
                }}
            />

            
        </section>
    );
};

const ConfirmModal = ({ open, onClose, onConfirm, unitName }) => {
    if (!open) return null;
    
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MdDeleteForever size={24} />
                        Confirm Delete
                    </h3>
                </div>
                
                {/* Modal body */}
                <div className="p-6">
                    <p className="text-gray-700 mb-2">
                        Are you sure you want to remove this unit?
                    </p>
                    <p className="text-lg font-semibold text-red-600 mb-6 bg-red-50 p-3 rounded-lg">
                        {unitName}
                    </p>
                    
                    {/* Modal footer */}
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
                            Delete Unit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Units;

