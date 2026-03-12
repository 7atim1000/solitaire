import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  MdDelete, 
  MdAddCircleOutline,
  MdLocationOn,
  MdOutlineGridView,
  MdOutlineViewList 
} from "react-icons/md";
import { 
  FaPlus, 
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { FiEdit3, FiGrid, FiList } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { BsCalendar } from "react-icons/bs";
import BackButton from '../components/shared/BackButton';
import FloorAddModal from '../components/floors/FloorAddModal';
import BottomNav from '../components/shared/BottomNav';
import { api } from '../https';

const Floors = () => {
  // State declarations
  const [viewMode, setViewMode] = useState('grid');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [floors, setFloors] = useState([]);
  const [isAddFloorModal, setIsAddFloorModal] = useState(false);
  const [isUpdateFloor, setIsUpdateFloor] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  
  // Action buttons
  // const buttons = [
  //   { 
  //     label: 'New Floor', 
  //     icon: <MdAddCircleOutline className='text-white' size={20} />, 
  //     action: 'floor',
  //     variant: 'primary'
  //   }
  // ];

  const buttons = [
    { label: 'New Floor', icon: <FaPlus className='text-green-600' size={18} />, action: 'floor' }
  ];
  
  // Open modal handler
  const handleOpenModal = (action) => {
    if (action === 'floor') setIsAddFloorModal(true);
  };

  // Fetch Floors
  const fetchFloors = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/floor/');
      if (response.data.success) {
        setFloors(response.data.floors || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch floors');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch floors');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFloors();
  }, []);

  // Filter and sort floors
  const filteredAndSortedFloors = React.useMemo(() => {
    let filtered = [...floors];
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(floor =>
        floor.floorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (floor.description && floor.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case 'asc':
        return filtered.sort((a, b) => a.floorName.localeCompare(b.floorName));
      case 'desc':
        return filtered.sort((a, b) => b.floorName.localeCompare(a.floorName));
      case 'newest':
        return filtered.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      case 'oldest':
        return filtered.sort((a, b) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );
      default:
        return filtered;
    }
  }, [floors, searchQuery, sortOrder]);

  // Edit handler
  const handleEdit = (floor) => {
    setCurrentFloor(floor);
    setIsUpdateFloor(true);
  };

  // Remove floor
  const removeFloor = async (id) => {
    try {
      const response = await api.post('/api/floor/remove', { id });
      if (response.data.success) {
        toast.success(response.data.message || 'Floor deleted successfully');
        fetchFloors();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete floor');
    }
  };

  // Bulk selection
  const toggleFloorSelection = (floorId) => {
    setSelectedFloors(prev =>
      prev.includes(floorId)
        ? prev.filter(id => id !== floorId)
        : [...prev, floorId]
    );
  };

  const selectAllFloors = () => {
    if (selectedFloors.length === filteredAndSortedFloors.length) {
      setSelectedFloors([]);
    } else {
      setSelectedFloors(filteredAndSortedFloors.map(floor => floor._id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedFloors.length === 0) {
      toast.error('Please select at least one floor');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedFloors.length} floors?`)) {
      return;
    }

    try {
      setIsLoading(true);
      // Delete floors one by one (since your API accepts single ID)
      for (const id of selectedFloors) {
        await api.post('/api/floor/remove', { id });
      }
      
      toast.success(`Successfully deleted ${selectedFloors.length} floors`);
      setSelectedFloors([]);
      fetchFloors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete floors');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className='min-h-screen bg-gray-50 w-full'>
      {/* Header Section */}
      <div className='sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200'>
        <div className='px-4 py-4 md:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <BackButton />
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>Floors Management</h1>
                <p className='text-sm text-gray-600 mt-1'>
                  Manage building floors and information
                </p>
              </div>
            </div>

         
            {/* <div className='flex items-center gap-3'>
              {buttons.map(({ label, icon, action, variant = 'primary' }) => (
                <button
                  key={action}
                  onClick={() => handleOpenModal(action)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                    ${variant === 'primary' 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow' 
                      : variant === 'secondary'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {icon}
                  <span className='hidden sm:inline'>{label}</span>
                </button>
              ))}
            </div> */}

            <div className='flex gap-2 items-center'>
              {buttons.map(({ label, icon, action }) => (
                <button
                  key={action}
                  onClick={() => handleOpenModal(action)}
                  className='bg-white px-4 py-2 text-[#1a1a1a] cursor-pointer font-semibold text-md flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-500 transition-colors'
                >
                  {label} {icon}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className='px-4 py-4 md:px-6 lg:px-8'>
        <div className='bg-white rounded-lg border border-gray-200 p-4 shadow-sm'>
          <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4'>
            {/* Search Bar */}
            <div className='relative flex-1'>
              <div className='relative'>
                <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search floors by name or description...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className='flex items-center gap-3'>
              {/* View Mode Toggle */}
              <div className='flex items-center bg-gray-100 rounded-lg p-1'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title='Grid View'
                >
                  <FiGrid className={viewMode === 'grid' ? 'text-green-600' : 'text-gray-600'} size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  title='List View'
                >
                  <FiList className={viewMode === 'list' ? 'text-green-600' : 'text-gray-600'} size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm'
              >
                <option value='asc'>Name A → Z</option>
                <option value='desc'>Name Z → A</option>
                <option value='newest'>Newest First</option>
                <option value='oldest'>Oldest First</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchFloors}
                disabled={isLoading}
                className='p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50'
                title='Refresh'
              >
                <HiOutlineRefresh className={isLoading ? 'animate-spin' : ''} size={20} />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedFloors.length > 0 && (
            <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-medium text-green-800'>
                    {selectedFloors.length} floor{selectedFloors.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={selectAllFloors}
                    className='text-sm text-green-600 hover:text-green-800'
                  >
                    {selectedFloors.length === filteredAndSortedFloors.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={handleBulkDelete}
                    className='px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2'
                  >
                    <MdDelete size={16} />
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className='px-4 pb-8 md:px-6 lg:px-8'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
            <p className='mt-4 text-gray-600'>Loading floors...</p>
          </div>
        ) : !filteredAndSortedFloors || filteredAndSortedFloors.length === 0 ? (
          <div className='text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300'>
            <MdLocationOn className='mx-auto text-gray-400' size={64} />
            <h3 className='mt-4 text-lg font-medium text-gray-900'>No floors found</h3>
            <p className='mt-2 text-gray-600 max-w-md mx-auto'>
              {searchQuery
                ? `No floors match "${searchQuery}". Try a different search term.`
                : 'Get started by creating your first floor.'}
            </p>
            <button
              onClick={() => handleOpenModal('floor')}
              className='mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors'
            >
              <FaPlus size={18} />
              Create New Floor
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {filteredAndSortedFloors.map(floor => (
              <div
                key={floor._id}
                className='bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group'
              >
                <div className='p-5'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={selectedFloors.includes(floor._id)}
                        onChange={() => toggleFloorSelection(floor._id)}
                        className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                      />
                      <div className='w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center'>
                        <MdLocationOn className='text-green-600' size={24} />
                      </div>
                    </div>
                    <div className='flex items-center gap-1'>
                      <button
                        onClick={() => handleEdit(floor)}
                        className='p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors'
                        title='Edit'
                      >
                        <FiEdit3 size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFloor(floor);
                          setDeleteModalOpen(true);
                        }}
                        className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete'
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    {floor.floorName}
                  </h3>
                  
                  {floor.description && (
                    <p className='text-sm text-gray-600 mb-4 line-clamp-2'>
                      {floor.description}
                    </p>
                  )}
                  
                  <div className='flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100'>
                    <span className='flex items-center gap-1'>
                      <BsCalendar className='text-gray-400' size={14} />
                      <span>{formatDate(floor.createdAt)}</span>
                    </span>
                    <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                      Floor
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left'>
                      <input
                        type='checkbox'
                        checked={selectedFloors.length === filteredAndSortedFloors.length && filteredAndSortedFloors.length > 0}
                        onChange={selectAllFloors}
                        className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                      />
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Floor Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Description
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Created Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredAndSortedFloors.map(floor => (
                    <tr key={floor._id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <input
                          type='checkbox'
                          checked={selectedFloors.includes(floor._id)}
                          onChange={() => toggleFloorSelection(floor._id)}
                          className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center'>
                            <MdLocationOn className='text-green-600' size={20} />
                          </div>
                          <div>
                            <div className='font-medium text-gray-900'>{floor.floorName}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-600 max-w-xs truncate'>
                          {floor.description || 'No description'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(floor.createdAt)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEdit(floor)}
                            className='text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded-lg transition-colors'
                            title='Edit'
                          >
                            <FiEdit3 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFloor(floor);
                              setDeleteModalOpen(true);
                            }}
                            className='text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-lg transition-colors'
                            title='Delete'
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {filteredAndSortedFloors.length > 0 && (
          <div className='mt-6 flex items-center justify-between text-sm text-gray-600'>
            <div>
              Showing <span className='font-semibold'>{filteredAndSortedFloors.length}</span> of{' '}
              <span className='font-semibold'>{floors.length}</span> floors
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-green-500'></div>
                <span>Active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddFloorModal && (
        <FloorAddModal
          isOpen={isAddFloorModal}
          onClose={() => setIsAddFloorModal(false)}
          onSuccess={fetchFloors}
        />
      )}

      <ConfirmModal
        open={deleteModalOpen}
        floorName={selectedFloor?.floorName}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedFloor) {
            removeFloor(selectedFloor._id);
            setDeleteModalOpen(false);
          }
        }}
      />

      {/* <BottomNav /> */}
    </section>
  );
};

const ConfirmModal = ({ open, onClose, onConfirm, floorName, type = 'delete' }) => {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-full items-center justify-center p-4 text-center'>
        {/* Backdrop */}
        <div 
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg'>
          <div className='bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4'>
            <div className='sm:flex sm:items-start'>
              <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                type === 'delete' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                {type === 'delete' ? (
                  <MdDelete className='h-6 w-6 text-red-600' />
                ) : (
                  <MdLocationOn className='h-6 w-6 text-yellow-600' />
                )}
              </div>
              <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
                <h3 className='text-lg font-semibold leading-6 text-gray-900'>
                  {type === 'delete' ? 'Delete Floor' : 'Archive Floor'}
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    Are you sure you want to {type} <span className='font-semibold text-gray-900'>{floorName}</span>?
                    {type === 'delete' && ' This action cannot be undone.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className='bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6'>
            <button
              type='button'
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                type === 'delete' 
                  ? 'bg-red-600 hover:bg-red-500' 
                  : 'bg-yellow-600 hover:bg-yellow-500'
              }`}
            >
              {type === 'delete' ? 'Delete' : 'Archive'}
            </button>
            <button
              type='button'
              onClick={onClose}
              className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Floors;