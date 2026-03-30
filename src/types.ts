export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
}

export interface Player extends Entity {
  isJumping: boolean;
  isStealth: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  projectileCooldown: number;
  health: number;
  nuggetsRescued: number;
  kills: number;
  facing: 1 | -1;
}

export interface Enemy extends Entity {
  type: 'fry-monster' | 'sauce-sentry';
  patrolRange: number;
  startPoint: number;
  direction: 1 | -1;
  health: number;
  isDead: boolean;
  flashTimer?: number;
  hitColorTimer?: number;
  knockbackX?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Level {
  platforms: Platform[];
  hazards: Hazard[];
  spotlights: Spotlight[];
  nuggets: Collectible[];
  goal: { x: number; y: number; width: number; height: number };
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'mustard';
}

export interface Hazard {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'mustard-water';
}

export interface Spotlight {
  x: number;
  y: number;
  radius: number;
  speed: number;
  range: number;
  currentOffset: number;
}

export interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  active: boolean;
}

export interface CollectionAnimation {
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  type: 'nugget';
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  collectionAnimations: CollectionAnimation[];
  level: Level;
  camera: { x: number; y: number };
  status: 'start' | 'playing' | 'gameover' | 'win';
  score: number;
  timeElapsed: number;
}
