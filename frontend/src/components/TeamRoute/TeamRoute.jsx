import { Navigate } from "react-router-dom";
import { useContext } from "react";

import CurrentUserContext from "../../contexts/CurrentUserContext";

function TeamRoute({ children }) {
  const { currentUser, isAuthLoading } = useContext(CurrentUserContext);

  if (isAuthLoading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!["employee", "admin"].includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default TeamRoute;
