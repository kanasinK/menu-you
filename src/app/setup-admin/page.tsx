"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertTriangle, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminCredentials {
  email: string;
  password: string;
}

export default function SetupAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "admin@menuyou.com",
    password: "Admin123456",
    user_name: "superadmin",
    nickname: "Super Admin",
    role_code: "SUPER_ADMIN",
  });

  const createAdmin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError("Admin user นี้มีอยู่แล้ว กรุณาใช้ข้อมูลนี้ login ได้เลย");
          setCredentials({
            email: formData.email,
            password: formData.password,
          });
        } else {
          setError(data.error || "เกิดข้อผิดพลาดในการสร้าง admin");
        }
        return;
      }

      setAdminCreated(true);
      setCredentials(data.credentials);
    } catch (err) {
      console.error("Create admin error:", err);
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ API"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingAdmins = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/create-admin");
      const data = await response.json();

      interface AdminInfo {
        email: string;
      }

      if (data.count > 0) {
        setError(
          `พบ Admin ${data.count} คนแล้ว: ${data.admins
            .map((a: AdminInfo) => a.email)
            .join(", ")}`
        );
      } else {
        setError("ยังไม่มี Admin ในระบบ กรุณาสร้าง Admin");
      }
    } catch {
      setError("ไม่สามารถตรวจสอบ Admin ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ตั้งค่า Super Admin</h1>
          <p className="text-muted-foreground mt-2">
            สร้างบัญชี Super Admin สำหรับเข้าใช้งานระบบครั้งแรก
          </p>
        </div>

        {process.env.NODE_ENV === "production" && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <strong>คำเตือน:</strong> หน้านี้ควรใช้เฉพาะใน development mode
              เท่านั้น!
            </AlertDescription>
          </Alert>
        )}

        {!adminCreated && !credentials ? (
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูล Super Admin</CardTitle>
              <CardDescription>
                กรอกข้อมูลสำหรับสร้างบัญชี Super Admin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@menuyou.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
                <p className="text-xs text-muted-foreground">
                  ควรมีความยาวอย่างน้อย 8 ตัวอักษร และผสมตัวพิมพ์ใหญ่เล็ก
                </p>
              </div>

              <div className="space-y-2">
                <Label>User Name</Label>
                <Input
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                  placeholder="superadmin"
                />
              </div>

              <div className="space-y-2">
                <Label>Nickname</Label>
                <Input
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="Super Admin"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={createAdmin}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังสร้าง...
                    </>
                  ) : (
                    "สร้าง Super Admin"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={checkExistingAdmins}
                  disabled={isLoading}
                >
                  ตรวจสอบ Admin ที่มีอยู่
                </Button>
              </div>

              {error && (
                <Alert
                  className={
                    credentials ? "border-yellow-500" : "border-destructive"
                  }
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-500">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <CardTitle>Super Admin สร้างสำเร็จ!</CardTitle>
              </div>
              <CardDescription>บันทึกข้อมูลนี้ไว้สำหรับ login</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <Label className="text-xs">Email</Label>
                  <p className="font-mono text-sm">{credentials?.email}</p>
                </div>
                <div>
                  <Label className="text-xs">Password</Label>
                  <p className="font-mono text-sm">{credentials?.password}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyCredentials}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  คัดลอกข้อมูล
                </Button>
                <Button onClick={goToLogin} className="flex-1">
                  ไปหน้า Login
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>หมายเหตุ:</strong> กรุณาบันทึก password
                  ไว้ในที่ปลอดภัย คุณจะต้องใช้ข้อมูลนี้ในการ login ครั้งแรก
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>ขั้นตอนการตั้งค่า</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                ตรวจสอบว่าตั้งค่า Supabase ใน <code>.env.local</code> แล้ว
              </li>
              <li>
                รัน SQL migration: <code>08_add_auth_to_members.sql</code> ใน
                Supabase
              </li>
              <li>เปิด Email Auth Provider ใน Supabase Dashboard</li>
              <li>สร้าง Super Admin ด้วยปุ่มด้านบน</li>
              <li>
                ใช้ข้อมูล admin ที่ได้ login ที่หน้า <code>/login</code>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
