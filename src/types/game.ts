/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TowerType = 'archer' | 'cannon' | 'ice';

export type TargetingMode = 'nearest' | 'first' | 'strongest' | 'weakest';

export interface TowerStats {
  id: TowerType;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  splashRadius: number; // 0 for single target
  slowFactor: number; // 0 for none, e.g. 0.5 = 50% slow
  slowDuration: number; // seconds
  canTargetFlying: boolean;
  color: string;
  accentColor: string;
  description: string;
  upgradeCostMultiplier: number;
}

export interface PlacedTower {
  id: string;
  nodeIndex: number;
  type: TowerType;
  level: number;
  x: number;
  z: number;
  targetingMode: TargetingMode;
  lastShotTime: number;
  totalDamageDealt: number;
  kills: number;
  rotation: number;
}

export type EnemyType = 'goblin' | 'wolf' | 'ogre' | 'boss' | 'flying' | 'armored' | 'healer';

export interface EnemyStats {
  type: EnemyType;
  name: string;
  maxHealth: number;
  speed: number;
  coinReward: number;
  damageToPlayer: number;
  isFlying: boolean;
  armorFactor: number; // percentage damage reduction from physical/cannon
  healRate?: number; // HP healed per tick for healers
  healRadius?: number;
  color: string;
  scale: number;
  description: string;
}

export interface EnemyInstance {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  speed: number;
  currentWaypointIndex: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  slowTimer: number;
  slowFactor: number;
  isDead: boolean;
  hasReachedVillage: boolean;
  distanceTraveled: number;
  spawnTime: number;
  lastHealTime?: number;
}

export interface Projectile {
  id: string;
  type: TowerType;
  startX: number;
  startY: number;
  startZ: number;
  currentX: number;
  currentY: number;
  currentZ: number;
  targetEnemyId: string;
  targetPosition: [number, number, number];
  damage: number;
  speed: number;
  splashRadius: number;
  slowFactor: number;
  slowDuration: number;
  progress: number; // 0 to 1
}

export interface BuildNode {
  index: number;
  x: number;
  z: number;
  towerId: string | null;
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  enemies: { type: EnemyType; count: number; interval: number }[];
  rewardBonus: number;
}

export interface ParticleEffect {
  id: string;
  type: 'arrow_hit' | 'explosion' | 'ice_burst' | 'coin_pickup' | 'heal_aura';
  x: number;
  y: number;
  z: number;
  color: string;
  lifetime: number;
  maxLifetime: number;
  scale: number;
}
