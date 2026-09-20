// src/Components/MapData/map.jsx
// Legacy route — redirects to the full GIS dashboard.
// The real map is now at /dashboard (IntegratedDashboard.jsx)
// and the personalized state map is at /map (UpdatedMap.jsx).

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MapPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);
  return null;
}