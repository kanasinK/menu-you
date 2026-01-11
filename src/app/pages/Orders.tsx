"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrderStore } from "@/store/orderStore";
import { useMasterStore } from "@/store/masterStore";
import { Order } from "@/types";

const Orders = () => {
  const { orders, query, loadOrders, setQuery, deleteOrder } = useOrderStore();
  const { masters, getById, getByCode } = useMasterStore();
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatCurrency = (amount: number | null | undefined) => {
    const safe = typeof amount === "number" ? amount : 0
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(safe);
  };

  const handleSearch = (value: string) => {
    setQuery({ q: value, page: 1 });
  };

  const handleStatusFilter = (value: string) => {
    setQuery({ statusCode: value === "all" ? undefined : value, page: 1 });
  };

  const handlePaymentStatusFilter = (value: string) => {
    setQuery({ paymentStatusCode: value === "all" ? undefined : value, page: 1 });
  };

  const handleServiceTypeFilter = (value: string) => {
    setQuery({ serviceTypeCode: value === "all" ? undefined : value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setQuery({ page });
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบออเดอร์นี้หรือไม่?")) {
      await deleteOrder(id);
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      id: "code",
      accessorKey: "code",
      header: "รหัสออเดอร์",
      cell: ({ row }) => (
        <Link
          href={`/orders/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.code}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "ลูกค้า",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.fullName}</div>
          <div className="text-sm text-muted-foreground">{row.original.shopName || row.original.email || row.original.tel || '-'}</div>
        </div>
      ),
    },
    {
      id: "serviceType",
      header: "ประเภทบริการ",
      cell: ({ row }) => {
        const serviceType = row.original.serviceTypeCode ? getByCode("serviceTypes", row.original.serviceTypeCode) : undefined
        return serviceType?.name || "-";
      },
    },
    {
      id: "statusCode",
      header: "สถานะ",
      cell: ({ row }) => {
        const status = row.original.statusCode ? getByCode("status", row.original.statusCode) : undefined
        return (
          <Badge variant="secondary">
            {status?.name || "ไม่ระบุ"}
          </Badge>
        );
      },
    },
    {
      id: "paymentStatusCode",
      header: "การชำระเงิน",
      cell: ({ row }) => {
        const ps = row.original.paymentStatusCode ? getByCode("paymentStatus", row.original.paymentStatusCode) : undefined
        return (
          <Badge variant="secondary">
            {ps?.name || "ไม่ระบุ"}
          </Badge>
        );
      },
    },
    {
      id: "total",
      header: "ยอดรวม",
      cell: ({ row }) => (
        <div className="font-medium">{formatCurrency(row.original.price)}</div>
      ),
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "วันที่สร้าง",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "การจัดการ",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/orders/${row.original.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                ดูรายละเอียด
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/orders/${row.original.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                แก้ไข
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id as unknown as string)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: orders?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ออเดอร์</h1>
          <p className="text-muted-foreground">จัดการออเดอร์ทั้งหมดในระบบ</p>
        </div>
        <Button asChild className="bg-gradient-primary">
          <Link href="/orders/new">
            <Plus className="h-4 w-4 mr-2" />
            สร้างออเดอร์ใหม่
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ค้นหาและกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาออเดอร์..."
                value={query.q || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={query.statusCode || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {masters.status.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={query.paymentStatusCode || "all"}
              onValueChange={handlePaymentStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="การชำระเงิน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {masters.paymentStatus.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={query.serviceTypeCode || "all"}
              onValueChange={handleServiceTypeFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="ประเภทบริการ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกประเภท</SelectItem>
                {masters.serviceTypes.map((type) => (
                  <SelectItem key={type.code} value={type.code}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    ไม่พบออเดอร์
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {orders && orders.pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            แสดง {orders.pagination.page * orders.pagination.size - orders.pagination.size + 1} ถึง {Math.min(
              orders.pagination.page * orders.pagination.size,
              orders.pagination.total
            )} จาก {orders.pagination.total} รายการ
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(orders.pagination.page - 1)}
              disabled={orders.pagination.page <= 1}
            >
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(orders.pagination.page + 1)}
              disabled={orders.pagination.page >= orders.pagination.pages}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
