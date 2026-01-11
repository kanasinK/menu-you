"use client";

import { useEffect } from "react";
import { ArrowLeft, Edit, Printer, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrderStore } from "@/store/orderStore";
import { useMasterStore } from "@/store/masterStore";
import { useMemberStore } from "@/store/memberStore";

interface OrderDetailProps {
  orderId?: string;
}

const OrderDetail = ({ orderId }: OrderDetailProps) => {
  const { selectedOrder, selectOrder } = useOrderStore();
  const { getById } = useMasterStore();
  const { getMemberById } = useMemberStore();

  useEffect(() => {
    if (orderId) {
      selectOrder(orderId);
    }
  }, [orderId, selectOrder]);

  if (!selectedOrder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const status = getById("status", (selectedOrder as any).statusCode ?? (selectedOrder as any).status);
  const paymentStatus = getById("paymentStatus", (selectedOrder as any).paymentStatusCode ?? (selectedOrder as any).paymentStatus);
  const serviceType = getById("serviceTypes", (selectedOrder as any).serviceTypeCode ?? (selectedOrder as any).serviceTypeId);
  const theme = getById("themes", (selectedOrder as any).themeCode ?? (selectedOrder as any).themeId);
  const assignee = getMemberById(String((selectedOrder as any).assigneeId ?? ""));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {selectedOrder.code}
            </h1>
            <p className="text-muted-foreground">รายละเอียดออเดอร์</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            พิมพ์
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            ดาวน์โหลด
          </Button>
          <Button asChild className="bg-gradient-primary">
            <Link href={`/orders/${selectedOrder.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              แก้ไข
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลออเดอร์</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    รหัสออเดอร์
                  </label>
                  <p className="font-medium">{selectedOrder.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ประเภทบริการ
                  </label>
                  <p className="font-medium">{serviceType?.name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ธีม
                  </label>
                  <p className="font-medium">{theme?.name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ผู้รับผิดชอบ
                  </label>
                  <p className="font-medium">{(assignee as any)?.fullName ?? (assignee as any)?.userName ?? "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    สถานะ
                  </label>
                  <div className="pt-1">
                    <Badge variant={(status as any)?.color || "secondary"}>
                      {status?.name || "ไม่ระบุ"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    การชำระเงิน
                  </label>
                  <div className="pt-1">
                    <Badge
                      variant={(paymentStatus as any)?.color || "secondary"}
                    >
                      {paymentStatus?.name || "ไม่ระบุ"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ชื่อบริษัท/ลูกค้า
                  </label>
                  <p className="font-medium">
                    {(selectedOrder as any).contact?.customerName ?? (selectedOrder as any).fullName ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ผู้ติดต่อ
                  </label>
                  <p className="font-medium">
                    {(selectedOrder as any).contact?.contactPerson ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    อีเมล
                  </label>
                  <p className="font-medium">{(selectedOrder as any).contact?.email ?? (selectedOrder as any).email ?? "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    โทรศัพท์
                  </label>
                  <p className="font-medium">{(selectedOrder as any).contact?.phone ?? (selectedOrder as any).tel ?? "-"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ที่อยู่
                </label>
                <p className="font-medium">{(selectedOrder as any).contact?.address ?? (selectedOrder as any).shippingAddress ?? "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Design Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลการออกแบบ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  แนวคิด
                </label>
                  <p className="font-medium">
                    {(selectedOrder as any).designInfo?.concept ?? "-"}
                  </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  หมายเหตุ
                </label>
                <p className="font-medium">{(selectedOrder as any).designInfo?.notes ?? "-"}</p>
              </div>
              {((selectedOrder as any).designInfo?.files?.length ?? 0) > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    ไฟล์แนบ
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(selectedOrder as any).designInfo.files.map((file: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Amount Summary */}
          <Card>
            <CardHeader>
              <CardTitle>สรุปยอดเงิน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>ยอดรวม</span>
                <span>{formatCurrency(((selectedOrder as any).amount?.subtotal ?? 0) as number)}</span>
              </div>
              <div className="flex justify-between">
                <span>ส่วนลด</span>
                <span>-{formatCurrency(((selectedOrder as any).amount?.discount ?? 0) as number)}</span>
              </div>
              <div className="flex justify-between">
                <span>ภาษี</span>
                <span>{formatCurrency(((selectedOrder as any).amount?.tax ?? 0) as number)}</span>
              </div>
              <div className="flex justify-between">
                <span>ค่าจัดส่ง</span>
                <span>{formatCurrency(((selectedOrder as any).amount?.shipping ?? 0) as number)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>รวมทั้งสิ้น</span>
                <span className="text-primary">
                  {formatCurrency(((selectedOrder as any).amount?.total ?? 0) as number)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>ไทม์ไลน์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(((selectedOrder as any).timeline ?? []) as Array<any>).map((item: any, index: number) => {
                  const user = getMemberById(String(item.userId ?? ""));
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {(user as any)?.fullName ?? (user as any)?.userName ?? "ไม่ระบุ"}
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(item.timestamp).toLocaleDateString(
                              "th-TH"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
