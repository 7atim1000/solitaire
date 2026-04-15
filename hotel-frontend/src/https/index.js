import axios from 'axios'


export const api = axios.create({
    
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});


export const rateService = {
  // Fetch all rates
  getRates: async () => {
    try {
      const response = await api.get('/api/rate');
      return response.data;
    } catch (error) {
      console.error('Error fetching rates:', error);
      throw error.response?.data || { message: 'Failed to fetch rates' };
    }
  },

  // Add new rate
  addRate: async (rateData) => {
    try {
      const response = await api.post('/api/rate', rateData);
      return response.data;
    } catch (error) {
      console.error('Error adding rate:', error);
      throw error.response?.data || { message: 'Failed to add rate' };
    }
  },

  // Update rate by ID
  updateRate: async (id, rateData) => {
    try {
      const response = await api.put(`/api/rate/${id}`, rateData);
      return response.data;
    } catch (error) {
      console.error('Error updating rate:', error);
      throw error.response?.data || { message: 'Failed to update rate' };
    }
  }
};


// api end points

// auth
export const login = (data) => api.post('/api/user/login', data);
export const register = (data) => api.post('/api/user/register', data);
export const getUserData = () => api.get('/api/user');
export const logout = () => api.post('/api/user/logout');

// floors
export const addFloor = (data) => api.post('/api/floor', data)
export const getAllFloors = () => api.get('/api/floor');

// rooms
export const addRoom = (data) => api.post('/api/room', data)
export const getAllRooms = () => api.get('/api/room');

export const updateRoom = ({roomId, ...roomData}) => api.put(`/api/room/${roomId}`, roomData);  // roomData explain in Bill.jsx
// export const updateRoom = ({ roomId, ...roomData }) => {
//   console.log('🔍 FRONTEND DEBUG - updateRoom called:', {
//     roomId,
//     roomIdType: typeof roomId,
//     roomIdValue: roomId,
//     roomData
//   });
  
//   if (!roomId) {
//     console.error('❌ FRONTEND ERROR: roomId is undefined or null!');
//     return Promise.reject(new Error('Room ID is required'));
//   }
  
//   // Check if roomId is a valid MongoDB ObjectId format (24 characters hex)
//   const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(roomId);
//   console.log('🔍 FRONTEND DEBUG - Is valid ObjectId format:', isValidObjectId);
  
//   if (!isValidObjectId) {
//     console.error('❌ FRONTEND ERROR: roomId is not a valid ObjectId format:', roomId);
//   }
  
//   const url = `/api/room/${roomId}`;
//   console.log('🔍 FRONTEND DEBUG - Making PUT request to:', url);
  
//   return api.put(url, roomData);
// };
//Change the endpoint to accept two parameters
//export const updateRoom = (roomId, roomData) => api.put(`/api/room/${roomId}`, roomData);


// Example of what updateRoom should look like
// export const updateRoom = async (roomData) => {
//     try {
//         const response = await axios.put(`/api/room/${roomData.roomId}`, roomData);
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

// Order Endpoint
export const addOrder = (data) => api.post('/api/order/', data);
// export const getOrders = () => api.get('/api/order');
export const updateOrder = ({orderId, orderStatus}) => api.put(`/api/order/${orderId}`, {orderStatus});   // STATUS

// export const extraOrder = ({orderId, ...extraData}) => api.post(`/api/order/${orderId}`, extraData);

// newArray :-
export const extraOrder = ({ orderId, cartData }) => api.post(`/api/order/${orderId}`, cartData);
// update Totals :- 

// API function
// API service Addjustment
export const updateTotals = ({orderId, ...totalData}) => api.put(`/api/order/${orderId}/totals`, totalData);  // serviceData explain in Bill.jsx
// export const updateTotals = (totalData) => 
//   api.put(`/api/order/${totalData.orderId}`, {
//   total: totalData.total,
//   totalWithTax: totalData.totalWithTax
// });

// Transaction Endpoint
export const addTransaction = (data) => api.post('/api/transactions/add-transaction', data);
// Expenses 
export const getExpenses = () => api.get('/api/expenses');
export const addExpense = (data) => api.post('/api/expenses', data);

// income 
export const getIncomes = () => api.get('/api/incomes');
export const addIncome = (data) => api.post('/api/incomes', data);

//  Customers Endpoint
export const addCustomer = (data) => api.post('/api/customers', data);
export const updateCustomer = ({customerId, ...balanceData}) => 
    api.put(`/api/customers/${customerId}`, balanceData);  // serviceData explain in Bill.jsx

//  Companies Endpoint
export const addCompany = (data) => api.post('/api/company', data);
export const updateCompany = ({companyId, ...balanceData}) => 
    api.put(`/api/company/${companyId}`, balanceData);  // serviceData explain in Bill.jsx


// Category Endpoint
export const getCategories = () => api.get('/api/category');
export const addCategory = (data) => api.post('/api/category', data);

// Services Endpoint
// export const getServices = () => api.get('/api/service');
// 1. Update the API function from GET to POST and send the parameters in the request body
export const getServices = (filters = {}) => api.post('/api/service/fetch', filters);

export const addService = (data) => api.post('/api/service', data);
export const updateService = ({serviceId, ...serviceData}) => api.put(`/api/service/${serviceId}`, serviceData);  // serviceData explain in Bill.jsx

// Unit Endpoint
export const getUnits = () => api.get('/api/unit');
export const addUnit = (data) => api.post('/api/unit', data);

