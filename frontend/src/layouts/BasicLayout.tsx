import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Badge } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  ShopOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface BasicLayoutProps {
  children: React.ReactNode;
  selectedKey?: string;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children, selectedKey = '1' }) => {
  // Menu items for the sidebar
  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard Overview',
    },
    {
      key: '2',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      children: [
        { key: '2-1', label: 'Sales Analytics' },
        { key: '2-2', label: 'Customer Analytics' },
        { key: '2-3', label: 'Product Performance' },
      ],
    },
    {
      key: '3',
      icon: <ShoppingOutlined />,
      label: 'Orders',
    },
    {
      key: '4',
      icon: <ShopOutlined />,
      label: 'Products',
    },
    {
      key: '5',
      icon: <UserOutlined />,
      label: 'Customers',
    },
    {
      key: '6',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  // User dropdown menu
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={256}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Text style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
            E-commerce Analytics
          </Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderRight: 0, marginTop: '16px' }}
        />
      </Sider>
      
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 10,
        }}>
          <div>
            <Text strong style={{ fontSize: '16px' }}>
              Shopify Analytics Dashboard
            </Text>
          </div>
          
          <Space size="middle">
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: '18px', color: '#666' }} />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>Admin User</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{
          margin: '24px 24px 0',
          padding: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 112px)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;