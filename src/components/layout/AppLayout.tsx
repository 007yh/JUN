import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, Heart, User, Clock, Image } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../store/appStore';

// Define theme color map
const themeMap: Record<string, string> = {
  'default': 'bg-pink-50/50',
  'blue': 'bg-blue-50/50',
  'purple': 'bg-purple-50/50',
  'green': 'bg-green-50/50',
  'yellow': 'bg-yellow-50/50',
  'dark': 'bg-gray-900 text-white', // Simple dark mode simulation
};

export default function AppLayout() {
  const { themeColor } = useAppStore();
  const bgClass = themeMap[themeColor] || themeMap['default'];

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500 font-sans`}>
      <main className="pb-24 md:pb-0 md:pl-24 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-xl border-t border-white/40 p-2 pb-6 flex justify-around items-center md:hidden z-50 rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
        <NavItem to="/dashboard" icon={<Home size={22} />} label="首页" />
        <NavItem to="/timeline" icon={<Clock size={22} />} label="记录" />
        <NavItem to="/album" icon={<Image size={22} />} label="相册" />
        <NavItem to="/hobbies" icon={<Heart size={22} />} label="爱好" />
        <NavItem to="/anniversary" icon={<Calendar size={22} />} label="纪念日" />
        <NavItem to="/profile" icon={<User size={22} />} label="我的" />
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex flex-col fixed top-0 bottom-0 left-0 w-24 bg-white/60 backdrop-blur-xl border-r border-white/40 items-center py-8 gap-6 z-50 shadow-[8px_0_32px_rgba(0,0,0,0.05)]">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-clay-btn flex items-center justify-center text-white font-bold text-xl">
          CJ
        </div>
        <NavItem to="/dashboard" icon={<Home size={24} />} label="首页" vertical />
        <NavItem to="/timeline" icon={<Clock size={24} />} label="记录" vertical />
        <NavItem to="/album" icon={<Image size={24} />} label="相册" vertical />
        <NavItem to="/anniversary" icon={<Calendar size={24} />} label="纪念日" vertical />
        <NavItem to="/hobbies" icon={<Heart size={24} />} label="爱好" vertical />
        <div className="mt-auto">
          <NavItem to="/profile" icon={<User size={24} />} label="我的" vertical />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, vertical = false }: { to: string; icon: React.ReactNode; label: string; vertical?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center text-gray-400 transition-all duration-300 group",
          isActive && "text-primary"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "p-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
            isActive 
              ? "bg-white shadow-clay-inset text-primary translate-y-1" 
              : "shadow-clay-btn bg-white hover:translate-y-[-2px]"
          )}>
            {icon}
          </div>
          <span className={cn(
            "text-[10px] font-medium mt-2 transition-opacity",
            isActive ? "font-bold" : "opacity-70 group-hover:opacity-100"
          )}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
