import MasterTest from '@/components/MasterTest';

export default function TestSupabasePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">ทดสอบการเชื่อมต่อ Supabase</h1>
        <p className="text-muted-foreground">
          หน้านี้ใช้สำหรับทดสอบการดึงข้อมูล master จาก database ผ่าน Supabase
        </p>
      </div>
      <MasterTest />
    </div>
  );
}
