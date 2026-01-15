import { Metadata } from "next";
import OrderForm from "@/pages/OrderForm";

interface OrderEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "แก้ไขออเดอร์ - ระบบจัดการงานพิมพ์",
  description: "แก้ไขข้อมูลออเดอร์",
};

export default async function OrderEditPage({ params }: OrderEditPageProps) {
  const { id } = await params;
  return <OrderForm orderId={id} />;
}
