import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import RaiseTicket from "./pages/RaiseTicket";
import CustomerDashboard from "./pages/CustomerDashboard";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/executive/login" element={<CustomerLogin isExecutive />} />

        <Route path="/dashboard" element={
          <PrivateRoute role="customer">
            <CustomerDashboard />
          </PrivateRoute>
        } />

        <Route path="/raise-ticket" element={
          <PrivateRoute role="customer">
            <RaiseTicket />
          </PrivateRoute>
        } />

        <Route path="/executive/dashboard" element={
          <PrivateRoute role="executive">
            <ExecutiveDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}