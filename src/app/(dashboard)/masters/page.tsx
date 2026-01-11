import { Metadata } from "next";
import Masters from "@/pages/Masters";

export const metadata: Metadata = {
  title: "ข้อมูลมาตรฐาน - ระบบจัดการงานพิมพ์",
  description: "จัดการข้อมูลมาตรฐานทั้งหมดในระบบ",
};

export default function MastersPage() {
  return <Masters />;
}
