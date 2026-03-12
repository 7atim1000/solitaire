import { createSlice } from '@reduxjs/toolkit';


const initialState = {
    orderId: "",
    customerId :"",

    customerName :'',
    Idnumber :'',
    email :'',
    contactNo :"",
    balance : "",
    guests: 0,
    
    RoomNo: "",
    //roomId: ""
    
    room: null

   
}


const customerSlice = createSlice ({
    name :"customer",
    initialState,

    reducers : {

        setCustomer: (state, action) => {
            const { customerId , customerName, Idnumber, email, contactNo, balance, guests } = action.payload; 

            state.orderId = `${Date.now()}`
            state.customerId = customerId ;
            
            state.customerName =  customerName;
            state.Idnumber = Idnumber ;
            
            state.email =  email;
            state.contactNo = contactNo;
            state.balance = balance;
            state.guests = guests;
         
        },

        removeCustomer: (state) => {
            state.customerId = '',
            
            state.customerName = '',
            state.email = '',
            state.contactNo = '',
            state.balance = '',
            state.guests = 0,
         
            state.room = null;
        },

        updateRoom: (state, action) => {
            state.room = action.payload.room;
        }
    }
})


export const { setCustomer, removeCustomer, updateRoom } = customerSlice.actions;
export default customerSlice.reducer;