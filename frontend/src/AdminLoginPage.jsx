import { Link } from "react-router-dom";
function AdminLoginPage(){
    return(
        <div>
            <h1>Welcome Back Admin</h1>
            <p>Not an admin? <Link to="/">Login in to your account</Link></p>
            <form>
                <label>Username: </label>
                <input type="text" required/>
                <label>Password: </label>
                <input type="text" required/>
            </form>
            <p>Create an admin account by clicking<Link to='/admin-sign-up'> here</Link></p>
        </div>
    )
}
export default AdminLoginPage;