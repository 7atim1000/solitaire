import React, { useState, useRef, useEffect } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MdDelete, MdDeleteForever } from "react-icons/md";
import { FaPlus, FaBed, FaDoorOpen, FaDoorClosed, FaBroom, FaWrench, FaBan, FaClock, FaCheckCircle, FaTimesCircle, FaHotel } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { BsFilter, BsFillDoorOpenFill, BsFillDoorClosedFill, BsExclamationTriangle, BsGear } from "react-icons/bs";
import { LiaEditSolid } from "react-icons/lia";
import { MdElevator, MdCleaningServices, MdBuild, MdBlock } from "react-icons/md";
import { GiWashingMachine } from "react-icons/gi";
import BackButton from '../components/shared/BackButton';
import AddRoom from '../components/rooms/AddRoom';
import EditRoom from '../components/rooms/EditRoom';
import { api, getAllFloors } from '../https';

// Helper function to get room status details with improved icons and colors
const getRoomStatusDetails = (status) => {
  switch (status) {
    case 'available':
      return {
        label: 'Available',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        icon: <FaDoorOpen className="mr-1" size={14} />,
        iconBig: <FaDoorOpen className="text-green-600" size={24} />,
        gradient: 'from-green-50 to-green-100'
      };
    case 'occupied':
      return {
        label: 'Occupied',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        icon: <FaDoorClosed className="mr-1" size={14} />,
        iconBig: <FaDoorClosed className="text-red-600" size={24} />,
        gradient: 'from-red-50 to-red-100'
      };
    case 'booked':
      return {
        label: 'Reserved',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        icon: <FaBed className="mr-1" size={14} />,
        iconBig: <FaBed className="text-blue-600" size={24} />,
        gradient: 'from-blue-50 to-blue-100'
      };
    case 'blocked':
      return {
        label: 'Blocked',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        icon: <FaBan className="mr-1" size={14} />,
        iconBig: <FaBan className="text-gray-600" size={24} />,
        gradient: 'from-gray-50 to-gray-100'
      };
    case 'outofservice':
      return {
        label: 'Out of Service',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        icon: <BsExclamationTriangle className="mr-1" size={14} />,
        iconBig: <BsExclamationTriangle className="text-purple-600" size={24} />,
        gradient: 'from-purple-50 to-purple-100'
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-200',
        icon: <FaWrench className="mr-1" size={14} />,
        iconBig: <MdBuild className="text-orange-600" size={24} />,
        gradient: 'from-orange-50 to-orange-100'
      };
    case 'cleaning':
      return {
        label: 'Cleaning',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        icon: <FaBroom className="mr-1" size={14} />,
        iconBig: <GiWashingMachine className="text-yellow-600" size={24} />,
        gradient: 'from-yellow-50 to-yellow-100'
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        icon: null,
        iconBig: null,
        gradient: 'from-gray-50 to-gray-100'
      };
  }
};

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const Rooms = () => {
  const Button = [
    { label: 'New Room', icon: <FaPlus className='text-green-600' size={18} />, action: 'room' }
  ];

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const handleOpenModal = (action) => {
    if (action === 'room') setIsRoomModalOpen(true);
  };

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [floor, setFloor] = useState('all');
  const [status, setStatus] = useState('all');

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1
  });

  const [isEditRoomModal, setIsEditRoomModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Available filters with improved structure
  const statuses = [
    { value: 'available', label: 'Available', icon: <FaDoorOpen size={14} />, color: 'green' },
    { value: 'booked', label: 'Reserved', icon: <FaBed size={14} />, color: 'blue' },
    { value: 'occupied', label: 'Occupied', icon: <FaDoorClosed size={14} />, color: 'red' },
    { value: 'blocked', label: 'Blocked', icon: <FaBan size={14} />, color: 'gray' },
    { value: 'maintenance', label: 'Maintenance', icon: <FaWrench size={14} />, color: 'orange' },
    { value: 'cleaning', label: 'Cleaning', icon: <FaBroom size={14} />, color: 'yellow' },
    { value: 'outofservice', label: 'Out of Service', icon: <BsExclamationTriangle size={14} />, color: 'purple' }
  ];

  // Fetch rooms with pagination, search, and filters
  const fetchRooms = async (searchParam = '') => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/room/fetch', {
        roomNo: 'all',
        status: status === 'all' ? '' : status,
        floor: floor === 'all' ? '' : floor,
        search: searchParam || search,
        sort,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      });

      if (response.data.success) {
        setRooms(response.data.data || response.data.rooms || []);

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
        toast.error(response.data.message || 'Service not found');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      fetchRooms();
    }
  }, [status, floor, sort, pagination.currentPage, pagination.itemsPerPage]);

  // Edit room
  const handleEdit = (room) => {
    setCurrentRoom(room);
    setIsEditRoomModal(true);
  };

  // Remove room
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const removeRoom = async (id) => {
    try {
      const response = await api.post('/api/room/remove', { id });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchRooms();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRooms(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Initial fetch
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch floors using TanStack Query
  const { data: floorsData, isError: floorsError } = useQuery({
    queryKey: ['floors'],
    queryFn: async () => {
      return await getAllFloors();
    },
    placeholderData: keepPreviousData,
  });

  if (floorsError) {
    toast.error('Failed to load floors!');
  }

  // Calculate room status statistics with improved function
  const calculateRoomStats = () => {
    let available = 0;
    let occupied = 0;
    let booked = 0;
    let blocked = 0;
    let outofservice = 0;
    let maintenance = 0;
    let cleaning = 0;

    rooms.forEach(room => {
      switch (room.status) {
        case 'available': available++; break;
        case 'occupied': occupied++; break;
        case 'booked': booked++; break;
        case 'blocked': blocked++; break;
        case 'outofservice': outofservice++; break;
        case 'maintenance': maintenance++; break;
        case 'cleaning': cleaning++; break;
      }
    });

    return {
      available,
      occupied,
      booked,
      blocked,
      outofservice,
      maintenance,
      cleaning,
      total: rooms.length
    };
  };

  const roomStats = calculateRoomStats();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms(search);
  };

  const handleStatusChange = (statusValue) => {
    setStatus(statusValue);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSortChange = (sortValue) => {
    setSort(sortValue);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setSearch('');
    setSort('-createdAt');
    setFloor('all');
    setStatus('all');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

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

  // Status Card Component
  const StatusCard = ({ label, count, icon, color, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} p-4 rounded-xl border ${color} shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${color} mb-1 flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${color.replace('text', 'bg')}`}></span>
            {label}
          </p>
          <p className={`text-2xl font-bold ${color}`}>{count}</p>
        </div>
        <div className={`bg-white p-3 rounded-xl shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="mt-3 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color.replace('text', 'bg')} rounded-full transition-all duration-500`}
          style={{ width: `${(count / (roomStats.total || 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  // Pagination Controls Component
  const PaginationControls = () => {
    return (
      <div className="flex justify-between items-center mt-2 py-2 px-5 bg-white shadow-lg/30 rounded-lg text-xs font-medium border border-gray-200">
        <div>
          Showing
          <span className='text-blue-600 font-semibold mx-1'>{rooms.length}</span>
          of
          <span className='text-blue-600 font-semibold mx-1'>{pagination.totalItems}</span>
          records
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg disabled:opacity-50 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = idx + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = idx + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + idx;
              } else {
                pageNum = pagination.currentPage - 2 + idx;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    pagination.currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg disabled:opacity-50 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Next
          </button>

          <select
            value={pagination.itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border border-gray-300 px-2 py-1.5 font-medium rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <section className='w-full h-screen flex flex-col bg-gray-50'>
      {/* Header Section */}
      <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between px-2 py-2 md:px-8 md:py-4 shadow-lg bg-white sticky top-0 z-20'>
        <div className='flex items-center gap-2'>
          <BackButton /> 
          <h1 className='text-2xl max-md:text-xl font-bold text-gray-800'>Rooms Management</h1>
        </div>

        <div className='flex gap-2 items-center'>
          {Button.map(({ label, icon, action }) => (
            <button
              key={action}
              onClick={() => handleOpenModal(action)}
              className='bg-white px-4 py-2 text-gray-700 cursor-pointer font-semibold text-md flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all'
            >
              {label} {icon}
            </button>
          ))}
        </div>

        {isRoomModalOpen && 
          <AddRoom 
            setIsAddRoomModal={setIsRoomModalOpen}
            fetchRooms={fetchRooms}
          />
        }
      </div>

      {/* Room Status Summary - IMPROVED DESIGN */}
      <div className='px-4 py-2  md:px-6'>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-1">
          {/* Total Rooms */}
          <StatusCard
            label="Total Rooms"
            count={pagination.totalItems}
            icon={<FaHotel className="text-gray-600" size={15} />}
            color="text-gray-700"
            gradient="from-gray-50 to-gray-100"
          />

          {/* Available */}
          <StatusCard
            label="Available"
            count={roomStats.available}
            icon={<FaDoorOpen className="text-green-600" size={15} />}
            color="text-green-700"
            gradient="from-green-50 to-green-100"
          />

          {/* Reserved */}
          <StatusCard
            label="Reserved"
            count={roomStats.booked}
            icon={<FaBed className="text-blue-600" size={15} />}
            color="text-blue-700"
            gradient="from-blue-50 to-blue-100"
          />

          {/* Occupied */}
          <StatusCard
            label="Occupied"
            count={roomStats.occupied}
            icon={<FaDoorClosed className="text-red-600" size={15} />}
            color="text-red-700"
            gradient="from-red-50 to-red-100"
          />

          {/* Blocked */}
          <StatusCard
            label="Blocked"
            count={roomStats.blocked}
            icon={<FaBan className="text-gray-600" size={15} />}
            color="text-gray-700"
            gradient="from-gray-50 to-gray-100"
          />

          {/* Maintenance */}
          <StatusCard
            label="Maintenance"
            count={roomStats.maintenance}
            icon={<MdBuild className="text-orange-600" size={15} />}
            color="text-orange-700"
            gradient="from-orange-50 to-orange-100"
          />

          {/* Cleaning */}
          <StatusCard
            label="Cleaning"
            count={roomStats.cleaning}
            icon={<GiWashingMachine className="text-yellow-600" size={15} />}
            color="text-yellow-700"
            gradient="from-yellow-50 to-yellow-100"
          />

          {/* Out of Service */}
          <StatusCard
            label="Out of Service"
            count={roomStats.outofservice}
            icon={<BsExclamationTriangle className="text-purple-600" size={15} />}
            color="text-purple-700"
            gradient="from-purple-50 to-purple-100"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 min-h-0 px-4 pb-4 md:px-6'>
        <div className='flex flex-col lg:flex-row gap-4 h-full'>
          {/* Left Sidebar - Floors */}
          <div className='lg:w-1/6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
            <div className='p-4 bg-gradient-to-r from-blue-600 to-blue-700'>
              <h3 className='font-semibold text-white flex items-center gap-2'>
                <MdElevator size={20} />
                Floors
              </h3>
            </div>
            <div className='overflow-y-auto max-h-[calc(100vh-300px)] p-2'>
              <button
                className={`w-full text-left p-3 rounded-lg mb-1 transition-all ${
                  floor === 'all' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setFloor('all')}
              >
                <span className="font-medium">All Floors</span>
              </button>
              {floorsData?.data?.data?.map(floorItem => {
                const isActive = floor === floorItem.floorName;
                return (
                  <button
                    key={floorItem._id}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => setFloor(floorItem.floorName)}
                  >
                    <span className="font-medium">{floorItem.floorName}</span>
                    <MdElevator className={isActive ? 'text-white' : 'text-gray-400'} size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content - Rooms Table */}
          <div className='flex-1 flex flex-col min-h-0'>
            {/* Search and Filter Bar */}
            <div className='bg-white rounded-xl shadow-lg border border-gray-200 mb-4 p-4'>
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search rooms by number, floor, category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                      showFilters ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    <BsFilter size={18} />
                    Filter
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </button>
                  {(search || sort !== '-createdAt' || floor !== 'all' || status !== 'all') && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  {[
                    { value: '-createdAt', label: 'Newest' },
                    { value: 'createdAt', label: 'Oldest' },
                    { value: 'roomNo', label: 'Room A-Z' },
                    { value: '-roomNo', label: 'Room Z-A' },
                    { value: 'price', label: 'Price Low' },
                    { value: '-price', label: 'Price High' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleSortChange(item.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        sort === item.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Filter Options */}
                {showFilters && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700">Filter by Status</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          status === 'all'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        All
                      </button>
                      {statuses.map((statusItem) => {
                        const statusDetails = getRoomStatusDetails(statusItem.value);
                        const isActive = status === statusItem.value;
                        return (
                          <button
                            key={statusItem.value}
                            onClick={() => handleStatusChange(statusItem.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                              isActive
                                ? `${statusDetails.bgColor} ${statusDetails.color} border-2 ${statusDetails.borderColor} shadow-md`
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {statusItem.icon}
                            {statusItem.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Rooms Table Container */}
            <div className='flex-1 flex flex-col min-h-0 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden'>
              {isLoading ? (
                <div className="flex-1 flex justify-center items-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading rooms...</p>
                  </div>
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-12">
                    <FaBed className="mx-auto text-gray-400" size={48} />
                    <p className='text-lg text-gray-600 mt-4'>
                      {search || floor !== 'all' || status !== 'all'
                        ? 'No rooms found with the selected filters'
                        : 'Your rooms list is empty. Start adding new rooms!'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Table with fixed header */}
                  <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Room Details</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Floor & Category</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Capacity</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Price (SD)</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Current Booking</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map((room) => {
                          const statusDetails = getRoomStatusDetails(room.status);

                          return (
                            <tr key={room._id} className="hover:bg-gray-50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${statusDetails.bgColor} group-hover:scale-110 transition-transform`}>
                                    {statusDetails.iconBig}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                      Room {room.roomNo}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {room.description || 'No description'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {room.floor} Floor
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {room.category}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusDetails.color} ${statusDetails.bgColor}`}>
                                  {statusDetails.icon}
                                  {statusDetails.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {room.seats} Person{room.seats !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">{room.priceOne.toFixed(2)}</span>
                                    <span className="text-xs text-gray-500"> /1P</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">{room.priceTow.toFixed(2)}</span>
                                    <span className="text-xs text-gray-500"> /2P</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {room.currentOrder ? (
                                  <div className="text-sm">
                                    <div className="font-medium text-gray-900">
                                      {room.currentOrder.customerDetails?.name || 'Guest'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      In: {formatDate(room.dateBooking)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Out: {formatDate(room.dateReturn)}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500 italic">No active booking</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(room)}
                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Edit Room"
                                  >
                                    <FiEdit3 size={18} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRoom(room);
                                      setDeleteModalOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete Room"
                                  >
                                    <MdDelete size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="border-t border-gray-200 p-4">
                    <PaginationControls />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Room Modal */}
      {isEditRoomModal && currentRoom && (
        <EditRoom
          room={currentRoom}
          setIsEditRoomModal={setIsEditRoomModal}
          fetchRooms={fetchRooms}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        roomNo={selectedRoom?.roomNo}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedRoom) {
            removeRoom(selectedRoom._id);
            setDeleteModalOpen(false);
          }
        }}
      />
    </section>
  );
};

// Improved Confirm Modal
const ConfirmModal = ({ open, onClose, onConfirm, roomNo }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0  bg-opacity-50" onClick={onClose}
      style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}
      ></div>
      <div className="bg-white rounded-xl p-6 shadow-2xl min-w-[350px] relative z-10 transform transition-all">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <FaTimesCircle className="text-red-600" size={32} />
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Confirm Delete</h3>
        <p className="text-gray-600 text-center mb-6">
          Are you sure you want to remove <span className="font-semibold text-red-600">Room {roomNo}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button
            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer transition-colors font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors font-medium"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rooms;


// import React, { useState, useRef, useEffect } from 'react';
// import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import { toast } from 'react-hot-toast';
// import { MdDelete, MdDeleteForever } from "react-icons/md";
// import { FaPlus, FaBed, FaDoorOpen, FaDoorClosed } from "react-icons/fa";
// import { FiEdit3 } from "react-icons/fi";
// import { IoSearch } from "react-icons/io5";
// import { BsFilter } from "react-icons/bs";
// import { LiaEditSolid } from "react-icons/lia";
// import { MdElevator } from "react-icons/md";
// import BackButton from '../components/shared/BackButton';
// import AddRoom from '../components/rooms/AddRoom';
// import EditRoom from '../components/rooms/EditRoom';
// import { api, getAllFloors } from '../https';

// // Helper function to get room status details
// const getRoomStatusDetails = (status) => {
//   switch (status) {
//     case 'available':
//       return {
//         label: 'Available',
//         color: 'text-green-700',
//         bgColor: 'bg-green-100',
//         icon: <FaDoorOpen className="mr-1" size={14} />
//       };
//     case 'occupied':
//       return {
//         label: 'Occupied',
//         color: 'text-red-600',
//         bgColor: 'bg-red-100',
//         icon: <FaDoorClosed className="mr-1" size={14} />
//       };
//     case 'reserved':
//       return {
//         label: 'Reserved',
//         color: 'text-blue-600',
//         bgColor: 'bg-blue-100',
//         icon: <FaBed className="mr-1" size={14} />
//       };
//     case 'maintenance':
//       return {
//         label: 'Maintenance',
//         color: 'text-orange-600',
//         bgColor: 'bg-orange-100',
//         icon: <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//         </svg>
//       };
//     case 'cleaning':
//       return {
//         label: 'Cleaning',
//         color: 'text-yellow-600',
//         bgColor: 'bg-yellow-100',
//         icon: <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
//         </svg>
//       };
//     default:
//       return {
//         label: 'Unknown',
//         color: 'text-gray-600',
//         bgColor: 'bg-gray-100',
//         icon: null
//       };
//   }
// };

// // Format date function
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
  
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// // Format currency
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-AE', {
//     style: 'currency',
//     currency: 'AED',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(amount);
// };

// const Rooms = () => {
//   const Button = [
//     { label: 'New Room', icon: <FaPlus className='text-green-600' size={18} />, action: 'room' }
//   ];

//   const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
//   const handleOpenModal = (action) => {
//     if (action === 'room') setIsRoomModalOpen(true);
//   };

//   const [rooms, setRooms] = useState([]);
//   const [search, setSearch] = useState('');
//   const [sort, setSort] = useState('-createdAt');
//   const [floor, setFloor] = useState('all');
//   const [status, setStatus] = useState('all');

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     itemsPerPage: 10,
//     totalItems: 0,
//     totalPages: 1
//   });

//   const [isEditRoomModal, setIsEditRoomModal] = useState(false);
//   const [currentRoom, setCurrentRoom] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);

//   // Available filters
//   const statuses = [
//     { value: 'available', label: 'Available' },
//     // { value: 'occupied', label: 'Occupied' },
//     // { value: 'reserved', label: 'Reserved' },
//     { value: 'booked', label: 'Reserved' },
//     { value: 'maintenance', label: 'Maintenance' },
//     { value: 'cleaning', label: 'Cleaning' }
//   ];

//   // Fetch rooms with pagination, search, and filters
//   const fetchRooms = async (searchParam = '') => {
//     setIsLoading(true);
//     try {
//       const response = await api.post('/api/room/fetch', {
//         roomNo: 'all',
//         status: status === 'all' ? '' : status,
//         floor: floor === 'all' ? '' : floor,
//         search: searchParam || search,
//         sort,
//         page: pagination.currentPage,
//         limit: pagination.itemsPerPage
//       });

//       if (response.data.success) {
//         setRooms(response.data.data || response.data.rooms || []);

//         if (response.data.pagination) {
//           setPagination(prev => ({
//             ...prev,
//             currentPage: response.data.pagination.currentPage ?? prev.currentPage,
//             itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
//             totalItems: response.data.pagination.total ?? prev.totalItems,
//             totalPages: response.data.pagination.totalPages ?? prev.totalPages
//           }));
//         }
//       } else {
//         toast.error(response.data.message || 'Service not found');
//       }
//     } catch (error) {
//       if (error.response && error.response.data && error.response.data.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error(error.message);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const isInitialMount = useRef(true);

//   useEffect(() => {
//     if (isInitialMount.current) {
//       isInitialMount.current = false;
//     } else {
//       fetchRooms();
//     }
//   }, [status, floor, sort, pagination.currentPage, pagination.itemsPerPage]);

//   // Edit room
//   const handleEdit = (room) => {
//     setCurrentRoom(room);
//     setIsEditRoomModal(true);
//   };

//   // Remove room
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedRoom, setSelectedRoom] = useState(null);

//   const removeRoom = async (id) => {
//     try {
//       const response = await api.post('/api/room/remove', { id });
//       if (response.data.success) {
//         toast.success(response.data.message);
//         await fetchRooms();
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   // Debounced search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchRooms(search);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [search]);

//   // Initial fetch
//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   // Fetch floors using TanStack Query
//   const { data: floorsData, isError: floorsError } = useQuery({
//     queryKey: ['floors'],
//     queryFn: async () => {
//       return await getAllFloors();
//     },
//     placeholderData: keepPreviousData,
//   });

//   if (floorsError) {
//     toast.error('Failed to load floors!');
//   }

//   // Calculate room status statistics
//   const calculateRoomStats = () => {
//     let available = 0;
//     let occupied = 0;

//     let booked = 0;
//     let blocked = 0;

//     let outofservice = 0;
//     let maintenance = 0;
//     let cleaning = 0;

//     rooms.forEach(room => {
//       switch (room.status) {
//         case 'available': available++; break;
//         case 'occupied': occupied++; break;

//         case 'booked': booked++; break;
//         case 'blocked': blocked++; break;

//         case 'outofservice': outofservice++; break;
//         case 'maintenance': maintenance++; break;
//         case 'cleaning': cleaning++; break;
//       }
//     });

//     // return { available, occupied, reserved, maintenance, cleaning, total: rooms.length };
//     return { available, booked, blocked, outofservice, maintenance, cleaning, total: rooms.length };
//   };

//   const roomStats = calculateRoomStats();

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     fetchRooms(search);
//   };

//   const handleStatusChange = (statusValue) => {
//     setStatus(statusValue);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handleSortChange = (sortValue) => {
//     setSort(sortValue);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const clearFilters = () => {
//     setSearch('');
//     setSort('-createdAt');
//     setFloor('all');
//     setStatus('all');
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handlePageChange = (newPage) => {
//     setPagination(prev => ({
//       ...prev,
//       currentPage: newPage
//     }));
//   };

//   const handleItemsPerPageChange = (newItemsPerPage) => {
//     setPagination(prev => ({
//       ...prev,
//       itemsPerPage: newItemsPerPage,
//       currentPage: 1
//     }));
//   };

//   // Pagination Controls Component
//   const PaginationControls = () => {
//     return (
//       <div className="flex justify-between items-center mt-2 py-2 px-5 bg-white shadow-lg/30 rounded-lg text-xs font-medium border border-gray-200">
//         <div>
//           Showing
//           <span className='text-blue-600'> {rooms.length} </span>
//           of
//           <span className='text-blue-600'> {pagination.totalItems} </span>
//           records
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => handlePageChange(pagination.currentPage - 1)}
//             disabled={pagination.currentPage === 1}
//             className="px-2 py-1 shadow-lg/30 border border-gray-300 text-xs font-normal disabled:opacity-50 cursor-pointer hover:bg-gray-50 rounded"
//           >
//             Previous
//           </button>

//           <span className="px-3 py-1">
//             Page
//             <span className='text-blue-600'> {pagination.currentPage} </span>
//             of
//             <span className='text-blue-600'> {pagination.totalPages} </span>
//           </span>

//           <button
//             onClick={() => handlePageChange(pagination.currentPage + 1)}
//             disabled={pagination.currentPage === pagination.totalPages}
//             className="px-2 py-1 shadow-lg/30 border border-gray-300 text-xs font-normal disabled:opacity-50 cursor-pointer hover:bg-gray-50 rounded"
//           >
//             Next
//           </button>

//           <select
//             value={pagination.itemsPerPage}
//             onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//             className="border border-gray-300 px-2 font-normal shadow-lg/30 cursor-pointer rounded"
//           >
//             <option value="5">5 per page</option>
//             <option value="10">10 per page</option>
//             <option value="20">20 per page</option>
//             <option value="50">50 per page</option>
//           </select>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <section className='w-full h-screen flex flex-col bg-gray-50'>
//       {/* Header Section */}
//       <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between px-2 py-2 md:px-8 md:py-4 shadow-lg bg-white'>
//         <div className='flex items-center gap-2'>
//           <BackButton /> 
//           <h1 className='text-2xl max-md:text-xl font-bold text-[#1a1a1a]'>Rooms Management</h1>
//         </div>

//         <div className='flex gap-2 items-center'>
//           {Button.map(({ label, icon, action }) => (
//             <button
//               key={action}
//               onClick={() => handleOpenModal(action)}
//               className='bg-white px-4 py-2 text-[#1a1a1a] cursor-pointer font-semibold text-md flex items-center gap-2 rounded-lg border border-gray-300 hover:bg-blue-50 hover:border-blue-500 transition-colors'
//             >
//               {label} {icon}
//             </button>
//           ))}
//         </div>

//         {isRoomModalOpen && 
//           <AddRoom 
//             setIsAddRoomModal={setIsRoomModalOpen}
//             fetchRooms={fetchRooms}
//           />
//         }
//       </div>

//       {/* Room Status Summary */}
//       <div className='px-2 py-2 md:px-2'>
//         <div className="grid grid-cols-2 md:grid-cols-8 gap-3 mb-4">
//           <div className="bg-gray-100 p-3 rounded-lg">
//             <div className="text-sm text-gray-600">Total Rooms</div>
//             <div className="text-xl font-bold">{pagination.totalItems}</div>
//           </div>
//           <div className="bg-green-50 p-3 rounded-lg border border-green-100">
//             <div className="text-sm text-green-600 flex items-center gap-1">
//               <FaDoorOpen size={12} /> Available
//             </div>
//             <div className="text-xl font-bold text-green-700">{roomStats.available}</div>
//           </div>
//           <div className="bg-red-50 p-3 rounded-lg border border-red-100">
//             <div className="text-sm text-red-600 flex items-center gap-1">
//               <FaDoorClosed size={12} /> Reserved
//             </div>
//             <div className="text-xl font-bold text-red-700">{roomStats.booked}</div>
//           </div>

       
//           <div className="bg-red-50 p-3 rounded-lg border border-red-100">
//             <div className="text-sm text-red-600 flex items-center gap-1">
//               <FaDoorClosed size={12} /> Blooked
//             </div>
//             <div className="text-xl font-bold text-red-700">{roomStats.blocked}</div>
//           </div>
//           <div className="bg-red-50 p-3 rounded-lg border border-red-100">
//             <div className="text-sm text-red-600 flex items-center gap-1">
//               <FaDoorClosed size={12} /> Out of service
//             </div>
//             <div className="text-xl font-bold text-red-700">{roomStats.outofservice}</div>
//           </div>
         
       
//           <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
//             <div className="text-sm text-orange-600">Maintenance</div>
//             <div className="text-xl font-bold text-orange-700">{roomStats.maintenance}</div>
//           </div>
//           <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
//             <div className="text-sm text-yellow-600">Cleaning</div>
//             <div className="text-xl font-bold text-yellow-700">{roomStats.cleaning}</div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Area - Takes remaining height with scroll */}
//       <div className='flex-1 min-h-0'> {/* Changed from overflow-hidden to min-h-0 */}
//         <div className='flex flex-col lg:flex-row gap-4 h-full px-2 py-2 md:px-2'>
//           {/* Left Sidebar - Floors */}
//           <div className='lg:w-1/9 bg-white rounded-lg shadow border border-gray-200'>
//             <div className='p-4 border-b border-gray-200'>
//               <h3 className='font-semibold text-gray-700'>Floors</h3>
//             </div>
//             <div className='overflow-y-auto max-h-[calc(100vh-300px)]'> {/* Adjusted height */}
//               <button
//                 className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${floor === 'all' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-700'}`}
//                 onClick={() => setFloor('all')}
//               >
//                 All Floors
//               </button>
//               {floorsData?.data?.data?.map(floorItem => (
//                 <button
//                   key={floorItem._id}
//                   className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-between ${floor === floorItem.floorName ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-700'}`}
//                   onClick={() => setFloor(floorItem.floorName)}
//                 >
//                   <span>{floorItem.floorName}</span>
//                   <MdElevator className={`${floor === floorItem.floorName ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Right Content - Rooms Table */}
//           <div className='flex-1 flex flex-col min-h-0'> {/* Added flex-col and min-h-0 */}
//             {/* Search and Filter Bar - Fixed height */}
//             <div className='bg-white rounded-lg shadow border border-gray-200 mb-4 p-4'>
//               <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
//                 <div className="flex gap-2">
//                   <div className="relative flex-1">
//                     <input
//                       type="text"
//                       placeholder="Search rooms by number, floor, category..."
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                       className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                     <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setShowFilters(!showFilters)}
//                     className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
//                   >
//                     <BsFilter size={18} />
//                     Filter
//                   </button>
//                   <button
//                     type="submit"
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Search
//                   </button>
//                   {(search || sort !== '-createdAt' || floor !== 'all' || status !== 'all') && (
//                     <button
//                       type="button"
//                       onClick={clearFilters}
//                       className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                     >
//                       Clear
//                     </button>
//                   )}
//                 </div>

//                 {/* Sort Options */}
//                 <div className="flex items-center gap-4">
//                   <div className="flex flex-wrap gap-2">
//                     {[
//                       { value: '-createdAt', label: 'Newest First' },
//                       { value: 'createdAt', label: 'Oldest First' },
//                       { value: 'roomNo', label: 'Room No (A-Z)' },
//                       { value: '-roomNo', label: 'Room No (Z-A)' },
//                       { value: 'floor', label: 'Floor (A-Z)' },
//                       { value: 'price', label: 'Price (Low to High)' },
//                       { value: '-price', label: 'Price (High to Low)' }
//                     ].map((item) => (
//                       <button
//                         key={item.value}
//                         type="button"
//                         onClick={() => handleSortChange(item.value)}
//                         className={`px-3 py-1 rounded-full text-sm ${sort === item.value
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                       >
//                         {item.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Filter Options */}
//                 {showFilters && (
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                     <div className="flex items-center justify-between mb-3">
//                       <h3 className="font-medium text-gray-700">Status Filters</h3>
//                       <button
//                         onClick={() => setShowFilters(false)}
//                         className="text-gray-500 hover:text-gray-700"
//                       >
//                         ×
//                       </button>
//                     </div>

//                     {/* Status Filter */}
//                     <div className="mb-4">
//                       <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
//                       <div className="flex flex-wrap gap-2">
//                         <button
//                           onClick={() => handleStatusChange('all')}
//                           className={`px-3 py-1 rounded-full text-sm ${status === 'all'
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                         >
//                           All Status
//                         </button>
//                         {statuses.map((statusItem) => {
//                           const statusDetails = getRoomStatusDetails(statusItem.value);
//                           return (
//                             <button
//                               key={statusItem.value}
//                               onClick={() => handleStatusChange(statusItem.value)}
//                               className={`px-3 py-1 rounded-full text-sm flex items-center ${status === statusItem.value
//                                 ? `${statusDetails.bgColor} ${statusDetails.color} border border-gray-300`
//                                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                             >
//                               {statusDetails.icon}
//                               {statusItem.label}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </form>
//             </div>

//             {/* Rooms Table Container - Takes remaining space */}
//             <div className='flex-1 flex flex-col min-h-0 bg-white rounded-lg shadow border border-gray-200'>
//               {isLoading ? (
//                 <div className="flex-1 flex justify-center items-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                 </div>
//               ) : rooms.length === 0 ? (
//                 <div className="flex-1 flex items-center justify-center">
//                   <div className="text-center py-10">
//                     <p className='text-lg text-red-600'>
//                       {search || floor !== 'all' || status !== 'all'
//                         ? 'No rooms found with the selected filters'
//                         : 'Your rooms list is empty. Start adding new rooms!'}
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   {/* Table with fixed header and scrollable body */}
//                   <div className="flex-1 overflow-auto min-h-0">
//                     <div className="min-w-full">
//                       <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                           <thead className="bg-gray-50 sticky top-0 z-10">
//                             <tr>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Room Details
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Floor & Category
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Status
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Capacity
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Price
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Current Booking
//                               </th>
//                               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
//                                 Actions
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="bg-white divide-y divide-gray-200">
//                             {rooms.map((room) => {
//                               const statusDetails = getRoomStatusDetails(room.status);

//                               return (
//                                 <tr key={room._id} className="hover:bg-gray-50 transition-colors">
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="flex items-center">
//                                       {room.image ? (
//                                         <div className="flex-shrink-0 h-12 w-12 mr-3">
//                                           <img
//                                             className="h-12 w-12 rounded-lg object-cover"
//                                             src={room.image}
//                                             alt={`Room ${room.roomNo}`}
//                                           />
//                                         </div>
//                                       ) : (
//                                         <div className="flex-shrink-0 h-12 w-12 mr-3 bg-blue-100 rounded-lg flex items-center justify-center">
//                                           <FaBed className="text-blue-500" size={24} />
//                                         </div>
//                                       )}
//                                       <div>
//                                         <div className="text-sm font-medium text-gray-900">
//                                           Room {room.roomNo}
//                                         </div>
//                                         <div className="text-xs text-gray-500">
//                                           {room.description || 'No description'}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="text-sm">
//                                       <div className="font-medium text-gray-900">
//                                         {room.floor} Floor
//                                       </div>
//                                       <div className="text-gray-600">
//                                         {room.category}
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDetails.color} ${statusDetails.bgColor}`}>
//                                       {room.status}
//                                       {statusDetails.icon}
//                                     </span>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="text-sm">
//                                       <div className="font-medium text-gray-900">
//                                         {room.seats} Person{room.seats !== 1 ? 's' : ''}
//                                       </div>
//                                       <div className="text-xs text-gray-500">
//                                         Capacity
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="space-y-1">
//                                       <div className="text-sm">
//                                         <div className="font-medium text-gray-900">
//                                           <span className='text-xs'>SD</span> {room.priceOne.toFixed(2)}
//                                         </div>
//                                         <div className="text-xs text-green-600">
//                                           For 1 Person /per night
//                                         </div>
//                                       </div>
//                                       <div className="text-sm">
//                                         <div className="font-medium text-gray-900">
//                                           <span className='text-xs'>SD</span> {room.priceTow.toFixed(2)}
//                                         </div>
//                                         <div className="text-xs text-green-600">
//                                           For 2 Person /per night
//                                         </div>
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     {room.currentOrder ? (
//                                       <div className="text-sm">
//                                         <div className="font-medium text-gray-900">
//                                           {room.currentOrder.customerDetails?.name || 'Guest'}
//                                         </div>
//                                         <div className="text-xs text-gray-500">
//                                           Check-in: {formatDate(room.currentOrder.checkIn)}
//                                         </div>
//                                         <div className="text-xs text-gray-500">
//                                           Check-out: {formatDate(room.currentOrder.checkOut)}
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <span className="text-xs text-gray-500">No active booking</span>
//                                     )}
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="flex items-center gap-2">
//                                       <button
//                                         onClick={() => handleEdit(room)}
//                                         className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 cursor-pointer"
//                                         title="Edit"
//                                       >
//                                         <FiEdit3 size={18} />
//                                       </button>
//                                       <button
//                                         onClick={() => {
//                                           setSelectedRoom(room);
//                                           setDeleteModalOpen(true);
//                                         }}
//                                         className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 cursor-pointer"
//                                         title="Delete"
//                                       >
//                                         <MdDelete size={18} />
//                                       </button>
//                                     </div>
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Pagination - Always visible at bottom */}
//                   <div className="border-t border-gray-200 mt-2">
//                     <PaginationControls />
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Room Modal */}
//       {isEditRoomModal && currentRoom && (
//         <EditRoom
//           room={currentRoom}
//           setIsEditRoomModal={setIsEditRoomModal}
//           fetchRooms={fetchRooms}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       <ConfirmModal
//         open={deleteModalOpen}
//         roomNo={selectedRoom?.roomNo}
//         onClose={() => setDeleteModalOpen(false)}
//         onConfirm={() => {
//           if (selectedRoom) {
//             removeRoom(selectedRoom._id);
//             setDeleteModalOpen(false);
//           }
//         }}
//       />
//     </section>
//   );
// };

// const ConfirmModal = ({ open, onClose, onConfirm, roomNo }) => {
//   if (!open) return null;

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center z-50"
//       style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
//     >
//       <div className="bg-white rounded-lg p-6 shadow-lg min-w-[300px]">
//         <p className="mb-6">
//           Are you sure you want to remove{' '}
//           <span className="font-semibold text-red-600">Room {roomNo}</span>?
//         </p>
//         <div className="flex justify-end gap-3">
//           <button
//             className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer transition-colors"
//             onClick={onClose}
//           >
//             Cancel
//           </button>
//           <button
//             className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
//             onClick={onConfirm}
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Rooms;

// import React , { useState, useRef, useEffect } from 'react' ;
// import { keepPreviousData, useQuery } from '@tanstack/react-query'

// import { MdDeleteForever, MdOutlineAddToDrive } from "react-icons/md";
// import { LiaEditSolid } from "react-icons/lia";  
// import { GiElevator } from "react-icons/gi";
// import { MdElevator } from "react-icons/md";

// import { toast } from 'react-toastify';
// import BackButton from '../components/shared/BackButton';
// import BottomNav from '../components/shared/BottomNav';
// import { api, getAllFloors } from '../https';

// import { getAvatarName, getBgColor } from '../utils';
// import AddRoom from '../components/rooms/AddRoom';
// import EditRoom from '../components/rooms/EditRoom';



// const Rooms = () => {
    
//     const Button = [{ label: 'New Room', icon: <MdOutlineAddToDrive className='text-emerald-600' size={20} />, 
//         action: 'room' }];
//     const [isAddRoomModal, setIsAddRoomModal] = useState(false);

//     const handleAddRoomModal = (action) => {
//         if (action === 'room') setIsAddRoomModal(true);
//     }; 


//  // fetch 
//     const [list, setList] = useState([]);
    
//     const [search, setSearch] = useState(''); // Match backend parameter name
//     const [sort, setSort] = useState('-createdAt');
    
//     const [floor, setFloor] = useState('all');
//     const [roomNo, setRoomNo] = useState('all');
//     const [status, setStatus] = useState('all')

//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         itemsPerPage: 10,
//         totalItems: 0,
//         totalPages: 1
//     });


//     const [isEditRoomModal, setIsEditRoomModal] = useState(false);
//     const [currentRoom, setCurrentRoom] = useState(null);

//     const fetchRooms = async (search = '') => {
//         try {

//             const response = await api.post('/api/room/fetch',
//                 {
//                     roomNo,
//                     status,
//                     floor,

//                     search,
//                     sort,

//                     page: pagination.currentPage,
//                     limit: pagination.itemsPerPage
//                 }
//             );

//             if (response.data.success) {
//                 //setList(response.data.employees)
//                 setList(response.data.data || response.data.rooms || []);

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
//                 toast.error(response.data.message || 'Rooms is not found')
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
//             fetchRooms();
//         }
//     }, [roomNo, status, floor, search, sort, pagination.currentPage, pagination.itemsPerPage]);

//     // Edit car
//     const handleEdit = (room) => {
//         setCurrentRoom(room);
//         setIsEditRoomModal(true);
//     };


    
//     // Removing
//     const [deleteModalOpen, setDeleteModalOpen] = useState(false);    // for remove
//     const [selectedRoom, setSelectedRoom] = useState(null);   // for remove

//     const removeRoom = async (id) => {

//         try {
//             const response = await api.post('/api/room/remove', { id },)
//             if (response.data.success) {
//                 toast.success(response.data.message)

//                 //Update the LIST after Remove
//                 await fetchRooms();

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
//             fetchRooms(search);
//         }, 500); // 500ms delay

//         return () => clearTimeout(timer);
//     }, [search, sort]);

//     // Initial fetch
//     useEffect(() => {
//         fetchRooms();
//     }, []);


//     // Fetch floors  
//     const { data: resData, IsError } = useQuery({
//         queryKey: ['floors'],
//         queryFn: async () => {
//             return await getAllFloors();
//         },
//         placeholderData: keepPreviousData,
//     });

//     if (IsError) {
//         toast.error('Something went wrong!');
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
//             <div className="flex justify-between items-center mt-2 py-2 px-5 bg-white shadow-lg/30 rounded-lg
//             text-xs font-medium border-b border-emerald-600 border-t border-emerald-600">
//                 <div>
//                     Showing
//                     <span className='text-emerald-600'> {list.length} </span>
//                     of
//                     <span className='text-emerald-600'> {pagination.totalItems} </span>
//                     records
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => handlePageChange(pagination.currentPage - 1)}
//                         disabled={pagination.currentPage === 1}
//                         className="px-2 py-1 shadow-lg/30 border-b border-emerald-600
//                         text-xs font-normal disabled:opacity-50 cursor-pointer"
//                     >
//                         Previous
//                     </button>

//                     <span className="px-3 py-1">
//                         Page
//                         <span className='text-emerald-600'> {pagination.currentPage} </span>
//                         of
//                         <span className='text-emerald-600'> {pagination.totalPages} </span>
//                     </span>

//                     <button
//                         onClick={() => handlePageChange(pagination.currentPage + 1)}
//                         disabled={pagination.currentPage === pagination.totalPages}
//                         className="px-2 py-1 shadow-lg/30 border-b border-emerald-600 text-xs font-normal disabled:opacity-50
//                         cursor-pointer"
//                     >
//                         Next
//                     </button>

//                     <select
//                         value={pagination.itemsPerPage}
//                         onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
//                         className="border-b border-emerald-600 px-2 font-normal shadow-lg/30 cursor-pointer"
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
//         <section className='flex gap-3 bg-[#f5f5f5] shadow-xl h-[calc(100vh-4rem)] overflow-y-scroll scrollbar-hidden'>

//             {/* Left sidebar - Departments */}
//             {/* The issue is with your template literal syntax. You have an extra closing brace } and the ternary operator is not properly formatted. Here's the corrected code: */}
//             <div className='flex-1 bg-white h-[100%] overflow-hidden flex flex-col'>

//                 <div className='overflow-y-auto scrollbar-hidden flex-1'>
//                     {resData?.data.data.map(floorItem => (
//                         <div key={floorItem._id} className='flex items-center justify-between gap-1 px-0 mx-1 mb-2 bg-white shadow-xl'>
//                             <button
//                                 className={`mx-auto items-center w-[90%] p-3 cursor-pointer text-[#1a1a1a] 
//                         rounded-sm font-semibold text-sm flex items-center gap-2
//                         ${floor === floorItem.floorName ? 'text-emerald-600 border-b-2 border-emerald-600' : 'bg-white'}`}
//                                 onClick={() => setFloor(floorItem.floorName)}
//                             >
//                                 {floorItem.floorName}
//                             </button>
//                             <MdElevator className='text-emerald-600 w-8 h-8 p-1' />
//                         </div>
//                     ))}
//                 </div>
//             </div>



//             <div className='flex-7 h-full bg-white overflow-y-scroll scrollbar-hidden'>
//                 <div className='flex items-center justify-between px-8 py-2 shadow-xl'>
//                     <div className='flex items-center'>
//                         <BackButton />
//                         <h1 className='text-lg font-semibold text-[#1a1a1a]'>Rooms Management</h1>
//                     </div>

//                     <div className='bg-white flex gap-2 items-center justify-around gap-3 hover:bg-emerald-600 shadow-lg/30'>
                       
//                         {Button.map(({ label, icon, action }) => {
//                             return (
//                                 <button

//                                     onClick={() => handleAddRoomModal(action)}

//                                     className='bg-white px-4 py-2 text-[#1a1a1a] cursor-pointer
//                                         font-semibold text-xs flex items-center gap-2 rounded-full'>
//                                     {label} {icon}
//                                 </button>
//                             )
//                         })}
//                     </div>

//                 {isAddRoomModal && <AddRoom setIsAddRoomModal={setIsAddRoomModal} fetchRooms= {fetchRooms}/>}

//                 </div>

//                 {/* Search and sorting */}
//                 <div className="flex items-center px-15 py-2 shadow-xl">
//                     <input
//                         type="text"
//                         placeholder="Search rooms..."
//                         className="border border-emerald-600 p-1 rounded-lg w-full text-xs font-semibold"
//                         // max-w-md
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                     />
//                     {/* Optional: Sort dropdown */}
//                     <select
//                         className="ml-4 border border-emerald-600 p-1  rounded-lg text-[#1f1f1f text-xs font-semibold]"
//                         value={sort}

//                         onChange={(e) => {
//                             setSort(e.target.value);
//                             setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page when changing sort
//                         }}
//                     >
//                         <option value="-createdAt">Newest First</option>
//                         <option value="createdAt">Oldest First</option>
//                         <option value="roomNo">By Room (A-Z)</option>
//                         <option value="roomNo">By Room (Z-A)</option>
//                         <option value="floor">By Floor (A-Z)</option>
//                     </select>
//                 </div>

//                 <div className='mt-1 ' >
//                     <div className='h-full overflow-x-auto mx-5 '>
//                         <table className='w-[100%] text-left ' >
//                             <thead className='bg-white border-b-3 border-emerald-600 text-xs font-normal text-ermerald-600'>
//                                 <tr> {/**bg-[#D2B48C] */}
                                    
//                                     <th className ='p-1'></th>
//                                     <th className ='p-1'></th>
//                                     <th className='p-1'>Room</th>
//                                     <th className='p-1'></th>
                                   
//                                     <th className='p-1'>Price</th>
//                                     <th className='p-1'></th>
                        
//                                 </tr>
//                             </thead>

//                             <tbody>

//                                 {list.length === 0
//                                     ? (<p className='text-xs text-emerald-600 flex items-start justify-start'>Your rooms list is empty . Start adding car !</p>)
//                                     : list.map((room, index) => (

//                                         <tr
//                                             // key ={index}
//                                             className='border-b-3 border-emerald-50 text-xs font-normal'
//                                         >
//                                             <td className='p-1' hidden>{room._id}</td>
//                                             <td className='p-1 bg-emerald-50'>{room.floor}</td>
//                                             <td className='p-1'><img 
//                                                 className='rounded-full border-b-2 border-emerald-600 w-9 h-9' 
//                                                 src={room.image} />
//                                             </td>
//                                             <td className='p-1'>{room.roomNo}</td>
//                                             <td className='p-1'>
//                                                 <span>{room.seats}</span>
//                                                 <span>Person</span>

//                                             </td>
//                                             <td className='p-1'>
//                                                 <span className ='text-emerald-600 text-xs font-normal'>{room.price}</span>
//                                                 <span className ='text-[#1a1a1a] text-xs font-normal'> AED</span>
//                                                 <span className = 'text-emerald-600 text-xs font-normal'> Per night</span>
//                                             </td>

//                                             <td className='p-1  flex flex-wrap gap-2  justify-center bg-zinc-1' style={{ marginRight: '0px' }}>
            
//                                                 <button className={`cursor-pointer rounded-full text-sm font-semibold hover:bg-emerald-600/30 p-1`}>
//                                                     <LiaEditSolid

//                                                         onClick={() => handleEdit(room)}
//                                                         size={20}
//                                                         className='w-5 h-5 text-emerald-600 rounded-full ' />
//                                                 </button>

//                                                 <button className={`text-[#be3e3f] rounded-full p-1 cursor-pointer text-sm font-semibold hover:bg-[#be3e3f]/30`}>
//                                                     <MdDeleteForever
//                                                         onClick={() => { setSelectedRoom(room); setDeleteModalOpen(true); }}
//                                                         size={20}
//                                                         className='w-5 h-5 text-[#be3e3f] rounded-full' />
//                                                 </button>

//                                             </td>

//                                         </tr>
//                                     ))}
//                             </tbody>

//                             {/* Footer Section */}
//                             {list.length > 0 && (
//                                 <tfoot className='bg-emerald-600 text-white border-t-2 border-emerald-600 text-xs font-semibold'>
//                                     <tr>
//                                         <td className='p-2' colSpan={6}>{list.length} Room</td>
//                                     </tr>
//                                 </tfoot>
//                             )}

//                         </table>

//                         {/* Pagination  */}
//                         {list.length > 0 && <PaginationControls />}

//                     </div>

//                     {/* Edit Employee Modal */}
//                     {isEditRoomModal && currentRoom && (
//                         <EditRoom
//                             room= {currentRoom}
//                             setIsEditRoomModal= {setIsEditRoomModal}
//                             fetchRooms= {fetchRooms}
//                         />
//                     )}


//                 </div>

//             </div>

//             <BottomNav />

//             {/* Place the ConfirmModal here */}
//             <ConfirmModal
//                 open= {deleteModalOpen}
//                 RoomNo= {selectedRoom?.roomNo}
//                 onClose={() => setDeleteModalOpen(false)}
//                 onConfirm={() => {
//                     removeRoom(selectedRoom._id);
//                     setDeleteModalOpen(false);
//                 }}
//             />
//             <BottomNav />
//         </section>
//     );
// };


// // You can put this at the bottom of your Services.jsx file or in a separate file
// const ConfirmModal = ({ open, onClose, onConfirm, RoomNo }) => {
//     if (!open) return null;
//     return (
//         <div
//             className="fixed inset-0 flex items-center justify-center z-50"
//             style={{ backgroundColor: 'rgba(243, 216, 216, 0.4)' }}  //rgba(0,0,0,0.4)
//         >

//             <div className="bg-white rounded-lg p-6 shadow-lg min-w-[300px]">
//                 {/* <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2> */}
//                 <p className="mb-6">Are you sure you want to remove 
//                     <span className="font-semibold text-[#be3e3f]">{RoomNo}</span> ?</p>
//                 <div className="flex justify-end gap-3">
//                     <button
//                         className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
//                         onClick={onClose}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         className="px-4 py-2 rounded bg-[#be3e3f] text-white cursor-pointer"
//                         onClick={onConfirm}
//                     >
//                         Delete
//                     </button>
//                 </div>
//             </div>

//         </div>
//     );
// };



// export default Rooms;