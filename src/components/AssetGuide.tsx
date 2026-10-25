/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Palette,
  Volume2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Play,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../audio/soundEffects';

interface AssetSource {
  title: string;
  source: string;
  url: string;
  license: string;
  description: string;
  category: '3D Models' | 'Animations' | 'Audio' | 'UI';
}

const ASSET_SOURCES: AssetSource[] = [
  {
    title: 'Kenney Medieval Kit',
    source: 'Kenney.nl',
    url: 'https://kenney.nl/assets/medieval-kit',
    license: 'CC0 (Public Domain)',
    description: 'Over 100 modular stone walls, wooden watchtowers, village houses, banners, and gates with unified textures.',
    category: '3D Models',
  },
  {
    title: 'Kenney Nature Kit',
    source: 'Kenney.nl',
    url: 'https://kenney.nl/assets/nature-kit',
    license: 'CC0 (Public Domain)',
    description: 'Low-poly pine trees, stone boulders, hills, and dirt path tiles tailored for top-down strategy viewports.',
    category: '3D Models',
  },
  {
    title: 'Mixamo Medieval Characters',
    source: 'Mixamo (Adobe)',
    url: 'https://www.mixamo.com',
    license: 'Free Commercial with Adobe ID',
    description: 'Fully rigged humanoids (Goblin, Knight, Ogre) with instant Walk, Run, Hit React, and Death animation cycles.',
    category: 'Animations',
  },
  {
    title: 'Kenney Fantasy & RPG Audio',
    source: 'Kenney.nl',
    url: 'https://kenney.nl/assets/rpg-audio',
    license: 'CC0 (Public Domain)',
    description: 'Crisp bow release twangs, sword clangs, magic ice blasts, and coin chimes ready for Unity AudioSource.',
    category: 'Audio',
  },
  {
    title: 'Freesound.org Curated TD FX',
    source: 'Freesound.org',
    url: 'https://freesound.org',
    license: 'CC0 / CC-BY',
    description: 'Search "cannon blast", "ice crackle", and "orc grunt". Always check the license filter checkbox for CC0.',
    category: 'Audio',
  },
  {
    title: 'Kenney Fantasy UI Borders',
    source: 'Kenney.nl',
    url: 'https://kenney.nl/assets/fantasy-ui-borders',
    license: 'CC0 (Public Domain)',
    description: 'Parchment ribbons, ornate stone frames, and stylized heart / coin icons for TextMeshPro UI canvases.',
    category: 'UI',
  },
];

export const AssetGuide: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Palette className="w-5 h-5" />
          </span>
          <h1 className="text-lg font-bold text-white">Art, Audio & Licensing Directory</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Curated free assets, commercial license verification guide, and interactive Web Audio soundboard.
        </p>
      </div>

      {/* Interactive Soundboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            Procedural Audio Soundboard (Web Audio Synthesizer)
          </span>
          <span className="text-xs text-slate-400 font-normal">Click to audition in real-time</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => sounds.playArrowShoot()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-sky-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-sky-400" /> Arrow Shoot
          </button>
          <button
            onClick={() => sounds.playCannonShoot()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-orange-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-orange-400" /> Cannon Fire
          </button>
          <button
            onClick={() => sounds.playExplosion()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-rose-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-rose-400" /> Explosion
          </button>
          <button
            onClick={() => sounds.playIceFreeze()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-cyan-400" /> Ice Freeze
          </button>
          <button
            onClick={() => sounds.playCoinChime()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400" /> Coin Reward
          </button>
          <button
            onClick={() => sounds.playWaveHorn()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400" /> Wave Horn
          </button>
          <button
            onClick={() => sounds.playVictory()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-yellow-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-yellow-400" /> Victory Fanfare
          </button>
          <button
            onClick={() => sounds.playGameOver()}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-purple-300 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-purple-400" /> Game Over Sting
          </button>
        </div>
      </div>

      {/* Free Curated Assets Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Recommended Free Medieval Asset Packs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASSET_SOURCES.map((a, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {a.category}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400">{a.license}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-100">{a.title}</h3>
                <span className="text-[11px] text-slate-500 font-mono">{a.source}</span>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{a.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Commercial Ready</span>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Visit Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Licensing Audit Checklist */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Pre-Publishing Commercial License Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-900/50">
            <div className="font-bold text-emerald-400 mb-1">CC0 (Public Domain)</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Safe for any commercial release on Steam / Google Play. No attribution required, though crediting the artist is courteous.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-900/50">
            <div className="font-bold text-amber-400 mb-1">CC-BY (Attribution)</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Free for commercial use, but you MUST credit the author name, asset title, and license link in your game&apos;s Credits roll.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-rose-900/50">
            <div className="font-bold text-rose-400 mb-1">CC-NC (Non-Commercial)</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              STRICTLY FORBIDDEN in published games. Even free games with ads or donation links violate Non-Commercial terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
