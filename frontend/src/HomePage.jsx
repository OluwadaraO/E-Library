import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Authentication";
function HomePage(){
    const {user, isAuthenticated, logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = async() => {
        try{
            await logout();
            alert('Logged out successfully');
            navigate('/')
        }
        catch(error){
            console.error(error);
        }
    }

    useEffect(()=> {
        if (!user || !isAuthenticated) {
            navigate('/');  // Redirect to /home if the user is authenticated
        }
    }, [user, navigate, isAuthenticated])


return(
    <div>
         <h1>{user && isAuthenticated? `Welcome back, ${user.firstName}` : 'Loading...'} </h1>
         <p>Books Available</p>
         <button onClick={handleLogout}>Log out</button>
    </div>
)
}
export default HomePage;