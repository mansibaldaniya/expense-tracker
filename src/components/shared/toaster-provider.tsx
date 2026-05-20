"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      reverseOrder={false}
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: "16px",
          background: "rgba(2, 6, 23, 0.94)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 50px rgba(2, 6, 23, 0.45)",
        },
        success: {
          style: {
            borderColor: "rgba(52, 211, 153, 0.35)",
          },
          iconTheme: {
            primary: "#34d399",
            secondary: "#04111a",
          },
        },
        error: {
          style: {
            borderColor: "rgba(248, 113, 113, 0.35)",
          },
          iconTheme: {
            primary: "#f87171",
            secondary: "#1f0a0a",
          },
        },
      }}
    />
  );
}
