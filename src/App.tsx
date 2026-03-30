/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import { StartScreen, GameOverScreen, WinScreen } from './components/UI';

export default function App() {
  const [status, setStatus] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nugget-noir-leaderboard');
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  const saveScore = (finalScore: number) => {
    const newEntry = { name: 'OPERATIVE_' + Math.floor(Math.random() * 1000), score: finalScore };
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setLeaderboard(newLeaderboard);
    localStorage.setItem('nugget-noir-leaderboard', JSON.stringify(newLeaderboard));
  };

  const handleGameOver = (finalScore: number) => {
    setScore(finalScore);
    saveScore(finalScore);
    setStatus('gameover');
  };

  const handleWin = (finalScore: number) => {
    setScore(finalScore);
    saveScore(finalScore);
    setStatus('win');
  };

  const handleStart = () => {
    setStatus('playing');
  };

  const handleMenu = () => {
    setStatus('start');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans selection:bg-yellow-500 selection:text-black">
      <div className="relative w-[800px] h-[600px] overflow-hidden rounded-xl border-8 border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {status === 'start' && (
          <StartScreen status={status} score={score} onStart={handleStart} leaderboard={leaderboard} />
        )}
        
        {status === 'playing' && (
          <Game onGameOver={handleGameOver} onWin={handleWin} />
        )}

        {status === 'gameover' && (
          <GameOverScreen status={status} score={score} onStart={handleStart} onMenu={handleMenu} leaderboard={leaderboard} />
        )}

        {status === 'win' && (
          <WinScreen status={status} score={score} onStart={handleStart} onMenu={handleMenu} leaderboard={leaderboard} />
        )}

        {/* Decorative scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
    </div>
  );
}

