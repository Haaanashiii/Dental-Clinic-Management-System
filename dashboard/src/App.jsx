import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// User imports
import UserDashboard from "./pages/UserFiling/UserDashboard";
import ManageProfilePage from "./pages/ManageProfilePage";

// Admin imports
import AdminDashboard from "./pages/AdminPannel/AdminDashboard";
import ManageDentist from "./pages/AdminPannel/ManageDentist";
import ManageStaff from "./pages/AdminPannel/ManageStaff";
import ManageRecord from "./pages/AdminPannel/ManageRecord";
import ManageAppointment from "./pages/AdminPannel/ManageAppointment";
//Main imports
import PorfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(""); 
  
useEffect(() => {
  const token = sessionStorage.getItem("authToken");
  const storedRole = sessionStorage.getItem("role");

  if (token && storedRole) {
    setUserRole(storedRole);
    setIsAuthenticated(true);
  } else {
    setIsAuthenticated(false);
  }
}, []);
  

  return (
    <BrowserRouter>
      <Routes>
        {/* User Panel */}
        <Route path="/login" element={<LoginPage
        setIsAuthenticated={setIsAuthenticated}
        setUserRole={setUserRole} 
       />} />
        <Route path="/SignUpPage" element={<SignUpPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}/>
        <Route path="/" element={isAuthenticated && userRole === "patient" ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route path="/ManageProfilePage" element={isAuthenticated ? (<ManageProfilePage /> ) : ( <Navigate to="/login" />)}/>
        <Route path="/Profile" element={isAuthenticated && userRole === "patient" ? <PorfilePage /> : <Navigate to="/login" />} />

        
        {/* Admin Panel */}
        <Route
          path="/AdminDashboard"
          element={
            isAuthenticated && (userRole === "staff" || userRole === "dentist")
              ? <AdminDashboard />
              : <Navigate to="/login" />
          }
        />
        <Route path="/ManageDentist" element={isAuthenticated && userRole === "dentist" ? <ManageDentist /> : <Navigate to="/login" />} />
        <Route
          path="/ManageStaff"
          element={
            isAuthenticated && ( userRole === "dentist")
              ? <ManageStaff />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/ManageRecord"
          element={
            isAuthenticated && (userRole === "staff" || userRole === "dentist")
              ? <ManageRecord />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/ManageAppointment"
          element={
            isAuthenticated && (userRole === "staff" || userRole === "dentist")
              ? <ManageAppointment />
              : <Navigate to="/login" />
          }
        />
        {/* Redirect to login if not authenticated */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
