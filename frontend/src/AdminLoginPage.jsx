import './AdminLoginPage.css';
import { Link } from "react-router-dom";
import React, {useState, useEffect} from 'react';
import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';
function AdminLoginPage(){
    const navigate = useNavigate();
    const {adminLogin, user} = useAuth();
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/admin-home');
        }
    }, [user, navigate])

    const handleLogin = async(e) => {
        e.preventDefault();
        try{
            const response = await fetch(`http://localhost:3000/admin-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({userName, password})
            });
            if (response.ok){
                const data = await response.json();
                adminLogin(data.user);
                navigate('/admin-home')
            }else{
                console.error('Login failed!')
            }
        }catch(error){
            console.log("Login error: ", error)
        }
    }
    return(
        <div className="login-container">
            <div className="login-form-container">
                <h1 className="login-title">Welcome Back Admin</h1>
                <p className="login-subtext">
                    Not an admin? <a href="/" className="link">Login in to your account</a>
                </p>
                <form onSubmit={handleLogin} className="login-form">
                    <label className="form-label">Username:</label>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="form-input"
                        required
                    />
                    <label className="form-label">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        required
                    />
                    <button type="submit" className="login-button">Log in to your account!</button>
                </form>
                <p className="login-subtext">
                    Create an admin account by clicking <a href="/admin-sign-up" className="link">here</a>
                </p>
            </div>
            <div className="gradient-background"></div>
        </div>


    )
}
export default AdminLoginPage;