import { useContext } from "react";
import { Navigate } from "react-router-dom";
import CurrentUserContext from "../../contexts/CurrentUserContext";

function ProtectedRoute({ children }) {
  const { currentUser } = useContext(CurrentUserContext);
  const token = localStorage.getItem("jwt");

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
