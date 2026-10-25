/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Heart,
  Coins,
  ShieldAlert,
  Play,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Crosshair,
  TrendingUp,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { PlacedTower, TargetingMode, TowerType } from '../types/game';
import { TOWER_DEFINITIONS, WAVES } from '../data/gameData';
import { sounds } from '../audio/soundEffects';
import { HowToPlayModal } from './HowToPlayModal';

interface GameHUDProps {
  lives: number;
  gold: number;
  currentWave: number;
  enemiesAlive: number;
  isWaveActive: boolean;
  gameSpeed: number;
  selectedTower: PlacedTower | null;
  selectedNodeIndex: number | null;
  towerToPlace: TowerType | null;
  isGameOver: boolean;
  isVictory: boolean;
  onSelectTowerToPlace: (type: TowerType | null) => void;
  onUpgradeTower: () => void;
  onSellTower: () => void;
  onChangeTargeting: (mode: TargetingMode) => void;
  onStartNextWave: () => void;
  onSetGameSpeed: (speed: number) => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  lives,
  gold,
  currentWave,
  enemiesAlive,
  isWaveActive,
  gameSpeed,
  selectedTower,
  selectedNodeIndex,
  towerToPlace,
  isGameOver,
  isVictory,
  onSelectTowerToPlace,
  onUpgradeTower,
  onSellTower,
  onChangeTargeting,
  onStartNextWave,
  onSetGameSpeed,
  onRestart,
}) => {
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const nextWaveConfig = WAVES.find((w) => w.waveNumber === currentWave);
  const towerDef = selectedTower ? TOWER_DEFINITIONS[selectedTower.type] : null;

  const upgradeCost =
    selectedTower && towerDef
      ? Math.round(towerDef.cost * towerDef.upgradeCostMultiplier * selectedTower.level)
      : 0;

  const sellRefund =
    selectedTower && towerDef
      ? Math.round(towerDef.cost * 0.6 * selectedTower.level)
      : 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. TOP STATS BAR (Floating clean medieval bar) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-2xl text-white text-sm backdrop-blur-none z-20">
        {/* Lives */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/70">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Lives</div>
            <div className={`font-bold text-base ${lives <= 5 ? 'text-rose-400' : 'text-slate-100'}`}>
              {lives} / 20
            </div>
          </div>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/70">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
            <Coins className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Gold</div>
            <div className="font-bold text-base text-amber-300">{gold}</div>
          </div>
        </div>

        {/* Wave info */}
        <div className="flex items-center gap-2 pr-3 border-r border-slate-700/70">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Wave</div>
            <div className="font-bold text-base text-slate-100">
              {currentWave} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </div>
          </div>
        </div>

        {/* Enemies Alive */}
        <div className="flex items-center gap-2 pr-2">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Enemies</div>
            <div className="font-semibold text-sm text-emerald-400">
              {isWaveActive ? `${enemiesAlive} Active` : 'Waiting'}
            </div>
          </div>
        </div>

        {/* Speed, Sound & How to Play Quick Controls */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/70">
          <button
            onClick={() => onSetGameSpeed(gameSpeed === 1 ? 2 : 1)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
              gameSpeed === 2
                ? 'bg-amber-500/30 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle 2x Speed"
          >
            {gameSpeed === 2 ? '2x' : '1x'}
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all ml-1 shadow-sm"
            title="How to Play Guide"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How to Play</span>
          </button>
        </div>
      </div>

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      {/* 2. UNIFIED BOTTOM CONTROL DOCK (Zero Viewport Occlusion, Centered) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-auto transition-transform duration-300 ease-out z-20 ${
          hudCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
        style={{ width: 'min(940px, 94vw)' }}
      >
        {/* Collapse / Expand Tab */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="flex items-center gap-1 px-4 py-1 bg-slate-900/95 border-t border-x border-slate-700/80 rounded-t-xl text-xs font-medium text-slate-300 hover:text-white transition-colors shadow-lg"
          >
            {hudCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show Controls
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Hide Controls
              </>
            )}
          </button>
        </div>

        {/* Main Dock Container */}
        <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-none text-white">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Left Column: Tower Shop / Selection (6 cols) */}
            <div className="md:col-span-6 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {selectedTower ? 'Tower Inspection' : 'Tower Arsenal'}
                </span>
                {selectedNodeIndex !== null && !selectedTower && (
                  <span className="text-[11px] text-amber-400 font-medium">
                    Spot #{selectedNodeIndex + 1} Selected — Choose Tower
                  </span>
                )}
              </div>

              {selectedTower && towerDef ? (
                // INSPECT SELECTED TOWER
                <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-xl p-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow"
                      style={{ backgroundColor: `${towerDef.color}25`, color: towerDef.color }}
                    >
                      L{selectedTower.level}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {towerDef.name}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">
                          Tier {selectedTower.level}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                        <span>Dmg: {Math.round(towerDef.damage * (1 + (selectedTower.level - 1) * 0.45))}</span>
                        <span>Rng: {(towerDef.range * (1 + (selectedTower.level - 1) * 0.15)).toFixed(1)}</span>
                        <span>Rate: {(towerDef.fireRate * (1 + (selectedTower.level - 1) * 0.2)).toFixed(1)}/s</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTower.level < 3 ? (
                      <button
                        onClick={onUpgradeTower}
                        disabled={gold < upgradeCost}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          gold >= upgradeCost
                            ? 'bg-amber-600/30 border-amber-500/60 text-amber-300 hover:bg-amber-500/40'
                            : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        Upgrade ({upgradeCost}g)
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-[11px] font-semibold text-amber-400 bg-amber-500/20 rounded-md border border-amber-500/40">
                        Max Level
                      </span>
                    )}

                    <button
                      onClick={onSellTower}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
                      title="Refund 60% gold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      +{sellRefund}g
                    </button>
                  </div>
                </div>
              ) : (
                // 3 TOWER PURCHASE BUTTONS
                <div className="grid grid-cols-3 gap-2">
                  {(['archer', 'cannon', 'ice'] as TowerType[]).map((type) => {
                    const stats = TOWER_DEFINITIONS[type];
                    const isSelected = towerToPlace === type;
                    const canAfford = gold >= stats.cost;

                    return (
                      <button
                        key={type}
                        onClick={() => onSelectTowerToPlace(isSelected ? null : type)}
                        className={`relative flex flex-col p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-400 shadow-md ring-1 ring-blue-400'
                            : canAfford
                            ? 'bg-slate-800/80 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                            : 'bg-slate-900/60 border-slate-800/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-200 capitalize">{type}</span>
                          <span
                            className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                              canAfford ? 'text-amber-300 bg-amber-500/20' : 'text-slate-500 bg-slate-800'
                            }`}
                          >
                            {stats.cost}g
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">{stats.description}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Targeting Modes & Wave Spawner (6 cols) */}
            <div className="md:col-span-6 flex items-center justify-between gap-3 pl-0 md:pl-3 md:border-l border-slate-700/70">
              {/* Targeting Mode Selector */}
              {selectedTower ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Crosshair className="w-3 h-3 text-cyan-400" /> Target Priority
                  </span>
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    {(['first', 'nearest', 'strongest', 'weakest'] as TargetingMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => onChangeTargeting(mode)}
                        className={`px-2 py-1 text-[11px] font-medium rounded capitalize transition-all ${
                          selectedTower.targetingMode === mode
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 flex flex-col gap-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Defense Strategy
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click any glowing node on the valley path to build towers. Cannons deal splash; Ice slows hordes!
                  </span>
                </div>
              )}

              {/* Start Next Wave Button */}
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={onStartNextWave}
                  disabled={isWaveActive || isGameOver || isVictory}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all ${
                    isWaveActive
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  <Play className="w-4 h-4 fill-white" />
                  {isWaveActive ? 'Wave In Progress' : `Start Wave ${currentWave}`}
                </button>
                {nextWaveConfig && !isWaveActive && (
                  <span className="text-[10px] text-slate-400">{nextWaveConfig.name}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GAME OVER MODAL */}
      {isGameOver && (
        <div className="absolute inset-0 pointer-events-auto bg-slate-950/80 backdrop-blur-none flex items-center justify-center p-4 z-40">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-rose-400 mb-1">Village Overrun!</h2>
            <p className="text-xs text-slate-400 mb-6">
              The monsters overwhelmed your defenses at Wave {currentWave}. Refine your tower placement and try again.
            </p>
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* 4. VICTORY MODAL */}
      {isVictory && (
        <div className="absolute inset-0 pointer-events-auto bg-slate-950/80 backdrop-blur-none flex items-center justify-center p-4 z-40">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-amber-400 mb-1">Village Saved!</h2>
            <div className="text-amber-300 font-bold text-sm mb-2">★★★ 3-Star Guardian ★★★</div>
            <p className="text-xs text-slate-400 mb-6">
              You successfully held the valley against all 10 waves of invaders with {lives} lives remaining!
            </p>
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
