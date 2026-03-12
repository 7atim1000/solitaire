import { createSlice } from '@reduxjs/toolkit';

//const initialState = {_id: "", Name: "", Price: ""}
const initialState = 
    {
        id: "",
        name: "",
    }
;

const extraSlice = createSlice ({
   name :"extra"  ,

    initialState,
    reducers: {

        addExtra : (state, action) => {
            state.insertMany(action.payload);
        },

        //setExtra: (state, action) => {

        //    const {_id, Name, Price } = action.payload;
        //    state._id= _id;
        //    state.Name= Name;
        //    state.Price= Price;
          
        //},
    }
})


export const { addExtra } = extraSlice.actions;
export default extraSlice.reducer;