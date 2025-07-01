import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// User imports
import ManageProfilePage from "./pages/ManageProfilePage";
import UserRecords from "./pages/UserPannel/UserRecords";
import LandingPage from "./pages/UserFiling/landingPage";
// Admin imports
import AdminDashboard from "./pages/AdminPannel/AdminDashboard";
import ManageDentist from "./pages/AdminPannel/ManageDentist";
import ManageStaff from "./pages/AdminPannel/ManageStaff";
import ManageRecord from "./pages/AdminPannel/ManageRecord";
import ManageAppointment from "./pages/AdminPannel/ManageAppointment";
import ManageUser from "./pages/AdminPannel/ManageUser";
//Main imports
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
        {/* Landing page always visible at root */}
        <Route path="/" element={<LandingPage />} />
        {/* Login and signup routes */}
        <Route path="/login" element={<LoginPage
        setIsAuthenticated={setIsAuthenticated}
        setUserRole={setUserRole} 
       />} />
        <Route path="/SignUpPage" element={<SignUpPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}/>
        {/* Authenticated routes */}
        <Route path="/ManageProfilePage" element={isAuthenticated ? (<ManageProfilePage /> ) : ( <Navigate to="/login" />)}/>
        <Route path="/Profile" element={isAuthenticated && userRole === "patient" ? <ManageProfilePage /> : <Navigate to="/login" />} />
        <Route path="/UserRecords" element={isAuthenticated && userRole === "patient" ? <UserRecords /> : <Navigate to="/login" />} />

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
            isAuthenticated && (userRole === "dentist")
              ? <ManageStaff />
              : <Navigate to="/login" />
          }
        />
        <Route
          path="/ManageUser"
          element={
            isAuthenticated && (userRole === "dentist")
              ? <ManageUser />
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
        {/* Redirect to landing if not found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
