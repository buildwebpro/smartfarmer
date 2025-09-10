'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, DollarSign, Clock, MapPin } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

interface PricingRule {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  price_per_hour: number;
  price_per_area: number;
  crop_type?: string;
  location_multiplier: number;
  min_hours: number;
  max_hours?: number;
  is_active: boolean;
  created_at: string;
}

interface CropType {
  id: string;
  name: string;
}

export default function PricingPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 0,
    price_per_hour: 0,
    price_per_area: 0,
    crop_type: '',
    location_multiplier: 1,
    min_hours: 1,
    max_hours: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pricing rules
      const { data: pricing, error: pricingError } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (pricingError) throw pricingError;

      // Fetch crop types
      const { data: crops, error: cropsError } = await supabase
        .from('crop_types')
        .select('id, name')
        .order('name');

      if (cropsError) throw cropsError;

      setPricingRules(pricing || []);
      setCropTypes(crops || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const ruleData = {
        name: formData.name,
        description: formData.description || null,
        base_price: formData.base_price,
        price_per_hour: formData.price_per_hour,
        price_per_area: formData.price_per_area,
        crop_type: formData.crop_type || null,
        location_multiplier: formData.location_multiplier,
        min_hours: formData.min_hours,
        max_hours: formData.max_hours ? parseInt(formData.max_hours) : null,
        is_active: formData.is_active
      };

      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('pricing_rules')
          .update(ruleData)
          .eq('id', editingRule.id);

        if (error) throw error;
        toast.success('อัปเดตกฎราคาเรียบร้อยแล้ว');
      } else {
        // Create new rule
        const { error } = await supabase
          .from('pricing_rules')
          .insert([ruleData]);

        if (error) throw error;
        toast.success('สร้างกฎราคาใหม่เรียบร้อยแล้ว');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving pricing rule:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกกฎราคา');
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      base_price: rule.base_price,
      price_per_hour: rule.price_per_hour,
      price_per_area: rule.price_per_area,
      crop_type: rule.crop_type || '',
      location_multiplier: rule.location_multiplier,
      min_hours: rule.min_hours,
      max_hours: rule.max_hours?.toString() || '',
      is_active: rule.is_active
    });
    setIsCreating(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบกฎราคานี้?')) return;

    try {
      const { error } = await supabase
        .from('pricing_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setPricingRules(pricingRules.filter(rule => rule.id !== ruleId));
      toast.success('ลบกฎราคาเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      toast.error('เกิดข้อผิดพลาดในการลบกฎราคา');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      base_price: 0,
      price_per_hour: 0,
      price_per_area: 0,
      crop_type: '',
      location_multiplier: 1,
      min_hours: 1,
      max_hours: '',
      is_active: true
    });
    setEditingRule(null);
    setIsCreating(false);
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);

      if (error) throw error;

      setPricingRules(pricingRules.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: !currentStatus } : rule
      ));
      
      toast.success(`${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}กฎราคาเรียบร้อยแล้ว`);
    } catch (error) {
      console.error('Error toggling rule status:', error);
      toast.error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าราคา</h1>
          <p className="text-gray-600 mt-2">จัดการกฎการคำนวณราคาสำหรับบริการต่างๆ</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มกฎราคา
        </Button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingRule ? 'แก้ไขกฎราคา' : 'สร้างกฎราคาใหม่'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อกฎราคา *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="เช่น ราคามาตรฐานข้าวโพด"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="crop_type">ประเภทพืช</Label>
                  <Select value={formData.crop_type} onValueChange={(value) => setFormData({...formData, crop_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภทพืช" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทุกประเภท</SelectItem>
                      {cropTypes.map(crop => (
                        <SelectItem key={crop.id} value={crop.id}>{crop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="อธิบายเงื่อนไขการใช้งานกฎราคานี้"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="base_price">ราคาฐาน (บาท) *</Label>
                  <Input
                    id="base_price"
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({...formData, base_price: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_hour">ราคาต่อชั่วโมง (บาท) *</Label>
                  <Input
                    id="price_per_hour"
                    type="number"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData({...formData, price_per_hour: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price_per_area">ราคาต่อไร่ (บาท) *</Label>
                  <Input
                    id="price_per_area"
                    type="number"
                    value={formData.price_per_area}
                    onChange={(e) => setFormData({...formData, price_per_area: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location_multiplier">ตัวคูณตำแหน่ง *</Label>
                  <Input
                    id="location_multiplier"
                    type="number"
                    step="0.1"
                    value={formData.location_multiplier}
                    onChange={(e) => setFormData({...formData, location_multiplier: parseFloat(e.target.value) || 1})}
                    placeholder="1.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="min_hours">ชั่วโมงขั้นต่ำ *</Label>
                  <Input
                    id="min_hours"
                    type="number"
                    value={formData.min_hours}
                    onChange={(e) => setFormData({...formData, min_hours: parseInt(e.target.value) || 1})}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_hours">ชั่วโมงสูงสุด</Label>
                  <Input
                    id="max_hours"
                    type="number"
                    value={formData.max_hours}
                    onChange={(e) => setFormData({...formData, max_hours: e.target.value})}
                    placeholder="ไม่จำกัด"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">เปิดใช้งาน</Label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingRule ? 'อัปเดต' : 'สร้าง'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pricing Rules List */}
      <div className="grid gap-4">
        {pricingRules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ยังไม่มีกฎราคา</h3>
              <p className="text-gray-600">เริ่มต้นโดยการสร้างกฎราคาแรก</p>
            </CardContent>
          </Card>
        ) : (
          pricingRules.map((rule) => (
            <Card key={rule.id} className={`${rule.is_active ? '' : 'opacity-60'} hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{rule.name}</h3>
                      <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                        {rule.is_active ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
                      </Badge>
                      {rule.crop_type && (
                        <Badge variant="outline">
                          {cropTypes.find(c => c.id === rule.crop_type)?.name || 'ไม่ระบุ'}
                        </Badge>
                      )}
                    </div>
                    {rule.description && (
                      <p className="text-gray-600 mb-3">{rule.description}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">ราคาฐาน</p>
                        <p className="font-medium">฿{rule.base_price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ต่อชั่วโมง</p>
                        <p className="font-medium">฿{rule.price_per_hour.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ต่อไร่</p>
                        <p className="font-medium">฿{rule.price_per_area.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ตัวคูณตำแหน่ง</p>
                        <p className="font-medium">×{rule.location_multiplier}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {rule.min_hours}-{rule.max_hours || '∞'} ชั่วโมง
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRuleStatus(rule.id, rule.is_active)}
                    >
                      {rule.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(rule)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}