import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../App";

const ProtectedRoutes = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
