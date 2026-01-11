import { Metadata } from "next";
import OrderForm from "@/pages/OrderForm";

interface OrderEditPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "แก้ไขออเดอร์ - ระบบจัดการงานพิมพ์",
  description: "แก้ไขข้อมูลออเดอร์",
};

export default function OrderEditPage({ params }: OrderEditPageProps) {
  return <OrderForm orderId={params.id} />;
}
