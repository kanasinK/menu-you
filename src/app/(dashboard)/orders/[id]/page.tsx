import { Metadata } from "next";
import OrderDetail from "@/pages/OrderDetail";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: "รายละเอียดออเดอร์ - ระบบจัดการงานพิมพ์",
  description: "ดูรายละเอียดออเดอร์",
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return <OrderDetail orderId={params.id} />;
}
