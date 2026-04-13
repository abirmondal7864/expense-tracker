import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      <p>Logged in as: {user?.email ?? "Unknown"}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

