/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TowerStats, EnemyStats, BuildNode, WaveConfig } from '../types/game';

export const INITIAL_LIVES = 20;
export const INITIAL_GOLD = 150;

export const TOWER_DEFINITIONS: Record<string, TowerStats> = {
  archer: {
    id: 'archer',
    name: 'Archer Watchtower',
    cost: 50,
    damage: 25,
    range: 5.5,
    fireRate: 1.2, // shots per sec
    splashRadius: 0,
    slowFactor: 0,
    slowDuration: 0,
    canTargetFlying: true,
    color: '#38bdf8', // sky-400
    accentColor: '#0284c7',
    description: 'Fast and cheap, good all-rounder. Can target flying enemies.',
    upgradeCostMultiplier: 1.6,
  },
  cannon: {
    id: 'cannon',
    name: 'Heavy Cannon',
    cost: 100,
    damage: 70,
    range: 4.5,
    fireRate: 0.5, // 1 shot every 2 sec
    splashRadius: 2.2,
    slowFactor: 0,
    slowDuration: 0,
    canTargetFlying: false, // Cannot shoot aerial targets
    color: '#f97316', // orange-500
    accentColor: '#c2410c',
    description: 'Slow, but splash damage hits enemy clusters and groups.',
    upgradeCostMultiplier: 1.8,
  },
  ice: {
    id: 'ice',
    name: 'Frost Spire',
    cost: 75,
    damage: 15,
    range: 5.0,
    fireRate: 0.8,
    splashRadius: 1.2,
    slowFactor: 0.5, // 50% slow
    slowDuration: 3.5,
    canTargetFlying: true,
    color: '#06b6d4', // cyan-500
    accentColor: '#0891b2',
    description: 'Weak damage, but slows enemies so other towers get more shots.',
    upgradeCostMultiplier: 1.5,
  },
};

export const ENEMY_DEFINITIONS: Record<string, EnemyStats> = {
  goblin: {
    type: 'goblin',
    name: 'Goblin Scout',
    maxHealth: 80,
    speed: 2.8,
    coinReward: 12,
    damageToPlayer: 1,
    isFlying: false,
    armorFactor: 0,
    color: '#22c55e',
    scale: 0.8,
    description: 'Swift basic raider.',
  },
  wolf: {
    type: 'wolf',
    name: 'Dire Wolf',
    maxHealth: 110,
    speed: 4.0,
    coinReward: 16,
    damageToPlayer: 1,
    isFlying: false,
    armorFactor: 0,
    color: '#64748b',
    scale: 0.9,
    description: 'Lightning-fast pack runner.',
  },
  armored: {
    type: 'armored',
    name: 'Ironclad Knight',
    maxHealth: 220,
    speed: 2.0,
    coinReward: 25,
    damageToPlayer: 2,
    isFlying: false,
    armorFactor: 0.5, // Takes 50% reduced cannon/physical damage
    color: '#94a3b8',
    scale: 1.0,
    description: 'Heavy plate armor absorbs 50% cannon impact.',
  },
  flying: {
    type: 'flying',
    name: 'Sky Wyvern',
    maxHealth: 140,
    speed: 3.2,
    coinReward: 22,
    damageToPlayer: 2,
    isFlying: true, // Flits directly to village, immune to cannons
    armorFactor: 0,
    color: '#a855f7',
    scale: 1.1,
    description: 'Flies directly to the village gate. Cannons cannot hit it!',
  },
  healer: {
    type: 'healer',
    name: 'Forest Shaman',
    maxHealth: 160,
    speed: 2.2,
    coinReward: 30,
    damageToPlayer: 2,
    isFlying: false,
    armorFactor: 0.1,
    healRate: 30,
    healRadius: 4.0,
    color: '#10b981',
    scale: 0.95,
    description: 'Restores 30 HP to nearby allies every 2 seconds.',
  },
  ogre: {
    type: 'ogre',
    name: 'Mountain Ogre',
    maxHealth: 550,
    speed: 1.5,
    coinReward: 50,
    damageToPlayer: 4,
    isFlying: false,
    armorFactor: 0.2,
    color: '#b45309',
    scale: 1.45,
    description: 'Colossal health pool and brutal siege threat.',
  },
  boss: {
    type: 'boss',
    name: 'Warlord Titan',
    maxHealth: 1600,
    speed: 1.2,
    coinReward: 150,
    damageToPlayer: 10,
    isFlying: false,
    armorFactor: 0.35,
    color: '#dc2626',
    scale: 2.0,
    description: 'The terrifying final invader of the realm.',
  },
};

// S-curved winding waypoint path across the valley (X, Z coordinates in Three.js world space)
export const WAYPOINTS: [number, number][] = [
  [-13, -9],   // 0: Spawn Gate
  [-8, -9],    // 1
  [-5, -4],    // 2
  [-9, 0],     // 3
  [-9, 5],     // 4
  [-2, 6],     // 5
  [3, 3],      // 6
  [1, -4],     // 7
  [7, -5],     // 8
  [9, 1],      // 9
  [9, 7],      // 10
  [13, 7],     // 11: Village Gate Arrival
];

// Strategic build spot nodes located around the corners and chokepoints
export const BUILD_NODES: BuildNode[] = [
  { index: 0, x: -7, z: -6.5, towerId: null },
  { index: 1, x: -6.5, z: -1.5, towerId: null },
  { index: 2, x: -7, z: 2.8, towerId: null },
  { index: 3, x: -3.5, z: 3.5, towerId: null },
  { index: 4, x: -0.5, z: 7.8, towerId: null },
  { index: 5, x: 1, z: 0.5, towerId: null },
  { index: 6, x: -1, z: -2.5, towerId: null },
  { index: 7, x: 4.5, z: -2, towerId: null },
  { index: 8, x: 6, z: 3.5, towerId: null },
  { index: 9, x: 7, z: 7.5, towerId: null },
  { index: 10, x: 10, z: -2, towerId: null },
];

export const WAVES: WaveConfig[] = [
  {
    waveNumber: 1,
    name: 'Scout Vanguard',
    enemies: [{ type: 'goblin', count: 6, interval: 1.4 }],
    rewardBonus: 30,
  },
  {
    waveNumber: 2,
    name: 'Wolf Pack Charge',
    enemies: [
      { type: 'goblin', count: 5, interval: 1.2 },
      { type: 'wolf', count: 4, interval: 1.0 },
    ],
    rewardBonus: 40,
  },
  {
    waveNumber: 3,
    name: 'Armored Infantry',
    enemies: [
      { type: 'goblin', count: 4, interval: 1.2 },
      { type: 'armored', count: 3, interval: 2.0 },
      { type: 'wolf', count: 4, interval: 1.0 },
    ],
    rewardBonus: 50,
  },
  {
    waveNumber: 4,
    name: 'Aerial Incursion',
    enemies: [
      { type: 'flying', count: 4, interval: 1.8 },
      { type: 'goblin', count: 6, interval: 1.0 },
    ],
    rewardBonus: 60,
  },
  {
    waveNumber: 5,
    name: 'Shaman Rites',
    enemies: [
      { type: 'healer', count: 2, interval: 3.0 },
      { type: 'armored', count: 4, interval: 1.5 },
      { type: 'wolf', count: 5, interval: 0.9 },
    ],
    rewardBonus: 75,
  },
  {
    waveNumber: 6,
    name: 'The Ogre Awakes',
    enemies: [
      { type: 'ogre', count: 1, interval: 4.0 },
      { type: 'goblin', count: 8, interval: 0.8 },
      { type: 'flying', count: 3, interval: 2.0 },
    ],
    rewardBonus: 90,
  },
  {
    waveNumber: 7,
    name: 'Shield & Staff',
    enemies: [
      { type: 'armored', count: 6, interval: 1.4 },
      { type: 'healer', count: 3, interval: 2.5 },
      { type: 'wolf', count: 6, interval: 0.8 },
    ],
    rewardBonus: 110,
  },
  {
    waveNumber: 8,
    name: 'Wyvern Swarm',
    enemies: [
      { type: 'flying', count: 8, interval: 1.2 },
      { type: 'ogre', count: 2, interval: 3.5 },
      { type: 'armored', count: 4, interval: 1.5 },
    ],
    rewardBonus: 130,
  },
  {
    waveNumber: 9,
    name: 'Twin Behemoths',
    enemies: [
      { type: 'ogre', count: 3, interval: 2.8 },
      { type: 'healer', count: 3, interval: 2.0 },
      { type: 'flying', count: 5, interval: 1.5 },
      { type: 'wolf', count: 8, interval: 0.7 },
    ],
    rewardBonus: 160,
  },
  {
    waveNumber: 10,
    name: 'Warlord Siege (Final Wave)',
    enemies: [
      { type: 'armored', count: 6, interval: 1.2 },
      { type: 'boss', count: 1, interval: 4.0 },
      { type: 'healer', count: 3, interval: 3.0 },
      { type: 'flying', count: 6, interval: 1.5 },
      { type: 'ogre', count: 2, interval: 3.0 },
    ],
    rewardBonus: 300,
  },
];
