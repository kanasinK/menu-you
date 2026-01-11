import { Metadata } from "next";
import Orders from "@/pages/Orders";

export const metadata: Metadata = {
  title: "ออเดอร์ - ระบบจัดการงานพิมพ์",
  description: "จัดการออเดอร์ทั้งหมดในระบบ",
};

export default function OrdersPage() {
  return <Orders />;
}
