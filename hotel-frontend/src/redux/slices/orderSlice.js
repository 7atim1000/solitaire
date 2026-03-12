import { createSlice } from '@reduxjs/toolkit'

const initialState = {           // Added
    _id: "",
    Length: "",
    Room: "",

    billsTotal: {},
    billsTax: {},
    billsTotalWithTax: {},

    billsPayed: {},
    billsBalance: {},

    customerDetailsName: {},
    customerDetailsPhone: {},
    cstId :"",
}

const orderSlice = createSlice({
    name: "order",

    initialState,

       reducers: {
        setOrder: (state, action) => {

            const {_id, Length, Room, billsTotal, billsTax, billsTotalWithTax, billsPayed, billsBalance, customerDetailsName,  customerDetailsPhone, cstId} = action.payload;

            state._id = _id ; 
            state.Length =Length ;
            state.Room = Room ;

            state.billsTotal = billsTotal ;
            state.billsTax = billsTax ;
            state.billsTotalWithTax = billsTotalWithTax ;

            state.billsPayed = billsPayed ;
            state.billsBalance = billsBalance ;

            state.customerDetailsName = customerDetailsName ;
            state.customerDetailsPhone = customerDetailsPhone ;
            state.cstId = cstId ;
        },
    }
});


export const { setOrder } = orderSlice.actions;
export default orderSlice.reducer;