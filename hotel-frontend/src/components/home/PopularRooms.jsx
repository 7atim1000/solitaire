import React , {useState, useEffect}  from 'react'
import { api } from '../../https';

const  PopularRooms = () => {

    const [list, setList] = useState([]);

    const [search, setSearch] = useState(''); // Match backend parameter name
    const [sort, setSort] = useState('-createdAt');

    const [floor, setFloor] = useState('all');
    const [roomNo, setRoomNo] = useState('all');
    const [status, setStatus] = useState('all')

    const fetchRooms = async () => {
        try {
            const response = await api.post('/api/room/fetch',
                {
                    roomNo,
                    status,
                    floor,

                    search,
                    sort,

                    page: 1,
                    limit: 1000,
                }
            );
            // Use whichever property your backend returns the data in
            setList(response.data.data || response.data.rooms || []);

        } catch (error) {
            console.error('Error fetching rooms menu.', error);
          
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []); 


    return (
       <div className='' >
            <div className='bg-white w-full rounded-lg items-center h-[calc(100vh-5rem)] overflow-y-scroll scrollbar-hidden shadow-xl'>
                
                <div className='flex justify-between items-center px-6 py-2 w-[100%] shadow-xl'>
                    <h1 className='text-[#1a1a1a] text-md font-semibold tracking-wide'>Popular Rooms Menu</h1>
                    {/* <a className='text-[#025cca] text-sm font-semibold'>View all</a> */}
                </div>
                
                <div className= ''>
                    {
                        list.map((room) => {
                            return (
                                <div key={room._id} className= 'flex items-center gap-4 bg-white rounded-[15px] px-2 py-1 mx-2 mt-2 shadow-lg/30 cursor-pointer hover:bg-[#f5f5f5]'>
                                    {/* <h1 className='text-[#02ca3a] font-bold text-sm mr-4' >{dish._id < 10 ? `0${dish._id}` : dish._id}</h1> */}
                                    <img src={room.image} alt={room.name} className='w-[45px] h-[45px] rounded-full 
                                    border-b-3 border-emerald-600' />
                                    <div>
                                        <h1 className='text-[#1a1a1a] font-semibold mt-1 tracking-wide'>{room.roomNo}</h1>
                                        <p className='text-[#F6B100] text-lg font-semibold mt-1'>
                                            <span className='text-sky-500 text-sm'>Offer : </span>
                                            {room.price}
                                            <span className ='text-xs font-normal text-sky-500'> AED</span>
                                            
                                            </p>
                                    </div>

                                </div>
                            )
                        })
                    }
                </div>
                

            </div>
       </div>
    )
}

export default PopularRooms ;