import React from 'react';

export const Auth0ProviderWrapper = ({ children }) => {
    // In a real app, wrap with <Auth0Provider domain="..." clientId="...">
    return (
        <div className="auth-wrapper">
            {children}
        </div>
    );
};
