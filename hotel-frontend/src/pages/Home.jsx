import React ,{useEffect, useState} from 'react'
import BottomNav from '../components/shared/BottomNav';
import Greetings from '../components/home/Greetings';
import { BsCashCoin } from 'react-icons/bs';
import { GrInProgress } from 'react-icons/gr';
import MiniCard from '../components/home/MiniCard';
import RecentOrders from '../components/home/RecentOrders';
import PopularRooms from '../components/home/PopularRooms';
import { api } from '../https';

const Home = () => {
    // fetch Orders 
    const [allInvoices, setAllInvoices] = useState([]);
    const [inProgressInvoices, setInProgressInvoices] = useState([]);

    // filters
    const [frequency, setFrequency] = useState('1');
    const [orderStatus, setOrderStatus] = useState('all');
    const [shift, setShift] = useState('all');
    const [orderType, setOrderType] = useState('all');

    const [inProgressStatus, setInProgressStatus] = useState('In Progress');


        const getInvoices = async () => {
            try {

                const res = await api.post('/api/order/fetch',
                    {
                        frequency,
                        orderType: 'Invoice',
                        orderStatus,
                        search: '', sort: '',
                        shift, 
                        page: 1, limit: 1000
                    });

                
                setAllInvoices(res.data.data || res.data.orders || []);
                console.log(res.data)

            } catch (error) {
                console.log(error)
            }
        };

       useEffect(() => {
             getInvoices();
         }, [frequency, orderStatus, shift]);


        const getInProgress = async () => {
            try {

                const res = await api.post('/api/order/fetch',
                    {
                        frequency, 
                        orderType: 'Invoice',
                        orderStatus: inProgressStatus,
                        search: '', sort: '',
                        shift, 
                        page: 1, limit: 1000
                    });

                
                setInProgressInvoices(res.data.data || res.data.orders || []);
                console.log(res.data)

            } catch (error) {
                console.log(error)
            }
        };

       useEffect(() => {
             getInProgress();
         }, [frequency, orderStatus, shift]);


    return (
        
        <section className ='bg-[#f5f5f5] h-[calc(100vh-5rem)] overflow-hidden flex gap-3 shadow-xl shadow'>
        
            {/*left div*/}
            <div className ='flex-[3] bg-white px-8'>
                
                {/*Greetings*/}
                <Greetings />
                
                {/*MiniCard --- Earning & inProgress */}
                <div className='flex items-center w-full gap-3 px-8 mt-8'>
                    {allInvoices.length === 0
                        ? (<p className='ml-5 mt-2 text-xs flex items-start justify-start'></p>)
                        : allInvoices.map((invoice, index) => (
                            <></>
                        ))}

                    {inProgressInvoices.length === 0
                        ? (<p className='ml-5 mt-2 text-xs text-orange-700 flex items-start justify-start'></p>)
                        : inProgressInvoices.map((invo, index) => (
                            <></>
                        ))}

                    <MiniCard title ='Total Earning'  icon ={<BsCashCoin />}     number ={allInvoices.reduce((acc, invoice) => acc + invoice.bills.totalWithTax, 0).toFixed(2)} />
                    <MiniCard title ='In Progress'    icon ={<GrInProgress />}   number ={inProgressInvoices.reduce((acc, invo) => acc + invo.bills.totalWithTax, 0).toFixed(2)} />

                </div>

                {/*Recent Orders*/}
                <RecentOrders/>
            </div>


            {/*Right div*/}
            <div className ='flex-[1] bg-white'>
                <PopularRooms />
            </div>

            <BottomNav />

        </section>
    )
}

export default Home;