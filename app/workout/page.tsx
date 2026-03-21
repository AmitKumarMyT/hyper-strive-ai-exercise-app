'use client';

import { motion } from 'motion/react';
import { Info, CheckCircle2, Smile, Star, Frown } from 'lucide-react';
import Image from 'next/image';

export default function WorkoutPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Exercise Header & Illustration */}
      <section>
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-surface-container-low mb-6 group">
          <Image 
            src="https://picsum.photos/seed/workout/800/450" 
            alt="Exercise" 
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6">
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
              Current Exercise
            </span>
            <h1 className="text-2xl font-black font-headline tracking-tight uppercase leading-none">
              Dumbbell Chest Press (Floor)
            </h1>
          </div>
        </div>
      </section>

      {/* Kinetic Timer Gauge */}
      <section className="flex flex-col items-center justify-center relative py-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle 
              className="text-surface-container-highest" 
              cx="128" cy="128" r="110" 
              fill="transparent" stroke="currentColor" strokeWidth="8" 
            />
            <motion.circle 
              className="text-primary-container drop-shadow-[0_0_12px_rgba(202,253,0,0.4)]" 
              cx="128" cy="128" r="110" 
              fill="transparent" stroke="currentColor" strokeWidth="12"
              strokeDasharray={690}
              initial={{ strokeDashoffset: 690 }}
              animate={{ strokeDashoffset: 200 }}
              transition={{ duration: 2, ease: "easeOut" }}
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-black font-headline tracking-tighter text-on-surface">
              00:42
            </span>
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mt-1">
              Focus Mode
            </span>
          </div>
        </div>
      </section>

      {/* Instruction Bento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 glass-panel p-6 rounded-[32px]">
          <div className="flex items-start gap-4">
            <div className="bg-tertiary/20 p-3 rounded-2xl">
              <Info className="text-tertiary" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Instructions
              </p>
              <p className="text-on-surface font-medium leading-relaxed">
                3 sets of 10-12 reps. Focus on slow eccentric movement.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-high p-5 rounded-[28px] flex flex-col justify-between">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Target Set
          </span>
          <span className="text-3xl font-black font-headline text-primary mt-2">
            2 <span className="text-sm font-medium text-on-surface-variant">/ 3</span>
          </span>
        </div>

        <div className="bg-surface-container-high p-5 rounded-[28px] flex flex-col justify-between">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Rest Timer
          </span>
          <span className="text-3xl font-black font-headline text-secondary mt-2">
            01:30
          </span>
        </div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col gap-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="w-full h-16 bg-primary-container text-on-primary-container rounded-2xl font-black font-headline uppercase tracking-widest text-lg shadow-[0_8px_32px_rgba(202,253,0,0.2)] flex items-center justify-center gap-3"
        >
          <span>Finish Set</span>
          <CheckCircle2 className="fill-current text-primary-container bg-on-primary-container rounded-full" size={24} />
        </motion.button>
        <button className="w-full h-14 bg-transparent border-2 border-white/10 text-on-surface rounded-2xl font-bold font-headline uppercase tracking-widest text-sm hover:border-secondary transition-colors">
          Skip Exercise
        </button>
      </div>

      {/* AI Feedback Section */}
      <section className="glass-panel p-8 rounded-[40px] luminescent-shadow mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-tertiary rounded-full" />
          <h3 className="text-xl font-black font-headline uppercase tracking-tight">
            How was the intensity?
          </h3>
        </div>
        <p className="text-on-surface-variant text-sm mb-6">
          Your feedback helps the AI adjust weights and tempo for your hypertrophy goals.
        </p>
        <div className="flex flex-col gap-3">
          <button className="flex justify-between items-center w-full px-6 py-4 bg-surface-container-highest rounded-2xl hover:bg-surface-container-high transition-colors group">
            <span className="font-bold text-on-surface group-hover:text-primary transition-colors">Too Easy</span>
            <Smile className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </button>
          <button className="flex justify-between items-center w-full px-6 py-4 bg-primary-container/10 border border-primary-container/20 rounded-2xl group">
            <span className="font-black text-primary uppercase tracking-wider">Just Right</span>
            <Star className="text-primary fill-current" />
          </button>
          <button className="flex justify-between items-center w-full px-6 py-4 bg-surface-container-highest rounded-2xl hover:bg-surface-container-high transition-colors group">
            <span className="font-bold text-on-surface group-hover:text-error transition-colors">Too Hard</span>
            <Frown className="text-on-surface-variant group-hover:text-error transition-colors" />
          </button>
        </div>
      </section>
    </div>
  );
}
