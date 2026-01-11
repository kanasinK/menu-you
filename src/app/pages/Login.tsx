"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "กรุณาใส่ชื่อผู้ใช้หรืออีเมล"),
  password: z.string().min(1, "กรุณาใส่รหัสผ่าน"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading, error, clearError } = useAuthStore();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    clearError();

    const success = await login(data.usernameOrEmail, data.password);

    if (!success) {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: error || "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "เข้าสู่ระบบสำเร็จ",
      description: "ยินดีต้อนรับเข้าสู่ระบบ",
    });

    // Redirect to dashboard or specified page
    const searchParams = new URLSearchParams(window.location.search);
    const redirect = searchParams.get("redirect") || "/dashboard";
    router.push(redirect);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-business">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Package className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">
              ระบบจัดการงานพิมพ์
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              เข้าสู่ระบบเพื่อจัดการออเดอร์และงานพิมพ์
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="usernameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อผู้ใช้ / อีเมล</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="กรุณาใส่ชื่อผู้ใช้หรืออีเมล"
                        {...field}
                        className="h-11"
                      />
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
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="กรุณาใส่รหัสผ่าน"
                          {...field}
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="text-xs">หากยังไม่มีบัญชี กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
