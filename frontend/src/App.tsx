import React from 'react';
import BasicLayout from './layouts/BasicLayout';
import DashboardPage from './pages/DashboardPage';
// Import Ant Design styles
import 'antd/dist/reset.css';

function App() {
  return (
    <BasicLayout selectedKey="1">
      <DashboardPage />
    </BasicLayout>
  );
}

export default App;
