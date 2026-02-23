import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';
import { useAuth } from '@/context/AuthContext';

// Import Admin Components
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminProfile from '@/components/admin/AdminProfile';
import UserManagement from '@/components/admin/UserManagement';
import SeatManagement from '@/components/admin/SeatManagement';
import PaymentManagement from '@/components/admin/PaymentManagement';
import MessageCenter from '@/components/admin/MessageCenter';
import ComplaintManagement from '@/components/admin/ComplaintManagement';
import AdminApproval from '@/components/admin/AdminApproval';
import LibrarySettings from '@/components/admin/LibrarySettings';
import SeatRequestCenter from '@/components/admin/SeatRequestCenter';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  
  // Base menu items for all admins
  const baseMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
  ];

  // Super admin only menu items
  const superAdminItems = [
    { path: '/admin/approval', label: 'Admin Approval', icon: '✅' },
    { path: '/admin/settings', label: 'Library Settings', icon: '⏰' },
  ];

  // Common menu items for all admins
  const commonMenuItems = [
    { path: '/admin/seats', label: 'Seat Management', icon: '💺' },
    { path: '/admin/seat-requests', label: 'Seat Requests', icon: '🎯' },
    { path: '/admin/payments', label: 'Payments', icon: '💰' },
    { path: '/admin/messages', label: 'Messages', icon: '📧' },
    { path: '/admin/complaints', label: 'Complaints', icon: '🎫' },
  ];

  // Conditionally build menu based on user role
  const menuItems = user?.isSuperAdmin
    ? [...baseMenuItems, ...superAdminItems, ...commonMenuItems]
    : [...baseMenuItems, ...commonMenuItems];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Portal" />
      <div className="flex">
        <Sidebar items={menuItems} />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<UserManagement />} />
            {user?.isSuperAdmin && (
              <>
                <Route path="approval" element={<AdminApproval />} />
                <Route path="settings" element={<LibrarySettings />} />
              </>
            )}
            <Route path="seats" element={<SeatManagement />} />
            <Route path="seat-requests" element={<SeatRequestCenter />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="messages" element={<MessageCenter />} />
            <Route path="complaints" element={<ComplaintManagement />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
