import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import Login from './pages/Login';
import AdminDashboard from "./pages/AdminDashboard";
import Profile from './pages/Profile';
import AddUser from './pages/AddUser';
import UserHome from './pages/UserHome';
import ManagerDashboard from './pages/ManagerDashboard';
import ViewProfile from './pages/ViewProfile';
import ViewLogs from './pages/ViewLogs'; 
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} /> 
    
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/" element={<Login />} />

        {/* ADMIN ONLY ROUTES */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/add-user" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AddUser />
          </ProtectedRoute>
        } />

        {/* SHARED PRIVATE ROUTES (Admin, Manager, Employee) */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['admin', 'non-employee', 'employee']}>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/user-home" element={
          <ProtectedRoute allowedRoles={['admin', 'employee']}>
            <UserHome />
          </ProtectedRoute>
        } />

        {/* MANAGER & ADMIN ROUTES */}
        <Route path="/manager-dashboard" element={
          <ProtectedRoute allowedRoles={['non-employee']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* VIEWING / EDITING ROUTES */}
        <Route path="/view-profile/:id" element={
          <ProtectedRoute allowedRoles={['non-employee']}>
            <ViewProfile />
          </ProtectedRoute>
        } />
        <Route path="/view-logs/:id" element={
          <ProtectedRoute allowedRoles={['non-employee','employee']}>
            <ViewLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/view-user/:adminViewUserId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserHome />
          </ProtectedRoute>
        } />
        <Route path="/admin/edit-profile/:id/:userId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;