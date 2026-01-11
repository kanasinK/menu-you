import { Metadata } from "next";
import Claims from "@/pages/Claims";

export const metadata: Metadata = {
  title: "การ Claim - ระบบจัดการงานพิมพ์",
  description: "จัดการการร้องเรียนและการ claim ทั้งหมด",
};

export default function ClaimsPage() {
  return <Claims />;
}
