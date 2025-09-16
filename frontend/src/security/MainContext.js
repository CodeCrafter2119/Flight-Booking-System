import { createContext, useContext, useState, useCallback } from "react";
import { ExecuteJwtAuthAPI, RegisterUser } from "../api/CallingApi";
import { urlAPI } from "../api/ApiClient";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        email: null,
        token: null,
        roles: [],
        userDetails: null // Add for additional user info
    });

    // Memoized login function
    const login = useCallback(async (email, password) => {
        try {
            const response = await ExecuteJwtAuthAPI(email, password);
            
            if (response.status === 200) {
                const JWToken = `Bearer ${response.data.token}`;
                const decodedToken = parseJwt(response.data.token);
                
                // Set axios interceptor
                urlAPI.interceptors.request.use((config) => {
                    config.headers.Authorization = JWToken;
                    return config;
                });

                setAuthState({
                    isAuthenticated: true,
                    email,
                    token: JWToken,
                    roles: decodedToken.roles || [],
                    userDetails: decodedToken.userDetails || null
                });

                return true;
            }
            logout();
            return false;
        } catch(error) {
            logout();
            console.error("Login error:", error);
            return false;
        }
    }, []);

    const register = useCallback(async (email, password) => {
        try {
            const response = await RegisterUser({ email, password });
            
            if (response.status === 201 || response.status === 200) {
                return await login(email, password);
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            throw error.response?.data || { message: 'Registration failed' };
        }
    }, [login]);

    const logout = useCallback(() => {
        // Clear axios interceptor
        urlAPI.interceptors.request.use((config) => {
            delete config.headers.Authorization;
            return config;
        });

        setAuthState({
            isAuthenticated: false,
            email: null,
            token: null,
            roles: [],
            userDetails: null
        });
    }, []);

    // Helper function to parse JWT
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(atob(base64));
        } catch (e) {
            console.error("JWT parsing error:", e);
            return {};
        }
    };

    return (
        <AuthContext.Provider value={{
            authenticated: authState.isAuthenticated,
            email: authState.email,
            token: authState.token,
            roles: authState.roles,
            user: authState.userDetails || { name: authState.email },
            login,
            logout,
            register
        }}>
            {children}
        </AuthContext.Provider>
    );
}