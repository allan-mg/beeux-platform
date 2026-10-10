import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import ServiceDetails from "./pages/ServiceDetails/ServiceDetails";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Checkout from "./pages/Checkout/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess/CheckoutSuccess";
import ContractDetails from "./pages/ContractDetails/ContractDetails";
import CurrentUserContext from "./contexts/CurrentUserContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import BriefDetails from "./pages/BriefDetails/BriefDetails";

import { getCurrentUser } from "./api/authApi";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(() =>
    Boolean(localStorage.getItem("jwt")),
  );

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      return;
    }

    getCurrentUser(token)
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        localStorage.removeItem("jwt");
        setCurrentUser(null);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, []);

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthLoading,
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/services/:slug" element={<ServiceDetails />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout/:orderId"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <ProtectedRoute>
              <CheckoutSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:orderId"
          element={
            <ProtectedRoute>
              <ContractDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/briefs/:orderId"
          element={
            <ProtectedRoute>
              <BriefDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </CurrentUserContext.Provider>
  );
}

export default App;
