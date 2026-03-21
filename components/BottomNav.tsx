'use client';

import { LayoutDashboard, Dumbbell, Utensils, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Workout', path: '/workout', icon: Dumbbell },
    { name: 'Profile', path: '/profile', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[32px] bg-surface-container-high/70 backdrop-blur-3xl border-t border-white/10 shadow-[0_-8px_32px_rgba(191,129,255,0.08)]">
      <div className="flex justify-around items-center h-20 px-4 pb-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex flex-col items-center justify-center relative transition-all active:scale-95 duration-200 ease-out ${isActive ? 'text-primary' : 'text-on-surface/40 hover:text-primary/80'}`}
            >
              <Icon size={24} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-headline font-bold text-[10px] uppercase tracking-widest">
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
