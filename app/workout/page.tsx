'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Info, CheckCircle2, Smile, Star, Frown, Loader2, Dumbbell, Zap, Sparkles, Coins, Trophy, ArrowLeft, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppStore } from '@/components/AppProvider';
import { GoogleGenAI, Type, VideoGenerationReferenceType } from '@google/genai';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function WorkoutPage() {
  const { workoutPlan, setWorkoutPlan, credits, setCredits, exerciseVisuals, setExerciseVisual } = useAppStore();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [isRegeneratingInstructions, setIsRegeneratingInstructions] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [hasVeoKey, setHasVeoKey] = useState(false);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasVeoKey(hasKey);
      }
    };
    checkKey();
    // Check periodically or on focus
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [setTimeElapsed, setSetTimeElapsed] = useState(0);
  const [exerciseTimeElapsed, setExerciseTimeElapsed] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (workoutPlan && !isResting && !isGenerating && !isWorkoutComplete) {
      timer = setInterval(() => {
        setSetTimeElapsed(prev => prev + 1);
        setExerciseTimeElapsed(prev => prev + 1);
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (isResting && timeLeft > 0 && !isWorkoutComplete) {
      timer = setTimeout(() => {
        setTimeLeft(t => t - 1);
        setExerciseTimeElapsed(prev => prev + 1);
        setTotalTimeElapsed(prev => prev + 1);
      }, 1000);
    } else if (isResting && timeLeft === 0 && !isWorkoutComplete) {
      setIsResting(false);
      setSetTimeElapsed(0);
    }
    return () => clearTimeout(timer);
  }, [isResting, timeLeft, workoutPlan, isGenerating, currentExerciseIndex]);

  const handleGenerateWorkout = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: 'I am a 26 year old male, 57kg, 5 foot 10 inches. Generate a workout focused on maximum hypertrophy. I only have access to my bodyweight, dumbbells, and a chair. Provide 4-5 exercises. Return a JSON array of exercises. Include a targetDurationSeconds for each set (usually 30-60s for hypertrophy).',
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Name of the exercise' },
                sets: { type: Type.NUMBER, description: 'Number of sets (e.g., 3)' },
                reps: { type: Type.STRING, description: 'Rep range (e.g., "10-12")' },
                rest: { type: Type.STRING, description: 'Rest time (e.g., "01:30")' },
                instructions: { type: Type.STRING, description: 'Short instruction focusing on hypertrophy/eccentric movement' },
                targetDurationSeconds: { type: Type.NUMBER, description: 'Estimated duration in seconds for one set' }
              },
              required: ['name', 'sets', 'reps', 'rest', 'instructions', 'targetDurationSeconds']
            }
          }
        }
      });

      if (response.text) {
        const plan = JSON.parse(response.text);
        setWorkoutPlan(plan);
        setCurrentExerciseIndex(0);
        setCurrentSet(1);
        setIsResting(false);
        setSetTimeElapsed(0);
        setExerciseTimeElapsed(0);
        setTotalTimeElapsed(0);
        setIsWorkoutComplete(false);
      }
    } catch (error) {
      console.error('Error generating workout:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateInstructions = async () => {
    if (!workoutPlan) return;
    setIsRegeneratingInstructions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const currentExercise = workoutPlan[currentExerciseIndex];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Provide extremely detailed, hypertrophy-focused cues and instructions for the exercise: "${currentExercise.name}". 
        Focus on:
        - Mind-muscle connection
        - Eccentric control (3-4 seconds)
        - Peak contraction
        - Range of motion
        - Common mistakes to avoid for muscle growth.
        Keep the response concise but highly technical and actionable.`,
      });

      if (response.text) {
        const newPlan = [...workoutPlan];
        newPlan[currentExerciseIndex] = {
          ...currentExercise,
          instructions: response.text.trim()
        };
        setWorkoutPlan(newPlan);
      }
    } catch (error) {
      console.error('Error regenerating instructions:', error);
    } finally {
      setIsRegeneratingInstructions(false);
    }
  };

  const parseRestTime = (restStr: string) => {
    // Parse "01:30" or "90s" into seconds
    if (restStr.includes(':')) {
      const [min, sec] = restStr.split(':').map(Number);
      return (min * 60) + sec;
    }
    return parseInt(restStr.replace(/\D/g, '')) || 60;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishSet = () => {
    if (!workoutPlan) return;
    const currentExercise = workoutPlan[currentExerciseIndex];

    if (currentSet < currentExercise.sets) {
      setIsResting(true);
      setTimeLeft(parseRestTime(currentExercise.rest));
      setCurrentSet(s => s + 1);
      setSetTimeElapsed(0);
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (!workoutPlan) return;
    if (currentExerciseIndex < workoutPlan.length - 1) {
      setCurrentExerciseIndex(i => i + 1);
      setCurrentSet(1);
      setIsResting(false);
      setSetTimeElapsed(0);
      setExerciseTimeElapsed(0);
    } else {
      // Workout Complete
      setIsWorkoutComplete(true);
    }
  };

  const handleUpdateVisual = async () => {
    if (isGeneratingVisual || credits <= 0) return;

    const currentExercise = workoutPlan![currentExerciseIndex];
    const hasNanoKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    try {
      if (!hasNanoKey) {
        setGenerationStatus('Add key for image generation');
        setTimeout(() => setGenerationStatus(''), 3000);
        return;
      }

      setIsGeneratingVisual(true);
      setGenerationStatus('Generating base image...');

      // 1. Generate base image with Nano Banana (Gemini 2.5 Flash Image)
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A high-quality, professional fitness illustration of a person performing ${currentExercise.name}. Cinematic lighting, detailed muscles, gym environment.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });

      let base64Image = '';
      const candidate = imageResponse.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Image) throw new Error('Failed to generate base image');

      // Update with static image first
      const imageUrl = `data:image/png;base64,${base64Image}`;
      setExerciseVisual(currentExercise.name, imageUrl);

      // 2. Check for Veo key for animation
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setGenerationStatus('Add key for GIF generation');
        setIsGeneratingVisual(false);
        // Don't clear status immediately so user can see it
        setTimeout(() => setGenerationStatus(''), 5000);
        return;
      }

      setGenerationStatus('Animating with Veo...');

      // 3. Animate with Veo (Veo 3.1 Fast Generate Preview)
      const veoAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      let operation = await veoAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A smooth, looping video of a person performing ${currentExercise.name} with perfect form. High quality, 1080p.`,
        image: {
          imageBytes: base64Image,
          mimeType: 'image/png'
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // 4. Poll for completion
      let attempts = 0;
      while (!operation.done && attempts < 30) {
        setGenerationStatus(`Processing video... (${attempts * 10}s)`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await veoAi.operations.getVideosOperation({ operation: operation });
        attempts++;
      }

      if (!operation.done) throw new Error('Video generation timed out');

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error('Failed to get video URI');

      // 5. Fetch video with API key
      const videoResponse = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': process.env.API_KEY as string,
        },
      });

      if (!videoResponse.ok) throw new Error('Failed to download video');

      const blob = await videoResponse.blob();
      const videoUrl = URL.createObjectURL(blob);

      // 6. Update state with video
      setExerciseVisual(currentExercise.name, videoUrl);
      setCredits(prev => prev - 1);
      setGenerationStatus('');
    } catch (error) {
      console.error('Error generating visual:', error);
      setGenerationStatus('Generation failed');
      setTimeout(() => setGenerationStatus(''), 3000);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  if (isWorkoutComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-32 h-32 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(202,253,0,0.3)]"
        >
          <Trophy className="text-on-primary-container" size={64} />
        </motion.div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black font-headline uppercase tracking-tighter italic">Workout Complete!</h1>
          <p className="text-on-surface-variant font-medium">You crushed your hypertrophy session.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-surface-container-high p-6 rounded-3xl flex flex-col items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Time</span>
            <span className="text-2xl font-black font-headline text-primary">{formatTime(totalTimeElapsed)}</span>
          </div>
          <div className="bg-surface-container-high p-6 rounded-3xl flex flex-col items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Exercises</span>
            <span className="text-2xl font-black font-headline text-secondary">{workoutPlan?.length}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="w-full h-16 bg-primary-container text-on-primary-container rounded-2xl font-black font-headline uppercase tracking-widest text-lg flex items-center justify-center gap-3"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Reset for a new session if they want to see the summary again or start over
              setWorkoutPlan(null);
              setIsWorkoutComplete(false);
            }}
            className="w-full h-14 bg-transparent border-2 border-white/10 text-on-surface rounded-2xl font-bold font-headline uppercase tracking-widest text-sm flex items-center justify-center gap-3"
          >
            <BarChart3 size={18} />
            View Summary
          </motion.button>
        </div>
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-4">
          <Dumbbell size={48} />
        </div>
        <h2 className="text-3xl font-headline font-black uppercase italic tracking-tight">Ready to Grow?</h2>
        <p className="text-on-surface-variant max-w-sm">
          Generate a personalized hypertrophy workout based on your profile using bodyweight and dumbbells.
        </p>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerateWorkout}
          disabled={isGenerating}
          className="w-full max-w-sm h-16 bg-primary-container text-on-primary-container rounded-2xl font-black font-headline uppercase tracking-widest text-lg shadow-[0_8px_32px_rgba(202,253,0,0.2)] flex items-center justify-center gap-3 disabled:opacity-70"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Zap className="fill-current" size={24} />}
          <span>{isGenerating ? 'Generating...' : 'Generate Workout'}</span>
        </motion.button>
      </div>
    );
  }

  const currentExercise = workoutPlan[currentExerciseIndex];
  const [showCreditInfo, setShowCreditInfo] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      {/* Exercise Header & Illustration */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreditInfo(!showCreditInfo)}
              className="flex items-center gap-2 bg-gradient-to-r from-surface-container-high to-surface-container-highest px-4 py-2 rounded-full border border-primary/20 shadow-[0_0_15px_rgba(202,253,0,0.1)] hover:shadow-[0_0_20px_rgba(202,253,0,0.2)] transition-shadow"
            >
              <div className="relative">
                <Coins size={16} className="text-primary" />
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/30 blur-sm rounded-full"
                />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-on-surface">
                {credits} <span className="text-primary">AI Credits</span>
              </span>
            </motion.button>

            <AnimatePresence>
              {showCreditInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-64 p-4 rounded-2xl bg-surface-container-highest border border-white/10 shadow-2xl z-50"
                >
                  <h4 className="font-headline font-bold text-sm mb-2 text-primary flex items-center gap-2">
                    <Sparkles size={14} />
                    AI Visual Generation
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                    Use credits to generate high-quality, animated demonstrations of exercises using Nano Banana and Veo AI models.
                  </p>
                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Available
                    </span>
                    <span className="text-sm font-black text-primary">{credits}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {isGeneratingVisual && (
            <div className="flex items-center gap-2 text-primary animate-pulse">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {generationStatus}
              </span>
            </div>
          )}
        </div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            if (!hasVeoKey) {
              window.aistudio.openSelectKey();
            } else {
              handleUpdateVisual();
            }
          }}
          className={`relative w-full aspect-video rounded-3xl overflow-hidden bg-surface-container-low mb-6 group cursor-pointer border-2 transition-all ${isGeneratingVisual ? 'border-primary animate-pulse' : 'border-transparent hover:border-primary/30'}`}
        >
          {exerciseVisuals[currentExercise.name] ? (
            exerciseVisuals[currentExercise.name].startsWith('data:image') ? (
              <Image 
                src={exerciseVisuals[currentExercise.name]} 
                alt="Exercise" 
                fill
                className="object-cover"
              />
            ) : (
              <video 
                src={exerciseVisuals[currentExercise.name]} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <Image 
              src={`https://picsum.photos/seed/${currentExercise.name.replace(/\s/g, '')}/800/450`} 
              alt="Exercise" 
              fill
              className="object-cover opacity-60"
            />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
          
          {/* Overlay for generation */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="text-primary mb-2" size={32} />
            <span className="text-xs font-bold uppercase tracking-widest text-white text-center px-4">
              {!process.env.NEXT_PUBLIC_GEMINI_API_KEY 
                ? 'Add key for image generation' 
                : !hasVeoKey 
                  ? 'Tap to add key for GIF generation' 
                  : 'Tap to Generate AI Visual'}
            </span>
          </div>

          <div className="absolute bottom-4 left-6">
            <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
              Exercise {currentExerciseIndex + 1} of {workoutPlan.length}
            </span>
            <h1 className="text-2xl font-black font-headline tracking-tight uppercase leading-none">
              {currentExercise.name}
            </h1>
          </div>
        </motion.div>
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
            {isResting && (
              <motion.circle 
                className="text-secondary drop-shadow-[0_0_12px_rgba(191,129,255,0.4)]" 
                cx="128" cy="128" r="110" 
                fill="transparent" stroke="currentColor" strokeWidth="12"
                strokeDasharray={690}
                initial={{ strokeDashoffset: 690 }}
                animate={{ strokeDashoffset: 690 - (690 * (timeLeft / parseRestTime(currentExercise.rest))) }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round" 
              />
            )}
            {!isResting && (
              <motion.circle 
                className="text-primary-container drop-shadow-[0_0_12px_rgba(202,253,0,0.4)]" 
                cx="128" cy="128" r="110" 
                fill="transparent" stroke="currentColor" strokeWidth="12"
                strokeDasharray={690}
                initial={{ strokeDashoffset: 690 }}
                animate={{ strokeDashoffset: 690 - (690 * Math.min(setTimeElapsed / (currentExercise.targetDurationSeconds || 45), 1)) }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round" 
              />
            )}
          </svg>
          <div className="absolute flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.span 
                key={isResting ? formatTime(timeLeft) : formatTime(setTimeElapsed)}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-6xl font-black font-headline tracking-tighter text-on-surface"
              >
                {isResting ? formatTime(timeLeft) : formatTime(setTimeElapsed)}
              </motion.span>
            </AnimatePresence>
            <motion.span 
              animate={isResting ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
              transition={isResting ? { duration: 1.5, repeat: Infinity } : {}}
              className="text-[10px] font-bold text-tertiary uppercase tracking-[0.2em] mt-1"
            >
              {isResting ? 'Resting' : 'Set Timer'}
            </motion.span>
          </div>
        </div>
        
        {/* Exercise Stats */}
        <div className="flex gap-8 mt-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Exercise Time</span>
            <span className="text-xl font-black font-headline text-on-surface">{formatTime(exerciseTimeElapsed)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Target Reps</span>
            <span className="text-xl font-black font-headline text-primary">{currentExercise.reps}</span>
          </div>
          {!isResting && currentExercise.targetDurationSeconds && (
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Remaining</span>
              <span className="text-xl font-black font-headline text-secondary">
                {formatTime(Math.max(0, currentExercise.targetDurationSeconds - setTimeElapsed))}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Instruction Bento */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-2 glass-panel p-6 rounded-[32px]"
        >
          <div className="flex items-start gap-4">
            <div className="bg-tertiary/20 p-3 rounded-2xl">
              <Info className="text-tertiary" size={24} />
            </div>
            <div>
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Instructions
                </p>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRegenerateInstructions}
                  disabled={isRegeneratingInstructions}
                  className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                  title="Regenerate with hypertrophy cues"
                >
                  {isRegeneratingInstructions ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                </motion.button>
              </div>
              <div className="relative">
                {isRegeneratingInstructions && (
                  <div className="absolute inset-0 bg-surface/50 backdrop-blur-[2px] rounded-lg z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                      <Loader2 size={12} className="animate-spin" />
                      Optimizing Cues...
                    </div>
                  </div>
                )}
                <p className="text-on-surface font-medium leading-relaxed">
                  {currentExercise.instructions}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-high p-5 rounded-[28px] flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Target Set
          </span>
          <span className="text-3xl font-black font-headline text-primary mt-2">
            {currentSet} <span className="text-sm font-medium text-on-surface-variant">/ {currentExercise.sets}</span>
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface-container-high p-5 rounded-[28px] flex flex-col justify-between"
        >
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Rest Timer
          </span>
          <span className="text-3xl font-black font-headline text-secondary mt-2">
            {currentExercise.rest}
          </span>
        </motion.div>
      </div>

      {/* Action Area */}
      <div className="flex flex-col gap-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleFinishSet}
          disabled={isResting}
          className="w-full h-16 bg-primary-container text-on-primary-container rounded-2xl font-black font-headline uppercase tracking-widest text-lg shadow-[0_8px_32px_rgba(202,253,0,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <span>{isResting ? 'Resting...' : 'Finish Set'}</span>
          <AnimatePresence>
            {!isResting && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="fill-current text-primary-container bg-on-primary-container rounded-full" size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
        <button 
          onClick={handleNextExercise}
          className="w-full h-14 bg-transparent border-2 border-white/10 text-on-surface rounded-2xl font-bold font-headline uppercase tracking-widest text-sm hover:border-secondary transition-colors"
        >
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

