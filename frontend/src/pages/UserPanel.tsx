import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';

// Import User Components
import UserDashboard from '@/components/user/UserDashboard';
import UserPayments from '@/components/user/UserPayments';
import UserMessages from '@/components/user/UserMessages';
import UserComplaints from '@/components/user/UserComplaints';
import UserProfile from '@/components/user/UserProfile';

const UserPanel: React.FC = () => {
  const menuItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: '📱' },
    { path: '/user/payments', label: 'Payments', icon: '💳' },
    { path: '/user/messages', label: 'Messages', icon: '📬' },
    { path: '/user/complaints', label: 'Help Desk', icon: '🆘' },
    { path: '/user/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="User Portal" />
      <div className="flex">
        <Sidebar items={menuItems} />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="payments" element={<UserPayments />} />
            <Route path="messages" element={<UserMessages />} />
            <Route path="complaints" element={<UserComplaints />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserPanel;
