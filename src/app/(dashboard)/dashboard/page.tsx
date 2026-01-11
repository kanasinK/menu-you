import { Metadata } from "next";
import Dashboard from "@/pages/Dashboard";

export const metadata: Metadata = {
  title: "แดชบอร์ด - ระบบจัดการงานพิมพ์",
  description: "ภาพรวมการดำเนินงานระบบจัดการงานพิมพ์",
};

export default function DashboardPage() {
  return <Dashboard />;
}
