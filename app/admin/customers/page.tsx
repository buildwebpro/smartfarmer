'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Mail, Phone, MapPin, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  status: 'active' | 'inactive';
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
    setFilteredCustomers(filtered);
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      // Fetch users with their order statistics
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'customer');

      if (usersError) throw usersError;

      // Fetch order statistics for each customer
      const customersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('total_price, created_at')
            .eq('user_id', user.id);

          if (ordersError) {
            console.error('Error fetching orders for user:', user.id, ordersError);
            return {
              ...user,
              total_orders: 0,
              total_spent: 0,
              last_order_date: undefined,
              status: 'inactive' as const
            };
          }

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
          const lastOrderDate = orders && orders.length > 0 
            ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : undefined;

          return {
            id: user.id,
            name: user.name || 'ไม่ระบุชื่อ',
            email: user.email,
            phone: user.phone,
            address: user.address,
            created_at: user.created_at,
            total_orders: totalOrders,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
            status: totalOrders > 0 ? 'active' as const : 'inactive' as const
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบลูกค้ารายนี้?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.filter(customer => customer.id !== customerId));
      toast.success('ลบลูกค้าเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('เกิดข้อผิดพลาดในการลบลูกค้า');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
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
          <h1 className="text-3xl font-bold text-gray-900">ลูกค้า</h1>
          <p className="text-gray-600 mt-2">จัดการข้อมูลลูกค้าและติดตามประวัติการใช้งาน</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มลูกค้า
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ค้นหาลูกค้า (ชื่อ, อีเมล, เบอร์โทร)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
              <p className="text-sm text-gray-600">ลูกค้าทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'ไม่พบลูกค้าที่ค้นหา' : 'ยังไม่มีลูกค้า'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'ลองเปลี่ยนคำค้นหาหรือเพิ่มลูกค้าใหม่' : 'เริ่มต้นโดยการเพิ่มลูกค้าคนแรก'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" alt={customer.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg text-gray-900">{customer.name}</h3>
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                          {customer.status === 'active' ? 'ใช้งานอยู่' : 'ไม่ได้ใช้งาน'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          สมัคร {new Date(customer.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      {customer.address && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {customer.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">{customer.total_orders}</p>
                        <p className="text-xs text-gray-600">ออร์เดอร์</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">
                          ฿{customer.total_spent.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">ยอดรวม</p>
                      </div>
                    </div>
                    {customer.last_order_date && (
                      <p className="text-xs text-gray-600 mb-4">
                        ออร์เดอร์ล่าสุด: {new Date(customer.last_order_date).toLocaleDateString('th-TH')}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}