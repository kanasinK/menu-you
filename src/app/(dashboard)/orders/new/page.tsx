import { Metadata } from "next";
import CustomerOrderForm from "@/pages/CustomerOrderForm";

export const metadata: Metadata = {
  title: "สร้างออเดอร์ใหม่ - ระบบจัดการงานพิมพ์",
  description: "เพิ่มออเดอร์ใหม่เข้าสู่ระบบ",
};

export default function NewOrderPage() {
  return <CustomerOrderForm />;
}
