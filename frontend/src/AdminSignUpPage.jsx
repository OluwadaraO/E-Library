import React, {useState} from 'react';
import { Link } from "react-router-dom";
import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';
import './AdminSignUpPage.css'
function AdminSignUpPage(){
  const {adminSignUp} = useAuth();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleUserSignUp = async(e) => {
    e.preventDefault();
    try{
      const userData = {
        userName,
        password,
        firstName,
        lastName
      }
      await adminSignUp(userData);
      navigate('/admin-login')
    }catch(error){
      console.error("Admin sgn up failed: ", error);
    }
  }
    return(
        <div className="admin-signup-container">
          <form onSubmit={handleUserSignUp} className="admin-signup-form">
            <h1>Hello Admin! Welcome to E-Library</h1>
            <p>Already an admin? <Link to="/admin-login" className="admin-signup-link">Sign in instead!</Link></p>
            <p>Please create an account</p>
            <label>First Name: </label>
            <input 
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required/>
            <label>Last Name: </label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e)=> setLastName(e.target.value)}
              required/>
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
            <button type='submit' className='admin-signup-button'>Create account!</button>
          </form>
        </div>
      )
}
export default AdminSignUpPage;