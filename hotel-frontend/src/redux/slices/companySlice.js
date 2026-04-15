import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    companyId :"",
    companyName :'',
    email :'',
    contactNo :"",
    balance : "",  
}


const companySlice = createSlice ({
    name :"company",
    initialState,

    reducers : {

        setCompany: (state, action) => {
            const { companyId , companyName, email, contactNo, balance } = action.payload; 

            state.companyId = companyId ;
            state.companyName =  companyName;      
            state.email =  email;
            state.contactNo = contactNo;
            state.balance = balance;
         
        },

        removeCompany: (state) => {
            state.companyId = '',
            state.companyName = '',
            state.email = '',
            state.contactNo = '',
            state.balance = '';
        },

     
    }
})


export const { setCompany, removeCompany } = companySlice.actions;
export default companySlice.reducer;