import { Link, useLocation } from "react-router-dom";
import { Home, List, ShieldAlert, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useLanguage();

  const navItems = [
    { href: "/home", label: t.nav_home, icon: Home },
    { href: "/schemes", label: t.nav_schemes, icon: List },
    { href: "/fraud-check", label: t.nav_fraud, icon: ShieldAlert },
    { href: "/profile", label: t.nav_profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-text-subtle hover:text-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-blue-50" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
