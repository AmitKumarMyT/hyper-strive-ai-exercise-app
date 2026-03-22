'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Gift, ChevronLeft, ChevronRight, UserPlus, Target, Edit2, Check } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/components/AppProvider';

export default function ProfilePage() {
  const { dailyCaloriesGoal, setDailyCaloriesGoal, dailyProteinGoal, setDailyProteinGoal } = useAppStore();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempCalories, setTempCalories] = useState(dailyCaloriesGoal.toString());
  const [tempProtein, setTempProtein] = useState(dailyProteinGoal.toString());

  const handleSaveGoals = () => {
    const newCalories = parseInt(tempCalories, 10);
    const newProtein = parseInt(tempProtein, 10);
    
    if (!isNaN(newCalories) && newCalories > 0) {
      setDailyCaloriesGoal(newCalories);
    } else {
      setTempCalories(dailyCaloriesGoal.toString());
    }
    
    if (!isNaN(newProtein) && newProtein > 0) {
      setDailyProteinGoal(newProtein);
    } else {
      setTempProtein(dailyProteinGoal.toString());
    }
    
    setIsEditingGoals(false);
  };
  return (
    <div className="space-y-8 pb-12">
      {/* Hero: Athlete Rank & Points */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10">
            <span className="text-tertiary text-xs font-bold tracking-[0.2em] uppercase">
              Current Standing
            </span>
            <h2 className="text-5xl font-black font-headline text-on-surface mt-2 tracking-tighter uppercase italic">
              Bronze Athlete
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                />
              </div>
              <span className="text-on-surface-variant text-xs font-bold shrink-0">650/1000 XP</span>
            </div>
          </div>

          <div className="relative z-10 flex gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <StarIcon className="text-primary w-4 h-4" />
              <span className="text-on-surface font-bold">
                2,450 <span className="text-[10px] text-on-surface-variant uppercase tracking-widest ml-1">Points</span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <Flame className="text-secondary w-4 h-4 fill-current" />
              <span className="text-on-surface font-bold">
                12 <span className="text-[10px] text-on-surface-variant uppercase tracking-widest ml-1">Day Streak</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-primary-container p-8 rounded-3xl flex flex-col justify-center items-center text-center">
          <span className="text-on-primary-container text-xs font-black tracking-widest uppercase mb-2">Rewards</span>
          <Gift className="text-on-primary-container w-12 h-12 mb-4" />
          <p className="text-on-primary-container font-headline font-bold text-lg leading-tight">
            Unlock Premium Program
          </p>
          <button className="mt-4 bg-surface text-on-surface px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
            Redeem
          </button>
        </div>
      </section>

      {/* Daily Goals Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black font-headline uppercase italic">Daily Targets</h3>
            <p className="text-on-surface-variant text-sm font-medium">Customize your macro goals</p>
          </div>
          <button 
            onClick={() => isEditingGoals ? handleSaveGoals() : setIsEditingGoals(true)}
            className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors text-primary"
          >
            {isEditingGoals ? <Check size={20} /> : <Edit2 size={20} />}
          </button>
        </div>

        <div className="glass-panel rounded-[32px] p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  <Target size={20} />
                </div>
                <span className="text-on-surface-variant font-body text-xs font-bold tracking-widest uppercase">
                  Calories
                </span>
              </div>
              
              {isEditingGoals ? (
                <div className="relative z-10 flex items-baseline gap-2">
                  <input 
                    type="number" 
                    value={tempCalories}
                    onChange={(e) => setTempCalories(e.target.value)}
                    className="bg-surface-container-highest border-none rounded-xl py-2 px-4 text-3xl font-black font-headline text-primary w-32 focus:ring-2 focus:ring-primary/50 outline-none"
                  />
                  <span className="text-on-surface-variant font-bold text-sm">kcal</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className="font-headline font-black text-4xl text-primary">{dailyCaloriesGoal}</span>
                  <span className="text-on-surface-variant font-bold text-sm">kcal</span>
                </div>
              )}
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/10 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
                  <Target size={20} />
                </div>
                <span className="text-on-surface-variant font-body text-xs font-bold tracking-widest uppercase">
                  Protein
                </span>
              </div>
              
              {isEditingGoals ? (
                <div className="relative z-10 flex items-baseline gap-2">
                  <input 
                    type="number" 
                    value={tempProtein}
                    onChange={(e) => setTempProtein(e.target.value)}
                    className="bg-surface-container-highest border-none rounded-xl py-2 px-4 text-3xl font-black font-headline text-secondary w-32 focus:ring-2 focus:ring-secondary/50 outline-none"
                  />
                  <span className="text-on-surface-variant font-bold text-sm">g</span>
                </div>
              ) : (
                <div className="relative z-10 flex items-baseline gap-2">
                  <span className="font-headline font-black text-4xl text-secondary">{dailyProteinGoal}</span>
                  <span className="text-on-surface-variant font-bold text-sm">g</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Consistency Lab */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-black font-headline uppercase italic">Consistency Lab</h3>
            <p className="text-on-surface-variant text-sm font-medium">Monthly Progress Tracking</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-8">
          <div className="grid grid-cols-7 gap-y-6 text-center">
            {/* Day Labels */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                {day}
              </div>
            ))}

            {/* Week 1 */}
            <Day date="28" opacity="30" />
            <Day date="29" opacity="30" />
            <Day date="30" opacity="30" />
            <Day date="1" status="workout" />
            <Day date="2" status="nutrition" />
            <Day date="3" status="workout" />
            <Day date="4" status="none" />

            {/* Week 2 */}
            <Day date="5" status="workout" />
            <Day date="6" status="workout" />
            <Day date="7" status="nutrition" />
            <Day date="8" status="workout" />
            <Day date="9" status="workout" />
            <Day date="10" status="none" />
            <Day date="11" status="none" />

            {/* Today */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className="absolute -inset-2 border border-primary/40 rounded-xl bg-primary/5" />
              <span className="text-sm font-bold text-primary relative z-10">12</span>
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#f3ffca] relative z-10" />
            </div>

            {/* Future */}
            <Day date="13" opacity="40" />
            <Day date="14" opacity="40" />
            <Day date="15" opacity="40" />
            <Day date="16" opacity="40" />
            <Day date="17" opacity="40" />
            <Day date="18" opacity="40" />
          </div>

          {/* Legend */}
          <div className="mt-12 flex justify-center gap-6 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#f3ffca]" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Workout Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#bf81ff]" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Nutrition Target</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-2xl font-black font-headline uppercase italic">Community</h3>
          <span className="bg-tertiary/20 text-tertiary text-[10px] font-black px-2 py-0.5 rounded-md border border-tertiary/20 tracking-widest uppercase">Beta</span>
        </div>

        <div className="relative group">
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-tertiary/20 blur-3xl rounded-full" />
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary/10 blur-3xl rounded-full" />
          
          <div className="glass-panel rounded-[32px] p-10 text-center flex flex-col items-center relative z-10">
            <div className="flex -space-x-4 mb-6">
              {[1, 2, 3].map(i => (
                <Image 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/100/100`}
                  alt={`Community member ${i}`}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-surface object-cover"
                />
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant">
                +84
              </div>
            </div>
            
            <h4 className="text-xl font-bold mb-2">Build your elite squad</h4>
            <p className="text-on-surface-variant text-sm max-w-xs mb-8">
              Compete in challenges, share PRs, and push your limits together. Social features are launching soon.
            </p>
            
            <button className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 group">
              <UserPlus className="text-tertiary transition-transform group-hover:rotate-12" size={20} />
              Connect with Friends
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StarIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function Day({ date, status, opacity }: { date: string, status?: 'workout' | 'nutrition' | 'none', opacity?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${opacity ? `opacity-${opacity}` : ''}`}>
      <span className="text-sm font-bold">{date}</span>
      {status === 'workout' && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#f3ffca]" />}
      {status === 'nutrition' && <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#bf81ff]" />}
      {status === 'none' && <div className="w-2 h-2 rounded-full bg-surface-container-highest" />}
    </div>
  );
}
