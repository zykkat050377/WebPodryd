// src/App.tsx
import { ThemeProvider } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import theme from './theme/theme';
import Login from "./components/Auth/Login";
import ChangePassword from "./components/Auth/ChangePassword";
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ContractList from './components/Dashboard/ContractList';
import ActsList from './components/Dashboard/ActsList';
import PassportData from './components/Dashboard/PassportData';
import ContractForm from './components/Contract/ContractForm';
import ActForm from './components/Act/ActForm';
import Profile from './components/Profile/Profile';
import { LayoutProvider } from './context/LayoutContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StructuralUnitsProvider } from './context/StructuralUnitsContext';
import UserManagement from './components/Settings/UserManagement';
import PrivateRoute from './components/Common/PrivateRoute';
import ContractSettings from './components/Settings/ContractSettings';
import ActSettings from './components/Settings/ActSettings';

// Компонент для маршрутов аутентификации (логин/смена пароля)
const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated && !user?.mustChangePassword) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  if (isAuthenticated && user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <AuthRoute>
            <ChangePassword />
          </AuthRoute>
        }
      />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Navigate to="/dashboard" replace />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/contracts"
        element={
          <PrivateRoute>
            <Layout>
              <ContractList />
            </Layout>
          </PrivateRoute>
        }
      />



      <Route
        path="/passport-data"
        element={
          <PrivateRoute>
            <Layout>
              <PassportData />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/create-contract"
        element={
          <PrivateRoute>
            <Layout>
              <ContractForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
            path="/acts"
            element={
              <PrivateRoute>
                <Layout>
                  <ActsList />
                </Layout>
              </PrivateRoute>
            }
          />
      <Route

        path="/create-act"
        element={
          <PrivateRoute>
            <Layout>
              <ActForm />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/user-management"
        element={
          <PrivateRoute requiredRoles={['admin', 'manager']}>
            <Layout>
              <UserManagement />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
       path="/contract-settings"
       element={
           <PrivateRoute requiredRoles={['manager']}>
             <Layout>
                 <ContractSettings />
             </Layout>
           </PrivateRoute>
         }
     />

      <Route
        path="/act-settings"
        element={
          <PrivateRoute requiredRoles={['manager']}>
            <Layout>
                <ActSettings />
            </Layout>
          </PrivateRoute>
        }
    />

      <Route
        path="*"
        element={
          <PrivateRoute>
            <Navigate to="/dashboard" replace />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <LayoutProvider>
          <AuthProvider>
            <StructuralUnitsProvider>
              <AppRoutes />
            </StructuralUnitsProvider>
          </AuthProvider>
        </LayoutProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

