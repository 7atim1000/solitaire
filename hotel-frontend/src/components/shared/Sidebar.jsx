import React, { useState, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { SidebarMenuLinks } from '../../assets/assets';
import { FaBackwardStep, FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { logout, api } from '../../https';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { removeUser } from '../../redux/slices/userSlice';
import hotel from '../../assets/images/solitair.png';

const Sidebar = () => {
  // Logout function :
  const userData = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State for notifications
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [checkedOutCount, setCheckedOutCount] = useState(0);
  const [overdueCheckInCount, setOverdueCheckInCount] = useState(0);
  const [overdueCheckOutCount, setOverdueCheckOutCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper function to parse date string (DD/MM/YYYY format)
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  };

  // Function to check if date is today
  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseDate(dateString);
    if (!checkDate) return false;
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  // Function to check if date is past
  const isPastDate = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseDate(dateString);
    if (!checkDate) return false;
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // Fetch orders and calculate counts
  const fetchOrderCounts = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/order/fetch', {
        frequency: '365', // Get all orders
        orderStatus: '', // All statuses
        shift: '',
        search: '',
        sort: '-createdAt',
        page: 1,
        limit: 1000 // Get enough records
      });

      const invoices = res.data?.data || res.data?.orders || [];
      
      // Calculate counts
      let checkInToday = 0;
      let checkOutToday = 0;
      let overdueCheckIn = 0;
      let overdueCheckOut = 0;

      invoices.forEach(invoice => {
        const bookingDate = invoice.dateBooking;
        const returnDate = invoice.dateReturn;
        const status = invoice.orderStatus;

        // Check-in today (status 'In Progress' and booking date is today)
        if (status === 'In Progress' && isToday(bookingDate)) {
          checkInToday++;
        }

        // Check-out today (status 'Checked In' and return date is today)
        if (status === 'Checked In' && isToday(returnDate)) {
          checkOutToday++;
        }

        // Overdue check-in (status 'In Progress' and booking date is past)
        if (status === 'In Progress' && isPastDate(bookingDate)) {
          overdueCheckIn++;
        }

        // Overdue check-out (status 'Checked In' and return date is past)
        if (status === 'Checked In' && isPastDate(returnDate)) {
          overdueCheckOut++;
        }
      });

      setCheckedInCount(checkInToday);
      setCheckedOutCount(checkOutToday);
      setOverdueCheckInCount(overdueCheckIn);
      setOverdueCheckOutCount(overdueCheckOut);

    } catch (error) {
      console.error('Error fetching order counts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts on component mount and periodically
  useEffect(() => {
    fetchOrderCounts();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchOrderCounts, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Logout mutation
  const logOutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: (data) => {
      dispatch(removeUser());
      localStorage.removeItem('token');
      document.cookie = 'accessToken=; Max-Age=0; path=/;';
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
    }
  });

  const handleLogOut = () => {
    if (!logOutMutation.isLoading) {
      document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      logOutMutation.mutate();
    }
  };

  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    Services: false
  });

  const toggleSubMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubItemActive = (subItems) => {
    if (!subItems) return false;
    return subItems.some(subItem => location.pathname === subItem.path);
  };

  const isMenuActive = (menu) => {
    return isActive(menu.path || '') || isSubItemActive(menu.subItems);
  };

  // Calculate total notifications for badge
  const totalNotifications = checkedInCount + checkedOutCount + overdueCheckInCount + overdueCheckOutCount;

  return (
    <div className='min-h-0 relative md:flex flex-col pt-2 max-w-13 md:max-w-75 w-full border-r-2 border-green-500 bg-white min-h-screen shadow-xl'>
      
      {/* Sidebar Header/Logo with Notifications */}
      <div className="p-4 border-b border-green-200 bg-white">
        
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center shadow-md">
            <img
              src={hotel}
              alt="Luxury Hotel"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className='text-gray-800 font-bold text-lg max-md:hidden'>Solitaire</span>

          {/* Notification Icons */}
          <div className="flex items-center gap-2">
            {/* Checked In Today Notification */}
            <div className="relative group">
              <FaSignInAlt 
                className={`cursor-pointer p-1.5 rounded-lg transition-all duration-200 ${
                  checkedInCount > 0 || overdueCheckInCount > 0 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                size={32}
              />
              {/* Badge for count */}
              {(checkedInCount > 0 || overdueCheckInCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {checkedInCount + overdueCheckInCount}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                <p className="font-semibold mb-1">Check-ins:</p>
                <p className="text-green-400">Today: {checkedInCount}</p>
                <p className="text-red-400">Overdue: {overdueCheckInCount}</p>
              </div>
            </div>

            {/* Checked Out Today Notification */}
            <div className="relative group">
              <FaSignOutAlt 
                className={`cursor-pointer p-1.5 rounded-lg transition-all duration-200 ${
                  checkedOutCount > 0 || overdueCheckOutCount > 0 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                size={32}
              />
              {/* Badge for count */}
              {(checkedOutCount > 0 || overdueCheckOutCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {checkedOutCount + overdueCheckOutCount}
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                <p className="font-semibold mb-1">Check-outs:</p>
                <p className="text-green-400">Today: {checkedOutCount}</p>
                <p className="text-red-400">Overdue: {overdueCheckOutCount}</p>
              </div>
            </div>

            {/* Loading indicator (optional) */}
            {loading && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            )}
          </div>
        </div>
      </div>

      <div className='w-full flex-1 bg-white overflow-y-auto'>
        {SidebarMenuLinks.map((link, index) => {
          const hasSubItems = link.subItems && link.subItems.length > 0;
          const isMenuActiveState = isMenuActive(link);
          const isExpanded = expandedMenus[link.name] || false;
          
          // Get the icon component
          const IconComponent = isMenuActiveState ? link.icon : (link.iconUncolored || link.icon);
          
          return (
            <div key={index} className='mb-1 px-2'>
              {/* Main Menu Item */}
              <div
                className={`relative flex items-center justify-between w-full py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200
                  ${isMenuActiveState 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'}`}
                onClick={() => {
                  if (hasSubItems) {
                    toggleSubMenu(link.name);
                  } else {
                    navigate(link.path || '#');
                  }
                }}
              >
                <div className='flex items-center gap-3 flex-1'>
                  {/* Render the icon component */}
                  <IconComponent 
                    className={isMenuActiveState ? 'text-white' : 'text-gray-500'} 
                    size={18}
                  />
                  <span className='max-md:hidden text-lg font-medium'>{link.name}</span>
                </div>
                
                {hasSubItems && (
                  <span className='max-md:hidden text-gray-400'>
                    {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                  </span>
                )}
                
                {isMenuActiveState && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-green-600 rounded-r-full shadow-sm"></div>
                )}
              </div>

              {/* Submenu Items - Glass effect */}
              {hasSubItems && isExpanded && (
                <div className="ml-6 pl-3 mt-1 space-y-1 border-l-2 border-green-200">
                  {link.subItems?.map((subItem, subIndex) => {
                    const isSubActive = isActive(subItem.path);
                    const SubIconComponent = subItem.icon;
                    
                    return (
                      <NavLink
                        key={subIndex}
                        to={subItem.path}
                        className={({ isActive: navActive }) => 
                          `flex items-center gap-3 w-full py-2 px-3 rounded-lg transition-all duration-150
                          ${navActive || isSubActive 
                            ? 'bg-green-100 text-green-700 shadow-sm border border-green-200' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                          }`
                        }
                      >
                        {SubIconComponent && (
                          <SubIconComponent 
                            className={isSubActive ? 'text-green-600' : 'text-gray-400'} 
                            size={14}
                          />
                        )}
                        <span className='max-md:hidden text-sm font-medium'>{subItem.name}</span>
                        
                        {isSubActive && (
                          <div className="ml-auto w-1 h-4 bg-green-500 rounded-full shadow-sm"></div>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile at Bottom */}
      <div className="p-4 border-t border-green-200 bg-gradient-to-b from-white to-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userData.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-gray-600 text-xs">Welcome,</p>
              <p className="text-gray-800 font-semibold text-sm">{userData.name || "Test user"}</p>
            </div>
          </div>
          <button
            onClick={handleLogOut}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
            title="Logout"
          >
            <RiLogoutCircleRLine size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


// import React, { useState, useEffect } from 'react';
// import { useLocation, NavLink, useNavigate } from 'react-router-dom';
// import { SidebarMenuLinks } from '../../assets/assets';
// import { FaBackwardStep, FaChevronDown, FaChevronRight } from "react-icons/fa6";
// import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
// import { logout, api } from '../../https';
// import { useDispatch, useSelector } from 'react-redux';
// import { useMutation } from '@tanstack/react-query';
// import { RiLogoutCircleRLine } from "react-icons/ri";
// import { MdKeyboardDoubleArrowRight } from "react-icons/md";
// import { removeUser } from '../../redux/slices/userSlice';
// import hotel from '../../assets/images/solitair.png';

// const Sidebar = () => {
//   // Logout function :
//   const userData = useSelector(state => state.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // State for notifications
//   const [checkedInCount, setCheckedInCount] = useState(0);
//   const [checkedOutCount, setCheckedOutCount] = useState(0);
//   const [overdueCheckInCount, setOverdueCheckInCount] = useState(0);
//   const [overdueCheckOutCount, setOverdueCheckOutCount] = useState(0);
//   const [loading, setLoading] = useState(false);

//   // Helper function to parse date string (DD/MM/YYYY format)
//   const parseDate = (dateString) => {
//     if (!dateString) return null;
//     const parts = dateString.split('/');
//     if (parts.length === 3) {
//       const day = parseInt(parts[0], 10);
//       const month = parseInt(parts[1], 10) - 1;
//       const year = parseInt(parts[2], 10);
//       return new Date(year, month, day);
//     }
//     return new Date(dateString);
//   };

//   // Function to check if date is today
//   const isToday = (dateString) => {
//     if (!dateString) return false;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const checkDate = parseDate(dateString);
//     if (!checkDate) return false;
//     checkDate.setHours(0, 0, 0, 0);
//     return checkDate.getTime() === today.getTime();
//   };

//   // Function to check if date is past
//   const isPastDate = (dateString) => {
//     if (!dateString) return false;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const checkDate = parseDate(dateString);
//     if (!checkDate) return false;
//     checkDate.setHours(0, 0, 0, 0);
//     return checkDate < today;
//   };

//   // Fetch orders and calculate counts
//   const fetchOrderCounts = async () => {
//     setLoading(true);
//     try {
//       const res = await api.post('/api/order/fetch', {
//         frequency: '365', // Get all orders
//         orderStatus: '', // All statuses
//         shift: '',
//         search: '',
//         sort: '-createdAt',
//         page: 1,
//         limit: 1000 // Get enough records
//       });

//       const invoices = res.data?.data || res.data?.orders || [];
      
//       // Calculate counts
//       let checkInToday = 0;
//       let checkOutToday = 0;
//       let overdueCheckIn = 0;
//       let overdueCheckOut = 0;

//       invoices.forEach(invoice => {
//         const bookingDate = invoice.dateBooking;
//         const returnDate = invoice.dateReturn;
//         const status = invoice.orderStatus;

//         // Check-in today (status 'In Progress' and booking date is today)
//         if (status === 'In Progress' && isToday(bookingDate)) {
//           checkInToday++;
//         }

//         // Check-out today (status 'Checked In' and return date is today)
//         if (status === 'Checked In' && isToday(returnDate)) {
//           checkOutToday++;
//         }

//         // Overdue check-in (status 'In Progress' and booking date is past)
//         if (status === 'In Progress' && isPastDate(bookingDate)) {
//           overdueCheckIn++;
//         }

//         // Overdue check-out (status 'Checked In' and return date is past)
//         if (status === 'Checked In' && isPastDate(returnDate)) {
//           overdueCheckOut++;
//         }
//       });

//       setCheckedInCount(checkInToday);
//       setCheckedOutCount(checkOutToday);
//       setOverdueCheckInCount(overdueCheckIn);
//       setOverdueCheckOutCount(overdueCheckOut);

//     } catch (error) {
//       console.error('Error fetching order counts:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch counts on component mount and periodically
//   useEffect(() => {
//     fetchOrderCounts();
    
//     // Refresh every 5 minutes
//     const interval = setInterval(fetchOrderCounts, 300000);
    
//     return () => clearInterval(interval);
//   }, []);

//   // Logout mutation
//   const logOutMutation = useMutation({
//     mutationFn: () => logout(),
//     onSuccess: (data) => {
//       dispatch(removeUser());
//       localStorage.removeItem('token');
//       document.cookie = 'accessToken=; Max-Age=0; path=/;';
//       navigate('/login');
//     },
//     onError: (error) => {
//       console.error('Logout error:', error);
//     }
//   });

//   const handleLogOut = () => {
//     if (!logOutMutation.isLoading) {
//       document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//       logOutMutation.mutate();
//     }
//   };

//   const location = useLocation();
//   const [expandedMenus, setExpandedMenus] = useState({
//     Services: false
//   });

//   const toggleSubMenu = (menuName) => {
//     setExpandedMenus(prev => ({
//       ...prev,
//       [menuName]: !prev[menuName]
//     }));
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   const isSubItemActive = (subItems) => {
//     if (!subItems) return false;
//     return subItems.some(subItem => location.pathname === subItem.path);
//   };

//   const isMenuActive = (menu) => {
//     return isActive(menu.path || '') || isSubItemActive(menu.subItems);
//   };

//   // Calculate total notifications for badge
//   const totalNotifications = checkedInCount + checkedOutCount + overdueCheckInCount + overdueCheckOutCount;

//   return (
//     <div className='min-h-0 relative md:flex flex-col pt-2 max-w-13 md:max-w-75 w-full border-r
//             border-emerald-700 text-sm min-h-screen bg-gradient-to-b from-green-600 to-green-700 mr-3'>
      
//       {/* Sidebar Header/Logo with Notifications */}
//       <div className="p-4 border-b border-emerald-900">
        
//         <div className="flex items-center justify-between gap-2">
//           <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
//             <img
//               src={hotel}
//               alt="Luxury Hotel"
//               className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300"
//             />
//           </div>
//           <span className='text-white font-bold text-lg max-md:hidden'>Solitaire</span>

//           {/* ✅ REPLACED: Logout button with Notification Icons */}
//           <div className="flex items-center gap-3">
//             {/* Checked In Today Notification */}
//             <div className="relative group">
//               <FaSignInAlt 
//                 className={`cursor-pointer text-white p-1 rounded-[3px] transition-all duration-200 ${
//                   checkedInCount > 0 || overdueCheckInCount > 0 
//                     ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
//                     : 'bg-emerald-600 hover:bg-emerald-700'
//                 }`}
//                 size={32}
//               />
//               {/* Badge for count */}
//               {(checkedInCount > 0 || overdueCheckInCount > 0) && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
//                   {checkedInCount + overdueCheckInCount}
//                 </span>
//               )}
//               {/* Tooltip */}
//               <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
//                 <p className="font-semibold mb-1">Check-ins:</p>
//                 <p className="text-green-400">Today: {checkedInCount}</p>
//                 <p className="text-red-400">Overdue: {overdueCheckInCount}</p>
//               </div>
//             </div>

//             {/* Checked Out Today Notification */}
//             <div className="relative group">
//               <FaSignOutAlt 
//                 className={`cursor-pointer text-white p-1 rounded-[3px] transition-all duration-200 ${
//                   checkedOutCount > 0 || overdueCheckOutCount > 0 
//                     ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
//                     : 'bg-emerald-600 hover:bg-emerald-700'
//                 }`}
//                 size={32}
//               />
//               {/* Badge for count */}
//               {(checkedOutCount > 0 || overdueCheckOutCount > 0) && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
//                   {checkedOutCount + overdueCheckOutCount}
//                 </span>
//               )}
//               {/* Tooltip */}
//               <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
//                 <p className="font-semibold mb-1">Check-outs:</p>
//                 <p className="text-green-400">Today: {checkedOutCount}</p>
//                 <p className="text-red-400">Overdue: {overdueCheckOutCount}</p>
//               </div>
//             </div>

//             {/* Loading indicator (optional) */}
//             {loading && (
//               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className='w-full flex-1'>
//         {SidebarMenuLinks.map((link, index) => {
//           const hasSubItems = link.subItems && link.subItems.length > 0;
//           const isMenuActiveState = isMenuActive(link);
//           const isExpanded = expandedMenus[link.name] || false;
          
//           // Get the icon component
//           const IconComponent = isMenuActiveState ? link.icon : (link.iconUncolored || link.icon);
          
//           return (
//             <div key={index} className='mb-1'>
//               {/* Main Menu Item */}
//               <div
//                 className={`relative flex items-center justify-between w-full py-3 px-4 border-b border-emerald-900 cursor-pointer transition-all duration-200
//                   ${isMenuActiveState ? 'bg-green-800 text-white shadow-inner' : 'text-white hover:bg-green-700 hover:text-white'}`}
//                 onClick={() => {
//                   if (hasSubItems) {
//                     toggleSubMenu(link.name);
//                   } else {
//                     navigate(link.path || '#');
//                   }
//                 }}
//               >
//                 <div className='flex items-center gap-2 flex-1'>
//                   {/* Render the icon component */}
//                   <IconComponent 
//                     className={isMenuActiveState ? 'text-white' : 'text-green-200'} 
//                     size={20}
//                   />
//                   <span className='max-md:hidden text-lg font-medium'>{link.name}</span>
//                 </div>
                
//                 {hasSubItems && (
//                   <span className='max-md:hidden text-emerald-200'>
//                     {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
//                   </span>
//                 )}
                
//                 {isMenuActiveState && (
//                   <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-l shadow-lg"></div>
//                 )}
//               </div>

//               {/* Submenu Items */}
//               {hasSubItems && isExpanded && (
//                 <div className="ml-4 pl-2 border-l-2 border-green-600 bg-green-900/50">
//                   {link.subItems?.map((subItem, subIndex) => {
//                     const isSubActive = isActive(subItem.path);
//                     const SubIconComponent = subItem.icon;
                    
//                     return (
//                       <NavLink
//                         key={subIndex}
//                         to={subItem.path}
//                         className={({ isActive: navActive }) => 
//                           `flex items-center gap-2 w-full py-2 px-3 my-1 rounded-r transition-all duration-150
//                           ${navActive || isSubActive 
//                             ? 'bg-green-500 text-white shadow-inner' 
//                             : 'text-green-100 hover:bg-green-700 hover:text-white'
//                           }`
//                         }
//                       >
//                         {SubIconComponent && (
//                           <SubIconComponent 
//                             className={isSubActive ? 'text-white mr-2' : 'text-green-100 mr-2'} 
//                             size={16}
//                           />
//                         )}
//                         <span className='max-md:hidden text-sm font-medium'>{subItem.name}</span>
                        
//                         {isSubActive && (
//                           <div className="ml-auto w-1.5 h-4 bg-white rounded shadow"></div>
//                         )}
//                       </NavLink>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* User Profile at Bottom */}
//       <div className="p-4 border-t border-emerald-200">
//         <div className="flex max-md:flex-col items-center gap-2">
//           <p className="text-white font-normal text-xs max-sm:hidden">
//             Thanks <span className='text-lg font-bold'>{userData.name || "Test user"}</span>
//           </p>
//           <p className="text-white text-xs max-sm:hidden">
//             <MdKeyboardDoubleArrowRight className='inline'/>  
//           </p>
//           <RiLogoutCircleRLine 
//             onClick={handleLogOut} 
//             className='cursor-pointer text-white p-1 ml-2 rounded-[3px] bg-red-500 hover:bg-red-600 animate-pulse absolute right-5  bottom-2' 
//             size={37}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

