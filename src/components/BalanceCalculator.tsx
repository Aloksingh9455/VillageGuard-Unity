/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sliders,
  TrendingUp,
  Download,
  Copy,
  Check,
  Shield,
  Zap,
  Info,
  RefreshCw,
} from 'lucide-react';
import { TOWER_DEFINITIONS, ENEMY_DEFINITIONS, WAVES } from '../data/gameData';

export const BalanceCalculator: React.FC = () => {
  // Tower state sliders
  const [towers, setTowers] = useState({
    archer: { damage: 25, fireRate: 1.2, cost: 50, range: 5.5 },
    cannon: { damage: 70, fireRate: 0.5, cost: 100, range: 4.5 },
    ice: { damage: 15, fireRate: 0.8, cost: 75, range: 5.0 },
  });

  // Enemy HP & Speed sliders
  const [enemies, setEnemies] = useState({
    goblin: { health: 80, speed: 2.8, reward: 12 },
    wolf: { health: 110, speed: 4.0, reward: 16 },
    armored: { health: 220, speed: 2.0, reward: 25 },
    flying: { health: 140, speed: 3.2, reward: 22 },
    ogre: { health: 550, speed: 1.5, reward: 50 },
    boss: { health: 1600, speed: 1.2, reward: 150 },
  });

  const [copiedSO, setCopiedSO] = useState(false);

  // Computations
  const archerDPS = towers.archer.damage * towers.archer.fireRate;
  const cannonDPS = towers.cannon.damage * towers.cannon.fireRate;
  const iceDPS = towers.ice.damage * towers.ice.fireRate;

  const archerEfficiency = ((archerDPS / towers.archer.cost) * 100).toFixed(2);
  const cannonEfficiency = ((cannonDPS / towers.cannon.cost) * 100).toFixed(2);
  const iceEfficiency = ((iceDPS / towers.ice.cost) * 100).toFixed(2);

  // Path length is approximately 28 units in the game world
  const PATH_LENGTH = 28;

  // Wave health calculations
  const waveEHP = WAVES.map((w) => {
    let totalHP = 0;
    let totalReward = w.rewardBonus;
    w.enemies.forEach((e) => {
      const stats = enemies[e.type as keyof typeof enemies] || { health: 100, reward: 10 };
      totalHP += stats.health * e.count;
      totalReward += stats.reward * e.count;
    });
    return { wave: w.waveNumber, name: w.name, totalHP, totalReward };
  });

  const handleResetDefaults = () => {
    setTowers({
      archer: { damage: 25, fireRate: 1.2, cost: 50, range: 5.5 },
      cannon: { damage: 70, fireRate: 0.5, cost: 100, range: 4.5 },
      ice: { damage: 15, fireRate: 0.8, cost: 75, range: 5.0 },
    });
    setEnemies({
      goblin: { health: 80, speed: 2.8, reward: 12 },
      wolf: { health: 110, speed: 4.0, reward: 16 },
      armored: { health: 220, speed: 2.0, reward: 25 },
      flying: { health: 140, speed: 3.2, reward: 22 },
      ogre: { health: 550, speed: 1.5, reward: 50 },
      boss: { health: 1600, speed: 1.2, reward: 150 },
    });
  };

  const generateScriptableObject = () => {
    return `// ==========================================
// File: TowerBalanceData.cs
// Generated from Village Guard Balance Lab
// ==========================================
using UnityEngine;

[CreateAssetMenu(fileName = "TowerBalanceData", menuName = "VillageGuard/BalanceData")]
public class TowerBalanceData : ScriptableObject
{
    [Header("Archer Watchtower")]
    public float archerDamage = ${towers.archer.damage}f;
    public float archerFireRate = ${towers.archer.fireRate}f;
    public int archerCost = ${towers.archer.cost};
    public float archerRange = ${towers.archer.range}f;

    [Header("Heavy Cannon")]
    public float cannonDamage = ${towers.cannon.damage}f;
    public float cannonFireRate = ${towers.cannon.fireRate}f;
    public int cannonCost = ${towers.cannon.cost};
    public float cannonRange = ${towers.cannon.range}f;

    [Header("Frost Spire")]
    public float iceDamage = ${towers.ice.damage}f;
    public float iceFireRate = ${towers.ice.fireRate}f;
    public int iceCost = ${towers.ice.cost};
    public float iceRange = ${towers.ice.range}f;

    [Header("Enemy Health Pool")]
    public float goblinHealth = ${enemies.goblin.health}f;
    public float wolfHealth = ${enemies.wolf.health}f;
    public float armoredHealth = ${enemies.armored.health}f;
    public float flyingHealth = ${enemies.flying.health}f;
    public float ogreHealth = ${enemies.ogre.health}f;
    public float bossHealth = ${enemies.boss.health}f;
}`;
  };

  const handleCopySO = () => {
    navigator.clipboard.writeText(generateScriptableObject());
    setCopiedSO(true);
    setTimeout(() => setCopiedSO(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Game Balance & DPS/TTK Laboratory</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Model Tower DPS, Gold Efficiency, Enemy Time-To-Kill, and 10-wave difficulty curves interactively.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleCopySO}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md"
          >
            {copiedSO ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSO ? 'Copied ScriptableObject!' : 'Export C# ScriptableObject'}
          </button>
        </div>
      </div>

      {/* Grid: Tower Stats vs Enemy Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tower Stat Tuner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Tower Arsenal Configuration
            </span>
            <span className="text-xs text-slate-400 font-normal">Real-Time DPS Engine</span>
          </h2>

          {/* Archer */}
          <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400">Archer Watchtower</span>
              <span className="text-slate-300">
                {archerDPS.toFixed(1)} DPS •{' '}
                <span className="text-amber-400 font-bold">{archerEfficiency} DPS/100g</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Damage: {towers.archer.damage}</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={towers.archer.damage}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      archer: { ...towers.archer, damage: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Rate: {towers.archer.fireRate}/s</label>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={towers.archer.fireRate}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      archer: { ...towers.archer, fireRate: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cost: {towers.archer.cost}g</label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={towers.archer.cost}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      archer: { ...towers.archer, cost: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Cannon */}
          <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-400">Heavy Cannon (Splash)</span>
              <span className="text-slate-300">
                {cannonDPS.toFixed(1)} DPS •{' '}
                <span className="text-amber-400 font-bold">{cannonEfficiency} DPS/100g</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Damage: {towers.cannon.damage}</label>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={towers.cannon.damage}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      cannon: { ...towers.cannon, damage: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-orange-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Rate: {towers.cannon.fireRate}/s</label>
                <input
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={towers.cannon.fireRate}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      cannon: { ...towers.cannon, fireRate: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-orange-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cost: {towers.cannon.cost}g</label>
                <input
                  type="range"
                  min="80"
                  max="250"
                  step="5"
                  value={towers.cannon.cost}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      cannon: { ...towers.cannon, cost: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-orange-400"
                />
              </div>
            </div>
          </div>

          {/* Ice Spire */}
          <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400">Frost Spire (50% Slow)</span>
              <span className="text-slate-300">
                {iceDPS.toFixed(1)} DPS •{' '}
                <span className="text-amber-400 font-bold">{iceEfficiency} DPS/100g</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Damage: {towers.ice.damage}</label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={towers.ice.damage}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      ice: { ...towers.ice, damage: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Rate: {towers.ice.fireRate}/s</label>
                <input
                  type="range"
                  min="0.4"
                  max="2.0"
                  step="0.1"
                  value={towers.ice.fireRate}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      ice: { ...towers.ice, fireRate: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cost: {towers.ice.cost}g</label>
                <input
                  type="range"
                  min="60"
                  max="200"
                  step="5"
                  value={towers.ice.cost}
                  onChange={(e) =>
                    setTowers({
                      ...towers,
                      ice: { ...towers.ice, cost: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enemy Stats & Time-To-Kill */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Enemy Durability & Path Survival Time
            </span>
            <span className="text-xs text-slate-400 font-normal">Path: ~28 meters</span>
          </h2>

          <div className="space-y-3">
            {Object.entries(enemies).map(([key, data]) => {
              const travelTime = (PATH_LENGTH / data.speed).toFixed(1);
              const ttkArcher = (data.health / (archerDPS || 1)).toFixed(1);

              return (
                <div key={key} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="capitalize text-slate-200">{key}</span>
                    <span className="text-slate-400 text-[11px]">
                      Survival: <span className="text-emerald-400 font-bold">{travelTime}s</span> on path • TTK vs 1 Archer:{' '}
                      <span className="text-amber-400 font-bold">{ttkArcher}s</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <label className="text-slate-400 block">Health: {data.health} HP</label>
                      <input
                        type="range"
                        min="50"
                        max={key === 'boss' ? 3000 : key === 'ogre' ? 1000 : 400}
                        step="10"
                        value={data.health}
                        onChange={(e) =>
                          setEnemies({
                            ...enemies,
                            [key]: { ...data, health: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block">Speed: {data.speed} m/s</label>
                      <input
                        type="range"
                        min="1.0"
                        max="5.5"
                        step="0.1"
                        value={data.speed}
                        onChange={(e) =>
                          setEnemies({
                            ...enemies,
                            [key]: { ...data, speed: Number(e.target.value) },
                          })
                        }
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Wave Progression Table (Waves 1-10 Ramp) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          10-Wave Health Pool & Gold Economy Curve
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Wave</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Total Enemy HP</th>
                <th className="py-2.5 px-3">Gold Yield</th>
                <th className="py-2.5 px-3">Min Towers Needed</th>
                <th className="py-2.5 px-3">Difficulty Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {waveEHP.map((row) => {
                const minArcherTowers = Math.ceil(row.totalHP / (archerDPS * 15));
                const difficultyRatio = (row.totalHP / (row.totalReward || 100)).toFixed(1);

                return (
                  <tr key={row.wave} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-bold text-slate-200">W{row.wave}</td>
                    <td className="py-2 px-3">{row.name}</td>
                    <td className="py-2 px-3 font-semibold text-rose-400">{row.totalHP.toLocaleString()} HP</td>
                    <td className="py-2 px-3 text-amber-300 font-semibold">+{row.totalReward}g</td>
                    <td className="py-2 px-3 text-sky-400">{minArcherTowers}x Archers</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.wave <= 3
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : row.wave <= 7
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {row.wave <= 3 ? 'Gentle' : row.wave <= 7 ? 'Challenging' : 'Deadly Siege'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
