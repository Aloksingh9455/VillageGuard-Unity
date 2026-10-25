/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Search,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { UNITY_PROMPTS, UnityPromptEntry } from '../data/unityPromptsData';

export const UnityHub: React.FC = () => {
  const [selectedPromptId, setSelectedPromptId] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const categories = ['All', 'Foundation', 'Enemies', 'Towers', 'Architecture', 'UI & Audio', 'Production'];

  const filteredPrompts = UNITY_PROMPTS.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activePrompt: UnityPromptEntry =
    UNITY_PROMPTS.find((p) => p.id === selectedPromptId) || UNITY_PROMPTS[0];

  const handleCopyCode = () => {
    if (activePrompt.csharpCode) {
      navigator.clipboard.writeText(activePrompt.csharpCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activePrompt.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Banner & Search */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Village Guard: Unity 3D Developer Master Guide</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete 20-part C# codebase, URP setup instructions, and architecture patterns for your 3D Tower Defense.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scripts, concepts, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-slate-600 ml-auto text-xs hidden md:inline">
          {filteredPrompts.length} of {UNITY_PROMPTS.length} Modules
        </span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: List of 20 Prompts */}
        <div className="w-80 border-r border-slate-800/80 bg-slate-900/40 overflow-y-auto p-3 flex flex-col gap-1.5 shrink-0">
          {filteredPrompts.map((p) => {
            const isSelected = p.id === selectedPromptId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPromptId(p.id)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border border-indigo-500/50 text-white shadow'
                    : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {p.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs truncate">{p.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.summary}</p>
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {p.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Main Area: Prompt Details & Code */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <span>Prompt #{activePrompt.id}</span>
                <span>•</span>
                <span>{activePrompt.category}</span>
              </div>
              <h2 className="text-xl font-bold text-white">{activePrompt.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{activePrompt.summary}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPrompt ? 'Prompt Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>

          {/* Original Prompt Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              The User Prompt
            </div>
            <pre className="text-xs text-amber-200/90 whitespace-pre-wrap font-mono leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
              {activePrompt.prompt}
            </pre>
          </div>

          {/* C# Script Section (if present) */}
          {activePrompt.csharpCode && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/70 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {activePrompt.codeFilename || 'Script.cs'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Unity C#</span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied C# Script!' : 'Copy C# Script'}
                </button>
              </div>

              <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[500px]">
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
                  <code>{activePrompt.csharpCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Editor Setup Instructions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Unity Editor Setup & Hierarchy
            </h3>
            <div className="space-y-2">
              {activePrompt.editorSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-md bg-slate-800 text-cyan-400 flex items-center justify-center font-bold shrink-0 mt-0.5 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tips & Common Gotchas */}
          {activePrompt.tips.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pro Tips & Battle-Tested Advice
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {activePrompt.tips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
