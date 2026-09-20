import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage          from "./LandingPage";
import AuthPage             from "./Components/Auth/AuthPage";
import IntegratedDashboard  from "./Components/MapData/IntegratedDashboard";
import UpdatedMap           from "./Components/MapData/UpdatedMap";

export default function App() {
  return (
    <BrowserRouter>
      {/* Global toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#11202b",
            color: "#fff",
            fontSize: "12px",
            borderRadius: "10px",
          },
        }}
      />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        {/* Full GIS portal — post-login */}
        <Route path="/dashboard" element={<IntegratedDashboard />} />
        {/* Personalized state/district map — accessible from dashboard sidebar */}
        <Route path="/map"       element={<UpdatedMap />} />
      </Routes>
    </BrowserRouter>
  );
}
