import React, {useRef, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { RxUpdate } from "react-icons/rx";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux'
import { updateOrder, updateRoom } from '../../https';
import { toast } from 'react-toastify';
import { setOrder } from '../../redux/slices/orderSlice';
import { BiSolidReport } from "react-icons/bi";
import { AiFillPlusCircle } from "react-icons/ai";

const InvoiceDetails = ({ 
  onStatusUpdate, 
  id, 
  date, 
  dateBooking,
  dateReturn,
  shift, 
  roomId,     
  roomNumber,
  customer, 
  phone, 
  payment, 
  total, 
  tax, 
  totalWithTax, 
  payed, 
  balance, 
  status, 
  customerId, 
  user 
}) => {
    
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  // Function to check if date is today
  const isExactlyToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseDate(dateString);
    if (!checkDate) return false;
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  // Function to check if date is in the future
  const isFutureDate = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseDate(dateString);
    if (!checkDate) return false;
    checkDate.setHours(0, 0, 0, 0);
    return checkDate > today;
  };

  const isBookingPast = isPastDate(dateBooking);
  const isBookingToday = isExactlyToday(dateBooking);
  const isBookingFuture = isFutureDate(dateBooking);
  
  const isReturnPast = isPastDate(dateReturn);
  const isReturnToday = isExactlyToday(dateReturn);
  const isReturnFuture = isFutureDate(dateReturn);

  // Check for overdue check-out and check-in
  const isOverdueCheckout = status === 'Checked In' && isReturnPast;
  const isOverdueCheckin = status === 'In Progress' && isBookingPast;

  // ✅ Check if customer has balance (for Checked Out validation)
  const hasBalance = Number(customerId?.balance) > 0;

  // Determine row background color
  const getRowBackground = () => {
    if (isOverdueCheckout) {
      return 'bg-red-100 hover:bg-red-200 border-l-4 border-red-600 animate-pulse';
    }
    if (isOverdueCheckin) {
      return 'bg-green-100 hover:bg-green-200 border-l-4 border-green-600 animate-pulse';
    }
    if (isBookingToday) {
      return 'bg-amber-100 hover:bg-amber-200 border-l-4 border-amber-500';
    }
    if (isReturnToday) {
      return 'bg-emerald-100 hover:bg-emerald-200 border-l-4 border-emerald-500';
    }
    if (isBookingFuture) {
      return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400';
    }
    if (isReturnFuture) {
      return 'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400';
    }
    return 'bg-white hover:bg-emerald-50';
  };

  // Get status badge for overdue notification
  const getStatusBadge = () => {
    if (isOverdueCheckout) {
      return (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          ⚠️ OVERDUE CHECK-OUT! Was {new Date(dateReturn).toLocaleDateString('en-GB')}
        </span>
      );
    }
    if (isOverdueCheckin) {
      return (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          ⚠️ OVERDUE CHECK-IN! Was {new Date(dateBooking).toLocaleDateString('en-GB')}
        </span>
      );
    }
    return null;
  };

  console.log('🏨 Room debug:', { 
    roomId, 
    roomNumber,
    status,
    dateBooking,
    dateReturn,
    hasBalance,
    balance: customerId?.balance,
    isOverdueCheckin,
    isOverdueCheckout,
    isValidObjectId: roomId ? /^[0-9a-fA-F]{24}$/.test(roomId) : false
  });

  // Handle row click to navigate to invoice details
  const handleRowClick = () => {
    console.log('🔍 Row clicked with ID:', id);
    console.log('📍 Navigating to:', `/invdetails/${id}`);
    navigate(`/invdetails/${id}`);
  };

  // Handle click on interactive elements to prevent row click
  const handleInteractiveClick = (e) => {
    e.stopPropagation();
  };

  const statusesThatUpdateRoom = ['In Progress', 'Cancel', 'Checked Out', 'Checked In'];

  const roomUpdateMutation = useMutation({
    mutationFn: (roomData) => {
      console.log('📤 STEP 1 - Mutation received:', roomData);
      if (!roomData.roomId) {
        console.error('❌ ERROR: roomId is missing!', roomData);
        throw new Error('roomId is required');
      }
      console.log('📤 STEP 2 - Calling updateRoom with:', roomData);
      return updateRoom(roomData);
    },
    onSuccess: (resData) => {
      console.log('✅ Room update successful:', resData);
      const responseData = resData?.data?.data || resData?.data;
      const roomStatus = responseData?.status;
      
      const statusMessages = {
        'booked': '📅 Room is now booked',
        'occupied': '🛏️ Room is now occupied',
        'available': '✅ Room is now available'
      };
      
      toast.success(statusMessages[roomStatus] || 'Room status updated!', {
        theme: "colored",
        style: { backgroundColor: '#10b981' }
      });
      
      queryClient.invalidateQueries(['rooms']);
    },
    onError: (error) => {
      console.error('❌ Room update failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || error.message || 'Failed to update room', {
        theme: "colored",
        style: { backgroundColor: '#ef4444' }
      });
    }
  });

  const orderUpdateMutation = useMutation({
    mutationFn: ({ reqData, orderId, orderStatus }) => {
      console.log('📤 Updating order:', { orderId, orderStatus });
      return updateOrder({ reqData, orderId, orderStatus });
    },
    onSuccess: (resData, variables) => {
      const newStatus = variables.orderStatus;
      
      console.log('✅ Order updated successfully to:', newStatus);
      console.log('📦 API Response:', resData);

      toast.success(`Invoice status updated to ${newStatus}!`, {
        theme: "colored",
        style: { backgroundColor: '#10b981' }
      });
      
      queryClient.invalidateQueries(['invoices']);
      
      // Update room for specific statuses
      if (statusesThatUpdateRoom.includes(newStatus) && roomId) {
        
        let roomStatus = 'available';
        
        if (newStatus === 'In Progress') {
          roomStatus = 'booked';
        } else if (newStatus === 'Checked In') {
          roomStatus = 'occupied';
        }
        
        console.log('🔄 Preparing room update:', { 
          roomId: roomId,
          status: roomStatus,
          orderId: id 
        });
        
        setTimeout(() => {
          console.log('🔍 ROOM DEBUG - Using roomId:', {
            roomId,
            isValidObjectId: /^[0-9a-fA-F]{24}$/.test(roomId)
          });
          
          if (!roomId) {
            console.error('❌ Cannot update room: roomId is missing');
            toast.error('Room ID is missing', {
              theme: "colored",
              style: { backgroundColor: '#ef4444' }
            });
            return;
          }
          
          roomUpdateMutation.mutate({
            roomId: roomId,
            status: roomStatus,
            orderId: id
          });
        }, 1500);
      } else {
        console.log('⏭️ No room update needed:', { 
          status: newStatus, 
          shouldUpdate: statusesThatUpdateRoom.includes(newStatus),
          hasRoomId: !!roomId 
        });
      }

      onStatusUpdate();
    },
    onError: (error, variables) => {
      console.error('❌ Order update failed:', {
        error,
        orderId: variables.orderId,
        orderStatus: variables.orderStatus,
        response: error.response?.data
      });
      
      toast.error(error.response?.data?.message || 'Failed to update order status!', {
        theme: "colored",
        style: { backgroundColor: '#ef4444' }
      });
    }
  });

  const handleStatusChange = ({ orderId, orderStatus }) => {                      
    console.log('📤 Status change requested:', { orderId, orderStatus });
    
    // ✅ Validate Checked Out status against customer balance
    if (orderStatus === 'Checked Out' && hasBalance) {
      toast.error('Cannot check out: Customer has outstanding balance!', {
        theme: "colored",
        style: { backgroundColor: '#ef4444' }
      });
      return; // Don't proceed with the mutation
    }
    
    orderUpdateMutation.mutate({ orderId, orderStatus });
  };

  const handleAddServices = (e) => {
    e.stopPropagation(); // Prevent row click
    const _id = id;      
    const Room = roomNumber;
    const customerDetailsName = customer;
    const customerDetailsPhone = phone;
    const billsTotal = total;
    const billsTax = tax;
    const billsTotalWithTax = totalWithTax;
    const billsPayed = payed;
    const billsBalance = balance;
    const cstId = customerId?._id || customerId;

    dispatch(setOrder({ 
      _id, 
      Room, 
      customerDetailsName, 
      customerDetailsPhone, 
      billsTotal, 
      billsTax, 
      billsTotalWithTax, 
      billsPayed, 
      billsBalance, 
      cstId 
    }));
    
    navigate('/addservices');
  };

  const getRoomStatusLabel = (status) => {
    switch(status) {
      case 'In Progress': return 'booked';
      case 'Checked In': return 'occupied';
      case 'Cancel': return 'available';
      case 'Checked Out': return 'available';
      default: return 'unknown';
    }
  };

  return (
    <>
      <tr 
        className={`border-b border-emerald-100 text-sm font-normal transition-colors duration-200 ${getRowBackground()} group cursor-pointer`}
        onClick={handleRowClick}
      >
        <td className='p-3 hidden'>{id}</td>
        
        {/* REMOVED onClick={handleInteractiveClick} from all non-interactive cells */}
        <td className='hide-print font-small'>
          <div className="flex flex-col gap-2">
            <span className={`text-xs font-bold ${isOverdueCheckin ? 'text-green-600 font-extrabold' : 'text-green-600'}`}>
              {dateBooking ? new Date(dateBooking).toLocaleDateString('en-GB') : '-'}
              {isOverdueCheckin && <span className="ml-1 text-green-600">⚠️</span>}
            </span>
            <span className={`text-xs font-bold ${isOverdueCheckout ? 'text-red-600 font-extrabold' : 'text-[#be3e3f]'}`}>
              {dateReturn ? new Date(dateReturn).toLocaleDateString('en-GB') : '-'}
              {isOverdueCheckout && <span className="ml-1 text-red-600">⚠️</span>}
            </span>
          </div>
        </td>

        <td className='p-3 text-gray-800 font-semibold'>{user}</td>
        <td className={`p-3 font-medium ${shift === 'Morning' ? "text-amber-600 bg-amber-50" : "text-sky-600 bg-sky-50"} rounded-lg`}>
          {shift}
        </td>
        
        <td className='p-3 text-gray-700 font-medium bg-emerald-50 rounded-lg relative group'>
          {roomNumber}
          {getStatusBadge()}
          {status && statusesThatUpdateRoom.includes(status) && roomId && !isOverdueCheckout && !isOverdueCheckin && (
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Room will be: {getRoomStatusLabel(status)}
            </span>
          )}
        </td>

        <td className='p-3 text-gray-800 font-medium'>
          <div className="flex flex-col gap-2">
            <span className='text-xs font-bold text-[#1a1a1a]'>{customerId?.customerName || customer}</span>
            <span
              className={
                customerId?.balance === 0
                  ? 'text-green-700 font-semibold text-xs'
                  : 'text-red-600 font-semibold text-xs'
              }
            >
              {Number(customerId?.balance || 0).toFixed(2)} SD
            </span>
          </div>
        </td>

        <td className='p-3 text-emerald-700 font-bold bg-emerald-50 rounded-lg'>
          {totalWithTax?.toFixed(2) || '0.00'}
        </td>
        <td className='p-3 text-sky-600 font-semibold'>{payed?.toFixed(2) || '0.00'}</td>
        <td className='p-3 text-gray-700 underline font-medium'>{payment}</td>
        <td className={`p-3 font-semibold ${balance === 0 ? 'text-emerald-600' : 'text-rose-600'} bg-${balance === 0 ? 'emerald' : 'rose'}-50 rounded-lg`}>
          {balance?.toFixed(2) || '0.00'}
        </td>

        {/* Status Selection Box - INTERACTIVE - keep onClick */}
        <td className='p-3 hide-print' onClick={handleInteractiveClick}>
          <select
            value={status}
            onChange={(e) => {
              const selectedStatus = e.target.value;
              console.log('🎯 Status selected:', selectedStatus);
              handleStatusChange({ orderId: id, orderStatus: selectedStatus });
            }}
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 cursor-pointer
              ${status === 'In Progress' ? 'border-amber-500 bg-amber-50 text-amber-700 focus:ring-amber-500' : ''}
              ${status === 'Checked In' ? 'border-blue-500 bg-blue-50 text-blue-700 focus:ring-blue-500' : ''}
              ${status === 'Cancel' ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500' : ''}
              ${status === 'Checked Out' ? 'border-purple-500 bg-purple-50 text-purple-700 focus:ring-purple-500' : ''}
              ${isOverdueCheckout && status === 'Checked In' ? 'border-red-600 bg-red-50 text-red-700 ring-red-500' : ''}
              ${isOverdueCheckin && status === 'In Progress' ? 'border-green-600 bg-green-50 text-green-700 ring-green-500' : ''}
            `}
            disabled={orderUpdateMutation.isLoading || roomUpdateMutation.isLoading}
          >
            <option value="In Progress" className="bg-amber-50 text-amber-700">🟡 In Progress</option>
            <option value="Checked In" className="bg-blue-50 text-blue-700">🔵 Checked In</option>
            <option value="Cancel" className="bg-red-50 text-red-700">🔴 Cancel</option>
            <option 
              value="Checked Out" 
              className={`bg-purple-50 ${hasBalance ? 'text-gray-400' : 'text-purple-700'}`}
              disabled={hasBalance}
            >
              🟣 Checked Out {hasBalance && '(Balance Due)'}
            </option>
          </select>
          
          {orderUpdateMutation.isLoading && (
            <div className="mt-1 text-xs text-gray-500 text-center animate-pulse">
              Updating order...
            </div>
          )}
          
          {roomUpdateMutation.isLoading && (
            <div className="mt-1 text-xs text-blue-500 text-center animate-pulse">
              Updating room...
            </div>
          )}
          
          {hasBalance && status === 'Checked In' && (
            <div className="mt-1 text-xs text-center font-bold text-red-600">
              ⚠️ Customer has balance: {Number(customerId?.balance || 0).toFixed(2)} SD
            </div>
          )}
          
          {isOverdueCheckin && !orderUpdateMutation.isLoading && !roomUpdateMutation.isLoading && (
            <div className="mt-1 text-xs text-center font-bold text-green-600 animate-pulse">
              ⚠️ Please check in guest
            </div>
          )}
          
          {isOverdueCheckout && !orderUpdateMutation.isLoading && !roomUpdateMutation.isLoading && (
            <div className="mt-1 text-xs text-center font-bold text-red-600 animate-pulse">
              ⚠️ Please check out guest
            </div>
          )}
          
          {status && statusesThatUpdateRoom.includes(status) && !orderUpdateMutation.isLoading && !roomUpdateMutation.isLoading && !isOverdueCheckout && !isOverdueCheckin && (
            <div className="mt-1 text-xs text-center font-medium"
              style={{
                color: status === 'In Progress' ? '#b45309' :
                       status === 'Checked In' ? '#2563eb' :
                       status === 'Cancel' ? '#dc2626' :
                       status === 'Checked Out' ? '#7e5bef' : '#6b7280'
              }}
            >
              Room → {getRoomStatusLabel(status)}
            </div>
          )}
        </td>

        {/* Adding service - INTERACTIVE - keep onClick */}
        <td onClick={handleInteractiveClick}>
          {status === "Checked In" && (
            <div className='flex items-center gap-7'>
              <button
                onClick={handleAddServices}
                className={`text-green-700 cursor-pointer text-sm font-semibold`}>
                <AiFillPlusCircle size={25} />
              </button>
            </div>
          )}
        </td>
      </tr>
    </>
  );
};

export default InvoiceDetails;

// import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import { RxUpdate } from "react-icons/rx";
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { useDispatch } from 'react-redux'
// import { updateOrder, updateRoom } from '../../https';
// import { toast } from 'react-toastify';
// import { setOrder } from '../../redux/slices/orderSlice';
// import { BiSolidReport } from "react-icons/bi";
// import { MdOutlineAddHome } from "react-icons/md";

// const InvoiceDetails = ({ 
//   onStatusUpdate, 
//   id, 
//   date, 
//   dateBooking,
//   dateReturn,
//   shift, 
//   roomId,     
//   roomNumber,
//   customer, 
//   phone, 
//   payment, 
//   total, 
//   tax, 
//   totalWithTax, 
//   payed, 
//   balance, 
//   status, 
//   customerId, 
//   user 
// }) => {
    
//   const dispatch = useDispatch();
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();

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

//   // Function to check if date is today
//   const isExactlyToday = (dateString) => {
//     if (!dateString) return false;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const checkDate = parseDate(dateString);
//     if (!checkDate) return false;
//     checkDate.setHours(0, 0, 0, 0);
//     return checkDate.getTime() === today.getTime();
//   };

//   // Function to check if date is in the future
//   const isFutureDate = (dateString) => {
//     if (!dateString) return false;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const checkDate = parseDate(dateString);
//     if (!checkDate) return false;
//     checkDate.setHours(0, 0, 0, 0);
//     return checkDate > today;
//   };

//   const isBookingPast = isPastDate(dateBooking);
//   const isBookingToday = isExactlyToday(dateBooking);
//   const isBookingFuture = isFutureDate(dateBooking);
  
//   const isReturnPast = isPastDate(dateReturn);
//   const isReturnToday = isExactlyToday(dateReturn);
//   const isReturnFuture = isFutureDate(dateReturn);

//   // Check for overdue check-out and check-in
//   const isOverdueCheckout = status === 'Checked In' && isReturnPast;
//   const isOverdueCheckin = status === 'In Progress' && isBookingPast;

//   // ✅ Check if customer has balance (for Checked Out validation)
//   const hasBalance = Number(customerId?.balance) > 0;

//   // Determine row background color
//   const getRowBackground = () => {
//     if (isOverdueCheckout) {
//       return 'bg-red-100 hover:bg-red-200 border-l-4 border-red-600 animate-pulse';
//     }
//     if (isOverdueCheckin) {
//       return 'bg-green-100 hover:bg-green-200 border-l-4 border-green-600 animate-pulse';
//     }
//     if (isBookingToday) {
//       return 'bg-amber-100 hover:bg-amber-200 border-l-4 border-amber-500';
//     }
//     if (isReturnToday) {
//       return 'bg-emerald-100 hover:bg-emerald-200 border-l-4 border-emerald-500';
//     }
//     if (isBookingFuture) {
//       return 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400';
//     }
//     if (isReturnFuture) {
//       return 'bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400';
//     }
//     return 'bg-white hover:bg-emerald-50';
//   };

//   // Get status badge for overdue notification
//   const getStatusBadge = () => {
//     if (isOverdueCheckout) {
//       return (
//         <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
//           ⚠️ OVERDUE CHECK-OUT! Was {new Date(dateReturn).toLocaleDateString('en-GB')}
//         </span>
//       );
//     }
//     if (isOverdueCheckin) {
//       return (
//         <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
//           ⚠️ OVERDUE CHECK-IN! Was {new Date(dateBooking).toLocaleDateString('en-GB')}
//         </span>
//       );
//     }
//     return null;
//   };

//   console.log('🏨 Room debug:', { 
//     roomId, 
//     roomNumber,
//     status,
//     dateBooking,
//     dateReturn,
//     hasBalance,
//     balance: customerId?.balance,
//     isOverdueCheckin,
//     isOverdueCheckout,
//     isValidObjectId: roomId ? /^[0-9a-fA-F]{24}$/.test(roomId) : false
//   });

//   const statusesThatUpdateRoom = ['In Progress', 'Cancel', 'Checked Out', 'Checked In'];

//   const roomUpdateMutation = useMutation({
//     mutationFn: (roomData) => {
//       console.log('📤 STEP 1 - Mutation received:', roomData);
//       if (!roomData.roomId) {
//         console.error('❌ ERROR: roomId is missing!', roomData);
//         throw new Error('roomId is required');
//       }
//       console.log('📤 STEP 2 - Calling updateRoom with:', roomData);
//       return updateRoom(roomData);
//     },
//     onSuccess: (resData) => {
//       console.log('✅ Room update successful:', resData);
//       const responseData = resData?.data?.data || resData?.data;
//       const roomStatus = responseData?.status;
      
//       const statusMessages = {
//         'booked': '📅 Room is now booked',
//         'occupied': '🛏️ Room is now occupied',
//         'available': '✅ Room is now available'
//       };
      
//       toast.success(statusMessages[roomStatus] || 'Room status updated!', {
//         theme: "colored",
//         style: { backgroundColor: '#10b981' }
//       });
      
//       queryClient.invalidateQueries(['rooms']);
//     },
//     onError: (error) => {
//       console.error('❌ Room update failed:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });
//       toast.error(error.response?.data?.message || error.message || 'Failed to update room', {
//         theme: "colored",
//         style: { backgroundColor: '#ef4444' }
//       });
//     }
//   });

//   const orderUpdateMutation = useMutation({
//     mutationFn: ({ reqData, orderId, orderStatus }) => {
//       console.log('📤 Updating order:', { orderId, orderStatus });
//       return updateOrder({ reqData, orderId, orderStatus });
//     },
//     onSuccess: (resData, variables) => {
//       const newStatus = variables.orderStatus;
      
//       console.log('✅ Order updated successfully to:', newStatus);
//       console.log('📦 API Response:', resData);

//       toast.success(`Invoice status updated to ${newStatus}!`, {
//         theme: "colored",
//         style: { backgroundColor: '#10b981' }
//       });
      
//       queryClient.invalidateQueries(['invoices']);
      
//       // Update room for specific statuses
//       if (statusesThatUpdateRoom.includes(newStatus) && roomId) {
        
//         let roomStatus = 'available';
        
//         if (newStatus === 'In Progress') {
//           roomStatus = 'booked';
//         } else if (newStatus === 'Checked In') {
//           roomStatus = 'occupied';
//         }
        
//         console.log('🔄 Preparing room update:', { 
//           roomId: roomId,
//           status: roomStatus,
//           orderId: id 
//         });
        
//         setTimeout(() => {
//           console.log('🔍 ROOM DEBUG - Using roomId:', {
//             roomId,
//             isValidObjectId: /^[0-9a-fA-F]{24}$/.test(roomId)
//           });
          
//           if (!roomId) {
//             console.error('❌ Cannot update room: roomId is missing');
//             toast.error('Room ID is missing', {
//               theme: "colored",
//               style: { backgroundColor: '#ef4444' }
//             });
//             return;
//           }
          
//           roomUpdateMutation.mutate({
//             roomId: roomId,
//             status: roomStatus,
//             orderId: id
//           });
//         }, 1500);
//       } else {
//         console.log('⏭️ No room update needed:', { 
//           status: newStatus, 
//           shouldUpdate: statusesThatUpdateRoom.includes(newStatus),
//           hasRoomId: !!roomId 
//         });
//       }

//       onStatusUpdate();
//     },
//     onError: (error, variables) => {
//       console.error('❌ Order update failed:', {
//         error,
//         orderId: variables.orderId,
//         orderStatus: variables.orderStatus,
//         response: error.response?.data
//       });
      
//       toast.error(error.response?.data?.message || 'Failed to update order status!', {
//         theme: "colored",
//         style: { backgroundColor: '#ef4444' }
//       });
//     }
//   });

//   const handleStatusChange = ({ orderId, orderStatus }) => {                      
//     console.log('📤 Status change requested:', { orderId, orderStatus });
    
//     // ✅ Validate Checked Out status against customer balance
//     if (orderStatus === 'Checked Out' && hasBalance) {
//       toast.error('Cannot check out: Customer has outstanding balance!', {
//         theme: "colored",
//         style: { backgroundColor: '#ef4444' }
//       });
//       return; // Don't proceed with the mutation
//     }
    
//     orderUpdateMutation.mutate({ orderId, orderStatus });
//   };

//   const handleAddServices = () => {
//     const _id = id;      
//     const Room = roomNumber;
//     const customerDetailsName = customer;
//     const customerDetailsPhone = phone;
//     const billsTotal = total;
//     const billsTax = tax;
//     const billsTotalWithTax = totalWithTax;
//     const billsPayed = payed;
//     const billsBalance = balance;
//     const cstId = customerId?._id || customerId;

//     dispatch(setOrder({ 
//       _id, 
//       Room, 
//       customerDetailsName, 
//       customerDetailsPhone, 
//       billsTotal, 
//       billsTax, 
//       billsTotalWithTax, 
//       billsPayed, 
//       billsBalance, 
//       cstId 
//     }));
    
//     navigate('/addservices');
//   };

//   const getRoomStatusLabel = (status) => {
//     switch(status) {
//       case 'In Progress': return 'booked';
//       case 'Checked In': return 'occupied';
//       case 'Cancel': return 'available';
//       case 'Checked Out': return 'available';
//       default: return 'unknown';
//     }
//   };

//   return (
//     <>
//       <tr className={`border-b border-emerald-100 text-sm font-normal transition-colors duration-200 ${getRowBackground()} group`}>
//         <td className='p-3 hidden'>{id}</td>
        
//         <td className='hide-print font-small'>
//           <div className="flex flex-col gap-2">
//             <span className={`text-xs font-bold ${isOverdueCheckin ? 'text-green-600 font-extrabold' : 'text-green-600'}`}>
//               {dateBooking ? new Date(dateBooking).toLocaleDateString('en-GB') : '-'}
//               {isOverdueCheckin && <span className="ml-1 text-green-600">⚠️</span>}
//             </span>
//             <span className={`text-xs font-bold ${isOverdueCheckout ? 'text-red-600 font-extrabold' : 'text-[#be3e3f]'}`}>
//               {dateReturn ? new Date(dateReturn).toLocaleDateString('en-GB') : '-'}
//               {isOverdueCheckout && <span className="ml-1 text-red-600">⚠️</span>}
//             </span>
//           </div>
//         </td>

//         <td className='p-3 text-gray-800 font-semibold'>{user}</td>
//         <td className={`p-3 font-medium ${shift === 'Morning' ? "text-amber-600 bg-amber-50" : "text-sky-600 bg-sky-50"} rounded-lg`}>
//           {shift}
//         </td>
        
//         <td className='p-3 text-gray-700 font-medium bg-emerald-50 rounded-lg relative group'>
//           {roomNumber}
//           {getStatusBadge()}
//           {status && statusesThatUpdateRoom.includes(status) && roomId && !isOverdueCheckout && !isOverdueCheckin && (
//             <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
//               Room will be: {getRoomStatusLabel(status)}
//             </span>
//           )}
//         </td>

//         <td className='p-3 text-gray-800 font-medium'>
//           <div className="flex flex-col gap-2">
//             <span className='text-xs font-bold text-[#1a1a1a]'>{customerId?.customerName || customer}</span>
//             <span
//               className={
//                 customerId?.balance === 0
//                   ? 'text-green-700 font-semibold text-xs'
//                   : 'text-red-600 font-semibold text-xs'
//               }
//             >
//               {Number(customerId?.balance || 0).toFixed(2)} SD
//             </span>
//           </div>
//         </td>

//         {/* <td className='p-3 text-gray-700'>{total?.toFixed(2) || '0.00'}</td>
//         <td className='p-3 text-gray-700'>{tax?.toFixed(2) || '0.00'}</td> */}

//         <td className='p-3 text-emerald-700 font-bold bg-emerald-50 rounded-lg'>
//           {totalWithTax?.toFixed(2) || '0.00'}
//         </td>
//         <td className='p-3 text-sky-600 font-semibold'>{payed?.toFixed(2) || '0.00'}</td>
//         <td className='p-3 text-gray-700 underline font-medium'>{payment}</td>
//         <td className={`p-3 font-semibold ${balance === 0 ? 'text-emerald-600' : 'text-rose-600'} bg-${balance === 0 ? 'emerald' : 'rose'}-50 rounded-lg`}>
//           {balance?.toFixed(2) || '0.00'}
//         </td>

//         {/* Status Selection Box */}
//         <td className='p-3 hide-print'>

//           <select
//             value={status}
//             onChange={(e) => {
//               const selectedStatus = e.target.value;
//               console.log('🎯 Status selected:', selectedStatus);
//               handleStatusChange({ orderId: id, orderStatus: selectedStatus });
//             }}
//             className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 cursor-pointer
//               ${status === 'In Progress' ? 'border-amber-500 bg-amber-50 text-amber-700 focus:ring-amber-500' : ''}
//               ${status === 'Checked In' ? 'border-blue-500 bg-blue-50 text-blue-700 focus:ring-blue-500' : ''}
//               ${status === 'Cancel' ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500' : ''}
//               ${status === 'Checked Out' ? 'border-purple-500 bg-purple-50 text-purple-700 focus:ring-purple-500' : ''}
//               ${isOverdueCheckout && status === 'Checked In' ? 'border-red-600 bg-red-50 text-red-700 ring-red-500' : ''}
//               ${isOverdueCheckin && status === 'In Progress' ? 'border-green-600 bg-green-50 text-green-700 ring-green-500' : ''}
//             `}
//             disabled={orderUpdateMutation.isLoading || roomUpdateMutation.isLoading}
//           >
//             <option value="In Progress" className="bg-amber-50 text-amber-700">🟡 In Progress</option>
//             <option value="Checked In" className="bg-blue-50 text-blue-700">🔵 Checked In</option>
//             <option value="Cancel" className="bg-red-50 text-red-700">🔴 Cancel</option>
//             <option 
//               value="Checked Out" 
//               className={`bg-purple-50 ${hasBalance ? 'text-gray-400' : 'text-purple-700'}`}
//               disabled={hasBalance}
//             >
//               🟣 Checked Out {hasBalance && '(Balance Due)'}
//             </option>
//           </select>
          
//           {orderUpdateMutation.isLoading && (
//             <div className="mt-1 text-xs text-gray-500 text-center animate-pulse">
//               Updating order...
//             </div>
//           )}
          
//           {roomUpdateMutation.isLoading && (
//             <div className="mt-1 text-xs text-blue-500 text-center animate-pulse">
//               Updating room...
//             </div>
//           )}
          
//           {hasBalance && status === 'Checked In' && (
//             <div className="mt-1 text-xs text-center font-bold text-red-600">
//               ⚠️ Customer has balance: {Number(customerId?.balance || 0).toFixed(2)} SD
              
//             </div>
//           )}
          
//           {isOverdueCheckin && !orderUpdateMutation.isLoading && !roomUpdateMutation.isLoading && (
//             <div className="mt-1 text-xs text-center font-bold text-green-600 animate-pulse">
//               ⚠️ Please check in guest
//             </div>
//           )}
          
//           {isOverdueCheckout && !orderUpdateMutation.isLoading && !roomUpdateMutation.isLoading && (
//             <div className="mt-1 text-xs text-center font-bold text-red-600 animate-pulse">
//               ⚠️ Please check out guest
//             </div>
//           )}
          
//           {status && statusesThatUpdateRoom.includes(status) && !orderUpdateMutation.isLoading && !roomUpdateMutation.isLoading && !isOverdueCheckout && !isOverdueCheckin && (
//             <div className="mt-1 text-xs text-center font-medium"
//               style={{
//                 color: status === 'In Progress' ? '#b45309' :
//                        status === 'Checked In' ? '#2563eb' :
//                        status === 'Cancel' ? '#dc2626' :
//                        status === 'Checked Out' ? '#7e5bef' : '#6b7280'
//               }}
//             >
//               Room → {getRoomStatusLabel(status)}
//             </div>
//           )}

//         </td>

//         {/* Adding service */}
//         <td>
//           {status === "Checked In" && (
//             <div className='flex items-center gap-7'>
//               <button
//                 onClick={handleAddServices}
//                 // disabled={status === "Completed"}
//                 className={`text-blue-500 cursor-pointer text-sm font-semibold`}>
//                 <MdOutlineAddHome size={25} />
//               </button>
              
//             </div>
//           )}
//         </td>

//       </tr>
//     </>
//   );
// };

// export default InvoiceDetails;
