"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMemberStore } from '@/store/memberStore';
import { useMasterStore } from '@/store/masterStore';
import { MemberForm } from '@/components/forms/MemberForm';

const Members = () => {
  const { members, loadMembers, deleteMember } = useMemberStore();
  const { getById } = useMasterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const filteredMembers = members.filter((member) => {
    const name = (member as any).fullName ?? (member as any).userName ?? ""
    const email = (member as any).email ?? ""
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบสมาชิกนี้หรือไม่?')) {
      await deleteMember(id);
    }
  };

  const handleEdit = (id: string) => {
    setSelectedMember(id);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">สมาชิก</h1>
          <p className="text-muted-foreground">
            จัดการสมาชิกในระบบ
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มสมาชิกใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedMember ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}
              </DialogTitle>
            </DialogHeader>
            <MemberForm
              memberId={selectedMember}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            รายชื่อสมาชิก
          </CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาสมาชิก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>โทรศัพท์</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const role = getById('roles', (member as any).roleId ?? (member as any).roleCode);
                const idStr = String((member as any).id ?? '')
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {(member as any).fullName ?? (member as any).userName}
                    </TableCell>
                    <TableCell>{(member as any).email ?? ""}</TableCell>
                    <TableCell>{(member as any).tel ?? ""}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{role?.name || 'ไม่ระบุ'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(member as any).status === true || (member as any).status === 'active' ? 'success' : 'secondary'}>
                        {(member as any).status === true || (member as any).status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date((member as any).createdAt).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(idStr)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(idStr)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    ไม่พบสมาชิก
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

export default Members;