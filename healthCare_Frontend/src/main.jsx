import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "#fff",
          color: "#141814",
          borderRadius: "12px",
          border: "1px solid #e8dbc0",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        },
        success: { iconTheme: { primary: "#426542", secondary: "#fff" } },
        error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  </React.StrictMode>
);