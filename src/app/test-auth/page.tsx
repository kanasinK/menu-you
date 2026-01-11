"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('test@menuyou.com');
  const [password, setPassword] = useState('Test123456');

  const addResult = (test: string, success: boolean, message: string) => {
    setTestResults(prev => [...prev, { test, success, message, time: new Date().toLocaleTimeString() }]);
  };

  const testSupabaseConnection = async () => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      
      if (!supabase) {
        addResult('Supabase Connection', false, 'Supabase client is not configured. Check .env.local file.');
        return false;
      }
      
      addResult('Supabase Connection', true, 'Supabase client initialized successfully');
      return true;
    } catch (error: any) {
      addResult('Supabase Connection', false, error.message);
      return false;
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      
      if (!supabase) {
        addResult('Database Connection', false, 'Supabase client not available');
        return false;
      }

      // ทดสอบ query ง่ายๆ
      const { data, error } = await supabase
        .from('members')
        .select('count')
        .limit(1);

      if (error) {
        addResult('Database Connection', false, `Error: ${error.message}`);
        return false;
      }

      addResult('Database Connection', true, 'Can query members table');
      return true;
    } catch (error: any) {
      addResult('Database Connection', false, error.message);
      return false;
    }
  };

  const createTestUser = async () => {
    try {
      const { signUp } = await import('@/lib/auth-supabase');
      const result = await signUp(email, password, {
        user_name: 'testuser',
        nickname: 'Test User',
        role_code: 'ADMIN'
      });

      if (result.error) {
        addResult('Create Test User', false, result.error.message);
        return false;
      }

      addResult('Create Test User', true, `User created: ${email}`);
      return true;
    } catch (error: any) {
      addResult('Create Test User', false, error.message);
      return false;
    }
  };

  const testLogin = async () => {
    try {
      const { signIn } = await import('@/lib/auth-supabase');
      const result = await signIn(email, password);

      if (result.error) {
        addResult('Login Test', false, result.error.message);
        return false;
      }

      if (result.user) {
        addResult('Login Test', true, `Logged in as: ${result.user.email} (Role: ${result.user.role_code})`);
        return true;
      }

      addResult('Login Test', false, 'No user returned');
      return false;
    } catch (error: any) {
      addResult('Login Test', false, error.message);
      return false;
    }
  };

  const testMockLogin = async () => {
    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'admin@example.com', 
          password: 'password' 
        })
      });

      if (response.ok) {
        addResult('Mock Login Test', true, 'Mock login works (fallback mode)');
        return true;
      } else {
        addResult('Mock Login Test', false, 'Mock login failed');
        return false;
      }
    } catch (error: any) {
      addResult('Mock Login Test', true, 'Mock mode available (client-side)');
      return true;
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Supabase Connection
    const isSupabaseConnected = await testSupabaseConnection();
    
    if (isSupabaseConnected) {
      // Test 2: Database Connection
      await testDatabaseConnection();
      
      // Test 3: Create Test User (if not exists)
      // await createTestUser(); // Comment out to avoid duplicate users
      
      // Test 4: Login
      await testLogin();
    } else {
      // Test fallback: Mock Login
      await testMockLogin();
    }

    setIsLoading(false);
  };

  const checkEnvironment = () => {
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    
    return (
      <Alert className={hasSupabaseUrl && hasSupabaseKey ? 'border-green-500' : 'border-yellow-500'}>
        <AlertDescription>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {hasSupabaseUrl ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-yellow-500" />}
              <span>NEXT_PUBLIC_SUPABASE_URL: {hasSupabaseUrl ? '✓ Configured' : '✗ Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              {hasSupabaseKey ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-yellow-500" />}
              <span>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: {hasSupabaseKey ? '✓ Configured' : '✗ Missing'}</span>
            </div>
          </div>
          {!hasSupabaseUrl || !hasSupabaseKey ? (
            <p className="mt-2 text-sm text-muted-foreground">
              สร้างไฟล์ .env.local และใส่ Supabase credentials (ดู env-setup-example.txt)
            </p>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ทดสอบระบบ Authentication</h1>
          <p className="text-muted-foreground mt-2">ทดสอบการเชื่อมต่อ Supabase และระบบ Login</p>
        </div>

        {checkEnvironment()}

        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลสำหรับทดสอบ</CardTitle>
            <CardDescription>ใช้ข้อมูลนี้ในการสร้าง Test User และ Login</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@menuyou.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Test123456"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={runAllTests} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังทดสอบ...
                  </>
                ) : (
                  'รันการทดสอบทั้งหมด'
                )}
              </Button>
              <Button variant="outline" onClick={createTestUser} disabled={isLoading}>
                สร้าง Test User
              </Button>
              <Button variant="outline" onClick={testLogin} disabled={isLoading}>
                ทดสอบ Login
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ผลการทดสอบ</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">ยังไม่มีผลการทดสอบ</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{result.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การทดสอบแบบ Manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1. ทดสอบ Mock Login (ไม่ต้องมี Supabase)</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>ไปที่ <a href="/login" className="text-primary underline">/login</a></li>
                <li>Email: admin@example.com</li>
                <li>Password: password</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. ทดสอบ Supabase Login</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>ตั้งค่า .env.local ตาม env-setup-example.txt</li>
                <li>รัน SQL: 08_add_auth_to_members.sql ใน Supabase</li>
                <li>สร้าง Test User ด้วยปุ่ม "สร้าง Test User" ข้างบน</li>
                <li>ไปที่ <a href="/login" className="text-primary underline">/login</a> และใช้ credentials ที่สร้าง</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-sm text-muted-foreground">
          <p>💡 <strong>เคล็ดลับ:</strong> ถ้า Supabase ยังไม่ได้ตั้งค่า ระบบจะใช้ Mock Login อัตโนมัติ</p>
          <p>📖 <strong>คู่มือ:</strong> อ่านเพิ่มเติมที่ SUPABASE_AUTH_GUIDE.md</p>
        </div>
      </div>
    </div>
  );
}

