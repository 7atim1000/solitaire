import React, { useState, useEffect } from 'react'
import BackButton from '../components/shared/BackButton';
import { MdElevator, MdSearch, MdFilterList, MdMeetingRoom } from "react-icons/md";
import { FaBed, FaDoorOpen, FaCalendarAlt } from "react-icons/fa";

import { toast } from 'react-toastify'
import { api, getAllFloors } from '../https';

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import RoomsBillCard from '../components/menu/RoomsBillCard';

const RoomBill = () => {
    // fetch 
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [floor, setFloor] = useState('all');
    const [roomNo, setRoomNo] = useState('all');
    const [status, setStatus] = useState('all');

    const fetchRooms = async () => {
        try {
            const res = await api.post('/api/room/fetch', {
                roomNo,
                floor,
                status,
                search,
                sort,
                page: 1,
                limit: 1000
            });

            setList(res.data.data || res.data.rooms || []);

        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [floor, status, search]);

    // Fetch Floors
    const { data: responseData, IsError } = useQuery({
        queryKey: ['floors'],
        queryFn: async () => {
            return await getAllFloors();
        },
        placeholderData: keepPreviousData,
    });

    if (IsError) {
        enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }

    // Calculate statistics
    const totalRooms = list.length;
    const availableRooms = list.filter(room => room.status === 'available').length;
    const bookedRooms = list.filter(room => room.status === 'booked').length;
    const totalSeats = list.reduce((acc, room) => acc + (room.seats || 0), 0);
    const totalRevenue = list.reduce((acc, room) => acc + (room.price || 0), 0);

    return (
        <section className='w-full bg-gradient-to-br from-emerald-50 to-white min-h-screen'>
            {/* Main Header */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 py-4 lg:px-8 lg:py-6 bg-white shadow-lg rounded-b-2xl border-b border-emerald-100'>
                <div className='flex items-center gap-3'>
                    <BackButton />
                    <div className='flex flex-col'>
                        <h1 className='text-2xl lg:text-3xl font-bold text-emerald-900'>Rooms Management</h1>
                        <p className='text-sm text-emerald-600 mt-1'>Manage and monitor hotel room occupancy</p>
                    </div>
                </div>

                {/* Statistics */}
                <div className='flex flex-wrap gap-3 mt-4 lg:mt-0'>
                    <div className='flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200'>
                        <MdMeetingRoom className='w-4 h-4 text-emerald-600' />
                        <span className='text-sm font-medium text-emerald-700'>{totalRooms} Rooms</span>
                    </div>
                    <div className='flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200'>
                        <FaBed className='w-4 h-4 text-emerald-600' />
                        <span className='text-sm font-medium text-emerald-700'>{totalSeats} Seats</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='px-4 lg:px-8 mt-6'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                    {/* Left Sidebar - Floors */}
                    <div className='lg:col-span-1'>
                        <div className='bg-white rounded-xl shadow-lg border border-emerald-100 p-5'>
                            <h3 className='text-lg font-bold text-emerald-900 mb-6 flex items-center gap-2'>
                                <MdElevator className='w-5 h-5 text-emerald-600' />
                                Floor Selection
                            </h3>

                            <div className='space-y-2'>
                                <button
                                    onClick={() => setFloor('all')}
                                    className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-between
                                        ${floor === 'all' 
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                >
                                    <span>All Floors</span>
                                    <span className='px-2 py-1 text-xs bg-white/30 rounded-full'>
                                        {totalRooms}
                                    </span>
                                </button>

                                {responseData?.data.data.map(floorItem => (
                                    <button
                                        key={floorItem._id}
                                        onClick={() => setFloor(floorItem.floorName)}
                                        className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-between
                                            ${floor === floorItem.floorName
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            }`}
                                    >
                                        <span className='flex items-center gap-2'>
                                            <MdElevator className='w-4 h-4' />
                                            {floorItem.floorName}
                                        </span>
                                        <span className='px-2 py-1 text-xs bg-white/30 rounded-full'>
                                            {list.filter(room => room.floor === floorItem.floorName).length}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className='mt-6 pt-6 border-t border-emerald-100'>
                                <h4 className='text-sm font-semibold text-emerald-800 mb-3'>Quick Stats</h4>
                                <div className='space-y-2'>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-emerald-600'>Available</span>
                                        <span className='font-bold text-emerald-700'>{availableRooms}</span>
                                    </div>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-amber-600'>Booked</span>
                                        <span className='font-bold text-amber-700'>{bookedRooms}</span>
                                    </div>
                                    <div className='flex justify-between items-center text-sm'>
                                        <span className='text-emerald-600'>Occupancy</span>
                                        <span className='font-bold text-emerald-700'>
                                            {totalRooms > 0 ? ((bookedRooms / totalRooms) * 100).toFixed(0) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Rooms */}
                    <div className='lg:col-span-3'>
                        <div className='bg-white rounded-xl shadow-lg border border-emerald-100 overflow-hidden'>
                            {/* Filters and Search */}
                            <div className='p-2 border-b border-emerald-100 bg-emerald-50/50'>
                                <div className='flex flex-col md:flex-row gap-4'>
                                    {/* Search */}
                                    <div className='flex-1'>
                                        <div className='relative'>
                                            <input
                                                type="text"
                                                placeholder="Search rooms by number, type..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className='w-full px-4 py-3 pl-12 bg-white border border-emerald-200 rounded-lg text-emerald-800 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200'
                                            />
                                            <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                                                <MdSearch className='w-5 h-5 text-emerald-500' />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Filters */}
                                    <div className='flex flex-wrap gap-2'>
                                        <button
                                            onClick={() => setStatus('all')}
                                            className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium
                                                ${status === 'all'
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                                }`}
                                        >
                                            All Rooms
                                        </button>
                                        <button
                                            onClick={() => setStatus('available')}
                                            className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium flex items-center gap-2
                                                ${status === 'Available'
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                                                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                                }`}
                                        >
                                            <FaDoorOpen className='w-3 h-3' />
                                            Available
                                        </button>
                                        <button
                                            onClick={() => setStatus('booked')}
                                            className={`px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium flex items-center gap-2
                                                ${status === 'Booked'
                                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                                                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                                                }`}
                                        >
                                            <FaCalendarAlt className='w-3 h-3' />
                                            Booked
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Rooms Grid */}
                            <div className='p-5'>
                                {list.length === 0 ? (
                                    <div className='text-center py-12'>
                                        <div className='mb-4 inline-flex p-4 bg-emerald-100 rounded-full'>
                                            <MdMeetingRoom className='w-12 h-12 text-emerald-400' />
                                        </div>
                                        <h3 className='text-lg font-semibold text-gray-700 mb-2'>No Rooms Found</h3>
                                        <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                                            {search ? 'No rooms match your search criteria.' : 'No rooms available for the selected filters.'}
                                        </p>
                                        <div className='flex gap-3 justify-center'>
                                            <button
                                                onClick={() => { setSearch(''); setStatus('all'); setFloor('all'); }}
                                                className='px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition duration-200 cursor-pointer text-sm font-medium'
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'>
                                        {list.map((room) => (
                                            <RoomsBillCard
                                                key={room._id}
                                                id={room._id}
                                                floor={room.floor}
                                                roomNo={room.roomNo}
                                                seats={room.seats}
                                                priceOne={room.priceOne}
                                                priceTow={room.priceTow}
                                                status={room.status}
                                                image={room.image}
                                                bookedBy={room.bookedBy}
                                                dateReturn={room.dateReturn}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Summary Footer */}
                                {list.length > 0 && (
                                    <div className='mt-6 pt-6 border-t border-emerald-100'>
                                        <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                                            <div className='text-sm text-emerald-600'>
                                                Showing <span className='font-bold'>{list.length}</span> rooms
                                                {floor !== 'all' && ` on floor ${floor}`}
                                                {status !== 'all' && ` (${status})`}
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <div className='text-sm text-emerald-700'>
                                                    <span className='font-bold'>{availableRooms}</span> available
                                                </div>
                                                <div className='text-sm text-amber-700'>
                                                    <span className='font-bold'>{bookedRooms}</span> booked
                                                </div>
                                                <div className='text-sm text-emerald-700'>
                                                    <span className='font-bold'>{totalSeats}</span> total seats
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RoomBill;

// import React, { useState, useEffect } from 'react'
// import BackButton from '../components/shared/BackButton';
// import { MdElevator } from "react-icons/md";
// import { toast } from 'react-toastify'
// import { api, getAllFloors } from '../https';
// import { keepPreviousData, useQuery } from '@tanstack/react-query'
// import RoomsBillCard from '../components/menu/RoomsBillCard';

// const CarBill = () => {

//     // fetch 
//     const [list, setList] = useState([]);

//     const [search, setSearch] = useState(''); // Match backend parameter name
//     const [sort, setSort] = useState('-createdAt');

//     const [floor, setFloor] = useState('all');
//     const [roomNo, setRoomNo] = useState('all');
//     const [status, setStatus] = useState('all')

//     const fetchRooms = async () => {
//         try {
//             // Request all records by setting a high limit and ignoring other parameters
//             const res = await api.post('/api/room/fetch', {

//                 roomNo,      // Ignore filtering by employee name
//                 floor,         // with filtering by department
//                 status,
//                 //search: '',     // Empty search string No searching
//                 search,
//                 sort,       // No sorting

//                 page: 1,          // First page
//                 limit: 1000       // Large number to get all records
//             });

//             // Use whichever property your backend returns the data in
//             setList(res.data.data || res.data.rooms || []);

//         } catch (error) {
//             console.error('Error fetching rooms:', error);
//             toast.error(error.message);
//         }
//     };

//     useEffect(() => {
//         fetchRooms();
//     }, [floor, status, search]);


//     // Fetch Floors
//     const { data: responseData, IsError } = useQuery({

//         queryKey: ['floors'],
//         queryFn: async () => {
//             return await getAllFloors();
//         },

//         placeholderData: keepPreviousData,
//     });


//     if (IsError) {
//         enqueueSnackbar('Something went wrong!', { variant: 'error' });
//     }

//     console.log(responseData);


//     return (
//         <section className='flex gap-3 bg-[#f5f5f5] shadow-xl h-[calc(100vh)] overflow-y-scroll scrollbar-hidden'>

//             <div className='flex-[1] h-[calc(100vh)] overflow-y-scroll scrollbar-hidden bg-white'>

//                 <div className='overflow-y-auto scrollbar-hidden flex-1'>
//                     {responseData?.data.data.map(floorItem => (
//                         <div key={floorItem._id} className='flex items-center justify-between gap-1 px-0 mx-1 mb-2 bg-white shadow-xl'>
//                             <button
//                                 className={`mx-auto items-center w-[90%] p-3 cursor-pointer text-[#1a1a1a] 
//                                     rounded-sm font-semibold text-sm flex items-center gap-2
//                                     ${floor === floorItem.floorName ? 'text-emerald-600 border-b-2 border-emerald-600' : 'bg-white'}`}
//                                 onClick={() => setFloor(floorItem.floorName)}
//                             >
//                                 {floorItem.floorName}
//                             </button>
//                             <MdElevator className='text-emerald-600 w-8 h-8 p-1' />
//                         </div>
//                     ))}
//                 </div>


//             </div>


//             <div className='flex-[7] h-[calc(100vh)] overflow-y-scroll scrollbar-hidden bg-white'>

//                 <div className='flex items-center justify-between px-8 py-3 shadow-xl'>
//                     <div className='flex items-center'>
//                         <BackButton />
//                         <h1 className='font-semibold text-md text-[#1a1a1a]'>Rooms</h1>
//                     </div>

//                     <div className='flex items-center justify-around gap-4'>
//                         <button onClick={() => setStatus('all')}
//                             className={`shadow-lg/30 text-sm cursor-pointer px-3 py-1 rounded-sm ${status === 'all' ? 'bg-[#0ea5e9] text-[#f5f5f5]' : ' bg-[#f5f5f5] text-[#0ea5e9]'} }`}
//                         >
//                             All
//                         </button>
//                         <button onClick={() => setStatus('Available')}
//                             className={`shadow-lg/30 text-sm cursor-pointer px-3 py-1 rounded-sm ${status === 'Available' ? 'bg-[#0ea5e9] text-[#f5f5f5]' : ' bg-[#f5f5f5] text-[#0ea5e9]'}`}
//                         >
//                             Available
//                         </button>
//                         <button onClick={() => setStatus('Booked')}
//                             className={`shadow-lg/30 text-sm cursor-pointer px-3 py-1 rounded-sm 
//                                 ${status === 'Booked' ? 'bg-[#0ea5e9] text-[#f5f5f5]' : ' bg-[#f5f5f5] text-[#0ea5e9]'}`}
//                         >
//                             Booked
//                         </button>

//                     </div>

//                 </div>

//                 <div className='mt-1 flex w-full items-start justify-start flex-wrap gap-2 px-2 py-1 bg-white overflow-y-scroll scrollbar-hidden  h-[calc(100vh-9rem)]'>
//                     {
//                         list.map((room, index) => (
//                             <RoomsBillCard
//                                 id={room._id} floor={room.floor}
//                                 roomNo={room.roomNo} seats={room.seats}
//                                 price={room.price}  status={room.status} 
//                                 image={room.image}
//                                 bookedBy={room.bookedBy}
//                                 dateReturn={room.dateReturn}
//                             />
//                         ))}

//                 </div>

//             </div>

//         </section>

//     );
// };


// export default CarBill