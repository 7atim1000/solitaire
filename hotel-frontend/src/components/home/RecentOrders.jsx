import React ,{useState, useEffect} from 'react'
import { FaSearch } from 'react-icons/fa'
import OrderList from './OrderList'
import { api } from '../../https';


const RecentOrders = () => {

// fetch 
    const [allInvoices, setAllInvoices] = useState([]);

    // filter by date
    const [frequency, setFrequency] = useState('1')
    const [orderStatus, setOrderStatus] = useState('all')
    const [shift, setShift] = useState('all')

    useEffect(() => {

        const getOrders = async () => {
            try {

                const res = await api.post('/api/order/fetch',
                    {
                        frequency,
                        orderStatus,
                        orderType: 'Invoice',
                        shift,
                        search: '', sort: '', 
                        page: 1, limit: 1000
                    });
                 

                setAllInvoices(res.data.data || res.data.orders || []);
                console.log(res.data)


            } catch (error) {
                console.log(error)
                message.error('Fetch Issue with transaction')

            }
        };

        getOrders();

    }, [frequency, orderStatus, shift]);

    
    return (
      <div className= 'px-8 mt-6 w-full '>

        <div className='bg-white w-full h-[calc(100vh-21rem)] rounded-lg shadow-lg/30'>
    
            <div className='flex justify-between items-center px-6 py-4'>
                <h1 className='text-emerald-700 text-sm font-semibold tracking-wide'>Recent Reservations</h1>
            </div>

            <div className='mt-4 px-6 h-[calc(100vh-15rem)] overflow-y-scroll scrollbar-hidden'>
                  {
                    allInvoices.length > 0 ? (
                        allInvoices.map((order, index) => (
                            <OrderList key ={order._id} order ={order} />
                        ))
                    ) : <p className ='text-sm font-medium text-[#be3e3f]'>No reservation available now!</p>
                }
     
            </div>
            
        </div>

      </div>
    )
}


export default RecentOrders