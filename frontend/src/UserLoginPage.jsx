import { Link } from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';
function UserLoginPage(){
    const navigate = useNavigate();
    const { login, user, logout } = useAuth();  // Access the login function and user data from the context
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    useEffect(() => {
        if (user) {
            navigate('/home');  // Redirect to /home if the user is authenticated
        }
    }, [user, navigate]);  //
  
    const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`http://localhost:3000/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ userName, password })
        });

        if (response.ok) {
            const data = await response.json();
            login(data.user);
            navigate('/home')
        } else {
            console.error('Login failed');
        }
    } catch (error) {
        console.log('Login error: ', error);

    }  // Call the login function from context
    };

    return(
        <div>
            <h1>Welcome Back to E-Library</h1>
            <p>Not a user? <Link to="/sign-up">Sign Up Today!</Link></p>
            <p>Admins should log in <Link to="/admin-login"> here</Link></p>
            {!user ? (
          <form onSubmit={handleLogin}>
            <div>
              <label>Username</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <button type="submit">Login</button>
          </form>
        ): null}
        </div>
    )
}
export default UserLoginPage;