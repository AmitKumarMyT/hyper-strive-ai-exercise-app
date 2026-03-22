'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Search, Plus, Zap, Utensils, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import CircularProgress from '@/components/CircularProgress';
import { useAppStore } from '@/components/AppProvider';
import { GoogleGenAI, Type } from '@google/genai';

export default function Home() {
  const { meals, addMeal, setMeals, dailyCaloriesGoal, setDailyCaloriesGoal, dailyProteinGoal, setDailyProteinGoal } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  
  const [manualMealName, setManualMealName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');

  const [tempCalorieGoal, setTempCalorieGoal] = useState(dailyCaloriesGoal.toString());
  const [tempProteinGoal, setTempProteinGoal] = useState(dailyProteinGoal.toString());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const consumedCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const consumedProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  
  const remainingCalories = Math.max(0, dailyCaloriesGoal - consumedCalories);
  const caloriePercent = Math.min(100, Math.round((consumedCalories / dailyCaloriesGoal) * 100));
  const proteinPercent = Math.min(100, Math.round((consumedProtein / dailyProteinGoal) * 100));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert("Please add your Gemini API key in the AI Studio UI to use the AI food scanner.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            { inlineData: { data: base64, mimeType: file.type } },
            { text: 'Analyze this food. Estimate the calories and protein content. Return a JSON object with name, calories, and protein.' }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'A short, catchy name for the meal' },
                calories: { type: Type.NUMBER, description: 'Estimated calories' },
                protein: { type: Type.NUMBER, description: 'Estimated protein in grams' }
              },
              required: ['name', 'calories', 'protein']
            }
          }
        });

        if (response.text) {
          const data = JSON.parse(response.text);
          addMeal({
            id: Date.now().toString(),
            name: data.name,
            calories: data.calories,
            protein: data.protein,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            imageUrl: URL.createObjectURL(file)
          });
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMealName || !manualCalories || !manualProtein) return;

    addMeal({
      id: Date.now().toString(),
      name: manualMealName,
      calories: parseInt(manualCalories, 10),
      protein: parseInt(manualProtein, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setManualMealName('');
    setManualCalories('');
    setManualProtein('');
    setIsManualModalOpen(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search for nutrition information for: "${searchQuery}". 
        Return a JSON array of up to 5 most likely matches. 
        Each object should have: name, calories (number), protein (number, grams), servingSize (string).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                servingSize: { type: Type.STRING }
              },
              required: ['name', 'calories', 'protein', 'servingSize']
            }
          }
        }
      });

      if (response.text) {
        setSearchResults(JSON.parse(response.text));
      }
    } catch (error) {
      console.error('Error searching food:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addFromSearch = (item: any) => {
    addMeal({
      id: Date.now().toString(),
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyCaloriesGoal(parseInt(tempCalorieGoal, 10));
    setDailyProteinGoal(parseInt(tempProteinGoal, 10));
    setIsGoalModalOpen(false);
  };

  const clearLog = () => {
    if (confirm('Are you sure you want to clear today\'s log?')) {
      setMeals([]);
    }
  };

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
              <div className="flex items-center gap-2">
                <span className="text-tertiary font-body text-xs font-bold tracking-[0.2em] uppercase">
                  Daily Budget
                </span>
                <button 
                  onClick={() => setIsGoalModalOpen(true)}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
              <h1 className="font-headline font-black text-6xl text-glow tracking-tighter">
                {remainingCalories.toLocaleString()}
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">kcal remaining</p>
            </div>
            
            <CircularProgress value={caloriePercent} max={100} size={96} strokeWidth={8}>
              <span className="font-headline font-bold text-lg">{caloriePercent}%</span>
            </CircularProgress>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col justify-between h-32">
              <span className="text-on-surface-variant font-body text-[10px] font-bold tracking-widest uppercase">
                Protein Target
              </span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline font-black text-3xl text-primary">{consumedProtein}</span>
                  <span className="text-on-surface-variant font-bold text-xs">/ {dailyProteinGoal}g</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${proteinPercent}%` }}
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
                <span className="font-bold text-xs tracking-tight">
                  {proteinPercent >= 80 ? 'Optimal Phase' : 'Building Phase'}
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-tight">
                {proteinPercent >= 80 
                  ? 'Protein intake is on track for maximal mTor signaling.' 
                  : 'Consume more protein to maximize muscle growth.'}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Integration: Snap & Track */}
      <section>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
              alert("Please add your Gemini API key in the AI Studio UI to use the AI food scanner.");
            } else {
              fileInputRef.current?.click();
            }
          }}
          disabled={isAnalyzing}
          className="w-full kinetic-gradient p-[1px] rounded-2xl group transition-transform disabled:opacity-70"
        >
          <div className="bg-surface rounded-[15px] p-5 flex items-center justify-between group-hover:bg-transparent transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                {isAnalyzing ? <Loader2 size={28} className="animate-spin" /> : <Camera size={28} className="fill-current" />}
              </div>
              <div className="text-left">
                <h3 className="font-headline font-extrabold text-lg leading-none mb-1 text-on-surface">
                  {isAnalyzing ? 'Analyzing Food...' : 'Snap & Track'}
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
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
            {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 2M+ foods manually..." 
            className="w-full bg-surface-container-high border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 text-on-surface outline-none"
          />
        </form>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest rounded-2xl shadow-2xl z-40 overflow-hidden border border-white/5"
            >
              <div className="p-2 max-h-64 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => addFromSearch(result)}
                    className="w-full text-left p-4 hover:bg-surface-container-high rounded-xl transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="font-bold text-on-surface">{result.name}</h4>
                      <p className="text-xs text-on-surface-variant">{result.servingSize} • {result.calories} kcal • {result.protein}g protein</p>
                    </div>
                    <Plus size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              <div className="p-3 bg-surface-container-low border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">AI Estimated Results</span>
                <button 
                  onClick={() => setSearchResults([])}
                  className="text-[10px] font-bold text-primary uppercase tracking-widest"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Today's Log */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-headline font-black text-xl tracking-tight uppercase">Today&apos;s Fuel</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={clearLog}
              className="text-[10px] font-bold text-on-surface-variant hover:text-error uppercase tracking-widest"
            >
              Clear Log
            </button>
            <span className="text-on-surface-variant font-body text-[10px] font-bold tracking-widest uppercase">
              {meals.length} Meals Logged
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {meals.map((meal, index) => (
            <motion.div 
              key={meal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-panel rounded-3xl p-5 flex items-center gap-4 ${index % 2 !== 0 ? 'border-l-4 border-l-primary/40' : ''}`}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative bg-surface-container-highest">
                {meal.imageUrl ? (
                  <Image 
                    src={meal.imageUrl} 
                    alt={meal.name} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/50">
                    <Utensils size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-headline font-bold text-base truncate pr-2">{meal.name}</h4>
                  <span className="text-on-surface-variant text-xs font-bold whitespace-nowrap">{meal.time}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-on-surface-variant">{meal.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="text-xs font-bold text-on-surface-variant">{meal.protein}g protein</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Manual Meal */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: meals.length * 0.1 }}
            onClick={() => setIsManualModalOpen(true)}
            className="bg-surface-container-low rounded-3xl p-5 border border-dashed border-on-surface-variant/20 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant/50">
                <Utensils size={24} />
              </div>
              <div>
                <h4 className="font-headline font-bold text-base text-on-surface-variant">Add Meal</h4>
                <p className="text-xs text-on-surface-variant/50 font-medium">Log manually</p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {isManualModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container p-6 rounded-[32px] w-full max-w-sm border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black font-headline uppercase italic mb-6">Log Meal</h2>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Meal Name</label>
                  <input 
                    type="text" 
                    required
                    value={manualMealName}
                    onChange={e => setManualMealName(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 text-on-surface outline-none"
                    placeholder="e.g., Chicken Breast & Rice"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Calories</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={manualCalories}
                      onChange={e => setManualCalories(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 text-on-surface outline-none"
                      placeholder="kcal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Protein (g)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={manualProtein}
                      onChange={e => setManualProtein(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 text-on-surface outline-none"
                      placeholder="grams"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full mt-6 bg-primary-container text-on-primary-container py-4 rounded-xl font-black font-headline uppercase tracking-widest hover:bg-primary transition-colors"
                >
                  Save Meal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Goal Settings Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container p-6 rounded-[32px] w-full max-w-sm border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsGoalModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black font-headline uppercase italic mb-6">Set Daily Goals</h2>
              
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Daily Calorie Goal</label>
                  <input 
                    type="number" 
                    required
                    min="500"
                    value={tempCalorieGoal}
                    onChange={e => setTempCalorieGoal(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 text-on-surface outline-none"
                    placeholder="e.g., 2500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Daily Protein Goal (g)</label>
                  <input 
                    type="number" 
                    required
                    min="50"
                    value={tempProteinGoal}
                    onChange={e => setTempProteinGoal(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50 text-on-surface outline-none"
                    placeholder="e.g., 180"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full mt-6 bg-primary-container text-on-primary-container py-4 rounded-xl font-black font-headline uppercase tracking-widest hover:bg-primary transition-colors"
                >
                  Update Goals
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

