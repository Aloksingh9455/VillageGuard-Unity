/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  Gamepad2,
  Code2,
  Sliders,
  Bug,
  Palette,
  Sparkles,
  Info,
  X,
  BookOpen,
} from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { UnityHub } from './components/UnityHub';
import { BalanceCalculator } from './components/BalanceCalculator';
import { UnityDebugger } from './components/UnityDebugger';
import { AssetGuide } from './components/AssetGuide';
import { HowToPlayModal } from './components/HowToPlayModal';

type AppTab = 'play' | 'unity-guide' | 'balance' | 'debugger' | 'assets';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('play');
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Header Navigation */}
      <header className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 select-none z-30">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-900/40">
            <Shield className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-2">
              Village Guard
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Unity 3D Studio
              </span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              3D Tower Defense Simulation & 20-Prompt Master Toolkit
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'play'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Game</span>
          </button>

          <button
            onClick={() => setActiveTab('unity-guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'unity-guide'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden md:inline">Unity Guide</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-indigo-500/30">
              20
            </span>
          </button>

          <button
            onClick={() => setActiveTab('balance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'balance'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden md:inline">Balance Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('debugger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'debugger'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span className="hidden md:inline">Debugger</span>
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'assets'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span className="hidden md:inline">Assets & Audio</span>
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHowToPlayModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How to Play</span>
          </button>

          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            title="About Village Guard & 20 Prompts"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Viewport */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'play' && <GameCanvas />}
        {activeTab === 'unity-guide' && <UnityHub />}
        {activeTab === 'balance' && <BalanceCalculator />}
        {activeTab === 'debugger' && <UnityDebugger />}
        {activeTab === 'assets' && <AssetGuide />}
      </main>

      {/* Overview Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-base text-white">About Village Guard Studio</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This application is an end-to-end interactive companion for building the 3D Unity Tower Defense game{' '}
              <strong>&quot;Village Guard&quot;</strong>, implementing all 20 prompts requested in your roadmap.
            </p>

            <div className="space-y-2 text-xs text-slate-300 mb-6">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-amber-300 block mb-0.5">🎮 Playable 3D Web Game:</strong>
                Real-time 3D Three.js implementation with 50° isometric camera, 3 towers (Archer, Cannon splash, Ice slow), 7 enemy types (Goblin, Wolf, Ogre, Boss, Flying, Armored, Healer), upgrade & sell systems, and audio synthesis.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-indigo-300 block mb-0.5">📜 20-Part Unity C# Toolkit:</strong>
                Complete copy-ready C# scripts, Unity URP editor steps, and Inspector wiring instructions for every single prompt.
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <strong className="text-cyan-300 block mb-0.5">⚖️ Balance Lab & Debugger:</strong>
                Simulate DPS, Time-To-Kill along path, 10-wave health curves, and troubleshoot the top Unity console errors.
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Got it, let&apos;s build & play!
            </button>
          </div>
        </div>
      )}

      {/* How to Play Manual Modal */}
      <HowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />
    </div>
  );
}
