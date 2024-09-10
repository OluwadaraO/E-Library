import { Link } from "react-router-dom";
function AdminSignUpPage(){
    return(
        <div>
          <h1>Hello Student! Welcome to E-Library</h1>
          <p>Already an admin? <Link to="/admin-login">Sign in instead!</Link></p>
          <form>
            <p>Please create an account</p>
            <label>Student First Name: </label>
            <input type="text" required/>
            <label>Student Last Name: </label>
            <input type="text" required/>
            <label>Student ID(put the numbers only): </label>
            <input type="number" required/>
            <label>Username: </label>
            <input type="text" required/>
            <label>Password: </label>
            <input type="password" required></input>
          </form>
        </div>
      )
}
export default AdminSignUpPage;