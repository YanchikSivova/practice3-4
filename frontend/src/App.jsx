import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Admin from './pages/Admin';
function App() {
  return (
    <div className='App'>
      <Navigation />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/account' element={<Account />} />
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;