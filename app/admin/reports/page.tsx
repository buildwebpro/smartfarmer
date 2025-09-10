'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, DollarSign, Activity, Download } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

interface ReportData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  completedOrders: number;
  monthlyOrders: Array<{ month: string; orders: number; revenue: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  topLocations: Array<{ location: string; count: number }>;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      // Fetch users data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', startDate.toISOString());

      if (usersError) throw usersError;

      // Process data
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
      const totalCustomers = users?.length || 0;
      const completedOrders = orders?.filter(order => order.status === 'completed').length || 0;

      // Monthly data
      const monthlyData = orders?.reduce((acc, order) => {
        const month = new Date(order.created_at).toLocaleDateString('th-TH', { month: 'short' });
        const existing = acc.find((item: { month: string; orders: number; revenue: number }) => item.month === month);
        if (existing) {
          existing.orders += 1;
          existing.revenue += order.total_price || 0;
        } else {
          acc.push({ month, orders: 1, revenue: order.total_price || 0 });
        }
        return acc;
      }, [] as Array<{ month: string; orders: number; revenue: number }>) || [];

      // Status distribution
      const statusCounts = orders?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: getStatusText(status),
        value: count,
        color: getStatusColor(status)
      }));

      // Top locations
      const locationCounts = orders?.reduce((acc, order) => {
        acc[order.location] = (acc[order.location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 5);

      // Update report data state with processed analytics
      setReportData({
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue || 0, 
        totalCustomers: totalCustomers || 0,
        completedOrders: completedOrders || 0,
        monthlyOrders: monthlyData || [],
        statusDistribution: statusDistribution || [],
        topLocations: topLocations || []
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรายงาน');
    } finally {
      setLoading(false);
    }
  }, [timeRange, supabase]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'in_progress': return 'กำลังดำเนินการ';
      case 'completed': return 'เสร็จสิ้น';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'in_progress': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const exportReport = () => {
    toast.success('กำลังส่งออกรายงาน...');
    // Implementation for export functionality
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายงาน</h1>
          <p className="text-gray-600 mt-2">ภาพรวมและสถิติการดำเนินงาน</p>
        </div>
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 วันที่ผ่านมา</SelectItem>
              <SelectItem value="30">30 วันที่ผ่านมา</SelectItem>
              <SelectItem value="90">90 วันที่ผ่านมา</SelectItem>
              <SelectItem value="365">1 ปีที่ผ่านมา</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            ส่งออก
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ออร์เดอร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.totalOrders || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
                <p className="text-2xl font-bold text-gray-900">
                  ฿{(reportData?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ลูกค้าใหม่</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.totalCustomers || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">งานเสร็จสิ้น</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.completedOrders || 0}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ออร์เดอร์รายเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.monthlyOrders || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถานะออร์เดอร์</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {reportData?.statusDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations */}
      <Card>
        <CardHeader>
          <CardTitle>สถานที่ยอดนิยม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.topLocations?.map((location, index) => (
              <div key={location.location} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    #{index + 1}
                  </div>
                  <span className="font-medium">{location.location}</span>
                </div>
                <span className="text-gray-600">{location.count} ออร์เดอร์</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}