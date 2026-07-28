import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import AdminSidebar, { AdminContent } from '../components/layout/AdminSidebar.jsx';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Navbar />
      <div className="admin-layout__body">
        <AdminSidebar />
        <AdminContent>
          <Outlet />
        </AdminContent>
      </div>
    </div>
  );
}
