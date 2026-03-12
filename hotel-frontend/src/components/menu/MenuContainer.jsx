import React, { useState } from 'react'

import { getBgColor } from '../../utils'

import { GrRadialSelected } from 'react-icons/gr';
import { useDispatch } from 'react-redux';
import { BiSolidSelectMultiple } from "react-icons/bi";
import { updateRoom } from '../../redux/slices/customerSlice';

// Dinamic fetch
import { getAllFloors, getAllRooms  } from '../../https';
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { enqueueSnackbar } from 'notistack';

import RoomCart from './RoomCart';

const MenuContainer = () => {

    // fetch Floor from DB :-
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
    console.log(responseData); 


    // fetch Rooms
    const { data: resData, isError } = useQuery({
        queryKey: ['roms'],

        queryFn: async () => {
            return await getAllRooms();
        },
        placeholderData: keepPreviousData,
    });
    if (isError) {
        enqueueSnackbar('Something went wrong!', { variant: 'error' })
    }

    console.log(resData);

    const [selectedFloor, setSelectedFloor] = useState(`Floor 01`) 



    return (
        <>
            {/*Floors */}
            <div className='grid grid-cols-4 gap-4 px-10 py-4 w-[100%] shadow-xl'>
                {responseData?.data.data.map(floor => (

                    <div key={floor.floorName} className='flex flex-col items-center justify-between p-4 rounded-lg h-[70px] cursor-pointer shadow-lg/30'
                        style={{ backgroundColor: getBgColor() }}

                        // selected Item
                        onClick={() => setSelectedFloor(floor.floorName)}
                    >

                        <div className='flex items-center justify-between w-full shadow-lg/30 p-2'>

                            <h1 className='text-md font-semibold text-white'>{floor.floorName}</h1>
                            {selectedFloor === floor.floorName && <GrRadialSelected className='text-white' size={20} />}

                        </div>

                    </div>

                ))}

            </div>
            

            {/* <hr className ='border-emerald-50 border-t-2 mt-4' /> */}
            

            <div className='grid grid-cols-4 gap-4 px-10 py-4 w-[100%] rounded-lg overflow-y-scroll scrollbar-hidden h-[calc(100vh-15rem)] shadow-xl'>

                {resData?.data.data.filter(i => i.floor === selectedFloor).map((room) => {

                    return (
                        <RoomCart id={room._id} name={room.roomNo} price={room.price}  floor={room.floor} status ={room.status} seats ={room.seats} guests ={room.guests} />
                    );
                })
                }

            </div>
        </>
    )
}


export default MenuContainer 