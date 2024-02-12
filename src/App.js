import { BrowserRouter as Router, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from "./pages/Home";
import Login from './pages/login';
import AdminPanel from './pages/admin';
import SignUp from './pages/signup';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/signup" element={<SignUp />} />

      </Routes>
    </Router>
  );
}


export default App;