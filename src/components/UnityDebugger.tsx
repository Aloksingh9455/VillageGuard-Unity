/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bug, CheckCircle, AlertTriangle, Copy, Check, Terminal, HelpCircle } from 'lucide-react';

interface BugCase {
  id: string;
  title: string;
  consoleError: string;
  cause: string;
  badCode: string;
  fixedCode: string;
  ruleOfThumb: string;
}

const COMMON_BUGS: BugCase[] = [
  {
    id: 'null-target',
    title: 'Projectile NullReferenceException on Target Death',
    consoleError: `NullReferenceException: Object reference not set to an instance of an object
at Projectile.Update () (at Assets/Scripts/Projectile.cs:32)`,
    cause: 'Another tower destroyed the enemy while this arrow was flying through the air. In Update(), target is now null, so target.position crashes.',
    badCode: `void Update()
{
    // CRASH: If another tower killed the enemy, target is destroyed!
    Vector3 dir = target.position - transform.position;
    transform.Translate(dir.normalized * speed * Time.deltaTime, Space.World);
}`,
    fixedCode: `void Update()
{
    // SAFE: If target was destroyed mid-flight, destroy projectile gracefully
    if (target == null)
    {
        Destroy(gameObject);
        return;
    }

    Vector3 dir = target.position - transform.position;
    transform.Translate(dir.normalized * speed * Time.deltaTime, Space.World);
}`,
    ruleOfThumb: 'Always check if (target == null) at the top of any homing projectile script before accessing its position.'
  },
  {
    id: 'touch-through-ui',
    title: 'Clicking Shop Buttons Builds Towers Underneath',
    consoleError: `Tower built at (4.5, 0.0, -2.0) while clicking UI shop icon!
Coins deducted unintentionally.`,
    cause: 'In Unity, 3D physics raycasts and OnMouseDown() fire even when tapping on top of UI buttons unless guarded with EventSystem.',
    badCode: `void OnMouseDown()
{
    // BUG: Fires when clicking UI buttons if they overlap this node!
    BuildManager.instance.BuildTowerOn(this);
}`,
    fixedCode: `using UnityEngine.EventSystems;

void OnMouseDown()
{
    // FIXED: Ignore click if user is tapping a UI button or canvas panel
    if (EventSystem.current.IsPointerOverGameObject())
    {
        return;
    }

    BuildManager.instance.BuildTowerOn(this);
}`,
    ruleOfThumb: 'For mobile touch, check `EventSystem.current.IsPointerOverGameObject(Input.GetTouch(0).fingerId)`.'
  },
  {
    id: 'waypoint-freeze',
    title: 'Enemies Freeze / Stop Moving at Waypoint Turn',
    consoleError: `Enemy stuck at Waypoint (2). No console errors, but enemy has stopped walking.`,
    cause: 'Floating-point math means an enemy almost never lands on the exact coordinate (e.g. 5.000001f != 5.000000f). Direct equality check fails forever.',
    badCode: `void Update()
{
    // BUG: Coordinates will almost never be mathematically identical!
    if (transform.position == target.position)
    {
        GetNextWaypoint();
    }
}`,
    fixedCode: `void Update()
{
    // FIXED: Use distance threshold (e.g. <= 0.2f)
    if (Vector3.Distance(transform.position, target.position) <= 0.2f)
    {
        GetNextWaypoint();
    }
}`,
    ruleOfThumb: 'Never use == to compare positions in 3D games; always compare Vector3.Distance() to a small tolerance threshold.'
  },
  {
    id: 'wave-early-end',
    title: 'Wave Ends or Wins While Enemies Are Still Spawning',
    consoleError: `Wave 3 triggered win condition while only 2 of 8 enemies spawned!`,
    cause: 'WaveSpawner only checked `if (EnemiesAlive == 0)`. While waiting for the 1.5s interval between spawns, EnemiesAlive was temporarily 0, so it advanced early.',
    badCode: `void Update()
{
    // BUG: If first enemy dies before second enemy spawns, wave ends!
    if (EnemiesAlive <= 0)
    {
        StartNextWave();
    }
}`,
    fixedCode: `private bool isSpawning = false;

void Update()
{
    // FIXED: Must verify enemies are not currently spawning in coroutine
    if (EnemiesAlive > 0 || isSpawning)
    {
        return;
    }

    StartNextWave();
}`,
    ruleOfThumb: 'Always set `isSpawning = true` before the spawn loop and `false` after the coroutine finishes all instances.'
  },
  {
    id: 'timescale-speed',
    title: '2x Fast Forward Causes Super Speed or Physics Tunneling',
    consoleError: `Projectiles fly completely through enemies without hitting them on 2x speed!`,
    cause: 'Movement wasn\'t multiplied by Time.deltaTime, or projectile step was larger than the enemy collider thickness without continuous collision detection.',
    badCode: `void Update()
{
    // BUG: Moves by raw speed without delta time scaling
    transform.position += transform.forward * speed;
}`,
    fixedCode: `void Update()
{
    // FIXED: Correctly scaled by Time.deltaTime
    float moveStep = speed * Time.deltaTime;
    transform.Translate(Vector3.forward * moveStep);
}`,
    ruleOfThumb: 'Always multiply frame-based movement by Time.deltaTime so speed cleanly scales with Time.timeScale (1x, 2x, 0.5x).'
  }
];

export const UnityDebugger: React.FC = () => {
  const [selectedBugId, setSelectedBugId] = useState<string>(COMMON_BUGS[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const activeBug = COMMON_BUGS.find((b) => b.id === selectedBugId) || COMMON_BUGS[0];

  const handleCopyFix = () => {
    navigator.clipboard.writeText(activeBug.fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Bug className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Unity Tower Defense Debugger & Error Clinic</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant diagnoses and tested C# fixes for the top 5 most frequent Unity TD bugs (Prompt 18).
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Bug Selector */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/40 p-3 space-y-2 overflow-y-auto shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Common Console Gotchas</span>
          {COMMON_BUGS.map((b) => {
            const isSelected = b.id === selectedBugId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBugId(b.id)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-rose-500/20 border border-rose-500/50 text-white shadow'
                    : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span className="font-bold text-xs line-clamp-1">{b.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{b.cause}</p>
              </button>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-rose-400 text-xs font-bold uppercase tracking-wider">Troubleshooting Case</span>
              <h2 className="text-lg font-bold text-white mt-0.5">{activeBug.title}</h2>
            </div>
            <button
              onClick={handleCopyFix}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Fixed Code!' : 'Copy Fix'}
            </button>
          </div>

          {/* Console Error Simulated Box */}
          <div className="bg-slate-900/90 border border-rose-950 rounded-xl p-3.5 font-mono text-xs text-rose-300 flex items-start gap-2.5">
            <Terminal className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <pre className="whitespace-pre-wrap">{activeBug.consoleError}</pre>
          </div>

          {/* Explanation in Simple Words */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              The Cause in Simple Words
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{activeBug.cause}</p>
          </div>

          {/* Code Comparison (Bad vs Good) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bad code */}
            <div className="bg-slate-900/80 border border-rose-900/50 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-rose-950/40 border-b border-rose-900/50 text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Problematic Code (Breaks)
              </div>
              <pre className="p-3 text-xs font-mono text-rose-200 overflow-x-auto leading-relaxed bg-slate-950/80">
                <code>{activeBug.badCode}</code>
              </pre>
            </div>

            {/* Fixed code */}
            <div className="bg-slate-900/80 border border-emerald-900/50 rounded-xl overflow-hidden">
              <div className="px-3 py-2 bg-emerald-950/40 border-b border-emerald-900/50 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Tested Solution (Safe)
              </div>
              <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed bg-slate-950/80">
                <code>{activeBug.fixedCode}</code>
              </pre>
            </div>
          </div>

          {/* Golden Rule */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider shrink-0 text-[10px] px-2 py-0.5 rounded bg-amber-500/20">
              Golden Rule
            </span>
            <span>{activeBug.ruleOfThumb}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
