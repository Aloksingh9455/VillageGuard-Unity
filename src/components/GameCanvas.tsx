/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TDGameEngine } from '../game/threeRenderer';
import { GameHUD } from './GameHUD';
import { PlacedTower, TargetingMode, TowerType } from '../types/game';
import { INITIAL_GOLD, INITIAL_LIVES, WAVES } from '../data/gameData';
import { sounds } from '../audio/soundEffects';

export const GameCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TDGameEngine | null>(null);

  // React state reflecting engine state for HUD
  const [lives, setLives] = useState<number>(INITIAL_LIVES);
  const [gold, setGold] = useState<number>(INITIAL_GOLD);
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [enemiesAlive, setEnemiesAlive] = useState<number>(0);
  const [isWaveActive, setIsWaveActive] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1.0);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);
  const [selectedTower, setSelectedTower] = useState<PlacedTower | null>(null);
  const [towerToPlace, setTowerToPlace] = useState<TowerType | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new TDGameEngine(mountRef.current, {
      onGoldChange: (newGold) => setGold(newGold),
      onLivesChange: (newLives) => setLives(newLives),
      onWaveComplete: (completedWave) => {
        setIsWaveActive(false);
        if (completedWave >= WAVES.length) {
          setIsVictory(true);
          sounds.playVictory();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } else {
          setCurrentWave(completedWave + 1);
        }
      },
      onGameOver: () => {
        setIsGameOver(true);
        setIsWaveActive(false);
      },
      onVictory: () => {
        setIsVictory(true);
        setIsWaveActive(false);
      },
      onNodeSelect: (nodeIdx) => {
        setSelectedNodeIndex(nodeIdx);
      },
      onTowerSelect: (tower) => {
        setSelectedTower(tower);
      },
    });

    engineRef.current = engine;

    // Periodic state polling for enemies count
    const interval = setInterval(() => {
      if (engineRef.current) {
        setEnemiesAlive(engineRef.current.enemies.size);
      }
    }, 150);

    return () => {
      clearInterval(interval);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleStartNextWave();
      } else if (e.code === 'Digit1') {
        handleSelectTowerToPlace('archer');
      } else if (e.code === 'Digit2') {
        handleSelectTowerToPlace('cannon');
      } else if (e.code === 'Digit3') {
        handleSelectTowerToPlace('ice');
      } else if (e.code === 'Escape') {
        engineRef.current.selectNode(null);
        engineRef.current.selectTower(null);
        setTowerToPlace(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWave, isWaveActive, isGameOver, isVictory]);

  const handleSelectTowerToPlace = (type: TowerType | null) => {
    setTowerToPlace(type);
    if (engineRef.current) {
      engineRef.current.towerToPlace = type;
      // If node is already selected, try to build immediately!
      if (type && selectedNodeIndex !== null && !selectedTower) {
        const success = engineRef.current.buildTower(selectedNodeIndex, type);
        if (success) {
          setTowerToPlace(null);
          engineRef.current.towerToPlace = null;
        }
      }
    }
  };

  const handleUpgradeTower = useCallback(() => {
    if (engineRef.current && selectedTower) {
      engineRef.current.upgradeTower(selectedTower.id);
    }
  }, [selectedTower]);

  const handleSellTower = useCallback(() => {
    if (engineRef.current && selectedTower) {
      engineRef.current.sellTower(selectedTower.id);
    }
  }, [selectedTower]);

  const handleChangeTargeting = useCallback((mode: TargetingMode) => {
    if (engineRef.current && selectedTower) {
      engineRef.current.setTowerTargeting(selectedTower.id, mode);
    }
  }, [selectedTower]);

  const handleStartNextWave = useCallback(() => {
    if (!engineRef.current || isWaveActive || isGameOver || isVictory) return;

    const waveConfig = WAVES.find((w) => w.waveNumber === currentWave);
    if (waveConfig) {
      setIsWaveActive(true);
      engineRef.current.startWave(waveConfig);
    }
  }, [currentWave, isWaveActive, isGameOver, isVictory]);

  const handleSetGameSpeed = useCallback((speed: number) => {
    setGameSpeed(speed);
    if (engineRef.current) {
      engineRef.current.gameSpeed = speed;
    }
  }, []);

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-950 overflow-hidden select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-crosshair" />

      {/* Zero-occlusion HUD Overlay */}
      <GameHUD
        lives={lives}
        gold={gold}
        currentWave={currentWave}
        enemiesAlive={enemiesAlive}
        isWaveActive={isWaveActive}
        gameSpeed={gameSpeed}
        selectedTower={selectedTower}
        selectedNodeIndex={selectedNodeIndex}
        towerToPlace={towerToPlace}
        isGameOver={isGameOver}
        isVictory={isVictory}
        onSelectTowerToPlace={handleSelectTowerToPlace}
        onUpgradeTower={handleUpgradeTower}
        onSellTower={handleSellTower}
        onChangeTargeting={handleChangeTargeting}
        onStartNextWave={handleStartNextWave}
        onSetGameSpeed={handleSetGameSpeed}
        onRestart={handleRestart}
      />
    </div>
  );
};
