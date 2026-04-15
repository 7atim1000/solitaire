import { configureStore } from '@reduxjs/toolkit';
import customerSlice from './slices/customerSlice';
import companySlice from './slices/companySlice';
import cartSlice from './slices/cartSlice';
import userSlice from './slices/userSlice';
import itemSlice from './slices/itemSlice';
import roomSlice from './slices/roomSlice';

import orderSlice from './slices/orderSlice';
import extraSlice from './slices/extraSlice';
import rateSlice from './slices/rateSlice';

const store = configureStore({
    reducer: {
        
        rate: rateSlice,
        room : roomSlice,
        customer: customerSlice,
        company: companySlice,
        cart: cartSlice,
        user: userSlice,
        item: itemSlice,

        order: orderSlice,
        extra: extraSlice,

    },

    devTools: import.meta.env.NODE_ENV !== "production",
});

export default store;