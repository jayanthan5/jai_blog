import React, { useState } from "react";
import "../styles/AdminLogin.css";
import axios from "axios";

function AdminLogin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/admin/login", {
        email: email,
        password: password
      });

      if (response.data === "Login Success") {
        setMessage("Login successful");
        window.location.href = "/admin/dashboard";
      } else {
        setMessage("Invalid email or password");
      }

    } catch (error) {
      setMessage("Server error");
      console.log(error);
    }
  };

  return (
    <div className="admin-login-container">

      <div className="login-box">

        <h2>Admin Login</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

        </form>

        <p className="message">{message}</p>

      </div>

    </div>
  );
}

export default AdminLogin;