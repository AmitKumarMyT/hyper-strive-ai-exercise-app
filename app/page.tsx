'use client';

import { motion } from 'motion/react';
import { Camera, Search, Plus, Zap, Utensils } from 'lucide-react';
import Image from 'next/image';
import CircularProgress from '@/components/CircularProgress';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Kinetic Macro Dashboard */}
      <section className="relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[32px] p-8 space-y-8 overflow-hidden relative"
        >
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
          
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-tertiary font-body text-xs font-bold tracking-[0.2em] uppercase">
                Daily Budget
              </span>
              <h1 className="font-headline font-black text-6xl text-glow tracking-tighter">
                1,240
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">kcal remaining</p>
            </div>
            
            <CircularProgress value={56} max={100} size={96} strokeWidth={8}>
              <span className="font-headline font-bold text-lg">56%</span>
            </CircularProgress>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col justify-between h-32">
              <span className="text-on-surface-variant font-body text-[10px] font-bold tracking-widest uppercase">
                Protein Target
              </span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline font-black text-3xl text-primary">142</span>
                  <span className="text-on-surface-variant font-bold text-xs">/ 190g</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '74%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(202,253,0,0.4)]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col justify-between h-32">
              <span className="text-on-surface-variant font-body text-[10px] font-bold tracking-widest uppercase">
                Hypertrophy Fuel
              </span>
              <div className="flex items-center gap-2 text-tertiary">
                <Zap size={18} className="fill-current" />
                <span className="font-bold text-xs tracking-tight">Optimal Phase</span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-tight">
                Protein intake is on track for maximal mTor signaling.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Integration: Snap & Track */}
      <section>
        <motion.button 
          whileTap={{ scale: 0.98 }}
          className="w-full kinetic-gradient p-[1px] rounded-2xl group transition-transform"
        >
          <div className="bg-surface rounded-[15px] p-5 flex items-center justify-between group-hover:bg-transparent transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <Camera size={28} className="fill-current" />
              </div>
              <div className="text-left">
                <h3 className="font-headline font-extrabold text-lg leading-none mb-1 text-on-surface">
                  Snap & Track
                </h3>
                <p className="text-on-surface-variant text-xs font-medium">
                  Powered by Gemini Flash AI
                </p>
              </div>
            </div>
            <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">
              →
            </span>
          </div>
        </motion.button>
      </section>

      {/* Search Bar */}
      <section className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search 2M+ foods manually..." 
          className="w-full bg-surface-container-high border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 text-on-surface outline-none"
        />
      </section>

      {/* Today's Log */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-headline font-black text-xl tracking-tight uppercase">Today&apos;s Fuel</h2>
          <span className="text-on-surface-variant font-body text-[10px] font-bold tracking-widest uppercase">
            4 Meals Logged
          </span>
        </div>

        <div className="space-y-4">
          {/* Breakfast */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-3xl p-5 flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
              <Image 
                src="https://picsum.photos/seed/breakfast/200/200" 
                alt="Breakfast" 
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-headline font-bold text-base truncate">Breakfast</h4>
                <span className="text-on-surface-variant text-xs font-bold">08:30 AM</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-on-surface-variant">450 kcal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-xs font-bold text-on-surface-variant">32g protein</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lunch */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-5 flex items-center gap-4 border-l-4 border-l-primary/40"
          >
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative">
              <Image 
                src="https://picsum.photos/seed/lunch/200/200" 
                alt="Lunch" 
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-headline font-bold text-base truncate">Grilled Chicken & Quinoa</h4>
                <span className="text-on-surface-variant text-xs font-bold">01:15 PM</span>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-on-surface-variant">620 kcal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-xs font-bold text-on-surface-variant">58g protein</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dinner (Empty state) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container-low rounded-3xl p-5 border border-dashed border-on-surface-variant/20 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant/50">
                <Utensils size={24} />
              </div>
              <div>
                <h4 className="font-headline font-bold text-base text-on-surface-variant">Dinner</h4>
                <p className="text-xs text-on-surface-variant/50 font-medium">Not logged yet</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
