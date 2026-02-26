import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import Login from './pages/Login';
import AdminDashboard from "./pages/AdminDashboard";
import Profile from './pages/Profile';
import AddUser from './pages/AddUser';
import UserHome from './pages/UserHome';

function App() {
  return (
    <Router>
      {/* Toaster placed here allows popups on any route */}
      <Toaster position="top-right" reverseOrder={false} /> 
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/user-home" element={<UserHome />} />
        
      </Routes>
    </Router>
  );
}

export default App;