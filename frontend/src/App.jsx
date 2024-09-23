import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserSignUpPage from './UserSignUpPage';
import UserLoginPage from './UserLoginPage';
import AdminLoginPage from './AdminLoginPage';
import AdminSignUpPage from './AdminSignUpPage';
import { AuthenticationProvider } from "./Authentication";
import HomePage from './HomePage';
import AdminHomePage from './AdminHomePage';
function App(){
  return(
    <AuthenticationProvider>
      <Router>
        <Routes>
          <Route path='/' element={<UserLoginPage/>}/>
          <Route path='/sign-up' element={<UserSignUpPage/>}/>
          <Route path='/admin-login' element={<AdminLoginPage/>}/>
          <Route path='/admin-sign-up' element={<AdminSignUpPage/>}/>
          <Route path='/home' element={<HomePage/>}/>
          <Route path='/admin-home' element={<AdminHomePage/>}/>
        </Routes>
      </Router>
    </AuthenticationProvider>
  )
}
export default App;