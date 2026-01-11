"use client";

import { useState } from "react";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMasterStore } from "@/store/masterStore";
import {
  MasterData,
  MasterItem,
  Color,
  Status,
  ServiceType,
  Theme,
  Product,
  Role,
} from "@/types";

type MasterDataItem =
  | ServiceType
  | Theme
  | Color
  | Product
  | MasterItem
  | Role
  | Status;

const Masters = () => {
  const { masters } = useMasterStore();
  const [activeTab, setActiveTab] = useState<keyof MasterData>("serviceTypes");

  const masterTabs = [
    { key: "serviceTypes", label: "ประเภทบริการ" },
    { key: "themes", label: "ธีม" },
    { key: "colors", label: "สี" },
    { key: "products", label: "สินค้า" },
    { key: "sizes", label: "ขนาด" },
    { key: "materials", label: "วัสดุ" },
    { key: "coatings", label: "การเคลือบ" },
    { key: "equipments", label: "อุปกรณ์" },
    { key: "roles", label: "บทบาท" },
    { key: "status", label: "สถานะ" },
    { key: "paymentStatus", label: "สถานะการชำระ" },
  ] as const;

  const renderTable = (type: keyof MasterData) => {
    const data = masters[type] ?? [];

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อ</TableHead>
            <TableHead>รหัส</TableHead>
            {type === "colors" && <TableHead>สี</TableHead>}
            {(type === "status" || type === "paymentStatus") && (
              <TableHead>ประเภท</TableHead>
            )}
            <TableHead>สถานะ</TableHead>
            <TableHead>การจัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: MasterDataItem) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {(item as any).name ?? (item as any).label}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.code}</Badge>
              </TableCell>
              {type === "colors" && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: (item as Color).hexCode }}
                    />
                    <span className="text-sm">{(item as Color).hexCode}</span>
                  </div>
                </TableCell>
              )}
              {(type === "status" || type === "paymentStatus") && (
                <TableCell>
                  <Badge variant={(item as any).color || "outline"}>
                    {(item as any).color || ""}
                  </Badge>
                </TableCell>
              )}
              <TableCell>
                <Badge variant={item.isActive ? "success" : "secondary"}>
                  {item.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                ไม่มีข้อมูล
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ข้อมูลมาตรฐาน</h1>
          <p className="text-muted-foreground">
            จัดการข้อมูลมาตรฐานทั้งหมดในระบบ
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มข้อมูลใหม่
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ข้อมูลมาตรฐาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value: string) =>
              setActiveTab(value as keyof MasterData)
            }
          >
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
              {masterTabs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-xs">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {masterTabs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{tab.label}</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่ม{tab.label}ใหม่
                    </Button>
                  </div>
                  {renderTable(tab.key)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Masters;
