"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMemberStore } from "@/store/memberStore";
import { useMasterStore } from "@/store/masterStore";
import { useToast } from "@/hooks/use-toast";

const memberFormSchema = z.object({
  userName: z.string().min(1, "ชื่อผู้ใช้จำเป็น"),
  nickname: z.string().optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").min(1, "อีเมลจำเป็น"),
  password: z
    .string()
    .min(4, "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร")
    .optional()
    .or(z.literal("")),
  roleCode: z.string().min(1, "บทบาทจำเป็น"),
  status: z.enum(["active", "inactive"]),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

interface MemberFormProps {
  memberId?: string | null;
  onSuccess?: () => void;
}

export function MemberForm({ memberId, onSuccess }: MemberFormProps) {
  const { getMemberById, createMember, updateMember } = useMemberStore();
  const {
    getActiveItems,
    loadMasters,
    masters,
    isLoading: mastersLoading,
  } = useMasterStore();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // โหลด masters ครั้งเดียวตอน mount
  useEffect(() => {
    if (!mastersLoading && masters.roles.length === 0) {
      loadMasters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      userName: "",
      nickname: "",
      email: "",
      password: "",
      roleCode: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (memberId) {
      const member = getMemberById(memberId);
      if (member) {
        console.log("Member data:", member);
        console.log("Role code:", member.roleCode);
        form.reset({
          userName: member.userName,
          nickname: member.nickname ?? "",
          email: member.email ?? "",
          password: "", // ไม่แสดง password เดิม
          roleCode: member.roleCode,
          status: member.status ? "active" : "inactive",
        });
      }
    } else {
      form.reset({
        userName: "",
        nickname: "",
        email: "",
        password: "",
        roleCode: "",
        status: "active",
      });
    }
    setSubmitError(null);
  }, [memberId, getMemberById, form]);

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (memberId) {
        await updateMember(memberId, {
          userName: data.userName,
          nickname: data.nickname || null,
          email: data.email,
          password: data.password || undefined,
          roleCode: data.roleCode,
          status: data.status === "active",
        });
        toast({
          title: "สำเร็จ",
          description: "อัปเดตข้อมูลสมาชิกเรียบร้อย",
        });
      } else {
        await createMember({
          userName: data.userName,
          nickname: data.nickname || null,
          email: data.email,
          password: data.password || null,
          roleCode: data.roleCode,
          status: data.status === "active",
        });
        toast({
          title: "สำเร็จ",
          description: "เพิ่มสมาชิกใหม่เรียบร้อย",
        });
      }
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้";
      setSubmitError(errorMessage);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = getActiveItems("roles");

  // Fallback roles ถ้าดึงจาก DB ไม่ได้
  const defaultRoles = [
    { code: "SUPER_ADMIN", name: "Super Admin" },
    { code: "ADMIN", name: "Admin" },
    { code: "DESIGNER_INHOUSE", name: "Designer (In-house)" },
    { code: "STAFF", name: "Staff" },
  ];

  const roleOptions = roles.length > 0 ? roles : defaultRoles;

  console.log("Role options:", roleOptions);
  console.log("Current form roleCode value:", form.watch("roleCode"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อผู้ใช้</FormLabel>
                <FormControl>
                  <Input placeholder="กรุณาใส่ชื่อผู้ใช้" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อเล่น</FormLabel>
                <FormControl>
                  <Input placeholder="กรุณาใส่ชื่อเล่น" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  อีเมล <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="กรุณาใส่อีเมล" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {memberId
                    ? "รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)"
                    : "รหัสผ่าน"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="กรุณาใส่รหัสผ่าน"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>บทบาท</FormLabel>
                <Select
                  key={field.value || "empty"}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกบทบาท" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.code} value={role.code}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>สถานะ</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">ใช้งาน</SelectItem>
                    <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="bg-gradient-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : memberId ? (
              "อัปเดต"
            ) : (
              "เพิ่มสมาชิก"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
