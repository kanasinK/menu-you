"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Statistics {
  total: number;
  totalAmount: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  recentOrders: Array<{
    id: number;
    fullName: string;
    price: number;
    createdAt: string;
    statusCode?: string;
    paymentStatusCode?: string;
  }>;
}

interface Members {
  total: number;
  active: number;
}

interface Claims {
  total: number;
}

export default function DashboardClient() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [members, setMembers] = useState<Members | null>(null);
  const [claims, setClaims] = useState<Claims | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ดึงข้อมูลสถิติจาก Supabase
      const response = await fetch('/api/statistics');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load statistics');
      }

      setStatistics(data.statistics);
      setMembers(data.members);
      setClaims(data.claims);
    } catch (err: any) {
      console.error('Load data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-glow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center text-muted-foreground">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="text-destructive">เกิดข้อผิดพลาด: {error}</div>
        <Button onClick={loadData} variant="outline">
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ออเดอร์ทั้งหมด
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {statistics?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">รายการออเดอร์ในระบบ</p>
          </CardContent>
        </Card>

        <Card className="shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดขายรวม</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(statistics?.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">รายได้รวมทั้งหมด</p>
          </CardContent>
        </Card>

        <Card className="shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทำงาน</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {members?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">สมาชิกที่ใช้งานระบบ</p>
          </CardContent>
        </Card>

        <Card className="shadow-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">การ Claim</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {claims?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">รอการดำเนินการ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              สถานะออเดอร์
            </CardTitle>
            <CardDescription>จำนวนออเดอร์แยกตามสถานะ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statistics?.byStatus || {}).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {status}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            )}
            {Object.keys(statistics?.byStatus || {}).length === 0 && (
              <div className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              สถานะการชำระเงิน
            </CardTitle>
            <CardDescription>จำนวนออเดอร์แยกตามการชำระเงิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statistics?.byPaymentStatus || {}).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {status}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            )}
            {Object.keys(statistics?.byPaymentStatus || {}).length === 0 && (
              <div className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                ออเดอร์ล่าสุด
              </CardTitle>
              <CardDescription>
                ออเดอร์ที่สร้างล่าสุด 5 รายการ
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/orders">
                <Eye className="h-4 w-4 mr-2" />
                ดูทั้งหมด
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics?.recentOrders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{order.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    ออเดอร์ #{order.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(order.price || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {(!statistics?.recentOrders || statistics.recentOrders.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                ยังไม่มีออเดอร์ในระบบ
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}