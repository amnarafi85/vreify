import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// Pages
import VerifyPage from "./pages/VerifyPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";

// Protected Route
import ProtectedRoute from "./pages/ProtectedRoute";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
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

        {/* Optional: catch-all 404 page */}
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
  </StrictMode>
);
