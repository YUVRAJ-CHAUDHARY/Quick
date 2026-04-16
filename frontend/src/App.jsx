import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import ClientDashboard from "./pages/client/ClientDashboard";
import RequestService from "./pages/client/RequestService";

import ProviderDashboard from "./pages/Provider/ProviderDashboard";
import NearbyRequests from "./pages/Provider/NearbyRequests";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminBookings from "./pages/Admin/AdminBookings";
import AdminServices from "./pages/Admin/AdminServices";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// Correct CSS file
import "./styles/global.css";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Client Routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute roles={["client"]}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/request"
        element={
          <ProtectedRoute roles={["client"]}>
            <RequestService />
          </ProtectedRoute>
        }
      />

      {/* Provider Routes */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute roles={["provider"]}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/requests"
        element={
          <ProtectedRoute roles={["provider"]}>
            <NearbyRequests />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminServices />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}