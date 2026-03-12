import { createSlice } from '@reduxjs/toolkit';


const initialState = {
  
    rateId :"",
    rateAmount : "",
   
}


const rateSlice = createSlice ({
    name :"rate",
    initialState,

    reducers : {

        setRate: (state, action) => {
            const { rateId , rateAmount } = action.payload; 

            state.rateId = rateId ;
            state.rateAmount = rateAmount;
         
        },


       
    }
})


export const { setRate } = rateSlice.actions;
export default rateSlice.reducer;