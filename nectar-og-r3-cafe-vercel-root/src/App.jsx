import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerDashboard from "./pages/OwnerDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/menu" replace />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/owner/login" element={<OwnerLogin />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
}
