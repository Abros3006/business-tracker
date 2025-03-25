import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BusinessDirectory } from './pages/BusinessDirectory';
import { BusinessProfile } from './pages/BusinessProfile';
import { Dashboard } from './pages/Dashboard';
import { BusinessManagement } from './pages/BusinessManagement';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/businesses" element={<Layout><BusinessDirectory /></Layout>} />
        <Route path="/businesses/:id" element={<Layout><BusinessProfile /></Layout>} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGuard>
          }
        />
        <Route
          path="/business/manage"
          element={
            <AuthGuard>
              <Layout>
                <BusinessManagement />
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;