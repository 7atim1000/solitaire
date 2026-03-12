import { createSlice } from '@reduxjs/toolkit'

const initialState = [];

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItems: (state, action) => {
            // Check if item already exists in cart
            const existingItemIndex = state.findIndex(
                item => item.id === action.payload.id && item.priceType === action.payload.priceType
            );
            
            if (existingItemIndex !== -1) {
                // Update existing item
                state[existingItemIndex] = {
                    ...state[existingItemIndex],
                    quantity: action.payload.quantity,
                    qty: action.payload.qty,
                    price: action.payload.price,
                    dateBooking: action.payload.dateBooking,
                    dateReturn: action.payload.dateReturn,
                    bookingDays: action.payload.bookingDays
                };
            } else {
                // Add new item
                state.push(action.payload);
            }
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id !== action.payload);
        },

        removeAllItems: (state) => {
            return [];
        },

        updateItemQuantity: (state, action) => {
            const { id, priceType, quantity } = action.payload;
            const itemIndex = state.findIndex(
                item => item.id === id && item.priceType === priceType
            );
            
            if (itemIndex !== -1) {
                const item = state[itemIndex];
                state[itemIndex] = {
                    ...item,
                    quantity: quantity,
                    qty: quantity,
                    price: item.pricePerQuantity * quantity
                };
            }
        },

        updateItemDates: (state, action) => {
            const { id, priceType, dateBooking, dateReturn, bookingDays } = action.payload;
            const itemIndex = state.findIndex(
                item => item.id === id && item.priceType === priceType
            );
            
            if (itemIndex !== -1) {
                const item = state[itemIndex];
                state[itemIndex] = {
                    ...item,
                    dateBooking,
                    dateReturn,
                    bookingDays,
                    price: item.pricePerQuantity * bookingDays
                };
            }
        }
    }
});

// Selectors
export const getTotalPrice = (state) => 
    state.cart.reduce((total, item) => total + item.price, 0);

export const getItemCount = (state) => state.cart.length;

export const getItemByRoomAndPriceType = (state, roomId, priceType) => 
    state.cart.find(item => item.id === roomId && item.priceType === priceType);

export const getCartItemsGroupedByRoom = (state) => {
    const grouped = {};
    state.cart.forEach(item => {
        if (!grouped[item.id]) {
            grouped[item.id] = [];
        }
        grouped[item.id].push(item);
    });
    return grouped;
};

export const { 
    addItems, 
    removeItem, 
    removeAllItems,
    updateItemQuantity,
    updateItemDates 
} = cartSlice.actions;

export default cartSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit'
// const initialState =   [];

// const cartSlice = createSlice({
//     name :'cart',

//     initialState, 

//     reducers : {          

//         addItems : (state, action) => {
//             state.push(action.payload);
//         },

//         removeItem : (state, action) => {
//             return state.filter(item => item.id != action.payload);
//         },

//         removeAllItems :(state) => {
//             return [];
//         }
//     }
// });
// export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);  // price from MenuContainer.jsx (price: price * dayCount)

// export const { addItems, removeItem, removeAllItems } = cartSlice.actions;
// export default cartSlice.reducer;