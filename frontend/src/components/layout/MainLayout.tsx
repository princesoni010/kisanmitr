import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen pb-16 bg-background">
      <div className="flex-1 max-w-md w-full mx-auto shadow-sm min-h-screen bg-background relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
