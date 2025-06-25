import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  LogoutOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import logo from '../../assets/LogoMolar.png';
import './ClientSidebar.css'; 

const { Sider } = Layout;

function ClientDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('role');
    navigate('/login');
  };

  // Remove the logout from regular menu items
  const items = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
      hidden: role !== 'patient',
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
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="ClientSidebar"
        width={200}
      >
        {/* Logo container */}
        <div className="logo-container" style={{ cursor: 'pointer' }}>
          <img 
            src={logo} 
            alt="Dental Clinic Logo" 
            style={{
              width: collapsed ? '40px' : '120px',
              margin: collapsed ? '10px auto' : '20px auto',
              display: 'block',
              transition: 'all 0.2s'
            }}
          />
        </div>

        <div className="sidebar-content">
          <Menu theme="dark" mode="inline">
            {items
              .filter(item => !item.hidden)
              .map(item => (
                <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                  {item.label}
                </Menu.Item>
              ))}
          </Menu>
          
          {/* Logout button positioned above the collapse control */}
          <div className="logout-button-container">
            <Button 
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-button"
            >
              {!collapsed && "Logout"}
            </Button>
          </div>
        </div>
      </Sider>
    </Layout>
  );
}

export default ClientDashboard;
