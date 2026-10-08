import { useContext } from "react";
import { Navigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function ProtectedRoute({ children }) {
  const { currentUser, isAuthLoading } = useContext(CurrentUserContext);
  const token = localStorage.getItem("jwt");

  if (isAuthLoading) {
    return <p>Cargando sesión...</p>;
  }

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
