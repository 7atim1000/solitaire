import { useEffect, useState } from "react";
import { getUserData } from "../https";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Don't fetch user if we're on login page
      if (location.pathname === '/login') {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await getUserData();
        
        if (data?.success) {
          const {_id, name, email, phone, role } = data.data;
          dispatch(setUser({ _id, name, email, phone, role }));
        } else {
          throw new Error("No user data");
        }
      } catch (error) {
        document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        dispatch(removeUser());
        
        // Only navigate to auth if not on login page
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [dispatch, navigate, location.pathname]);

  return isLoading;
};

export default useLoadData;


// import { useEffect, useState } from "react";
// import { getUserData } from "../https";
// import { removeUser, setUser } from "../redux/slices/userSlice";
// import { useDispatch } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";

// const useLoadData = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchUser = async () => {
//       const isLoginPage = location.pathname === '/login';
//       const token = localStorage.getItem('authToken'); // Assuming you use localStorage for token

//       // If on login page and no token, skip fetching user data
//       if (isLoginPage && !token) {
//         console.log('On login page with no token - skipping user fetch');
//         setIsLoading(false);
//         return;
//       }

//       // If no token anywhere and not on login page, redirect to login
//       if (!token && !isLoginPage) {
//         console.log('No token found and not on login page - redirecting');
//         dispatch(removeUser());
//         document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//         navigate('/login');
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const { data } = await getUserData();
        
//         // Check if the response is actually successful
//         if (data?.success) {
//           const { _id, name, email, phone, role } = data.data;
//           dispatch(setUser({ _id, name, email, phone, role }));
          
//           // If on login page but user is authenticated, redirect to dashboard
//           if (isLoginPage) {
//             navigate('/');
//           }
//         } else {
//           throw new Error("No user data");
//         }
//       } catch (error) {
//         console.error('Error fetching user:', error);
        
//         // Clear any potential lingering cookies and tokens
//         document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//         localStorage.removeItem('authToken'); // Remove token if exists
        
//         dispatch(removeUser());
        
//         // Only redirect to login if not already there
//         if (!isLoginPage) {
//           navigate('/login');
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUser();
//   }, [dispatch, navigate, location.pathname]);

//   return isLoading;
// };

// export default useLoadData;






// import { useEffect, useState } from "react";
// import { getUserData } from "../https";
// import { removeUser, setUser } from "../redux/slices/userSlice";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";

// const useLoadData = () => {

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(true);

//  useEffect(() => {
//         const fetchUser = async () => {
//             try {
//                 const { data } = await getUserData();
                
//                 // Check if the response is actually successful
//                 if (data?.success) {
//                     const {_id, name, email, phone, role } = data.data;
//                     dispatch(setUser({ _id, name, email, phone, role }));
//                 } else {
//                     throw new Error("No user data");
//                 }
//             } catch (error) {
//                 // Clear any potential lingering cookies
//                 document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
//                 dispatch(removeUser());
//                 navigate('/auth');
//             } finally {
//                 setIsLoading(false);
//             }
//         }

//         fetchUser();
//     }, [dispatch, navigate]);

//     return isLoading;
    
// };


// export default useLoadData;