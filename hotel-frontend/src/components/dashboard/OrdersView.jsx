import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react'
import OrdersUpdate from './OrdersUpdate';
import { enqueueSnackbar } from 'notistack';


const OrdersView = () => {
    


    return(
        <>
          <div className =''>
                
                    {/* { resData?.data.data.map((order) =>{  

                   return (   //flex flex-col items-center justify-between p-4 rounded-lg h-[70px] cursor-pointer
                    <OrdersUpdate  id={order._id} name={order.customerDetails.name} phone={order.customerDetails.phone}  status={order.orderStatus} date={order.orderDate} length ={order.items.length} room={order.room.roomNo} total={order.bills.total} tax={order.bills.tax} totalWithTax={order.bills.totalWithTax}  />
                    )
                    })
                } */}
            </div>
        </>
    );
};



export default OrdersView;