import { Metadata } from "next";
import Login from "@/pages/Login";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ - ระบบจัดการงานพิมพ์",
  description: "เข้าสู่ระบบเพื่อจัดการออเดอร์และงานพิมพ์",
};

export default function LoginPage() {
  return <Login />;
}
