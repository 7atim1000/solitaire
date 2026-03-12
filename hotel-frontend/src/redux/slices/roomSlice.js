import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    _id: null,
    roomNo: '',
    floor: '',
    seats: 0,
    priceOne: 0,
    priceTow: 0,
    selectedPrice: 0,
    selectedPriceType: 'priceOne',
    image: ''
}

const roomSlice = createSlice({
    name :"room",

    initialState,

    reducers :{
        
        // setRoom :(state, action) => {
        //     const { _id, roomNo , seats, floor, priceOne, priceTow, selectedPrice, image } = action.payload ;
            
        //     state._id = _id;
        //     state.roomNo = roomNo ;
        //     state.seats = seats ;
        //     state.floor = floor;
        //     state.price = price ;
            
        //     state.image = image ;
        // },
        setRoom: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },

        removeRoom: (state) => {
            return initialState;
        },

        removeRoom :(state) => {
            state._id = "";
            state.roomNo = "" ;
            state.seats = "";
            state.floor = "";
            state.price = "" ;
        
            state.image = "" ;
            
        },
        
       
    }
});

export const { setRoom, removeRoom } = roomSlice.actions ;
export default roomSlice.reducer;
