import { Link } from "react-router-dom"
function UserSignUpPage(){
    return(
        <div>
          <h1>Hello! Welcome to E-Library</h1>
          <p>Already a user? <Link to="/">Sign in instead!</Link></p>
          <form>
            <p>Please create an account</p>
            <label>Student First Name: </label>
            <input type="text" required/>
            <label>Student Last Name: </label>
            <input type="text" required/>
            <label>Student ID(put the numbers only no zeroes): </label>
            <input type="number" required/>
            <label>Username: </label>
            <input type="text" required/>
            <label>Password: </label>
            <input type="password" required></input>
          </form>
        </div>
      )
}
export default UserSignUpPage