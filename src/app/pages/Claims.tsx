"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, Search, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClaimStore } from '@/store/claimStore';
import { useOrderStore } from '@/store/orderStore';

const Claims = () => {
  const { claims, loadClaims } = useClaimStore();
  const { getOrderById } = useOrderStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const filteredClaims = claims.filter((claim) => {
    const order = getOrderById(claim.orderId.toString());
    const matchesSearch = 
      claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.reporterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'warning';
      case 'in_progress':
        return 'primary';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'เปิด';
      case 'in_progress':
        return 'ดำเนินการ';
      case 'resolved':
        return 'แก้ไขแล้ว';
      case 'closed':
        return 'ปิด';
      default:
        return status;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'ด่วนมาก';
      case 'high':
        return 'สูง';
      case 'medium':
        return 'ปานกลาง';
      case 'low':
        return 'ต่ำ';
      default:
        return priority;
    }
  };

  const getClaimTypeText = (type: string) => {
    switch (type) {
      case 'quality':
        return 'คุณภาพ';
      case 'delivery':
        return 'การส่งมอบ';
      case 'design':
        return 'การออกแบบ';
      case 'other':
        return 'อื่นๆ';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">การ Claim</h1>
          <p className="text-muted-foreground">
            จัดการการร้องเรียนและการ claim ทั้งหมด
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          สร้าง Claim ใหม่
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            ค้นหาและกรอง
          </CardTitle>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหา claim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="open">เปิด</SelectItem>
                <SelectItem value="in_progress">ดำเนินการ</SelectItem>
                <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
                <SelectItem value="closed">ปิด</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสออเดอร์</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead>ผู้รายงาน</TableHead>
                <TableHead>ความสำคัญ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => {
                const order = getOrderById(claim.orderId.toString());
                return (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {order?.code || 'ไม่พบออเดอร์'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getClaimTypeText(claim.claimType || 'other')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {claim.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.reporterName || '-'}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.reportedBy === 'customer' ? 'ลูกค้า' : 'ภายใน'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(claim.priority || 'medium')}>
                        {getPriorityText(claim.priority || 'medium')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(claim.status || 'open')}>
                        {getStatusText(claim.status || 'open')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(claim.createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredClaims.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    ไม่พบการ claim
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Claims;