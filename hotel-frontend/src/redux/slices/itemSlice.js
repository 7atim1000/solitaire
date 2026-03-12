import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    room: null,

    _id: "",
    roomNo: "",
}

const itemSlice = createSlice ({
    name: "item",

    initialState,

    reducers: {

        setItem: (state, action) => {
            const {_id, roomNo } = action.payload;

            state._id= _id;
            state.roomNo= roomNo;
        },

         updateItem: (state, action) => {
            //state.room = action.payload.room;
            state._id = action.payload._id
        }
    }
})


export const { setItem, updateItem } = itemSlice.actions;
export default itemSlice.reducer;