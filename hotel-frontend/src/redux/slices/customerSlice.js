import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orderId: "",
    customerId: "",
    customerName: '',
    companies: false,
    personal: false,
    company: '',
    companyId: '',
    companyBalance: 0,  // Add this field for company balance
    Idnumber: '',
    email: '',
    contactNo: "",
    balance: "",
    guests: 0,
    RoomNo: "",
    room: null
}

const customerSlice = createSlice({
    name: "customer",
    initialState,

    reducers: {
        setCustomer: (state, action) => {
            const { 
                customerId, 
                customerName, 
                companies,
                personal,
                company,
                companyId,
                companyBalance,  // Add companyBalance
                Idnumber, 
                email, 
                contactNo, 
                balance, 
                guests 
            } = action.payload;

            state.orderId = `${Date.now()}`
            state.customerId = customerId;
            state.customerName = customerName;
            state.companies = companies || false;
            state.personal = personal || false;
            state.company = company || '';
            state.companyId = companyId || '';
            state.companyBalance = companyBalance || 0;  // Store company balance
            state.Idnumber = Idnumber;
            state.email = email;
            state.contactNo = contactNo;
            state.balance = balance;
            state.guests = guests;
        },

        removeCustomer: (state) => {
            state.orderId = "";
            state.customerId = '';
            state.customerName = '';
            state.companies = false;
            state.personal = false;
            state.company = '';
            state.companyId = '';
            state.companyBalance = 0;  // Reset company balance
            state.email = '';
            state.contactNo = '';
            state.balance = '';
            state.guests = 0;
            state.room = null;
        },

        updateRoom: (state, action) => {
            state.room = action.payload.room;
        }
    }
})

export const { setCustomer, removeCustomer, updateRoom } = customerSlice.actions;
export default customerSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//     orderId: "",
//     customerId: "",
//     customerName: '',
//     companies: false,      // Add companies boolean field
//     personal: false,       // Add personal boolean field
//     company: '',           // Company name as string
//     companyId: '',         // Company ID if needed
//     companyBalance: 0,  // Add this field for company balance
//     Idnumber: '',
//     email: '',
//     contactNo: "",
//     balance: "",
//     guests: 0,
//     RoomNo: "",
//     room: null
// }

// const customerSlice = createSlice({
//     name: "customer",
//     initialState,

//     reducers: {
//         setCustomer: (state, action) => {
//             const { 
//                 customerId, 
//                 customerName, 
//                 companies,      // Add companies
//                 personal,       // Add personal
//                 company,        // Company name
//                 companyId,      // Company ID (optional)
//                 Idnumber, 
//                 email, 
//                 contactNo, 
//                 balance, 
//                 guests 
//             } = action.payload;

//             state.orderId = `${Date.now()}`
//             state.customerId = customerId;
//             state.customerName = customerName;
//             state.companies = companies || false;
//             state.personal = personal || false;
//             state.company = company || '';
//             state.companyId = companyId || '';
//             state.Idnumber = Idnumber;
//             state.email = email;
//             state.contactNo = contactNo;
//             state.balance = balance;
//             state.guests = guests;
//         },

//         removeCustomer: (state) => {
//             state.orderId = "";
//             state.customerId = '';
//             state.customerName = '';
//             state.companies = false;
//             state.personal = false;
//             state.company = '';
//             state.companyId = '';
//             state.email = '';
//             state.contactNo = '';
//             state.balance = '';
//             state.guests = 0;
//             state.room = null;
//         },

//         updateRoom: (state, action) => {
//             state.room = action.payload.room;
//         }
//     }
// })

// export const { setCustomer, removeCustomer, updateRoom } = customerSlice.actions;
// export default customerSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//     orderId: "",
//     customerId :"",
   
//     customerName :'',
//     company: '',
//     Idnumber :'',
//     email :'',
//     contactNo :"",
//     balance : "",
//     guests: 0,
    
//     RoomNo: "",
//     //roomId: ""
    
//     room: null

   
// }


// const customerSlice = createSlice ({
//     name :"customer",
//     initialState,

//     reducers : {

//         setCustomer: (state, action) => {
//             const { customerId , customerName, company, Idnumber, email, contactNo, balance, guests } = action.payload; 

//             state.orderId = `${Date.now()}`
//             state.customerId = customerId ;
            
//             state.customerName =  customerName;
//             state.company =  company;
//             state.Idnumber = Idnumber ;
            
//             state.email =  email;
//             state.contactNo = contactNo;
//             state.balance = balance;
//             state.guests = guests;
         
//         },

//         removeCustomer: (state) => {
//             state.customerId = '',
            
//             state.customerName = '',
//             state.company = '',
//             state.email = '',
//             state.contactNo = '',
//             state.balance = '',
//             state.guests = 0,
         
//             state.room = null;
//         },

//         updateRoom: (state, action) => {
//             state.room = action.payload.room;
//         }
//     }
// })


// export const { setCustomer, removeCustomer, updateRoom } = customerSlice.actions;
// export default customerSlice.reducer;