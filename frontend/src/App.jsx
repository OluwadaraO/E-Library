import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserSignUpPage from './UserSignUpPage';
import UserLoginPage from './UserLoginPage';
import AdminLoginPage from './AdminLoginPage';
import AdminSignUpPage from './AdminSignUpPage';
function App(){
  return(
    <Router>
      <Routes>
        <Route path='/' element={<UserLoginPage/>}/>
        <Route path='/sign-up' element={<UserSignUpPage/>}/>
        <Route path='/admin-login' element={<AdminLoginPage/>}/>
        <Route path='/admin-sign-up' element={<AdminSignUpPage/>}/>
      </Routes>
    </Router>
  )
}
export default App;