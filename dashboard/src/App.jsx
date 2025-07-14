import React, { useEffect, useState, Suspense, lazy, useCallback, memo } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Lazy load all main pages
const ManageProfilePage = memo(lazy(() => import("./pages/ManageProfilePage")));
const UserRecords = memo(lazy(() => import("./pages/UserPannel/UserRecords")));
const LandingPage = memo(lazy(() => import("./pages/UserFiling/landingPage")));
const UserDashboard = memo(lazy(() => import("./pages/UserPannel/UserDashboard")));
const OtherPlatform = memo(lazy(() => import("./pages/UserPannel/OtherPlatform")));
const AdminDashboard = memo(lazy(() => import("./pages/AdminPannel/AdminDashboard")));
const ManageDentist = memo(lazy(() => import("./pages/AdminPannel/ManageDentist")));
const ManageStaff = memo(lazy(() => import("./pages/AdminPannel/ManageStaff")));
const ManageRecord = memo(lazy(() => import("./pages/AdminPannel/ManageRecord")));
const ManageAppointment = memo(lazy(() => import("./pages/AdminPannel/ManageAppointment")));
const ManageUser = memo(lazy(() => import("./pages/AdminPannel/ManageUser")));
const ViewAudit = memo(lazy(() => import("./pages/AdminPannel/ViewAudit")));
const LoginPage = memo(lazy(() => import("./pages/LoginPage")));
const SignUpPage = memo(lazy(() => import("./pages/SignUpPage")));

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
          isAuthenticated && (userRole === "dentist" || userRole === "staff") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageDentist />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageStaff" element={
          isAuthenticated && (userRole === "dentist" || userRole === "staff") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageStaff />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        
        <Route path="/ManageUser" element={
          isAuthenticated && (userRole === "dentist" || userRole === "staff") ? (
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

        <Route path="/OtherPlatform" element={
          isAuthenticated && (userRole === "patient" || userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <OtherPlatform />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
         <Route path="/AdminDashboard" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <AdminDashboard />
            </AnimatedContent>
          ) : <Navigate to="/login" />
        } />
        <Route path="/LandingPage" element={
            <AnimatedContent hasSidebar={true}>
              <LandingPage />
            </AnimatedContent>
        } />
          <Route path="/ViewAudit" element={
            <AnimatedContent hasSidebar={true}>
              <ViewAudit />
            </AnimatedContent>
        } />
        {/* Redirect to landing if not found */}
        <Route path="*" element={<Navigate to="/LandingPage" />} />
      </Routes>
    </AnimatePresence>
  );
}

// Add logout handler
function handleLogout(setIsAuthenticated, setUserRole) {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("email");
  sessionStorage.removeItem("username");
  setIsAuthenticated(false);
  setUserRole("");
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem("authToken"));
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem("role") || "");

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const storedRole = sessionStorage.getItem("role");
    if (token && storedRole) {
      setUserRole(storedRole);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setUserRole("");
    }
  }, []);

  // Memoized logout handler
  const memoizedLogout = useCallback(() => handleLogout(setIsAuthenticated, setUserRole), [setIsAuthenticated, setUserRole]);

  // Pass handleLogout to sidebar pages as needed
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{textAlign:'center',marginTop:40}}>Loading...</div>}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <UserDashboard onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/SignUpPage" element={<SignUpPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
          <Route path="/ManageProfilePage" element={isAuthenticated ? (<ManageProfilePage onLogout={memoizedLogout} /> ) : ( <Navigate to="/LandingPage" />)}/>
          <Route path="/Profile" element={isAuthenticated && userRole === "patient" ? <ManageProfilePage onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/UserRecords" element={isAuthenticated && userRole === "patient" ? <UserRecords onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/OtherPlatform" element={isAuthenticated ? <OtherPlatform onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/AdminDashboard" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <AdminDashboard onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/ManageDentist" element={isAuthenticated && (userRole === "dentist" || userRole === "staff") ? <ManageDentist onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/ManageStaff" element={isAuthenticated && (userRole === "dentist" || userRole === "staff") ? <ManageStaff onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/ManageUser" element={isAuthenticated && (userRole === "dentist" || userRole === "staff") ? <ManageUser onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/ManageRecord" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <ManageRecord onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/ManageAppointment" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <ManageAppointment onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="/ViewAudit" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <ViewAudit onLogout={memoizedLogout} /> : <Navigate to="/LandingPage" />} />
          <Route path="*" element={<Navigate to="/LandingPage" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
