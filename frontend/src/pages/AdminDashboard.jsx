import React, { useState } from "react";
import "../styles/AdminDashboard.css";

function AdminDashboard() {

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  return (
    <div className="dashboard-container">

      {/* Hamburger Button */}
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>

      {/* Offscreen Sidebar */}
      <div className={`sidebar ${menuOpen ? "active" : ""}`}>

        <h2>Admin Panel</h2>

        <ul>
          <li><a href="/admin/dashboard">Dashboard</a></li>
          <li><a href="/admin/create-post">Create Post</a></li>
          <li><a href="/admin/posts">Manage Posts</a></li>
          <li className="logout" onClick={handleLogout}>Logout</li>
        </ul>

      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        <h1>Admin Dashboard</h1>
        <p>Welcome back Admin 👋</p>

        <div className="cards">

          <div className="card">
            <h3>Create Blog</h3>
            <a href="/admin/create-post">
              <button>Create</button>
            </a>
          </div>

          <div className="card">
            <h3>Manage Blogs</h3>
            <a href="/admin/posts">
              <button>Manage</button>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;