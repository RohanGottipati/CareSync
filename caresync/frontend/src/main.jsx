import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Auth0ProviderWrapper } from './auth0-provider.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Auth0ProviderWrapper>
            <App />
        </Auth0ProviderWrapper>
    </StrictMode>,
)
