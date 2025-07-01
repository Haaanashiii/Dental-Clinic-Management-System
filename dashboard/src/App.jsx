import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// User imports
import UserDashboard from "./pages/UserFiling/UserDashboard";
import ManageProfilePage from "./pages/ManageProfilePage";
import UserRecords from "./pages/UserPannel/UserRecords";
import OtherPlatform from "./pages/UserPannel/OtherPlatform";
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

// Content area animation variants (not full page)
const contentVariants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 }
};

const contentTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

// Wrapper for pages that have sidebars (only animate content area)
const AnimatedContent = ({ children, hasSidebar = false }) => {
  if (!hasSidebar) {
    // Full page animation for login, signup, etc.
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </motion.div>
    );
  }
  
  // For pages with sidebar, don't animate the whole page
  // The individual page components should handle content animation
  return children;
};

// Routes component that uses location for AnimatePresence
function AnimatedRoutes({ isAuthenticated, userRole, setIsAuthenticated, setUserRole }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing page - full page animation */}
        <Route path="/" element={
          <AnimatedContent hasSidebar={false}>
            <UserDashboard />
          </AnimatedContent>
        } />
        
        {/* Login and signup routes - full page animation */}
        <Route path="/login" element={
          <AnimatedContent hasSidebar={false}>
            <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          </AnimatedContent>
        } />
        
        <Route path="/SignUpPage" element={
          <AnimatedContent hasSidebar={false}>
            <SignUpPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
          </AnimatedContent>
        } />
        
        {/* Authenticated routes - pages with sidebars */}
        <Route path="/ManageProfilePage" element={
          isAuthenticated ? (
            <AnimatedContent hasSidebar={true}>
              <ManageProfilePage />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/Profile" element={
          isAuthenticated && userRole === "patient" ? (
            <AnimatedContent hasSidebar={true}>
              <ManageProfilePage />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/UserRecords" element={
          isAuthenticated && userRole === "patient" ? (
            <AnimatedContent hasSidebar={true}>
              <UserRecords />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />

        {/* Admin Panel - pages with sidebars */}
        <Route path="/AdminDashboard" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <AdminDashboard />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageDentist" element={
          isAuthenticated && userRole === "dentist" ? (
            <AnimatedContent hasSidebar={true}>
              <ManageDentist />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageStaff" element={
          isAuthenticated && (userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageStaff />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageUser" element={
          isAuthenticated && (userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageUser />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageRecord" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageRecord />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageAppointment" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageAppointment />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        {/* Redirect to landing if not found */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

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
      <AnimatedRoutes 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        setIsAuthenticated={setIsAuthenticated}
        setUserRole={setUserRole} 
       />} />
        <Route path="/SignUpPage" element={<SignUpPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}/>
        {/* Authenticated routes */}
        <Route path="/ManageProfilePage" element={isAuthenticated ? (<ManageProfilePage /> ) : ( <Navigate to="/login" />)}/>
        <Route path="/Profile" element={isAuthenticated && userRole === "patient" ? <ManageProfilePage /> : <Navigate to="/login" />} />
        <Route path="/UserRecords" element={isAuthenticated && userRole === "patient" ? <UserRecords /> : <Navigate to="/login" />} />
        <Route path="/OtherPlatform" element={isAuthenticated && userRole === "patient" ? <OtherPlatform /> : <Navigate to="/login" />} />

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
