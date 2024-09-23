import React, { createContext, useContext, useState, useEffect } from 'react';
const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Function to handle user login
    const login = (user) => {
        setIsAuthenticated(true);
        setUser(user);
    };

    const adminLogin = (user) => {
        setIsAuthenticated(true);
        setUser(user);
    }

    // Function to handle user sign-up
    const signUp = async (userData) => {
        try {
            const response = await fetch(`http://localhost:3000/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);  // Notify user account creation
            } else {
                console.error('Sign-up failed');
            }
        } catch (error) {
            console.error('Sign up error: ', error);
        }
    };

    const adminSignUp = async(userData) => {
        try{
            const response = await fetch(`http://localhost:3000/admin-sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            if (response.ok){
                const data = await response.json();
                alert(data.message);
            }else{
                console.error('Sign up failed')
            }
        }catch(error){
            console.error('Sign up error: ', error);
        }
    };

    // Function to check user session from backend
    const checkUserSession = async () => {
        try {
            const response = await fetch(`http://localhost:3000/protected`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUser(data);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Session check error: ', error);
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    // Function to handle user logout
    const logout = async () => {
        try {
            const response = await fetch(`http://localhost:3000/logout`, {
                method: 'POST',
                credentials: 'include',  // Ensures that cookies are included in the request
            });

            if (response.ok) {
                setUser(null); 
                setIsAuthenticated(false); // Clear user state on successful logout
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error: ', error);
        }
    };

    useEffect(() => {
        checkUserSession();  // Check session when the component mounts
    }, []);

    return (
        <AuthenticationContext.Provider value={{ user, login, signUp, logout, isAuthenticated, adminSignUp, adminLogin }}>
            {children}
        </AuthenticationContext.Provider>
    );
};
export const useAuth = () => {
    return useContext(AuthenticationContext);  // This should reference AuthenticationContext
};
