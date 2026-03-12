import React, { useState } from 'react'
import { useDispatch } from 'react-redux' 
import { addItems } from '../../redux/slices/cartSlice';
import { updateRoom } from '../../redux/slices/customerSlice';
import { FaArrowAltCircleRight } from "react-icons/fa";
import { toast } from 'react-toastify'

const RoomCart = ({id, name, price, floor, status, seats, guests}) => {

    const [dayCount, setDayCount] = useState(0);
    const [itemId, setItemId] = useState();              // to solve conunting 

    const increment = (id) => {                          // to solve counting

        setItemId(id);                                   // to solve counting DAY
        setDayCount((prev) => prev + 1)
    }
    const decrement = (id) => {

        setItemId(id);
        if (dayCount <= 0) return;
        setDayCount((prev) => prev - 1);
    };



    const dispatch = useDispatch();

    const handleAddToCard = (item) => {  // item for cardInformation AND room for slice room

        if (dayCount === 0) {

           
            toast.warning('Please specify number of days first.');
            return ;

        }
            
        //  return

        const { name, price } = item;
        //slice room
        const room = { roomId: id, roomNo: name }

        const newObj = { id: new Date(), name: name, pricePerQuantity: price, quantity: dayCount, price: price * dayCount };
        setDayCount(0);

        dispatch(addItems(newObj));

        // slice room
        dispatch(updateRoom({ room }))



    };




    return (
        
        <div className='flex flex-col gap-2 p-2 rounded-lg h-[235px] cursor-pointer bg-white shadow-lg/30 mt-0 hover:bg-white border-t-3 border-emerald-600' >

            <div className='flex justify-between items-center mb-0'>

                <div className='flex flex-col gap-0 mb-0'>
                    <h1 className='text-md font-semibold text-emerald-700 flex justify-start items-start'>{name}</h1>
                    <p className='text-xs text-[#1a1a1a] mt-0'>{floor}</p>
                </div>

                <div className='mt-0'>
                    <button disabled={status === "Booked"} onClick={() => handleAddToCard({id, name, price, floor, status, seats, guests})}
                        className='cursor-pointer mt-0'>
                        <FaArrowAltCircleRight className='text-emerald-700 rounded-lg flex justify-end items-end ' size={35} />
                    </button>
                </div>

            </div>



            <div className='flex items-center justify-between px-0 w-full '>

                <p className='ml-0  text-emerald-700 text-lg font-semibold text-lg'><span className='text-xs text-[#1a1a1a]'>AED</span>{price.toFixed(2)}</p>

                <div className='flex gap-1 justify-between items-center flex-wrap bg-emerald-50 hover:bg-white px-4 py-3 rounded-lg mr-0 shadow-lg/30'>
                    <button
                        onClick={() => decrement(id)}
                        className='text-emerald-600 text-lg cursor-pointer'
                    >
                        &minus;
                    </button>
                    <span className={`${dayCount > 9 ? "text-lg" : "text-5xl"} text-emerald-700 flex flex-wrap gap-2  font-semibold`}>{id === itemId ? dayCount : "0"}<span className={`${dayCount > 9 ? "mt-2 text-xs" : "mt-5 text-xs"} text-[#1a1a1a]`}>days</span></span>

                    <button
                        onClick={() => increment(id)}
                        className='text-[#be3e3f] text-lg  cursor-pointer'
                    >
                        &#43;
                    </button>

                </div>
            </div>

            <div className='flex items-start justify-between '>
                <p className='ml-0  text-emerald-700 text-lg font-semibold text-lg'><span className='text-xs text-[#1a1a1a]'>Seats: </span>{seats}</p>
                <p className='ml-0  text-emerald-700 text-lg font-semibold text-lg'><span className='text-xs text-[#1a1a1a]'>Guest: </span>{guests}</p>
            </div>

            <div className='w-full items-center mt-3 shadow-lg'>
                <p className={`${status === 'Booked' ? "bg-red-300 text-[#be3e3f]" : "bg-emerald-300  text-emerald-700"}  text-sm font-semibold items-center py-3 rounded-lg shadow-lg flex justify-center items-center`}>{status}</p>
            </div>

   
        </div>
    );
};


export default RoomCart ;