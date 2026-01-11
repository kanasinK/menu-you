"use client";

import { Loader2 } from "lucide-react";
import { useLoadingStore } from "@/store/loadingStore";

const GlobalLoadingOverlay = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white px-8 py-6 text-center shadow-xl">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-semibold text-gray-900">กำลังประมวลผล...</p>
        <p className="text-sm text-gray-500">กรุณารอสักครู่</p>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
