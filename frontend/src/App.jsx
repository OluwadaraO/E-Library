import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserSignUpPage from './UserSignUpPage';
import UserLoginPage from './UserLoginPage';
import AdminLoginPage from './AdminLoginPage';
import AdminSignUpPage from './AdminSignUpPage';
import { AuthenticationProvider } from "./Authentication";
import HomePage from './HomePage';
import AdminHomePage from './AdminHomePage';
import UserProfilePage from './UserProfilePage';
import UserNotificationPage from './UserNotificationPage';
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
          <Route path='/user/:id' element={<UserProfilePage/>}/>
          <Route path='/user-notifications' element={<UserNotificationPage/>}/>
        </Routes>
      </Router>
    </AuthenticationProvider>
  )
}
export default App;