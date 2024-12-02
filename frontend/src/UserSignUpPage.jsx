import React, {useState} from 'react';
import { Link } from "react-router-dom";
import { useAuth } from './Authentication';
import { useNavigate } from "react-router-dom";
import './UserSignUpPage.css'
function UserSignUpPage(){
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolID, setschoolID] = useState('');
  const {signUp} = useAuth();
  const navigate = useNavigate()

  const handleUserSignUp = async(e) => {
    e.preventDefault();
    const parsedSchoolID = parseInt(schoolID)
    try{
      const userData = {
        userName,
        password,
        firstName,
        lastName,
        schoolID: parsedSchoolID
      }
      await signUp(userData);
      navigate('/')
    }catch(error){
      console.error("Sign up failed: ", error);
    }
  }
    return(
        <div className="user-signup-container">
          <h1 className="user-signup-title">Hello! Welcome to E-Library</h1>
          <p className="user-signup-subtext">Already a user? <Link to="/"  className="user-signup-link">Sign in instead!</Link></p>
          <form onSubmit={handleUserSignUp} className="user-signup-form">
            <p className="user-signup-instruction">Please create an account</p>
            <div className="user-signup-fields">
            <label className="user-signup-label">Student First Name: </label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="user-signup-input"/>
            <label className="user-signup-label">Student Last Name: </label>
            <input 
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="user-signup-input"/>
            <label className="user-signup-label">Student ID(put the numbers only no zeroes): </label>
            <input 
              type="number"
              value={schoolID}
              onChange={(e) => setschoolID(e.target.value)}
              required
              className="user-signup-input"/>
            <label className="user-signup-label">Username: </label>
            <input 
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="user-signup-input"/>
            <label className="user-signup-label">Password: </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="user-signup-input"/>
            </div>
            <button type='submit' className="user-signup-button">Sign Up</button>
          </form>
        </div>
      )
}
export default UserSignUpPage