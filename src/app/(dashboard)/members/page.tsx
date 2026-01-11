import { Metadata } from "next";
import Members from "@/pages/Members";

export const metadata: Metadata = {
  title: "สมาชิก - ระบบจัดการงานพิมพ์",
  description: "จัดการสมาชิกในระบบ",
};

export default function MembersPage() {
  return <Members />;
}
