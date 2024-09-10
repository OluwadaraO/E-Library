import { Link } from 'react-router-dom';
function UserLoginPage(){
    return(
        <div>
            <h1>Welcome Back to E-Library</h1>
            <p>Not a user? <Link to="/sign-up">Sign Up Today!</Link></p>
            <p>Admins should log in <Link to="/admin-login"> here</Link></p>
            <form>
                <label>Username: </label>
                <input type="text" required/>
                <label>Password: </label>
                <input type="text" required/>
            </form>
        </div>
    )
}
export default UserLoginPage;