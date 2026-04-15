import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
  Home, Reservation, Rooms, Menu, Dashboard, AddServices, 
  Floors, Customers, Companies, Invoices, Categories, Services, Units, RoomBill, 
  Transactions, Incomes, Expense, InvDetails, TaxesReport,
} from './pages';

import LoginPage from './pages/LoginPage';
import MainLayout from './pages/Layout';
import FullScreenLoader from './components/shared/FullScreenLoader';
import useLoadData from './hooks/useLoadData';
import ProtectedRoutes from './components/shared/ProtectedRoutes';
import RatesPage from './pages/RatesPage';


// Create a wrapper component that uses useLoadData INSIDE Router
const AppContent = () => {
  const isLoading = useLoadData(); // Now this is INSIDE Router context
  const { isAuth } = useSelector(state => state.user);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/" replace />} />
      
      {/* Protected Routes with Layout */}
       <Route path="/" element={
        <ProtectedRoutes isAuth={isAuth}>
          <MainLayout />
        </ProtectedRoutes>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rate" element={<RatesPage />} />
        <Route path="reservation" element={<Reservation />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="floors" element={<Floors />} />
        <Route path="roomsbill" element={<RoomBill />} />
        <Route path="menu" element={<Menu />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="expense" element={<Expense />} />
        <Route path="income" element={<Incomes />} />
        <Route path="guests" element={<Customers />} />
        <Route path="companies" element={<Companies />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invdetails/:id" element={<InvDetails />} />
        <Route path="addservices" element={<AddServices />} />
        <Route path="services" element={<Categories />} />
        <Route path="items" element={<Services />} />
        <Route path="categories" element={<Categories />} />
        
        <Route path="addservices" element={<AddServices />} />
        <Route path="services" element={<Categories />} />
        <Route path="items" element={<Services />} />
        <Route path="units" element={<Units />} />
        <Route path="tax" element={<TaxesReport />} />

      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;




// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { 
//   Home, Reservation, Rooms, Menu, Dashboard, AddServices, 
//   Floors, Customers, Invoices, Categories, Services, Units, RoomBill, 
//   Transactions
// } from './pages';
// import LoginPage from './pages/LoginPage';
// import MainLayout from './pages/Layout'; // Renamed to avoid conflict
// import FullScreenLoader from './components/shared/FullScreenLoader';
// import useLoadData from './hooks/useLoadData';
// import ProtectedRoutes from './components/shared/ProtectedRoutes'; // Create this component

// function App() {
//   const isLoading = useLoadData();
//   const { isAuth } = useSelector(state => state.user);

//   // Show loader while loading data
//   if (isLoading) {
//     return <FullScreenLoader />;
//   }

//   return (
//     <>
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
      
//       <Router>
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/" replace />} />
          
//           {/* Protected Routes with Layout */}
//           <Route path="/" element={
//             <ProtectedRoutes isAuth={isAuth}>
//               <MainLayout />
//             </ProtectedRoutes>
//           }>
//             {/* Index/Home route */}
//             <Route index element={<Home />} />
            
//             {/* Dashboard routes */}
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="reservation" element={<Reservation />} />
//             <Route path="rooms" element={<Rooms />} />
//             <Route path="floors" element={<Floors />} />
//             <Route path="roomsbill" element={<RoomBill />} />
//             <Route path="menu" element={<Menu />} />
//             <Route path="transactions" element={<Transactions />} />
//             <Route path="customers" element={<Customers />} />
//             <Route path="invoices" element={<Invoices />} />
//             <Route path="addservices" element={<AddServices />} />
//             <Route path="services" element={<Categories />} />
//             <Route path="items" element={<Services />} />
//             <Route path="units" element={<Units />} />
//           </Route>

//           {/* Catch-all route */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </Router>
//     </>
//   );
// }

// export default App;







// import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// import { Home, Auth, Reservation, Rooms, Menu, Dashboard, AddServices, 
//         Floors, Customers, Invoices, Categories, Services, Units, RoomBill, 
//         Transactions} from './pages';

// import Headers from './components/shared/Headers';
// import { useSelector } from 'react-redux';
// import useLoadData from './hooks/useLoadData';
// import FullScreenLoader from './components/shared/FullScreenLoader';

// import { ToastContainer } from 'react-toastify';
// import LoginPage from './pages/LoginPage';


// function Layout() {
//   // logout issus
//   useLoadData();

//   // Loading
 
  
//   // to hide header :-
//   const location = useLocation();

//   const isLoading = useLoadData();
//   // const hideHeaderRoutes = ['/auth', '/menu', '/rooms', '/room', '/roomsbill', '/addservices', '/invoices', 
//   //   '/transactions', '/customers', '/services' , '/items', '/units', '/floors', '/dashboard', '/reservation'
//   // ];

//   // to prevent browser with out login
//   const { isAuth } = useSelector(state => state.user);

//   //Loading
//   if (isLoading) return <FullScreenLoader />

//   return (
//     <>
//         {/* {!hideHeaderRoutes.includes(location.pathname) &&  <Headers/>} */}

//         <ToastContainer />

//         <Routes>
//              <Route path ='/' element = {

//               <ProtectedRoutes>
//                 <Home />
//               </ProtectedRoutes>

//               } /> 

           
//             <Route path ='/auth' element = {isAuth ? <Navigate to ='/' /> :  <LoginPage />} /> 
              
            
//             <Route path ='/reservation' element = {
//              <ProtectedRoutes>
//                 <Reservation />
//               </ProtectedRoutes>
//             }
//           />
//             <Route path ='/rooms' element ={
//               <ProtectedRoutes>
//                 <Rooms />
//               </ProtectedRoutes>
//             }/>

//         <Route path='/floors' element={
//           <ProtectedRoutes>
//             <Floors />
//           </ProtectedRoutes>
//         } />


//         <Route path='/roomsbill' element={
//           <ProtectedRoutes>
//             <RoomBill />
//           </ProtectedRoutes>
//         } />

//         <Route path='/menu' element={
//           <ProtectedRoutes>
//             <Menu />
//           </ProtectedRoutes>
//         } />

//         <Route path='/transactions' element={
//           <ProtectedRoutes>
//             <Transactions />
//           </ProtectedRoutes>
//         } />

        
//         <Route path='customers' element={
//           <ProtectedRoutes>
//             <Customers />
//           </ProtectedRoutes>
//         } />

//         <Route path='/invoices' element={
//           <ProtectedRoutes>
//             <Invoices />
//           </ProtectedRoutes>
//         } />

//         <Route path='/dashboard' element={
//           <ProtectedRoutes>
//             <Dashboard />
//           </ProtectedRoutes>
//         } />

//         <Route path='/addservices' element={
//           <ProtectedRoutes>
//             <AddServices />
//           </ProtectedRoutes>
//         } />



//         <Route path='/services' element={
//           <ProtectedRoutes>
//             <Categories />
//           </ProtectedRoutes>
//         } />

//         <Route path='/items' element={
//           <ProtectedRoutes>
//             <Services />
//           </ProtectedRoutes>
//         } />

//         <Route path='/units' element={
//           <ProtectedRoutes>
//             <Units />
//           </ProtectedRoutes>
//         } />

    

//         <Route path='*' element ={<div>NOT FOUND</div>}/>

//         </Routes>
   
//     </>
//   );
// }


// // to prevent browser with out login
// function ProtectedRoutes({children}) {

//    const { isAuth } = useSelector(state => state.user);
//    if (!isAuth) {
//       return <Navigate to='/auth'/>
//    }

//    return children;
// }


// function App() {
//     return (
//       <Router>
//           <Layout />
//       </Router>
//     );
// };

// export default App
