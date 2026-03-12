import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Icons
import { 
  TbTransformPoint, 
  TbPercentage66, 
  TbSum 
} from "react-icons/tb";
import { IoBedOutline } from "react-icons/io5";
import { TiPointOfInterestOutline } from "react-icons/ti";
import { PiStairsThin } from "react-icons/pi";
import { RxDropdownMenu } from "react-icons/rx";
import { MdOutlineFamilyRestroom } from "react-icons/md";
import { GiCash, GiRoundTable } from "react-icons/gi";
import { CiCircleList } from "react-icons/ci";
import { RiNumbersLine } from "react-icons/ri";
import { BiUnite } from "react-icons/bi";
import { FaChartLine, FaFilter, FaUsers, FaSearch, FaCalendarAlt, FaClock } from "react-icons/fa";
import { HiMiniUserGroup } from "react-icons/hi2";
import { BsGraphUp, BsCalendarCheck } from "react-icons/bs";
import { MdMeetingRoom } from "react-icons/md";
import { FiDollarSign } from "react-icons/fi";

// Components
import { getBgColor } from '../utils';
import { api } from '../https';

// Helper function for safe array operations
const safeFilter = (array, filterFn) => {
  if (!Array.isArray(array)) return [];
  return array.filter(filterFn);
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Dashboard navigation cards
  const dashboardCards = [
    { 
      label: "Rooms", 
      icon: <IoBedOutline className='w-6 h-6' />, 
      action: "rooms",
      description: "Manage room inventory",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    { 
      label: "Floors", 
      icon: <PiStairsThin className='w-6 h-6' />, 
      action: "floors",
      description: "Floor management",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
    },
    { 
      label: "Units", 
      icon: <BiUnite className='w-6 h-6'/>, 
      action: "units",
      description: "Unit configurations",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-gradient-to-r from-amber-500 to-amber-600"
    },  
    { 
      label: "Services", 
      icon: <RxDropdownMenu className='w-6 h-6' />, 
      action: "services",
      description: "Service categories",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600"
    },
    { 
      label: "Items", 
      icon: <TbTransformPoint className='w-6 h-6'/>, 
      action: "items",
      description: "Service items",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-gradient-to-r from-rose-500 to-rose-600"
    },
    { 
      label: "Customers", 
      icon: <MdOutlineFamilyRestroom className='w-6 h-6' />, 
      action: "customers",
      description: "Customer management",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-gradient-to-r from-indigo-500 to-indigo-600"
    },
    { 
      label: "Reservations", 
      icon: <TiPointOfInterestOutline className='w-6 h-6' />, 
      action: "Reservations",
      description: "Booking management",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-gradient-to-r from-cyan-500 to-cyan-600"
    },
    { 
      label: "Transactions", 
      icon: <GiCash className='w-6 h-6' />, 
      action: "transactions",
      description: "Financial transactions",
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-gradient-to-r from-violet-500 to-violet-600"
    },
  ];

  const handleNavigation = (action) => {
    const routes = {
      'rooms': '/rooms',
      'floors': '/floors',
      'services': '/services',
      'items': '/items',
      'units': '/units',
      'Reservations': '/invoices',
      'customers': '/customers',
      'transactions': '/transactions'
    };
    
    if (routes[action]) {
      navigate(routes[action]);
    }
  };

  // State management
  const [allOrders, setAllOrders] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floorList, setFloorList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [frequency, setFrequency] = useState('30'); // Default to last 30 days
  const [orderStatus, setOrderStatus] = useState('all');
  const [shift, setShift] = useState('all');
  const [roomStatus, setRoomStatus] = useState('all');
  
  // New state for orders summary
  const [ordersSummary, setOrdersSummary] = useState({
    totalOrders: 0,
    completedOrders: 0,
    inProgressOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    last5Orders: []
  });

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchOrders(),
          fetchRooms(),
          fetchFloors(),
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [frequency, orderStatus, shift, roomStatus]);

  // Fetch orders function similar to getOrders from Invoices component
  const fetchOrders = async () => {
    try {
      const res = await api.post('/api/order/fetch', {
        frequency,
        orderStatus: orderStatus === 'all' ? '' : orderStatus,
        shift: shift === 'all' ? '' : shift,
        sort: '-createdAt', // Get latest orders first
        page: 1,
        limit: 100 // Get enough orders to calculate stats
      });

      const orders = res.data?.data || res.data?.orders || [];
      setAllOrders(orders);
      
      // Calculate summary statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersSummaryData = {
        totalOrders: orders.length,
        completedOrders: orders.filter(order => order.orderStatus === 'Completed').length,
        inProgressOrders: orders.filter(order => order.orderStatus === 'In Progress').length,
        todayOrders: orders.filter(order => {
          try {
            const orderDate = new Date(order.orderDate || order.createdAt);
            return orderDate >= today;
          } catch {
            return false;
          }
        }).length,
        totalRevenue: orders.reduce((acc, order) => 
          acc + (order.bills?.totalWithTax || 0), 0
        ),
        last5Orders: orders.slice(0, 5) // Get first 5 orders (already sorted by -createdAt)
      };
      
      setOrdersSummary(ordersSummaryData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
      setOrdersSummary({
        totalOrders: 0,
        completedOrders: 0,
        inProgressOrders: 0,
        todayOrders: 0,
        totalRevenue: 0,
        last5Orders: []
      });
    }
  };

  // const fetchRooms = async () => {
  //   try {
  //     const res = await api.post('/api/room/fetch', { status: roomStatus });
      
  //     // Handle different response formats
  //     let roomsData = [];
      
  //     if (Array.isArray(res.data)) {
  //       roomsData = res.data;
  //     } else if (res.data && Array.isArray(res.data.rooms)) {
  //       roomsData = res.data.rooms;
  //     } else if (res.data && Array.isArray(res.data.data)) {
  //       roomsData = res.data.data;
  //     } else if (res.data && typeof res.data === 'object') {
  //       // If it's an object, try to extract array values
  //       roomsData = Object.values(res.data).filter(item => 
  //         item && typeof item === 'object'
  //       );
  //     }
      
  //     console.log('Rooms data loaded:', roomsData);
  //     setRooms(roomsData);
      
  //   } catch (error) {
  //     console.error('Error fetching rooms:', error);
  //     setRooms([]);
  //   }
  // };

  // The issue is that your backend function returns paginated data with a nested structure, but your frontend is trying to extract the rooms from the wrong place. The backend returns:
  
  const fetchRooms = async () => {
    try {
      const res = await api.post('/api/room/fetch', {
        status: roomStatus,
        page: 1,
        limit: 1000 // Get all rooms (set a high limit)
      });

      console.log('📡 API Response:', res.data);

      let roomsData = [];

      // ✅ Check the actual response structure
      if (res.data && res.data.success) {
        // If using pagination wrapper
        if (Array.isArray(res.data.data)) {
          roomsData = res.data.data;
        } else if (Array.isArray(res.data.rooms)) {
          roomsData = res.data.rooms;
        }
      } else if (Array.isArray(res.data)) {
        // If response is direct array
        roomsData = res.data;
      } else if (res.data && typeof res.data === 'object') {
        // If it's an object, try to extract array values
        roomsData = Object.values(res.data).filter(item =>
          item && typeof item === 'object' && item._id
        );
      }

      console.log('📊 Rooms data loaded:', roomsData);
      console.log('📊 Total rooms count:', roomsData.length);
      setRooms(roomsData);

    } catch (error) {
      console.error('❌ Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchFloors = async () => {
    try {
      const response = await api.get('/api/floor/');
      if (response.data.success) {
        setFloorList(response.data.floors || []);
      } else {
        setFloorList([]);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      setFloorList([]);
    }
  };

  // Safe calculations
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const availableRooms = safeFilter(safeRooms, r => r.status === 'available');
  const bookedRooms = safeFilter(safeRooms, r => r.status === 'booked');

  // Updated stats cards with order data
  const statsCards = [
    {
      title: "Floors",
      value: Array.isArray(floorList) ? floorList.length : 0,
      icon: <PiStairsThin className="w-8 h-8" />,
      change: "+2.5%",
      description: "Total floors in system",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      filter: null
    },
    {
      title: "Rooms",
      value: safeRooms.length,
      icon: <IoBedOutline className="w-8 h-8" />,
      change: roomStatus === 'available' ? `available: ${availableRooms.length}` : "",
      description: `${availableRooms.length} available`,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      filter: (
        <div className="flex gap-1">
          {['all', 'available', 'booked'].map((status) => (
            <button
              key={status}
              onClick={() => setRoomStatus(status)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${roomStatus === status 
                ? 'bg-white text-blue-600' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Total Orders",
      value: ordersSummary.totalOrders,
      icon: <CiCircleList className="w-8 h-8" />,
      change: frequency === '1' ? "Today" : frequency === '30' ? "This month" : "This year",
      description: `${ordersSummary.completedOrders} completed`,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      filter: (
        <div className="flex gap-1">
          {[
            { value: '1', label: 'Day' },
            { value: '30', label: 'Month' },
            { value: '365', label: 'Year' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFrequency(item.value)}
              className={`px-3 py-1 text-xs rounded-full transition-all ${frequency === item.value 
                ? 'bg-white text-emerald-600' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Total Revenue",
      value: `SD ${ordersSummary.totalRevenue.toFixed(2)}`,
      icon: <FiDollarSign className="w-8 h-8" />,
      change: "+8.2%",
      description: "Total sales amount",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      filter: null
    }
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 w-full">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <FaChartLine className="w-7 h-7" />
              </div>
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome to your management dashboard. Monitor key metrics and navigate quickly.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/invoices')}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
            >
              <TiPointOfInterestOutline className="w-4 h-4" />
              <span>View All Orders</span>
            </button>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            <FaChartLine className="w-5 h-5" />
          </div>
          Key Performance Indicators
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <div 
              key={index}
              className={`${stat.color} text-white rounded-xl p-5 shadow-lg transition-transform hover:scale-[1.02]`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  {stat.icon}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-80">{stat.description}</p>
                  {stat.change && (
                    <p className="text-xs mt-1 opacity-90">{stat.change}</p>
                  )}
                </div>
                {stat.filter && (
                  <div className="mt-2">
                    {stat.filter}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CiCircleList className="text-emerald-600" />
              Order Statistics
            </h3>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'Completed', label: 'Completed' },
                { value: 'In Progress', label: 'In Progress' }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setOrderStatus(item.value)}
                  className={`px-3 py-1 text-sm rounded-lg ${orderStatus === item.value 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {ordersSummary.todayOrders}
                  </p>
                </div>
                <FaCalendarAlt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {ordersSummary.completedOrders}
                  </p>
                </div>
                <BsCalendarCheck className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {ordersSummary.inProgressOrders}
                  </p>
                </div>
                <FaClock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    SD {ordersSummary.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <FiDollarSign className="w-6 h-6 opacity-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              Recent Orders (Last 5)
            </h3>
            <button 
              onClick={() => navigate('/invoices')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          {ordersSummary.last5Orders.length === 0 ? (
            <div className="text-center py-8">
              <CiCircleList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersSummary.last5Orders.map((order, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        order.orderStatus === 'Completed' 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-amber-100 text-amber-600'
                      }`}>
                        {order.orderStatus === 'Completed' ? (
                          <BsCalendarCheck className="w-4 h-4" />
                        ) : (
                          <FaClock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {order.customerDetails?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Room: {order.room?.roomNo || 'N/A'} • 
                          {formatDate(order.orderDate || order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      SD {(order.bills?.totalWithTax || 0).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.orderStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Order Status Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Status Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm">Completed</span>
                </div>
                <span className="font-medium">{ordersSummary.completedOrders}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm">In Progress</span>
                </div>
                <span className="font-medium">{ordersSummary.inProgressOrders}</span>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${ordersSummary.totalOrders > 0 
                      ? (ordersSummary.completedOrders / ordersSummary.totalOrders) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <FaUsers className="w-5 h-5" />
          </div>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {dashboardCards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(card.action)}
              className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-500 group"
            >
              <div className={`p-3 rounded-lg ${card.bgColor} text-white mb-3 w-fit group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{card.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              <div className="mt-3 text-xs text-gray-400 group-hover:text-emerald-600 transition-colors">
                Click to access →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
            <p className="text-sm text-gray-600">Today's Orders</p>
            <p className="text-xl font-bold text-gray-800">
              {ordersSummary.todayOrders}
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <p className="text-xl font-bold text-gray-800">
              {ordersSummary.totalOrders > 0 
                ? `${((ordersSummary.completedOrders / ordersSummary.totalOrders) * 100).toFixed(1)}%` 
                : '0%'
              }
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Order Value</p>
            <p className="text-xl font-bold text-gray-800">
              {ordersSummary.totalOrders > 0 
                ? `SD ${(ordersSummary.totalRevenue / ordersSummary.totalOrders).toFixed(2)}` 
                : 'SD 0.00'
              }
            </p>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-xl font-bold text-gray-800">
              {ordersSummary.inProgressOrders}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button 
          onClick={() => navigate('/rooms')}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
        >
          <IoBedOutline className="w-4 h-4" />
          Manage Rooms
        </button>
        <button 
          onClick={() => navigate('/invoices')}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
        >
          <BsCalendarCheck className="w-4 h-4" />
          View All Orders
        </button>
        <button 
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center gap-2"
        >
          <FaUsers className="w-4 h-4" />
          Customer Management
        </button>
      </div>
    </div>
  );
};

export default Dashboard;



// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// // Icons
// import { 
//   TbTransformPoint, 
//   TbPercentage66, 
//   TbSum 
// } from "react-icons/tb";
// import { IoBedOutline } from "react-icons/io5";
// import { TiPointOfInterestOutline } from "react-icons/ti";
// import { PiStairsThin } from "react-icons/pi";
// import { RxDropdownMenu } from "react-icons/rx";
// import { MdOutlineFamilyRestroom } from "react-icons/md";
// import { GiCash, GiRoundTable } from "react-icons/gi";
// import { CiCircleList } from "react-icons/ci";
// import { RiNumbersLine } from "react-icons/ri";
// import { BiUnite } from "react-icons/bi";
// import { FaChartLine, FaFilter, FaUsers, FaSearch } from "react-icons/fa";
// import { HiMiniUserGroup } from "react-icons/hi2";
// import { BsGraphUp, BsCalendarCheck } from "react-icons/bs";
// import { MdMeetingRoom } from "react-icons/md";

// // Components
// import { getBgColor } from '../utils';
// import { api } from '../https';

// // Helper function for safe array operations
// const safeFilter = (array, filterFn) => {
//   if (!Array.isArray(array)) return [];
//   return array.filter(filterFn);
// };

// const Dashboard = () => {
//   const navigate = useNavigate();

//   // Dashboard navigation cards
//   const dashboardCards = [
//     { 
//       label: "Rooms", 
//       icon: <IoBedOutline className='w-6 h-6' />, 
//       action: "rooms",
//       description: "Manage room inventory",
//       color: "from-blue-500 to-blue-600",
//       bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
//     },
//     { 
//       label: "Floors", 
//       icon: <PiStairsThin className='w-6 h-6' />, 
//       action: "floors",
//       description: "Floor management",
//       color: "from-purple-500 to-purple-600",
//       bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
//     },
//     { 
//       label: "Units", 
//       icon: <BiUnite className='w-6 h-6'/>, 
//       action: "units",
//       description: "Unit configurations",
//       color: "from-amber-500 to-amber-600",
//       bgColor: "bg-gradient-to-r from-amber-500 to-amber-600"
//     },  
//     { 
//       label: "Services", 
//       icon: <RxDropdownMenu className='w-6 h-6' />, 
//       action: "services",
//       description: "Service categories",
//       color: "from-emerald-500 to-emerald-600",
//       bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600"
//     },
//     { 
//       label: "Items", 
//       icon: <TbTransformPoint className='w-6 h-6'/>, 
//       action: "items",
//       description: "Service items",
//       color: "from-rose-500 to-rose-600",
//       bgColor: "bg-gradient-to-r from-rose-500 to-rose-600"
//     },
//     { 
//       label: "Customers", 
//       icon: <MdOutlineFamilyRestroom className='w-6 h-6' />, 
//       action: "customers",
//       description: "Customer management",
//       color: "from-indigo-500 to-indigo-600",
//       bgColor: "bg-gradient-to-r from-indigo-500 to-indigo-600"
//     },
//     { 
//       label: "Reservations", 
//       icon: <TiPointOfInterestOutline className='w-6 h-6' />, 
//       action: "Reservations",
//       description: "Booking management",
//       color: "from-cyan-500 to-cyan-600",
//       bgColor: "bg-gradient-to-r from-cyan-500 to-cyan-600"
//     },
//     { 
//       label: "Transactions", 
//       icon: <GiCash className='w-6 h-6' />, 
//       action: "transactions",
//       description: "Financial transactions",
//       color: "from-violet-500 to-violet-600",
//       bgColor: "bg-gradient-to-r from-violet-500 to-violet-600"
//     },
//   ];

//   const handleNavigation = (action) => {
//     const routes = {
//       'rooms': '/rooms',
//       'floors': '/floors',
//       'services': '/services',
//       'items': '/items',
//       'units': '/units',
//       'Reservations': '/invoices',
//       'customers': '/customers',
//       'transactions': '/transactions'
//     };
    
//     if (routes[action]) {
//       navigate(routes[action]);
//     }
//   };

//   // State management
//   const [allInvoices, setAllInvoices] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [floorList, setFloorList] = useState([]);
//   const [customerList, setCustomerList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Filters
//   const [frequency, setFrequency] = useState('366');
//   const [orderStatus, setOrderStatus] = useState('all');
//   const [shift, setShift] = useState('all');
//   const [orderType, setOrderType] = useState('all');
//   const [roomStatus, setRoomStatus] = useState('all');

//   // Fetch all data
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setIsLoading(true);
//       try {
//         await Promise.all([
//           fetchInvoices(),
//           fetchRooms(),
//           fetchFloors(),
//         //  fetchCustomers()
//         ]);
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [frequency, orderStatus, shift, roomStatus]);

//   const fetchInvoices = async () => {
//     try {
//       const res = await api.post('/api/order/fetch', {
//         frequency,
//         orderType,
//         orderStatus,
//         shift
//       });
//       setAllInvoices(res.data.data || []);
//     } catch (error) {
//       console.error('Error fetching invoices:', error);
//       setAllInvoices([]);
//     }
//   };

//   const fetchRooms = async () => {
//     try {
//       const res = await api.post('/api/room/fetch', { status: roomStatus });
      
//       // Handle different response formats
//       let roomsData = [];
      
//       if (Array.isArray(res.data)) {
//         roomsData = res.data;
//       } else if (res.data && Array.isArray(res.data.rooms)) {
//         roomsData = res.data.rooms;
//       } else if (res.data && Array.isArray(res.data.data)) {
//         roomsData = res.data.data;
//       } else if (res.data && typeof res.data === 'object') {
//         // If it's an object, try to extract array values
//         roomsData = Object.values(res.data).filter(item => 
//           item && typeof item === 'object'
//         );
//       }
      
//       console.log('Rooms data loaded:', roomsData);
//       setRooms(roomsData);
      
//     } catch (error) {
//       console.error('Error fetching rooms:', error);
//       setRooms([]);
//     }
//   };

//   const fetchFloors = async () => {
//     try {
//       const response = await api.get('/api/floor/');
//       if (response.data.success) {
//         setFloorList(response.data.floors || []);
//       } else {
//         setFloorList([]);
//       }
//     } catch (error) {
//       console.error('Error fetching floors:', error);
//       setFloorList([]);
//     }
//   };

//   // const fetchCustomers = async () => {
//   //   try {
//   //     const res = await api.post('/api/customers/');
//   //     if (res.data.success) {
//   //       setCustomerList(res.data.customers || []);
//   //     } else {
//   //       setCustomerList([]);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error fetching customers:', error);
//   //     setCustomerList([]);
//   //   }
//   // };

//   // Safe calculations
//   const safeRooms = Array.isArray(rooms) ? rooms : [];
//   const availableRooms = safeFilter(safeRooms, r => r.status === 'Available');
//   const bookedRooms = safeFilter(safeRooms, r => r.status === 'Booked');
  
//   const totalSales = Array.isArray(allInvoices) 
//     ? allInvoices.reduce((acc, invoice) => acc + (invoice.bills?.total || 0), 0)
//     : 0;
  
//   const totalTax = Array.isArray(allInvoices) 
//     ? allInvoices.reduce((acc, invoice) => acc + (invoice.bills?.tax || 0), 0)
//     : 0;
  
//   const totalWithTax = Array.isArray(allInvoices) 
//     ? allInvoices.reduce((acc, invoice) => acc + (invoice.bills?.totalWithTax || 0), 0)
//     : 0;

//   // Stats cards data
//   const statsCards = [
//     {
//       title: "Floors",
//       value: Array.isArray(floorList) ? floorList.length : 0,
//       icon: <PiStairsThin className="w-8 h-8" />,
//       change: "+2.5%",
//       description: "Total floors in system",
//       color: "bg-gradient-to-br from-purple-500 to-purple-600",
//       filter: null
//     },
//     // {
//     //   title: "Customers",
//     //   value: Array.isArray(customerList) ? customerList.length : 0,
//     //   icon: <HiMiniUserGroup className="w-8 h-8" />,
//     //   change: "+12.3%",
//     //   description: "Active customers",
//     //   color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
//     //   filter: null
//     // },
//     {
//       title: "Rooms",
//       value: safeRooms.length,
//       icon: <IoBedOutline className="w-8 h-8" />,
//       change: roomStatus === 'Available' ? `Available: ${availableRooms.length}` : "",
//       description: `${availableRooms.length} available`,
//       color: "bg-gradient-to-br from-blue-500 to-blue-600",
//       filter: (
//         <div className="flex gap-1">
//           {['all', 'Available', 'Booked'].map((status) => (
//             <button
//               key={status}
//               onClick={() => setRoomStatus(status)}
//               className={`px-3 py-1 text-xs rounded-full transition-all ${roomStatus === status 
//                 ? 'bg-white text-blue-600' 
//                 : 'bg-white/10 text-white/80 hover:bg-white/20'
//               }`}
//             >
//               {status}
//             </button>
//           ))}
//         </div>
//       )
//     },
//     {
//       title: "Invoices",
//       value: Array.isArray(allInvoices) ? allInvoices.length : 0,
//       icon: <CiCircleList className="w-8 h-8" />,
//       change: frequency === '1' ? "Today" : frequency === '30' ? "This month" : "This year",
//       description: "Total invoices",
//       color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
//       filter: (
//         <div className="flex gap-1">
//           {[
//             { value: '1', label: 'Day' },
//             { value: '30', label: 'Month' },
//             { value: '366', label: 'Year' }
//           ].map((item) => (
//             <button
//               key={item.value}
//               onClick={() => setFrequency(item.value)}
//               className={`px-3 py-1 text-xs rounded-full transition-all ${frequency === item.value 
//                 ? 'bg-white text-emerald-600' 
//                 : 'bg-white/10 text-white/80 hover:bg-white/20'
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </div>
//       )
//     },
//     // {
//     //   title: "Total Sales",
//     //   value: `AED ${totalSales.toFixed(2)}`,
//     //   icon: <RiNumbersLine className="w-8 h-8" />,
//     //   change: "+8.2%",
//     //   description: "Gross revenue",
//     //   color: "bg-gradient-to-br from-amber-500 to-amber-600",
//     //   filter: null
//     // },
//     // {
//     //   title: "Total Tax",
//     //   value: `AED ${totalTax.toFixed(2)}`,
//     //   icon: <TbPercentage66 className="w-8 h-8" />,
//     //   change: `VAT Collected`,
//     //   description: "Tax collected",
//     //   color: "bg-gradient-to-br from-rose-500 to-rose-600",
//     //   filter: null
//     // },
//     // {
//     //   title: "Net Revenue",
//     //   value: `AED ${totalWithTax.toFixed(2)}`,
//     //   icon: <TbSum className="w-8 h-8" />,
//     //   change: "+10.5%",
//     //   description: "After tax revenue",
//     //   color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
//     //   filter: null
//     // }
//   ];

//   if (isLoading) {
//     return (
//       <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 w-full">
//       {/* Header */}
//       <header className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
//               <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
//                 <FaChartLine className="w-7 h-7" />
//               </div>
//               Dashboard Overview
//             </h1>
//             <p className="text-gray-600 mt-2">
//               Welcome to your management dashboard. Monitor key metrics and navigate quickly.
//             </p>
//           </div>
          
//           {/* <div className="flex items-center gap-3">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-64"
//               />
//               <FaSearch className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
//             </div>
//             <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2">
//               <BsGraphUp className="w-4 h-4" />
//               <span className="hidden sm:inline">Generate Report</span>
//             </button>
//           </div> */}

//         </div>
//       </header>

//       {/* Quick Stats Grid */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//           <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
//             <FaChartLine className="w-5 h-5" />
//           </div>
//           Key Performance Indicators
//         </h2>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {statsCards.map((stat, index) => (
//             <div 
//               key={index}
//               className={`${stat.color} text-white rounded-xl p-5 shadow-lg transition-transform hover:scale-[1.02]`}
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="text-sm opacity-90">{stat.title}</p>
//                   <p className="text-2xl font-bold mt-1">{stat.value}</p>
//                 </div>
//                 <div className="p-3 rounded-full bg-white/20">
//                   {stat.icon}
//                 </div>
//               </div>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <p className="text-xs opacity-80">{stat.description}</p>
//                   {stat.change && (
//                     <p className="text-xs mt-1 opacity-90">{stat.change}</p>
//                   )}
//                 </div>
//                 {stat.filter && (
//                   <div className="mt-2">
//                     {stat.filter}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Navigation Cards */}
//       {/* <div className="mb-8">
//         <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
//           <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
//             <FaUsers className="w-5 h-5" />
//           </div>
//           Quick Navigation
//         </h2>
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
//           {dashboardCards.map((card, index) => (
//             <button
//               key={index}
//               onClick={() => handleNavigation(card.action)}
//               className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-500 group"
//             >
//               <div className={`p-3 rounded-lg ${card.bgColor} text-white mb-3 w-fit group-hover:scale-110 transition-transform`}>
//                 {card.icon}
//               </div>
//               <h3 className="font-semibold text-gray-800 text-sm">{card.label}</h3>
//               <p className="text-xs text-gray-500 mt-1">{card.description}</p>
//               <div className="mt-3 text-xs text-gray-400 group-hover:text-emerald-600 transition-colors">
//                 Click to access →
//               </div>
//             </button>
//           ))}
//         </div>
//       </div> */}

//       {/* Detailed Metrics */}
//       {/* Sales Summary */}
      
//       {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        
//         {/* <div className="bg-white rounded-xl p-6 shadow-md"> */}
//           {/* <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
//               <BsGraphUp className="text-emerald-600" />
//               Sales Summary
//             </h3>
//             <div className="flex gap-2">
//               {[
//                 { value: '1', label: 'Today' },
//                 { value: '30', label: 'Month' },
//                 { value: '366', label: 'Year' }
//               ].map((item) => (
//                 <button
//                   key={item.value}
//                   onClick={() => setFrequency(item.value)}
//                   className={`px-3 py-1 text-sm rounded-lg ${frequency === item.value 
//                     ? 'bg-emerald-100 text-emerald-700' 
//                     : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   {item.label}
//                 </button>
//               ))}
//             </div>
//           </div> */}
          
//           {/* <div className="space-y-4"> */}
//             {/* <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
//               <div>
//                 <p className="text-sm text-gray-600">Total Invoices</p>
//                 <p className="text-2xl font-bold text-gray-800">
//                   {Array.isArray(allInvoices) ? allInvoices.length : 0}
//                 </p>
//               </div>
//               <CiCircleList className="w-8 h-8 text-blue-600" />
//             </div> */}
            
//             {/* <div className="grid grid-cols-2 gap-4">
//               <div className="p-4 bg-emerald-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Gross Sales</p>
//                 <p className="text-xl font-bold text-gray-800">AED {totalSales.toFixed(2)}</p>
//               </div>
//               <div className="p-4 bg-amber-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Tax Collected</p>
//                 <p className="text-xl font-bold text-gray-800">AED {totalTax.toFixed(2)}</p>
//               </div>
//             </div> */}
            
//             {/* <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg">
//               <p className="text-sm opacity-90">Net Revenue</p>
//               <p className="text-2xl font-bold">AED {totalWithTax.toFixed(2)}</p>
//             </div> */}
//           {/* </div> */}
//         {/* </div> */}

//         {/* Room Status */}
//         {/* <div className="bg-white rounded-xl p-6 shadow-md">
//           <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
//             <MdMeetingRoom className="text-blue-600" />
//             Room Status
//           </h3>
          
//           <div className="space-y-4">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Total Rooms</span>
//               <span className="font-semibold">{safeRooms.length}</span>
//             </div>
            
//             <div className="space-y-2">
//               <div className="flex justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
//                   <span className="text-sm">Available</span>
//                 </div>
//                 <span>{availableRooms.length}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded-full bg-rose-500"></div>
//                   <span className="text-sm">Booked</span>
//                 </div>
//                 <span>{bookedRooms.length}</span>
//               </div>
//             </div>
            
//             <div className="mt-6">
//               <div className="flex gap-2 mb-4 flex-wrap">
//                 {['all', 'Available', 'Booked'].map((status) => (
//                   <button
//                     key={status}
//                     onClick={() => setRoomStatus(status)}
//                     className={`px-4 py-2 rounded-lg text-sm ${roomStatus === status 
//                       ? 'bg-blue-600 text-white' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     {status}
//                   </button>
//                 ))}
//               </div>
              
//               <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
//                   style={{ 
//                     width: `${safeRooms.length > 0 
//                       ? (availableRooms.length / safeRooms.length) * 100 
//                       : 0}%` 
//                   }}
//                 ></div>
//               </div>
              
//               <div className="flex justify-between text-xs text-gray-500 mt-2">
//                 <span>{availableRooms.length} Available</span>
//                 <span>{bookedRooms.length} Booked</span>
//               </div>
//             </div>
//           </div>
//         </div> */}
//       {/* </div> */}

//       {/* Footer Summary */}
//       {/* <div className="mt-8 pt-6 border-t border-gray-200">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg">
//             <p className="text-sm text-gray-600">Active Customers</p>
//             <p className="text-xl font-bold text-gray-800">
//               {Array.isArray(customerList) ? customerList.length : 0}
//             </p>
//           </div>
//           <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
//             <p className="text-sm text-gray-600">Total Floors</p>
//             <p className="text-xl font-bold text-gray-800">
//               {Array.isArray(floorList) ? floorList.length : 0}
//             </p>
//           </div>
//           <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
//             <p className="text-sm text-gray-600">Today's Invoices</p>
//             <p className="text-xl font-bold text-gray-800">
//               {Array.isArray(allInvoices) 
//                 ? allInvoices.filter(inv => {
//                     if (!inv || !inv.createdAt) return false;
//                     try {
//                       const invoiceDate = new Date(inv.createdAt);
//                       const today = new Date();
//                       return invoiceDate.toDateString() === today.toDateString();
//                     } catch {
//                       return false;
//                     }
//                   }).length
//                 : 0
//               }
//             </p>
//           </div>
//           <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
//             <p className="text-sm text-gray-600">Occupancy Rate</p>
//             <p className="text-xl font-bold text-gray-800">
//               {safeRooms.length > 0 
//                 ? `${((bookedRooms.length / safeRooms.length) * 100).toFixed(1)}%` 
//                 : '0%'
//               }
//             </p>
//           </div>
//         </div>
//       </div> */}

//       {/* Quick Actions Bar */}
//       {/* <div className="mt-8 flex flex-wrap gap-3">
//         <button 
//             onClick={() => navigate('/rooms')}
//             className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
//         >
//           <IoBedOutline className="w-4 h-4" />
//           Manage Rooms
//         </button>
//         <button 
//           onClick={() => navigate('/invoices')}
//           className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
//         >
//           <BsCalendarCheck className="w-4 h-4" />
//           View Reservations
//         </button>
//         <button 
//           onClick={() => navigate('/customers')}
//           className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all flex items-center gap-2"
//         >
//           <FaUsers className="w-4 h-4" />
//           Customer Management
//         </button>
//       </div> */}
//     </div>
//   );
// };

// export default Dashboard;