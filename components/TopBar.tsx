'use client';

import { Bell } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'motion/react';

export default function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-white/5">
      <div className="flex items-center gap-3 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 flex-1">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 relative"
          >
            <Image 
              src="https://picsum.photos/seed/userprofile/100/100" 
              alt="Profile" 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <span className="font-headline font-black tracking-widest uppercase text-on-surface text-xl">
            HYPERSTRIVE
          </span>
        </div>
        <button className="text-on-surface/60 hover:text-primary transition-colors active:scale-95 duration-100">
          <Bell size={24} />
        </button>
      </div>
    </header>
  );
}
