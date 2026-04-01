import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/Adminlogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>

      <Routes>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/create-post" element={<CreatePost />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;