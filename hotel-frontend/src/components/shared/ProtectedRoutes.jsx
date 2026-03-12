import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutes = ({ children }) => {
  const { isAuth } = useSelector(state => state.user);
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;