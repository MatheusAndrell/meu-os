import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from './store'
import { RouterProvider } from './router'
import { ToastProvider } from './ui'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider>
      <StoreProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </StoreProvider>
    </RouterProvider>
  </React.StrictMode>
)
