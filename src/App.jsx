import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskCreation from './pages/TaskCreation';
import TaskList from './pages/TaskList';
import Admin from './pages/Admin';
import AdminPage from './components/AdminPage';
import Signup from './pages/Signup';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';


const AppRoutes = () => {
  const location = useLocation();
  const hideHeaderRoutes = ['/login', '/', '/signup'];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
  
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-task"
          element={
            <PrivateRoute>
              <TaskCreation />
            </PrivateRoute>
          }
        />
        <Route
          path="/task-list"
          element={
            <PrivateRoute>
              <TaskList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
