import React from 'react';
import { motion } from 'motion/react';

interface UIProps {
  status: 'start' | 'gameover' | 'win';
  score: number;
  onStart: () => void;
  onMenu?: () => void;
  leaderboard: { name: string; score: number }[];
}

export const StartScreen: React.FC<UIProps> = ({ onStart, leaderboard }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center h-full text-white p-8 bg-black/95 relative overflow-hidden"
  >
    {/* Film Grain Overlay */}
    <div className="film-grain" />

    {/* Background Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(230,126,34,0.05),transparent_70%)]" />
    
    {/* Vintage Signage Title */}
    <div className="relative mb-8 text-center">
      <div className="absolute -inset-4 bg-orange-600/10 blur-2xl rounded-full" />
      <h1 className="text-8xl font-black tracking-tighter italic text-orange-500 drop-shadow-[0_0_20px_rgba(230,126,34,0.6)] uppercase leading-none">
        NUGGET<br/>FIGHT CLUB
      </h1>
      <div className="mt-2 flex items-center justify-center gap-4">
        <div className="h-[1px] w-12 bg-zinc-700" />
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-[0.5em]">
          WARRIOR DEMO - TRACK 1
        </p>
        <div className="h-[1px] w-12 bg-zinc-700" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl relative z-10">
      <div className="space-y-6">
        <div className="formica-texture diner-border p-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-600/30" />
          <h2 className="text-2xl font-black mb-4 text-orange-400 flex items-center gap-3">
            <span className="text-xs border border-orange-400/50 px-1 rounded">01</span>
            THE LAST CHANCE
          </h2>
          <p className="font-serif italic text-lg leading-relaxed text-zinc-300 relative">
            "The Sauce Syndicate has crossed the line. They've taken the family. 
            It's time to show them what 'Nugget Strength' really means. 
            Infiltrate the diner, strike down the Fry Monsters, and extract the survivors."
            <span className="absolute -bottom-4 right-0 text-xs font-mono text-zinc-600">— CASE FILE #442</span>
          </p>
        </div>
        
        <button
          onClick={onStart}
          className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-3xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.5)] skew-x-[-6deg] border-b-4 border-orange-800 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          <span className="relative">ENTER THE FRAY</span>
        </button>
      </div>

      <div className="formica-texture diner-border p-8">
        <h2 className="text-xl font-mono mb-6 text-orange-500 flex items-center gap-3">
          <span className="w-2 h-2 bg-orange-500 animate-pulse rounded-full shadow-[0_0_10px_rgba(230,126,34,1)]" />
          TOP OPERATIVES
        </h2>
        <div className="space-y-4">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, i) => (
              <div key={i} className="flex justify-between font-mono text-sm border-b border-zinc-800/50 pb-2 group hover:bg-white/5 transition-colors px-2">
                <span className="text-zinc-400 group-hover:text-white transition-colors">{entry.name}</span>
                <span className="text-orange-500 font-bold">{entry.score}</span>
              </div>
            ))
          ) : (
            <p className="text-zinc-600 italic font-serif">No records found in the archives...</p>
          )}
        </div>
      </div>
    </div>

    <div className="mt-16 text-zinc-500 font-mono text-xs flex gap-12 bg-black/80 px-8 py-3 rounded-full border border-zinc-800 backdrop-blur-md shadow-2xl">
      <span className="flex items-center gap-2"><kbd className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">WASD</kbd> MOVE</span>
      <span className="flex items-center gap-2"><kbd className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">SPACE</kbd> JUMP</span>
      <span className="flex items-center gap-2"><kbd className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">F / J</kbd> STRIKE</span>
      <span className="flex items-center gap-2"><kbd className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">K / L</kbd> BLASTER</span>
    </div>
  </motion.div>
);

export const GameOverScreen: React.FC<UIProps> = ({ score, onStart, onMenu }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center justify-center h-full text-white bg-red-950/95 relative overflow-hidden"
  >
    <div className="film-grain" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
    
    <h1 className="text-9xl font-black mb-4 text-red-600 italic tracking-tighter drop-shadow-2xl">DIPPED.</h1>
    <p className="text-2xl mb-8 font-mono tracking-widest text-red-200/60">YOU WERE OVERWHELMED BY THE SAUCE</p>
    
    <div className="formica-texture diner-border p-10 mb-12 text-center min-w-[300px]">
      <div className="text-sm font-mono text-zinc-500 mb-2 uppercase tracking-tighter">FINAL SCORE ARCHIVE</div>
      <div className="text-6xl font-black text-white">{score}</div>
    </div>

    <div className="flex gap-6 relative z-10">
      <button
        onClick={onStart}
        className="px-12 py-5 bg-white text-black font-black text-xl hover:bg-zinc-200 transition-all shadow-2xl skew-x-[-6deg]"
      >
        RETRY MISSION
      </button>
      <button
        onClick={onMenu}
        className="px-12 py-5 border-2 border-white text-white font-black text-xl hover:bg-white/10 transition-all skew-x-[-6deg]"
      >
        MAIN MENU
      </button>
    </div>
  </motion.div>
);

export const WinScreen: React.FC<UIProps> = ({ score, onStart, onMenu }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="flex flex-col items-center justify-center h-full text-white bg-zinc-950 relative overflow-hidden"
  >
    <div className="film-grain" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(234,179,8,0.05),transparent_70%)]" />
    
    <h1 className="text-9xl font-black mb-4 text-yellow-500 italic tracking-tighter drop-shadow-2xl">EXTRACTED.</h1>
    <p className="text-2xl mb-8 font-mono tracking-widest text-yellow-200/60">THE FAMILY IS SAFE... FOR NOW</p>
    
    <div className="formica-texture diner-border p-10 mb-12 text-center min-w-[300px]">
      <div className="text-sm font-mono text-zinc-500 mb-2 uppercase tracking-tighter">MISSION SUCCESS RATING</div>
      <div className="text-6xl font-black text-white">{score}</div>
    </div>

    <div className="flex gap-6 relative z-10">
      <button
        onClick={onStart}
        className="px-12 py-5 bg-yellow-500 text-black font-black text-xl hover:bg-yellow-400 transition-all shadow-2xl skew-x-[-6deg]"
      >
        NEXT MISSION
      </button>
      <button
        onClick={onMenu}
        className="px-12 py-5 border-2 border-yellow-500 text-yellow-500 font-black text-xl hover:bg-yellow-500/10 transition-all skew-x-[-6deg]"
      >
        MAIN MENU
      </button>
    </div>
  </motion.div>
);
