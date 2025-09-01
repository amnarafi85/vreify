import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";

// Protected Route
import ProtectedRoute from "./pages/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public verification page */}
        <Route path="/" element={<VerifyPage />} />

        {/* Admin login page */}
        <Route path="/admin" element={<LoginPage />} />

        {/* Protected dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Optional: catch-all route for 404 */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>404 - Page Not Found</h2>
              <p>
                <a href="/">Go back to Home</a>
              </p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
