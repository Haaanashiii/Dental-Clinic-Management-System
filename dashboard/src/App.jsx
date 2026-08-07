import React, { useEffect, useState, Suspense, lazy, useCallback, memo, createContext } from "react";
// Global loading context
export const LoadingContext = createContext({ setLoading: () => {}, loading: false });
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
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/Profile" element={
          isAuthenticated && userRole === "patient" ? (
            <AnimatedContent hasSidebar={true}>
              <ManageProfilePage />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/UserRecords" element={
          isAuthenticated && userRole === "patient" ? (
            <AnimatedContent hasSidebar={true}>
              <UserRecords />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />

        {/* Admin Panel - pages with sidebars */}
        <Route path="/AdminDashboard" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <AdminDashboard />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/ManageDentist" element={
          isAuthenticated && (userRole === "dentist" || userRole === "staff") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageDentist />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/ManageStaff" element={
          isAuthenticated && (userRole === "dentist" || userRole === "staff") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageStaff />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/ManageUser" element={
          isAuthenticated && (userRole === "dentist" || userRole === "staff") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageUser />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/ManageRecord" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageRecord />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        
        <Route path="/ManageAppointment" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ManageAppointment />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />

        <Route path="/OtherPlatform" element={
          isAuthenticated && (userRole === "patient" || userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <OtherPlatform />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
         <Route path="/AdminDashboard" element={
          isAuthenticated && (userRole === "staff" || userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <AdminDashboard />
            </AnimatedContent>
          ) : <Navigate to="/LandingPage" />
        } />
        <Route path="/LandingPage" element={
            <AnimatedContent hasSidebar={true}>
              <LandingPage />
            </AnimatedContent>
        } />
          <Route path="/ViewAudit" element={
             isAuthenticated && ( userRole === "dentist") ? (
            <AnimatedContent hasSidebar={true}>
              <ViewAudit />
            </AnimatedContent>
            ) : <Navigate to="/LandingPage" />
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
  const [loading, setLoading] = useState(false);

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

  // Global loading overlay
  const LoadingOverlay = () => (
    loading ? (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(255,255,255,0.6)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'all',
        transition: 'opacity 0.2s',
      }}>
        <div style={{
          background: '#fff',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: 12}}>
            <circle cx="24" cy="24" r="20" stroke="#1c444d" strokeWidth="4" opacity="0.2" />
            <path d="M44 24c0-11.046-8.954-20-20-20" stroke="#1c444d" strokeWidth="4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite" />
            </path>
          </svg>
          <span style={{color:'#1c444d',fontWeight:'bold',fontSize:18}}>Loading...</span>
        </div>
      </div>
    ) : null
  );

  // Pass handleLogout and loading context to sidebar pages as needed
  return (
    <LoadingContext.Provider value={{ setLoading, loading }}>
      <BrowserRouter>
        <Suspense fallback={<div style={{textAlign:'center',marginTop:40}}>Loading...</div>}>
          <LoadingOverlay />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/LandingPage" element={<Navigate to="/" replace />} />
            <Route path="/sign-in" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
            <Route path="/login" element={<Navigate to="/sign-in" replace />} />
            <Route path="/SignUpPage" element={<SignUpPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
            <Route path="/dashboard" element={isAuthenticated && userRole === "patient" ? <UserDashboard onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ManageProfilePage" element={isAuthenticated ? (<ManageProfilePage onLogout={memoizedLogout} /> ) : ( <Navigate to="/sign-in" />)}/>
            <Route path="/Profile" element={isAuthenticated && userRole === "patient" ? <ManageProfilePage onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/UserRecords" element={isAuthenticated && userRole === "patient" ? <UserRecords onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/OtherPlatform" element={isAuthenticated ? <OtherPlatform onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/AdminDashboard" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <AdminDashboard onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ManageDentist" element={isAuthenticated && (userRole === "dentist" || userRole === "staff") ? <ManageDentist onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ManageStaff" element={isAuthenticated && (userRole === "dentist" || userRole === "staff") ? <ManageStaff onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ManageUser" element={isAuthenticated && (userRole === "dentist" || userRole === "staff") ? <ManageUser onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ManageRecord" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <ManageRecord onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ManageAppointment" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <ManageAppointment onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="/ViewAudit" element={isAuthenticated && (userRole === "staff" || userRole === "dentist") ? <ViewAudit onLogout={memoizedLogout} /> : <Navigate to="/sign-in" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </LoadingContext.Provider>
  );
}

export default App;
