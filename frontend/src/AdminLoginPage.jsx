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
        <div>
            <h1>Welcome Back Admin</h1>
            <p>Not an admin? <Link to="/">Login in to your account</Link></p>
            <form onSubmit={handleLogin}>
                <label>Username: </label>
                <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required/>
                <label>Password: </label>
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required/>
                <button type="submit">Log in to your account!</button>
            </form>
            <p>Create an admin account by clicking<Link to='/admin-sign-up'> here</Link></p>
        </div>
    )
}
export default AdminLoginPage;