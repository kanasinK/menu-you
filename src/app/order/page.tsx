import { Metadata } from "next";
import CustomerOrderForm from "@/pages/CustomerOrderForm";

export const metadata: Metadata = {
  title: "แบบฟอร์มสั่งงาน - ระบบจัดการงานพิมพ์",
  description: "กรอกข้อมูลเพื่อสั่งงานพิมพ์",
};

export default function OrderPage() {
  return <CustomerOrderForm />;
}
