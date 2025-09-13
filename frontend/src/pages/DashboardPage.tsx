import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Progress, Table, Tag, Spin, Alert } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { apiService, type Product, type KPIData, type SalesData, type Customer, type Order } from '../services/api';

const { Title, Text } = Typography;

interface KPICardProps {
  title: string;
  value: number | string;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  prefix, 
  suffix, 
  trend, 
  trendValue,
  loading = false 
}) => {
  const trendIcon = trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const trendColor = trend === 'up' ? '#3f8600' : '#cf1322';

  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        loading={loading}
      />
      {trendValue && (
        <div style={{ marginTop: '8px' }}>
          <Text style={{ color: trendColor }}>
            {trendIcon} {trendValue}
          </Text>
          <Text type="secondary" style={{ marginLeft: '8px' }}>
            vs last month
          </Text>
        </div>
      )}
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  // State management for data and loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [, setCustomers] = useState<Customer[]>([]);
  const [, setOrders] = useState<Order[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dashboardData = await apiService.getDashboardData();
        
        if (dashboardData.error) {
          setError(dashboardData.error);
        } else {
          setKpiData(dashboardData.kpis);
          setProducts(dashboardData.products);
          setSalesData(dashboardData.sales);
          setCustomers(dashboardData.customers);
          setOrders(dashboardData.orders);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
        <Text style={{ marginLeft: '16px' }}>Loading dashboard data...</Text>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description={error}
        type="error"
        showIcon
        style={{ margin: '24px' }}
        action={
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        }
      />
    );
  }

  // Calculate derived metrics
  const averageOrderValue = kpiData?.total_orders ? (kpiData.total_sales / kpiData.total_orders) : 0;

  // Use real products data for the table, or fallback to empty array
  const topProducts = products.slice(0, 4).map((product) => ({
    key: product.id.toString(),
    name: product.title,
    category: product.product_type || 'Unknown',
    sales: Math.floor(Math.random() * 300) + 50, // Mock sales data - you can enhance this with real sales data from your API
    revenue: Math.floor(Math.random() * 15000) + 3000,
    status: product.status === 'active' ? 'hot' : 'normal',
  }));

  // Chart configurations using real sales data
  const salesChartConfig = {
    data: salesData,
    xField: 'date',
    yField: 'daily_sales',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 5,
      shape: 'diamond',
    },
  };

  // Product table columns
  const productColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      sorter: (a: any, b: any) => a.sales - b.sales,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `$${value.toLocaleString()}`,
      sorter: (a: any, b: any) => a.revenue - b.revenue,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'hot' ? 'red' : status === 'normal' ? 'blue' : 'default';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  // Generate category distribution from real products data
  const getCategoryData = () => {
    if (!products || products.length === 0) {
      // Fallback data when no products are loaded
      return [
        { type: 'No Data', value: 100 }
      ];
    }

    // Group products by vendor (using vendor as category)
    const categoryCount: { [key: string]: number } = {};
    products.forEach(product => {
      const category = product.product_type || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    // Convert to chart data format and calculate percentages
    const totalProducts = products.length;
    return Object.entries(categoryCount).map(([category, count]) => ({
      type: category,
      value: Math.round((count / totalProducts) * 100) // Convert to percentage
    })).sort((a, b) => b.value - a.value); // Sort by value descending
  };

  const categoryData = getCategoryData();

  const pieChartConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    label: {
      text: 'value',
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right' as const,
        rowPadding: 5,
      },
    },
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Dashboard Overview</Title>
        <Text type="secondary">
          Welcome back! Here's what's happening with your store today.
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Sales"
            value={kpiData?.total_sales || 0}
            prefix={<DollarOutlined />}
            trend="up"
            trendValue="12.5%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Orders"
            value={kpiData?.total_orders || 0}
            prefix={<ShoppingCartOutlined />}
            trend="up"
            trendValue="8.2%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="New Customers"
            value={kpiData?.new_customers_past_30_days || 0}
            prefix={<UserOutlined />}
            trend="down"
            trendValue="3.1%"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Average Order"
            value={averageOrderValue}
            prefix={<DollarOutlined />}
            trend="up"
            trendValue="5.7%"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Sales Trend" style={{ height: '400px' }}>
            <Column {...salesChartConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Sales by Category" style={{ height: '400px' }}>
            <Pie {...pieChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Top Performing Products" style={{ height: '400px' }}>
            <Table 
              dataSource={topProducts} 
              columns={productColumns} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Store Performance" style={{ height: '400px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text>Conversion Rate</Text>
                <Progress percent={75} status="active" />
              </div>
              <div>
                <Text>Customer Satisfaction</Text>
                <Progress percent={88} strokeColor="#52c41a" />
              </div>
              <div>
                <Text>Inventory Level</Text>
                <Progress percent={45} strokeColor="#faad14" />
              </div>
              <div>
                <Text>Monthly Goal</Text>
                <Progress percent={65} strokeColor="#1890ff" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;