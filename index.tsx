import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import DevErrorBoundary from "./components/DevErrorBoundary";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DevErrorBoundary>
      <App />
    </DevErrorBoundary>
  </React.StrictMode>
);

