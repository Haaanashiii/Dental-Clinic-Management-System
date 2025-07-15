import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  LogoutOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../../assets/logo-white.png';
import './ClientSidebar.css';

const { Sider } = Layout;

function ClientDashboard({ setIsAuthenticated }) {
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    return stored ? stored === 'true' : false;
  });

  const navigate = useNavigate();
  const location = useLocation(); // Used to sync selected menu item
  const role = sessionStorage.getItem('role');

  // Set initial selected key based on current route
  const getDefaultSelectedKey = () => {
    const path = location.pathname;

    if (path === '/') return '1';
    if (path.includes('ManageProfilePage')) return '2';
    if (path.includes('ManageUser')) return '3';
    if (path.includes('ManageDentist')) return '4';
    if (path.includes('ManageStaff')) return '5';
    if (path.includes('ManageAppointment')) return '6';
    if (path.includes('ManageRecord')) return '7';
    if (path.includes('UserRecords')) return '8';
    if (path.includes('AdminDashboard')) return '1';
    if (path.includes('ViewAudit')) return '9';
    if (path.includes('OtherPlatform')) return '10';

    return '';
  };

  const [selectedKey, setSelectedKey] = useState(getDefaultSelectedKey);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  const handleLogout = () => {
    sessionStorage.clear();
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate('/LandingPage');
  };

  // Get current user info
  const getCurrentUser = () => {

    const name = sessionStorage.getItem('name') || sessionStorage.getItem('username') || 'User';
    const role = sessionStorage.getItem('role') || 'Unknown';
    return { name, role };
  };

  const currentUser = getCurrentUser();

  const items = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => {
        if (role === 'patient') {
          navigate('/');
        } else {
          navigate('/AdminDashboard');
        }
      },
      hidden: false,
    },
    {
      key: '2',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/ManageProfilePage'),
    },
    {
      key: '3',
      icon: <TeamOutlined />,
      label: 'Manage Users',
      onClick: () => navigate('/ManageUser'),
      hidden: role !== 'dentist',
    },
    {
      key: '4',
      icon: <TeamOutlined />,
      label: 'Manage Dentists',
      onClick: () => navigate('/ManageDentist'),
      hidden: role !== 'dentist',
    },
    {
      key: '5',
      icon: <TeamOutlined />,
      label: 'Manage Staffs',
      onClick: () => navigate('/ManageStaff'),
      hidden: role !== 'dentist',
    },
    {
      key: '6',
      icon: <FileTextOutlined />,
      label: 'Appointments',
      onClick: () => navigate('/ManageAppointment'),
      hidden: role !== 'staff' && role !== 'dentist',
    },
    {
      key: '7',
      icon: <FileTextOutlined />,
      label: 'Manage Records',
      onClick: () => navigate('/ManageRecord'),
      hidden: role !== 'staff' && role !== 'dentist',
    },
    {
      key: '8',
      icon: <FileTextOutlined />,
      label: 'User Records',
      onClick: () => navigate('/UserRecords'),
      hidden: role !== 'patient',
    },
     {
      key: '9',
      icon: <TeamOutlined />, // Changed icon to TeamOutlined for Audit logs
      label: 'Audit Logs', // Changed label to Audit Logs
      onClick: () => navigate('/ViewAudit'),
      hidden: role !== 'staff' && role !== 'dentist',
    },
    {
      key: '10',
      icon: <FileTextOutlined />,
      label: 'Other Platforms',
      onClick: () => navigate('/OtherPlatform'),
      hidden: role !== 'patient' && role !== 'staff' && role !== 'dentist',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="ClientSidebar"
        width={200}
        trigger={null} // This removes the default trigger that causes delay
      >
        <div className="logo-container" onClick={() => navigate('/LandingPage')} style={{ cursor: 'pointer' }}>
          <img
            src={logo}
            alt="Dental Clinic Logo"
            style={{
              width: collapsed ? '40px' : '120px',
              margin: collapsed ? '10px auto' : '20px auto',
              display: 'block',
              transition: 'all 0.2s',
            }}
          />
        </div>

        <div className="sidebar-content">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
          >
            {items
              .filter(item => !item.hidden)
              .map(item => (
                <Menu.Item
                  key={item.key}
                  icon={item.icon}
                  onClick={() => {
                    setSelectedKey(item.key);
                    item.onClick();
                  }}
                >
                  {item.label}
                </Menu.Item>
              ))}
          </Menu>

          <div className="logout-button-container">
            {/* User Info Section */}
            <div className="user-info-container">
              <div className="user-info">
                <div className="user-avatar">
                  <AccountCircleIcon />
                </div>
                {!collapsed && (
                  <div className="user-details">
                    <div className="username">{currentUser.name}</div>
                    <div className="user-role">{currentUser.role}</div>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-button"
            >
              {!collapsed && "Logout"}
            </Button>

            {/* Custom Collapse Button - This eliminates the delay */}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-button"
            >
              {!collapsed}
            </Button>
          </div>
        </div>
      </Sider>
    </Layout>
  );
}

export default ClientDashboard;
