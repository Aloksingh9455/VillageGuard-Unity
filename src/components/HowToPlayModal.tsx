/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  X,
  Target,
  Coins,
  Shield,
  Lightbulb,
  MousePointer,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-none flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">How to Play Village Guard</h2>
              <p className="text-xs text-slate-400">Official Defender&apos;s Field Manual & Strategy Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 py-4 pr-1 text-xs">
          {/* Goal & Controls Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Goal */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5" /> Mission Goal
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Stop enemies from reaching your village gate. <strong>Survive every wave to win</strong>. If your lives reach 0, you lose.
                </p>
              </div>
              <div className="mt-2 text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" /> Start with 20 Lives & 150 Coins
              </div>
            </div>

            {/* Controls */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-1">
                  <MousePointer className="w-3.5 h-3.5" /> Controls
                </div>
                <div className="space-y-1.5 text-slate-300 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] font-bold">PC</span>
                    <span>Click build spots or towers with the mouse.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] font-bold">Mobile</span>
                    <span>Tap the screen to place, inspect, upgrade or sell.</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 font-mono">
                Keyboard shortcuts: <span className="text-cyan-300">[1] [2] [3]</span> towers, <span className="text-cyan-300">[Space]</span> next wave
              </div>
            </div>
          </div>

          {/* Tower Arsenal Breakdown */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> 3 Tower Types in the Shop Bar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Archer */}
              <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sky-400">Archer</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">50 coins</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Fast and cheap, good all-rounder. Rapid arrows can shoot both ground enemies and flying wyverns.
                  </p>
                </div>
                <span className="mt-2 text-[10px] text-sky-400 font-medium">★ Best vs fast Wolves</span>
              </div>

              {/* Cannon */}
              <div className="p-3 rounded-2xl bg-orange-950/30 border border-orange-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-orange-400">Cannon</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">100 coins</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Slow, but explosive splash damage pulverizes dense enemy groups and heavy ground troops.
                  </p>
                </div>
                <span className="mt-2 text-[10px] text-orange-400 font-medium">★ Best vs Goblin packs & Ogres</span>
              </div>

              {/* Ice */}
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-400">Ice</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px]">75 coins</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Weak direct damage, but chills enemies by 50% speed so your other towers get twice as many shots.
                  </p>
                </div>
                <span className="mt-2 text-[10px] text-cyan-400 font-medium">★ Crucial support multiplier</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Gameplay Rules */}
          <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Step-by-Step Gameplay Guide
            </h3>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside leading-relaxed text-[11px]">
              <li>
                <strong>Start with coins:</strong> You begin with <strong>150 coins</strong> and <strong>20 lives</strong>. Check the top bar.
              </li>
              <li>
                <strong>Pick a tower</strong> from the shop bar at the bottom: Archer (50), Cannon (100), or Ice (75).
              </li>
              <li>
                <strong>Tap a green build spot</strong> beside the path to place the tower. Coins are deducted immediately.
              </li>
              <li>
                <strong>Wait for the wave:</strong> Enemies spawn at the gate and walk toward the village. Towers shoot automatically when enemies enter range.
              </li>
              <li>
                <strong>Earn coins</strong> for every monster killed.
              </li>
              <li>
                <strong>Tap a placed tower</strong> to open the inspection panel:
                <div className="pl-4 mt-0.5 text-slate-400 space-y-0.5">
                  <div>• <em>Upgrade:</em> More damage, range, and fire speed (max level 3).</div>
                  <div>• <em>Sell:</em> Get 60% of the cost back to reposition your defense.</div>
                  <div>• <em>Target Priority:</em> Choose First, Nearest, Strongest, or Weakest.</div>
                </div>
              </li>
              <li>
                <strong>Between waves:</strong> Spend coins on new towers or upgrades before starting the next wave.
              </li>
              <li>
                <strong>Repeat</strong> until the final wave (the Boss Titan) is defeated to save the village!
              </li>
            </ol>
          </div>

          {/* Enemy Danger Table */}
          <div className="space-y-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Enemy Threats & Danger Profile
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-1.5 px-2">Enemy</th>
                    <th className="py-1.5 px-2">Danger & Trait</th>
                    <th className="py-1.5 px-2">Counter Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-[11px]">
                  <tr>
                    <td className="py-2 px-2 font-bold text-emerald-400">Goblin</td>
                    <td className="py-2 px-2">Normal, comes in numbers</td>
                    <td className="py-2 px-2 text-slate-400">Cannons splash them down easily.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-bold text-slate-300">Wolf</td>
                    <td className="py-2 px-2">Very fast, low health</td>
                    <td className="py-2 px-2 text-slate-400">Rapid Archers with &quot;First&quot; target priority.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-bold text-amber-500">Ogre</td>
                    <td className="py-2 px-2">Slow, very high health (550 HP)</td>
                    <td className="py-2 px-2 text-slate-400">Ice Spire slow + Upgraded Cannons.</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-bold text-rose-500">Boss</td>
                    <td className="py-2 px-2">Huge health (1600 HP), last wave</td>
                    <td className="py-2 px-2 text-slate-400">Max level 3 towers & focused fire.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips to Win */}
          <div className="space-y-2 bg-gradient-to-br from-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Pro Tips to Win
            </h3>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  Place towers at <strong>corners and bends</strong> of the path, because enemies stay in range longer there.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  Put an <strong>Ice tower first</strong>, then Archers or Cannons nearby to maximize the chilled damage window.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  Use <strong>Cannons against groups</strong> (Goblins, Ogres) and <strong>Archers against fast Wolves</strong>.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  Don&apos;t spend all coins on one tower. <strong>Mix tower types</strong> to cover each other&apos;s weaknesses.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Upgrading one good tower</strong> is often better than building a weak new one.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  <strong>Save some coins</strong> before the boss wave so you can upgrade during the final siege.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg"
          >
            I&apos;m Ready to Defend!
          </button>
        </div>
      </div>
    </div>
  );
};
