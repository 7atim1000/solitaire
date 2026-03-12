import React, {useState} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addItems } from '../../redux/slices/cartSlice';
import { updateRoom } from '../../redux/slices/customerSlice';
import { BiSolidMessageRoundedAdd } from "react-icons/bi";
import { addExtra } from '../../redux/slices/extraSlice';
import { toast } from 'react-toastify'

const ExtraItemsCard = ({id, name, price, cat, qty, unit}) => {

// Increment Decrement (Counting)
  
    const [qtCount, setqtCount] = useState(0);
    const [itemId, setItemId] = useState();              // to solve conunting 
        
    const increment = (id) => {                          // to solve counting
        setItemId(id);                                   // to solve counting DAY
        setqtCount((prev) => prev + 1)
    };

    const decrement = (id) => {
        setItemId(id);
        if (qtCount <= 0) return;
        setqtCount((prev) => prev - 1); 
    };

/////////////////////////////////////

const dispatch = useDispatch();

// send service or item to cardbill
const handleAddToCard = (item) => {  // item for cardInformation AND room for slice room
    
    if (qtCount === 0)  {

        toast.warning('Please specify number of services first.');
        return ;

    }
            



    const {name, price } = item; 

    //slice room
    const room = {roomId: id, roomNo: name}

    const newObj = { id: id, name: name, pricePerQuantity: price, quantity: qtCount, price: price * qtCount };
    setqtCount(0);

    dispatch(addItems(newObj));

    dispatch(updateRoom({room}))

   
    };
    
    const orderData = useSelector(state => state.order);

    return (
        <div className='flex flex-col justify-start gap-2 p-2 rounded-lg h-[180px] w-[180px] cursor-pointer bg-white 
        shadow-lg/30 mt-0 hover:bg-emerald-50 border-b-3 border-emerald-600' >

            <div className='flex justify-between items-center mb-0'>

                <div className ='flex flex-col gap-0 mb-0'>
                    <h1 className ='text-sm font-semibold text-[#1a1a1a] flex justify-start items-start'>{name}</h1>
                    <p className ='text-xs font-normal text-emerald-600 mt-0 underline'>{cat}</p>
                </div>

                <div className ='mt-0'>
                    <button onClick ={() =>  handleAddToCard({id, name, price, cat, qty, unit})}
                    className ='cursor-pointer mt-0'>
                    <BiSolidMessageRoundedAdd className ='text-emerald-600  rounded-lg flex justify-end items-end ' 
                    size={25}/></button>
                </div>
            </div>

            <div className ='flex flex-col gap-4 w-full '>
                
                <div className='flex items-center gap-1'>
                    <p className='text-emerald-600 text-lg font-semibold text-md'>{price}</p>
                    <span className='text-[#1a1a1a] text-xs font-normal'>AED</span>
                </div>
                
                                
                <div className ='flex gap-3 items-center justify-between bg-white px-4 py-3 rounded-lg mr-0
                shadow-lg/30 '>
                    <button
                        onClick ={()=>  decrement(id)}
                        className ='text-emerald-600 text-lg cursor-pointer p-1 w-6  hover:bg-[#0ea5e9]/30 rounded-full'
                    >
                        &minus;
                    </button>
                    <span className ={`${qtCount > 9 ? "text-lg" : "text-4xl"} text-emerald-600 flex flex-wrap gap-2  font-semibold`}>{id === itemId ? qtCount : "0"}<span className ={`${qtCount > 9 ? "mt-2  text-xs" : "mt-5 text-xs"} text-[#1f1f1f]`}>{unit}</span></span>
                    
                    <button
                        onClick ={()=> increment(id)}
                        className ='text-emerald-600 text-lg cursor-pointer p-1 w-6  hover:bg-[#0ea5e9]/30 rounded-full'
                        >
                        &#43;
                    </button>

                </div>

            </div>

              
            {/* <div className ='flex items-start justify-between '>
                <p className ='ml-0  text-green-700 text-lg font-semibold text-lg'><span className ='text-xs text-red-700'>Seats: </span>{seats}</p>
                <p className ='mr-5  text-green-700 text-lg font-semibold text-lg'><span className ='text-xs text-red-700'>Guests: </span>{guests}</p>
            </div>
        
            <div className ='w-full items-center mt-3 shadow-lg'>
                <p className ={`${status === 'Booked'? "bg-red-300 text-red-700" : "bg-blue-300  text-blue-700"}
                text-sm font-semibold items-center py-1 rounded-lg shadow-lg flex justify-center items-center`}>{status}</p>
            </div> */}


        </div>
    );
};


export default ExtraItemsCard;