import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { HelmetProvider } from "react-helmet-async"
import { checkCacheVersion } from "./utils/cacheManager"

// Check cache version on app start
checkCacheVersion()

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)

