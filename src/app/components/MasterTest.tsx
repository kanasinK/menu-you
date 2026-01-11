'use client';

import { useEffect, useState } from 'react';
import { useMasterStore } from '@/store/masterStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';

const MasterTest = () => {
  const { masters, isLoading, error, loadMasters, refreshMasters } = useMasterStore();
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    dataCount: number;
  } | null>(null);

  useEffect(() => {
    loadMasters();
  }, [loadMasters]);

  const handleTestConnection = async () => {
    setTestResults(null);
    try {
      await refreshMasters();
      setTestResults({
        success: true,
        message: 'เชื่อมต่อ Supabase สำเร็จ!',
        dataCount: Object.values(masters).flat().length
      });
    } catch (error) {
      setTestResults({
        success: false,
        message: `เชื่อมต่อ Supabase ล้มเหลว: ${error instanceof Error ? error.message : 'Unknown error'}`,
        dataCount: 0
      });
    }
  };

  const getMasterCount = (type: keyof typeof masters) => {
    return masters[type]?.length || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            ทดสอบการเชื่อมต่อ Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              ทดสอบการเชื่อมต่อ
            </Button>
            <Button 
              onClick={refreshMasters} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรชข้อมูล
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {testResults && (
            <div className={`p-3 rounded-md ${
              testResults.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {testResults.success ? (
                  <Database className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={testResults.success ? 'text-green-700' : 'text-red-700'}>
                  {testResults.message}
                </span>
              </div>
              {testResults.success && (
                <p className="text-sm text-green-600 mt-1">
                  จำนวนข้อมูลทั้งหมด: {testResults.dataCount} รายการ
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูล Master ที่โหลดได้</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Service Types</div>
              <div className="text-2xl font-bold text-blue-600">{getMasterCount('serviceTypes')}</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900">Themes</div>
              <div className="text-2xl font-bold text-green-600">{getMasterCount('themes')}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-900">Colors</div>
              <div className="text-2xl font-bold text-purple-600">{getMasterCount('colors')}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-sm font-medium text-orange-900">Products</div>
              <div className="text-2xl font-bold text-orange-600">{getMasterCount('products')}</div>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg">
              <div className="text-sm font-medium text-pink-900">Sizes</div>
              <div className="text-2xl font-bold text-pink-600">{getMasterCount('sizes')}</div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="text-sm font-medium text-indigo-900">Orientations</div>
              <div className="text-2xl font-bold text-indigo-600">{getMasterCount('orientations')}</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-900">Materials</div>
              <div className="text-2xl font-bold text-yellow-600">{getMasterCount('materials')}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-900">Roles</div>
              <div className="text-2xl font-bold text-red-600">{getMasterCount('roles')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {masters.serviceTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ตัวอย่างข้อมูล Service Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {masters.serviceTypes.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="outline" className="ml-2">{item.code}</Badge>
                  </div>
                  <Badge variant={item.isActive ? 'default' : 'secondary'}>
                    {item.isActive ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MasterTest;
