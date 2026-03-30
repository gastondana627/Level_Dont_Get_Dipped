import React, { useEffect, useRef, useState } from 'react';
import { Player, Enemy, Level, GameState, Platform, Spotlight, Collectible } from '../types';
import { GRAVITY, JUMP_FORCE, MOVE_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, COLORS, ATTACK_RANGE, ATTACK_COOLDOWN, PROJECTILE_SPEED, PROJECTILE_RADIUS, PROJECTILE_COOLDOWN } from '../constants';

interface GameProps {
  onGameOver: (score: number) => void;
  onWin: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ onGameOver, onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const keys = useRef<{ [key: string]: boolean }>({});

  const playClang = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
      
      // Secondary high-pitched ring
      const ring = audioCtx.createOscillator();
      const ringGain = audioCtx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(1200, audioCtx.currentTime);
      ringGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      ringGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      ring.connect(ringGain);
      ringGain.connect(audioCtx.destination);
      ring.start();
      ring.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  };

  // Initialize Level 1: Honey Mustard Waters
  const initLevel = (): Level => {
    return {
      platforms: [
        { x: 0, y: 550, width: 6000, height: 50, type: 'normal' }, // Ground
        { x: 300, y: 400, width: 200, height: 20, type: 'normal' },
        { x: 600, y: 300, width: 200, height: 20, type: 'normal' },
        { x: 900, y: 450, width: 300, height: 20, type: 'normal' },
        { x: 1300, y: 350, width: 200, height: 20, type: 'normal' },
        { x: 1600, y: 400, width: 400, height: 20, type: 'normal' },
        { x: 2100, y: 300, width: 300, height: 20, type: 'normal' },
        { x: 2500, y: 450, width: 400, height: 20, type: 'normal' },
        { x: 3100, y: 350, width: 300, height: 20, type: 'normal' },
        { x: 3500, y: 250, width: 200, height: 20, type: 'normal' },
        { x: 3900, y: 400, width: 400, height: 20, type: 'normal' },
        { x: 4400, y: 300, width: 300, height: 20, type: 'normal' },
        { x: 4800, y: 450, width: 400, height: 20, type: 'normal' },
        { x: 5300, y: 350, width: 300, height: 20, type: 'normal' },
      ],
      hazards: [
        { x: 400, y: 530, width: 200, height: 20, type: 'mustard-water' },
        { x: 1000, y: 530, width: 300, height: 20, type: 'mustard-water' },
        { x: 1800, y: 530, width: 400, height: 20, type: 'mustard-water' },
        { x: 2400, y: 530, width: 500, height: 20, type: 'mustard-water' },
        { x: 3200, y: 530, width: 400, height: 20, type: 'mustard-water' },
        { x: 4000, y: 530, width: 600, height: 20, type: 'mustard-water' },
        { x: 5000, y: 530, width: 500, height: 20, type: 'mustard-water' },
      ],
      spotlights: [
        { x: 500, y: 300, radius: 100, speed: 0.02, range: 200, currentOffset: 0 },
        { x: 1100, y: 300, radius: 120, speed: 0.015, range: 300, currentOffset: 0 },
        { x: 1700, y: 300, radius: 150, speed: 0.01, range: 400, currentOffset: 0 },
        { x: 2300, y: 300, radius: 130, speed: 0.012, range: 350, currentOffset: 0 },
        { x: 3000, y: 300, radius: 140, speed: 0.018, range: 400, currentOffset: 0 },
        { x: 3800, y: 300, radius: 160, speed: 0.01, range: 500, currentOffset: 0 },
        { x: 4600, y: 300, radius: 120, speed: 0.014, range: 300, currentOffset: 0 },
        { x: 5400, y: 300, radius: 150, speed: 0.011, range: 450, currentOffset: 0 },
      ],
      nuggets: [
        { x: 350, y: 350, width: 20, height: 20, collected: false },
        { x: 650, y: 250, width: 20, height: 20, collected: false },
        { x: 950, y: 400, width: 20, height: 20, collected: false },
        { x: 1350, y: 300, width: 20, height: 20, collected: false },
        { x: 1800, y: 350, width: 20, height: 20, collected: false },
        { x: 2200, y: 250, width: 20, height: 20, collected: false },
        { x: 2700, y: 400, width: 20, height: 20, collected: false },
        { x: 3200, y: 300, width: 20, height: 20, collected: false },
        { x: 3600, y: 200, width: 20, height: 20, collected: false },
        { x: 4000, y: 350, width: 20, height: 20, collected: false },
        { x: 4500, y: 250, width: 20, height: 20, collected: false },
        { x: 4900, y: 400, width: 20, height: 20, collected: false },
        { x: 5400, y: 300, width: 20, height: 20, collected: false },
      ],
      goal: { x: 5850, y: 450, width: 80, height: 100 },
    };
  };

  useEffect(() => {
    const level = initLevel();
    setGameState({
      player: {
        x: 50,
        y: 500,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        vx: 0,
        vy: 0,
        isJumping: false,
        isStealth: false,
        isAttacking: false,
        attackCooldown: 0,
        projectileCooldown: 0,
        health: 100,
        nuggetsRescued: 0,
        kills: 0,
        facing: 1,
      },
      enemies: [
        { x: 400, y: 510, width: 40, height: 40, vx: 2, vy: 0, type: 'fry-monster', patrolRange: 200, startPoint: 400, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 1200, y: 510, width: 40, height: 40, vx: 2, vy: 0, type: 'fry-monster', patrolRange: 300, startPoint: 1200, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 800, y: 260, width: 40, height: 40, vx: 1.5, vy: 0, type: 'fry-monster', patrolRange: 100, startPoint: 800, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 2000, y: 510, width: 40, height: 40, vx: 2.5, vy: 0, type: 'fry-monster', patrolRange: 400, startPoint: 2000, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 2800, y: 510, width: 40, height: 40, vx: 2, vy: 0, type: 'fry-monster', patrolRange: 300, startPoint: 2800, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 3500, y: 510, width: 40, height: 40, vx: 3, vy: 0, type: 'fry-monster', patrolRange: 500, startPoint: 3500, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 4200, y: 510, width: 40, height: 40, vx: 2, vy: 0, type: 'fry-monster', patrolRange: 300, startPoint: 4200, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
        { x: 5000, y: 510, width: 40, height: 40, vx: 2.5, vy: 0, type: 'fry-monster', patrolRange: 400, startPoint: 5000, direction: 1, health: 3, isDead: false, flashTimer: 0, hitColorTimer: 0, knockbackX: 0 },
      ],
      projectiles: [],
      particles: [],
      collectionAnimations: [],
      level,
      camera: { x: 0, y: 0 },
      status: 'playing',
      score: 0,
      timeElapsed: 0,
    });

    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameState) return;
    if (gameState.status === 'gameover') {
      onGameOver(gameState.score);
    } else if (gameState.status === 'win') {
      onWin(gameState.score);
    }
  }, [gameState?.status, onGameOver, onWin]);

  useEffect(() => {
    if (!gameState) return;

    let animationFrameId: number;

    const update = () => {
      setGameState((prev) => {
        if (!prev || prev.status !== 'playing') return prev;

        const { player, enemies, level, camera, projectiles, particles, collectionAnimations } = prev;
        const newPlayer = { ...player };

        // Update Particles
        const updatedParticles = particles.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // Gravity for particles
          life: p.life - 1
        })).filter(p => p.life > 0);

        // Horizontal Movement
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
          newPlayer.vx = -MOVE_SPEED;
          newPlayer.facing = -1;
        } else if (keys.current['ArrowRight'] || keys.current['KeyD']) {
          newPlayer.vx = MOVE_SPEED;
          newPlayer.facing = 1;
        } else {
          newPlayer.vx *= 0.8;
        }

        newPlayer.x += newPlayer.vx;

        // Vertical Movement (Gravity)
        newPlayer.vy += GRAVITY;
        newPlayer.y += newPlayer.vy;

        // Collision with Platforms
        newPlayer.isJumping = true;
        level.platforms.forEach((platform) => {
          if (
            newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y + newPlayer.height > platform.y &&
            newPlayer.y + newPlayer.height < platform.y + platform.height + newPlayer.vy
          ) {
            newPlayer.y = platform.y - newPlayer.height;
            newPlayer.vy = 0;
            newPlayer.isJumping = false;
          }
        });

        // Jump
        if ((keys.current['ArrowUp'] || keys.current['KeyW'] || keys.current['Space']) && !newPlayer.isJumping) {
          newPlayer.vy = JUMP_FORCE;
          newPlayer.isJumping = true;
        }

        // World Boundaries
        if (newPlayer.x < 0) newPlayer.x = 0;
        if (newPlayer.x > 6000 - newPlayer.width) newPlayer.x = 6000 - newPlayer.width;
        if (newPlayer.y > CANVAS_HEIGHT) {
          newPlayer.health = 0; // Fall death
        }

        // Attack Logic
        if (newPlayer.attackCooldown > 0) {
          newPlayer.attackCooldown--;
        }

        // Enemies Update & Collision
        const updatedEnemies = enemies.map((enemy) => {
          if (enemy.isDead) return enemy;
          
          // Update hit timers
          const nextEnemy = { ...enemy };
          if (nextEnemy.flashTimer && nextEnemy.flashTimer > 0) nextEnemy.flashTimer--;
          if (nextEnemy.hitColorTimer && nextEnemy.hitColorTimer > 0) nextEnemy.hitColorTimer--;
          if (nextEnemy.knockbackX && Math.abs(nextEnemy.knockbackX) > 0.1) {
            nextEnemy.x += nextEnemy.knockbackX;
            nextEnemy.knockbackX *= 0.8; // Friction
          } else {
            nextEnemy.knockbackX = 0;
          }

          nextEnemy.x += nextEnemy.vx * nextEnemy.direction;
          if (Math.abs(nextEnemy.x - nextEnemy.startPoint) > nextEnemy.patrolRange) {
            nextEnemy.direction *= -1;
          }

          // Collision with player
          if (
            newPlayer.x < nextEnemy.x + nextEnemy.width &&
            newPlayer.x + newPlayer.width > nextEnemy.x &&
            newPlayer.y < nextEnemy.y + nextEnemy.height &&
            newPlayer.y + newPlayer.height > nextEnemy.y
          ) {
            if (!newPlayer.isStealth) {
              newPlayer.health -= 0.5;
            }
          }
          return nextEnemy;
        });

        // Melee Attack
        if ((keys.current['KeyF'] || keys.current['KeyJ']) && newPlayer.attackCooldown === 0) {
          newPlayer.isAttacking = true;
          newPlayer.attackCooldown = ATTACK_COOLDOWN;
          
          updatedEnemies.forEach((enemy) => {
            if (!enemy.isDead) {
              const attackX = newPlayer.facing === 1 ? newPlayer.x + newPlayer.width : newPlayer.x - ATTACK_RANGE;
              if (
                attackX < enemy.x + enemy.width &&
                attackX + ATTACK_RANGE > enemy.x &&
                newPlayer.y < enemy.y + enemy.height &&
                newPlayer.y + newPlayer.height > enemy.y
              ) {
                enemy.health -= 1;
                enemy.flashTimer = 10;
                enemy.knockbackX = newPlayer.facing * 8;
                
                if (enemy.health <= 0) {
                  enemy.isDead = true;
                  newPlayer.kills += 1;
                }
              }
            }
          });
        }

        if (newPlayer.attackCooldown < ATTACK_COOLDOWN - 10) {
          newPlayer.isAttacking = false;
        }

        // Projectile Logic (Blaster)
        const currentProjectiles = [...projectiles];
        if (newPlayer.projectileCooldown > 0) {
          newPlayer.projectileCooldown--;
        } else if (keys.current['KeyK'] || keys.current['KeyL']) {
          newPlayer.projectileCooldown = PROJECTILE_COOLDOWN;
          currentProjectiles.push({
            x: newPlayer.facing === 1 ? newPlayer.x + newPlayer.width : newPlayer.x,
            y: newPlayer.y + newPlayer.height / 2,
            vx: newPlayer.facing * PROJECTILE_SPEED,
            vy: 0,
            radius: PROJECTILE_RADIUS,
            color: COLORS.mustard,
            active: true,
          });
        }

        // Update Projectiles & Handle Enemy Hits
        const finalProjectiles = currentProjectiles.map(p => ({ ...p })).filter((p) => {
          if (!p.active) return false;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > 6000) return false;

          let hit = false;
          updatedEnemies.forEach((enemy) => {
            if (!enemy.isDead && !hit) {
              if (
                p.x > enemy.x && p.x < enemy.x + enemy.width &&
                p.y > enemy.y && p.y < enemy.y + enemy.height
              ) {
                enemy.health -= 1;
                enemy.hitColorTimer = 15;
                hit = true;

                // Spawn splatter particles
                for (let i = 0; i < 8; i++) {
                  updatedParticles.push({
                    x: p.x,
                    y: p.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6 - 2,
                    life: 20 + Math.random() * 20,
                    maxLife: 40,
                    color: Math.random() > 0.5 ? COLORS.fry : COLORS.fryBox,
                    size: 2 + Math.random() * 3
                  });
                }

                if (enemy.health <= 0) {
                  enemy.isDead = true;
                  newPlayer.kills += 1;
                }
              }
            }
          });
          return !hit;
        });

        // Stealth Logic (Check if in spotlight)
        let inSpotlight = false;
        const nextSpotlights = level.spotlights.map((spot) => {
          const nextSpot = { ...spot, currentOffset: spot.currentOffset + spot.speed };
          const spotX = nextSpot.x + Math.sin(nextSpot.currentOffset) * nextSpot.range;
          const dist = Math.sqrt(Math.pow(newPlayer.x + newPlayer.width / 2 - spotX, 2) + Math.pow(newPlayer.y + newPlayer.height / 2 - spot.y, 2));
          if (dist < nextSpot.radius) inSpotlight = true;
          return nextSpot;
        });
        newPlayer.isStealth = !inSpotlight;

        // Hazards
        level.hazards.forEach((hazard) => {
          if (
            newPlayer.x < hazard.x + hazard.width &&
            newPlayer.x + newPlayer.width > hazard.x &&
            newPlayer.y < hazard.y + hazard.height &&
            newPlayer.y + newPlayer.height > hazard.y
          ) {
            newPlayer.health -= 0.5;
          }
        });

        // Collectibles & Animations
        const updatedAnimations = collectionAnimations.map(anim => ({
          ...anim,
          timer: anim.timer + 1
        }));

        const remainingAnimations = updatedAnimations.filter((anim) => {
          if (anim.timer === 80) {
            playClang();
          }
          if (anim.timer >= anim.maxTimer) {
            newPlayer.nuggetsRescued += 1;
            return false;
          }
          return true;
        });

        let nuggetsChanged = false;
        const newNuggets = level.nuggets.map((nugget) => {
          if (
            !nugget.collected &&
            newPlayer.x < nugget.x + nugget.width &&
            newPlayer.x + newPlayer.width > nugget.x &&
            newPlayer.y < nugget.y + nugget.height &&
            newPlayer.y + newPlayer.height > nugget.y
          ) {
            nuggetsChanged = true;
            remainingAnimations.push({
              x: nugget.x,
              y: nugget.y,
              timer: 0,
              maxTimer: 120, // Increased for a longer, cuter animation
              type: 'nugget',
            });
            return { ...nugget, collected: true };
          }
          return nugget;
        });

        const nextLevel = { ...level, nuggets: newNuggets, spotlights: nextSpotlights };

        // Camera follow
        const newCamera = {
          x: Math.max(0, newPlayer.x - CANVAS_WIDTH / 2),
          y: 0,
        };

        const newTimeElapsed = prev.timeElapsed + 1;
        const timeBonus = Math.max(0, 10000 - Math.floor(newTimeElapsed / 60) * 10);
        const baseScore = newPlayer.nuggetsRescued * 100 + newPlayer.kills * 50;

        // Win/Loss conditions
        if (newPlayer.health <= 0) {
          return { ...prev, status: 'gameover', score: baseScore };
        }

        if (
          newPlayer.x < level.goal.x + level.goal.width &&
          newPlayer.x + newPlayer.width > level.goal.x &&
          newPlayer.y < level.goal.y + level.goal.height &&
          newPlayer.y + newPlayer.height > level.goal.y
        ) {
          return { ...prev, status: 'win', score: baseScore + timeBonus + 500 };
        }

        return {
          ...prev,
          player: newPlayer,
          enemies: updatedEnemies,
          projectiles: finalProjectiles,
          particles: updatedParticles,
          collectionAnimations: remainingAnimations,
          level: nextLevel,
          camera: newCamera,
          score: baseScore,
          timeElapsed: newTimeElapsed,
        };
      });
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState?.status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const { player, level, camera, enemies, particles } = gameState;

      // Clear
      ctx.fillStyle = '#0a0a0a'; // Even darker noir background
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Distant Industrial Silhouettes (Parallax-ish)
      ctx.save();
      ctx.translate(-camera.x * 0.3, 0);
      ctx.fillStyle = '#0d0d0d';
      for(let i = 0; i < 15; i++) {
        // Use deterministic heights based on index to avoid flickering
        const h = 150 + ((i * 73) % 200); 
        const w = 100 + ((i * 37) % 100);
        ctx.fillRect(i * 300, CANVAS_HEIGHT - h, w, h);
        
        // Chimneys with stable smoke
        const chimneyX = i * 300 + w/2 - 15;
        const chimneyH = h + 40;
        ctx.fillRect(chimneyX, CANVAS_HEIGHT - chimneyH, 30, 40);
        
        // Subtle smoke particles
        ctx.fillStyle = 'rgba(40, 40, 40, 0.3)';
        for(let j = 0; j < 3; j++) {
          const smokeY = CANVAS_HEIGHT - chimneyH - 20 - (j * 30) - ((Date.now() / 50 + i * 10) % 30);
          const smokeX = chimneyX + 15 + Math.sin(Date.now() / 1000 + i + j) * 10;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, 10 + j * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#0d0d0d'; // Reset for next building
      }
      ctx.restore();

      // Atmospheric Fog Layer
      const fogGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      fogGradient.addColorStop(0, 'transparent');
      fogGradient.addColorStop(0.7, 'rgba(10, 10, 10, 0)');
      fogGradient.addColorStop(1, 'rgba(20, 15, 5, 0.4)'); // Mustard-tinted fog at bottom
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Pipes leaking mustard (Mid-ground)
      ctx.save();
      ctx.translate(-camera.x * 0.6, 0);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 12;
      for(let i = 0; i < 15; i++) {
        const px = i * 600 + 100;
        const py = 50 + ((i * 13) % 100);
        ctx.beginPath();
        ctx.moveTo(px, -50);
        ctx.lineTo(px, py);
        ctx.lineTo(px + 150, py);
        ctx.stroke();
        
        // Drip effect
        const dripY = py + ((Date.now() / 10 + i * 100) % 400);
        ctx.fillStyle = COLORS.mustard;
        ctx.beginPath();
        ctx.arc(px + 130, dripY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Constant stream
        ctx.globalAlpha = 0.3;
        ctx.fillRect(px + 128, py, 4, CANVAS_HEIGHT);
        ctx.globalAlpha = 1.0;
      }
      ctx.restore();

      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      // Draw Platforms
      level.platforms.forEach((p) => {
        ctx.fillStyle = p.type === 'mustard' ? COLORS.mustard : '#222';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        // Platform edge
        ctx.strokeStyle = '#444';
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      });

      // Draw Hazards
      level.hazards.forEach((h) => {
        ctx.fillStyle = COLORS.mustard;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(h.x, h.y, h.width, h.height);
        ctx.globalAlpha = 1.0;
        // Bubbles
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(h.x + (Date.now() / 20 + i * 40) % h.width, h.y + 10, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      });

      // Draw Nuggets (Collectibles)
      level.nuggets.forEach((n) => {
        if (!n.collected) {
          ctx.save();
          ctx.fillStyle = COLORS.nugget;
          ctx.strokeStyle = COLORS.nuggetDark;
          ctx.lineWidth = 2;
          
          // Mini nugget shape
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(n.x, n.y, n.width, n.height, 6);
          } else {
            ctx.rect(n.x, n.y, n.width, n.height);
          }
          ctx.fill();
          ctx.stroke();
          
          // Texture dots
          ctx.fillStyle = COLORS.nuggetTexture;
          ctx.beginPath();
          ctx.arc(n.x + 5, n.y + 5, 2, 0, Math.PI * 2);
          ctx.arc(n.x + 12, n.y + 14, 2, 0, Math.PI * 2);
          ctx.fill();

          // Glow
          ctx.shadowBlur = 10;
          ctx.shadowColor = COLORS.nugget;
          ctx.stroke();
          ctx.restore();
        }
      });

      // Draw Goal (Extraction Door)
      const goal = level.goal;
      ctx.save();
      
      // Door Frame
      ctx.fillStyle = COLORS.doorFrame;
      ctx.fillRect(goal.x - 10, goal.y - 10, goal.width + 20, goal.height + 10);
      
      // Inner Door
      ctx.fillStyle = COLORS.doorPanel;
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
      
      // Door Details (Lines/Panels)
      ctx.strokeStyle = '#1A252F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(goal.x + goal.width / 2, goal.y);
      ctx.lineTo(goal.x + goal.width / 2, goal.y + goal.height);
      ctx.stroke();
      
      // Horizontal panels
      for(let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(goal.x, goal.y + (goal.height / 4) * i);
        ctx.lineTo(goal.x + goal.width, goal.y + (goal.height / 4) * i);
        ctx.stroke();
      }
      
      // Status Lights
      const lightOn = (Date.now() / 500) % 2 > 1;
      ctx.fillStyle = lightOn ? COLORS.doorLight : '#1E8449';
      ctx.beginPath();
      ctx.arc(goal.x + goal.width / 2, goal.y - 20, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow for light
      if (lightOn) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.doorLight;
        ctx.stroke();
      }
      
      // "EXTRACTION" Sign
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('EXTRACTION', goal.x + goal.width / 2, goal.y - 35);
      
      // Warning stripes
      ctx.fillStyle = '#F1C40F';
      for(let i = 0; i < 5; i++) {
        ctx.save();
        ctx.translate(goal.x - 10 + i * 20, goal.y + goal.height);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(0, 0, 10, 30);
        ctx.restore();
      }
      
      ctx.restore();

      // Draw Particles
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      // Draw Enemies (Fry Monsters)
      enemies.forEach((e) => {
        if (!e.isDead) {
          // Fry Basket
          if (e.flashTimer && e.flashTimer > 0) {
            ctx.fillStyle = '#fff';
          } else if (e.hitColorTimer && e.hitColorTimer > 0) {
            ctx.fillStyle = '#ff4d4d'; // Bright red for damage
          } else {
            ctx.fillStyle = COLORS.fryBox;
          }
          ctx.fillRect(e.x, e.y + 10, e.width, e.height - 10);
          
          // Fries sticking out
          if (e.flashTimer && e.flashTimer > 0) {
            ctx.fillStyle = '#fff';
          } else if (e.hitColorTimer && e.hitColorTimer > 0) {
            ctx.fillStyle = '#ffcc00'; // Bright yellow for damage
          } else {
            ctx.fillStyle = COLORS.fry;
          }
          for (let i = 0; i < 8; i++) {
            ctx.fillRect(e.x + i * 5, e.y - Math.sin(Date.now() / 100 + i) * 5, 4, 15);
          }

          // Angry Eyes
          ctx.fillStyle = '#fff';
          ctx.fillRect(e.x + 10, e.y + 15, 8, 8);
          ctx.fillRect(e.x + 22, e.y + 15, 8, 8);
          ctx.fillStyle = '#000';
          ctx.fillRect(e.x + 12, e.y + 17, 4, 4);
          ctx.fillRect(e.x + 24, e.y + 17, 4, 4);
          
          // Teeth
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.moveTo(e.x + 10, e.y + 30);
          ctx.lineTo(e.x + 15, e.y + 35);
          ctx.lineTo(e.x + 20, e.y + 30);
          ctx.lineTo(e.x + 25, e.y + 35);
          ctx.lineTo(e.x + 30, e.y + 30);
          ctx.fill();
        } else {
          // Dead enemy (fry mess / collapsed)
          ctx.save();
          ctx.translate(e.x, e.y + e.height - 10);
          
          // Collapsed basket
          ctx.fillStyle = COLORS.fryBox;
          ctx.globalAlpha = 0.6;
          ctx.fillRect(0, 0, e.width + 10, 10);
          
          // Scattered fries
          ctx.fillStyle = COLORS.fry;
          ctx.globalAlpha = 0.8;
          for (let i = 0; i < 12; i++) {
            ctx.save();
            ctx.translate(i * 4 - 5, 5);
            ctx.rotate(Math.PI / 2 + (i % 3 - 1) * 0.5);
            ctx.fillRect(0, 0, 3, 15);
            ctx.restore();
          }
          ctx.restore();
        }
      });

      // Draw Projectiles
      gameState.projectiles.forEach((p) => {
        if (!p.active) return;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Trail effect
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 0.5, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw Collection Animations
      gameState.collectionAnimations.forEach((anim) => {
        const progress = anim.timer / anim.maxTimer;
        const scoopDuration = 80; // Slow, cute jump phase
        const scoopProgress = Math.min(1, anim.timer / scoopDuration); 
        const flyProgress = Math.max(0, (anim.timer - scoopDuration) / (anim.maxTimer - scoopDuration)); 

        // Target is top left UI area (40, 50) relative to camera
        const targetX = gameState.camera.x + 40; 
        const targetY = gameState.camera.y + 50;

        // Initial position is where it was collected
        const startY = anim.y + 40;
        const basketY = startY - (40 * scoopProgress);
        
        // After scooping, it flies to target
        const zipProgress = Math.pow(flyProgress, 2);
        let currentX = anim.x + (targetX - anim.x) * zipProgress;
        let currentY = (flyProgress > 0) ? (basketY + (targetY - basketY) * zipProgress) : basketY;

        // Add a slight shake during scooping
        if (scoopProgress > 0 && flyProgress === 0) {
          currentX += Math.sin(anim.timer * 0.5) * 2;
        }

        const size = 20;
        const basketSize = 34;

        ctx.save();
        
        // Steam Effect (Diner Noir Lore)
        if (scoopProgress > 0.2) {
          ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
          for (let i = 0; i < 4; i++) {
            const steamX = currentX + Math.sin(anim.timer * 0.1 + i) * 15;
            const steamY = currentY - 10 - (i * 10) - ((anim.timer * 0.5) % 20);
            const steamSize = 8 + Math.sin(anim.timer * 0.05 + i) * 4;
            ctx.beginPath();
            ctx.arc(steamX, steamY, steamSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Grease Splatters
        if (scoopProgress > 0.5 && flyProgress < 0.5) {
          ctx.fillStyle = '#1a0f00'; // Dark grease color
          for (let i = 0; i < 6; i++) {
            const gx = currentX + Math.cos(i * 1.2) * 25 * scoopProgress;
            const gy = currentY + Math.sin(i * 1.2) * 25 * scoopProgress;
            ctx.beginPath();
            ctx.arc(gx, gy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Draw Fryer Basket (Diner Noir Aesthetic: Worn Chrome/Steel)
        ctx.strokeStyle = '#4a4a4a'; // Worn steel
        ctx.lineWidth = 2;
        
        // Basket body (wire mesh)
        ctx.beginPath();
        ctx.strokeRect(currentX - basketSize/2, currentY - 5, basketSize, basketSize/2);
        
        // Gritty Mesh Pattern
        ctx.strokeStyle = 'rgba(60, 60, 60, 0.5)';
        ctx.lineWidth = 1;
        for(let i = -2; i <= 2; i++) {
          ctx.moveTo(currentX + i * 6, currentY - 5);
          ctx.lineTo(currentX + i * 6, currentY + 12);
        }
        for(let i = 0; i < 3; i++) {
          ctx.moveTo(currentX - basketSize/2, currentY - 5 + i * 6);
          ctx.lineTo(currentX + basketSize/2, currentY - 5 + i * 6);
        }
        ctx.stroke();

        // Main Frame
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2.5;
        
        // Dented appearance (slightly irregular frame)
        ctx.beginPath();
        const bx = currentX - basketSize/2;
        const by = currentY - 5;
        const bw = basketSize;
        const bh = basketSize/2;
        
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + bw * 0.4, by);
        ctx.lineTo(bx + bw * 0.45, by + 2); // Small dent
        ctx.lineTo(bx + bw * 0.5, by);
        ctx.lineTo(bx + bw, by);
        ctx.lineTo(bx + bw, by + bh);
        ctx.lineTo(bx, by + bh);
        ctx.closePath();
        ctx.stroke();
        
        // Rust Spots
        ctx.fillStyle = '#8B4513'; // Rust color
        ctx.globalAlpha = 0.6;
        const rustSeed = (anim.x + anim.y) % 100;
        for(let i = 0; i < 3; i++) {
          const rx = bx + ((rustSeed * (i + 1)) % bw);
          const ry = by + ((rustSeed * (i + 2)) % bh);
          ctx.beginPath();
          ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        
        // Basket handle (Noir style: Heavy iron)
        ctx.strokeStyle = '#1c1c1c';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(currentX - basketSize/2, currentY + 5);
        ctx.lineTo(currentX - basketSize/2 - 18, currentY - 12);
        ctx.stroke();
        
        // Handle grip
        ctx.fillStyle = '#3d2b1f'; // Dark wood/rubber grip
        ctx.fillRect(currentX - basketSize/2 - 22, currentY - 15, 8, 4);

        // Draw the Baby Nugget
        if (flyProgress > 0) {
          // Inside the basket during flight
          ctx.fillStyle = COLORS.nugget;
          ctx.shadowBlur = 10;
          ctx.shadowColor = COLORS.mustard;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(currentX - size/2, currentY - 5, size, size * 0.8, 4);
          } else {
            ctx.rect(currentX - size/2, currentY - 5, size, size * 0.8);
          }
          ctx.fill();
        } else {
          // Cute jump into the basket
          const jumpHeight = 30;
          const jumpProgress = scoopProgress;
          const jumpY = anim.y - (Math.sin(jumpProgress * Math.PI) * jumpHeight);
          
          ctx.fillStyle = COLORS.nugget;
          ctx.shadowBlur = 10;
          ctx.shadowColor = COLORS.mustard;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(anim.x - size/2, jumpY, size, size * 0.8, 4);
          } else {
            ctx.rect(anim.x - size/2, jumpY, size, size * 0.8);
          }
          ctx.fill();
          
          // Little eyes for the baby nugget
          ctx.fillStyle = '#000';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(anim.x - 4, jumpY + 6, 2, 0, Math.PI * 2);
          ctx.arc(anim.x + 4, jumpY + 6, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Sparkles (only during flight or end of scoop)
        if (scoopProgress > 0.8) {
          ctx.fillStyle = '#fff';
          ctx.shadowBlur = 0;
          for (let i = 0; i < 3; i++) {
            const ox = Math.cos(Date.now() / 100 + i * 10) * 10 * (1 - flyProgress);
            const oy = Math.sin(Date.now() / 100 + i * 10) * 10 * (1 - flyProgress);
            ctx.beginPath();
            ctx.arc(currentX + ox, currentY + oy, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      });

      // Draw Player (Nugget Warrior)
      ctx.save();
      if (player.facing === -1) {
        ctx.scale(-1, 1);
        ctx.translate(-player.x * 2 - player.width, 0);
      }

      // Body
      ctx.fillStyle = player.isStealth ? COLORS.nuggetDark : COLORS.nugget;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(player.x, player.y, player.width, player.height, 12);
      } else {
        ctx.rect(player.x, player.y, player.width, player.height);
      }
      ctx.fill();

      // Blaster (Honey Mustard Gun)
      ctx.fillStyle = '#444';
      ctx.fillRect(player.x + 40, player.y + 25, 30, 15); // Barrel
      ctx.fillStyle = COLORS.mustard;
      ctx.fillRect(player.x + 45, player.y + 28, 20, 9); // Mustard core
      ctx.fillStyle = '#222';
      ctx.fillRect(player.x + 30, player.y + 20, 15, 25); // Grip/Body

      // Muscle/Texture
      ctx.fillStyle = COLORS.nuggetTexture;
      ctx.beginPath();
      ctx.arc(player.x + 15, player.y + 40, 8, 0, Math.PI * 2);
      ctx.arc(player.x + 45, player.y + 40, 8, 0, Math.PI * 2);
      ctx.fill();

      // Scars
      ctx.strokeStyle = COLORS.blood;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player.x + 10, player.y + 15);
      ctx.lineTo(player.x + 25, player.y + 30);
      ctx.stroke();

      // Angry Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(player.x + 20, player.y + 20, 8, 0, Math.PI * 2);
      ctx.arc(player.x + 45, player.y + 20, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(player.x + 22, player.y + 20, 3, 0, Math.PI * 2);
      ctx.arc(player.x + 47, player.y + 20, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyebrows (Angry)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(player.x + 15, player.y + 12);
      ctx.lineTo(player.x + 25, player.y + 18);
      ctx.moveTo(player.x + 50, player.y + 12);
      ctx.lineTo(player.x + 40, player.y + 18);
      ctx.stroke();

      // Attack Swing
      if (player.isAttacking) {
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(player.x + player.width + 10, player.y + player.height / 2, 20, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();

      // Draw Spotlights
      level.spotlights.forEach((s) => {
        const spotX = s.x + Math.sin(s.currentOffset) * s.range;
        const gradient = ctx.createRadialGradient(spotX, s.y, 0, spotX, s.y, s.radius);
        gradient.addColorStop(0, COLORS.spotlight);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(spotX, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // UI Overlay (Scoring Area)
      ctx.save();
      
      // Main Panel Background (Formica Texture)
      const hudWidth = 300;
      const hudHeight = 130;
      const hudX = 20;
      const hudY = 20;

      // Draw Formica Panel
      ctx.fillStyle = '#111';
      ctx.fillRect(hudX, hudY, hudWidth, hudHeight);
      
      // Subtle Formica Pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for(let i = 0; i < hudWidth; i += 20) {
        for(let j = 0; j < hudHeight; j += 20) {
          ctx.beginPath();
          ctx.arc(hudX + i + 2, hudY + j + 2, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Panel Border
      ctx.strokeStyle = COLORS.uiBorder;
      ctx.lineWidth = 3;
      ctx.strokeRect(hudX, hudY, hudWidth, hudHeight);
      
      // Outer Glow
      ctx.strokeStyle = 'rgba(230, 126, 34, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(hudX - 2, hudY - 2, hudWidth + 4, hudHeight + 4);
      
      // Vintage Signage Header
      ctx.fillStyle = COLORS.uiAccent;
      ctx.font = 'bold 10px "Courier New"';
      ctx.fillText('PROPERTY OF THE SAUCE SYNDICATE', hudX + 10, hudY + 15);
      
      // Vitality Bar
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px "Courier New"';
      ctx.fillText('VITALITY', hudX + 20, hudY + 40);
      
      const barWidth = 160;
      const barHeight = 12;
      ctx.fillStyle = '#222';
      ctx.fillRect(hudX + 110, hudY + 28, barWidth, barHeight);
      
      const healthWidth = (player.health / 100) * barWidth;
      const healthColor = player.health > 50 ? '#2ecc71' : player.health > 25 ? '#f1c40f' : '#e74c3c';
      ctx.fillStyle = healthColor;
      ctx.fillRect(hudX + 110, hudY + 28, healthWidth, barHeight);
      
      // Nuggets & Intel
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px "Courier New"';
      ctx.fillText(`NUGGETS: ${player.nuggetsRescued}/13`, hudX + 20, hudY + 65);
      ctx.fillText(`INTEL: ${gameState.score.toString().padStart(6, '0')}`, hudX + 20, hudY + 85);
      
      // Timer
      const minutes = Math.floor(gameState.timeElapsed / 3600);
      const seconds = Math.floor((gameState.timeElapsed % 3600) / 60);
      const centis = Math.floor((gameState.timeElapsed % 60) * 1.66);
      const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
      
      ctx.fillStyle = COLORS.uiAccent;
      ctx.font = 'bold 14px "Courier New"';
      ctx.fillText(`TIME: ${timeStr}`, hudX + 20, hudY + 105);
      
      // Stealth Status
      if (player.isStealth) {
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 11px "Courier New"';
        ctx.fillText('» STEALTH ACTIVE «', hudX + 160, hudY + 105);
      } else {
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 11px "Courier New"';
        ctx.fillText('» EXPOSED «', hudX + 160, hudY + 105);
      }
      
      ctx.restore();

      // Film Grain Effect (Canvas)
      ctx.save();
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        const size = Math.random() * 2;
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        ctx.fillRect(x, y, size, size);
      }
      ctx.restore();

      // Controls hint at bottom
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);
      ctx.fillStyle = '#666';
      ctx.font = '11px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('WASD: MOVE | F/J: STRIKE | K/L: BLASTER | SPACE: JUMP', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);
      ctx.restore();
    };

    render();
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border-4 border-zinc-800 shadow-2xl rounded-lg bg-black cursor-none"
    />
  );
};

export default Game;
