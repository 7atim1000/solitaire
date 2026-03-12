import React from 'react'
import { RxUpdate } from "react-icons/rx";
import { BiSolidCommentAdd } from "react-icons/bi";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { updateOrder, updateRoom } from '../../https';
import { useDispatch } from 'react-redux';

import { setOrder } from '../../redux/slices/orderSlice';
import { useNavigate } from 'react-router-dom';

const OrdersUpdate = ({id, name, phone, status, date, length, room, total, tax, totalWithTax}) => {
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Update orderStatus & room Status
    const handleStatusChange = ({orderId, orderStatus}) => {                          // orderId ?
        orderUpdateMutation.mutate({orderId, orderStatus});
    };

    
    const queryClient = useQueryClient();

    const orderUpdateMutation = useMutation({
        
        mutationFn: ({reqData, orderId, orderStatus}) => updateOrder({reqData, orderId, orderStatus}),
            onSuccess: (resData) => {                     // to set room update change data to resData
                const { data } = resData.data;           // to set room update added this const
        
                enqueueSnackbar('Order status updated successfully..', { variant: 'success' });
                queryClient.invalidateQueries(['orders']);
             
                
                
                //update roomStatus to Available
        
                const roomData = { roomId: data.room, status: "Available" }  // data.room from backend updateOrder controller
                    setTimeout(() => {
                    roomUpdateMutation.mutate(roomData);
                }, 1500)
        
                /////////////////////////////
                }, 

                onError: ()=> {
                    enqueueSnackbar('Failed to update order status!', { variant: 'error' });
                }

    })


// room update to Available 
        const roomUpdateMutation = useMutation({
        
            mutationFn: (reqData) => updateRoom(reqData),
            onSuccess: (resData) => {
                const { data } = resData.data;
                console.log(data);
        
            }, 
                onError : (error) => {
                    console.log(error)
                }
            });

// add services

const handleAddServices =() => {

    const _id = id;      
    //const {bills} = {total, total, total};
    const Length = length;
    const Room = room;
    const customerDetailsName = name;
    const customerDetailsPhone = phone;

    const billsTotal = total;
    const billsTax = tax;
    const billsTotalWithTax = totalWithTax;

    dispatch(setOrder({_id, Length, Room, customerDetailsName, customerDetailsPhone, billsTotal, billsTax, billsTotalWithTax}));
    navigate('/addservices')
};
    
   
    return(

        <div className ='container mx-10 bg-[#f5f5f5] p-2' >
            
        <div className ='overflow-x-auto' >
            <table className ='w-full text-left text-[#1f1f1f] bg-gray-200 rounded-lg shadow-lg' >
                    {/*
                        <thead className ='bg-gray-300 text-blue-700 rounded-lg shadow-lg'>
                          <tr>
                              <th className ='p-3 text-xs font-semibold'>Order ID</th>
                              <th className ='p-3 text-xs font-semibold'>Customer</th>
                              <th className ='p-3 text-xs font-semibold'>Status</th>
                              <th className ='p-3 text-xs font-semibold'>Time</th>
                              <th className ='p-3 text-xs font-semibold'>Services</th>
                              <th className ='p-3 text-xs font-semibold'>Room No</th>
                              <th className ='p-3 text-xs font-semibold'>Total</th>
                              <th className ='p-3 text-xs font-semibold'></th>
                              <th className ='p-3 text-xs font-semibold'></th>
                          </tr>
                        </thead>
                    */}
                        
                    
                        <tbody >
                         
                            <tr
                                className ='border-b border-gray-200 hover:bg-gray-200 cursor-pointer'
                            >
                              
                            <td className ='p-4 text-sm font-semibold'>#{id}</td>
                            <td className ='p-4 text-sm font-semibold'>{name}</td>
                              
                            <td className ='p-4 text-xs font-semibold'>
                                <select
                                      
                                    className ={`cursor-pointer h-7 shadow-lg rounded-lg  text-[#1a1a1a] border border-gray-200
                                    ${status === 'Complete' ? "text-green-700 bg-green-200" : "text-orange-700 bg-orange-200"}`}
  
                                    value ={status}
                                    onChange ={(e) => handleStatusChange({ orderId: id,  orderStatus: e.target.value })}
                                
                                >
  
                                    <option className ='text-[#1a1a1a] rounded-lg cursor-pointer' value ='In Progress'>In Progress</option>
                                    <option className ='text-[#1a1a1a] rounded-lg cursor-pointer' value ='Complete'>Complete</option>
  
                                  </select>
                              </td>
                           
                                <td className ='p-4 text-xs font-semibold'>{date}</td>
                                <td className ='p-4 text-xs font-semibold'>{length} Items</td>
                                <td className ='p-4 text-xs font-semibold'>{room}</td>
                                <td className ='p-4'><span className ='text-xs text-blue-700'>UAE</span> <span className ='text-md font-semibold'>{total.toFixed(2)}</span></td>
                            
                              
                                <td className ='p-4 text-center'>

                                    <button className ={`${status === 'Complete' ? "text-green-700 " : "text-red-700"} cursor-pointer text-sm font-semibold`}>
                                      <RxUpdate  size={22}/>
                                    </button>

                                </td>
  
                                <td className ='p-4 text-center'>

                                    <button
                                        onClick ={handleAddServices}
                                        disabled={status === "Booked"}
                                        className ={`${status === 'Complete' ? "text-gray-300" : "text-blue-700"}  cursor-pointer text-sm font-semibold`}>
                                        <BiSolidCommentAdd size ={22}/>
                                    </button>
  
                              </td>
                          </tr>
                          {/* ))} */}
                      </tbody>
  
                  </table>
  
              </div>    
          </div>
      
    )
}


export default OrdersUpdate;