import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import PropertiesPage from '../pages/PropertiesPage.jsx';
import PropertyDetailPage from '../pages/PropertyDetailPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import BookingsPage from '../pages/BookingsPage.jsx';
import WishlistPage from '../pages/WishlistPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import AdminPropertiesPage from '../pages/AdminPropertiesPage.jsx';
import AdminBookingsPage from '../pages/AdminBookingsPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import AdminRegisterPage from '../pages/AdminRegisterPage.jsx';
import AdminReviewsPage from '../pages/AdminReviewsPage.jsx';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="properties"
              element={
                <ProtectedRoute>
                  <PropertiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="properties/:id"
              element={
                <ProtectedRoute>
                  <PropertyDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route path="admin/register" element={<AdminRegisterPage />} />

          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
          </Route>

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
