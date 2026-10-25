/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  EnemyInstance,
  PlacedTower,
  Projectile,
  TowerType,
  TargetingMode,
  ParticleEffect,
} from '../types/game';
import {
  BUILD_NODES,
  ENEMY_DEFINITIONS,
  TOWER_DEFINITIONS,
  WAYPOINTS,
  INITIAL_GOLD,
  INITIAL_LIVES,
} from '../data/gameData';
import {
  createBuildNodeMesh,
  createEnemyModel,
  createPineTree,
  createRock,
  createSpawnGate,
  createTowerModel,
  createVillageGate,
  EnemyMeshModel,
  TowerModel,
} from './threeModels';
import { sounds } from '../audio/soundEffects';

export interface GameEngineCallbacks {
  onGoldChange: (gold: number) => void;
  onLivesChange: (lives: number) => void;
  onWaveComplete: (wave: number) => void;
  onGameOver: () => void;
  onVictory: () => void;
  onNodeSelect: (nodeIndex: number | null) => void;
  onTowerSelect: (tower: PlacedTower | null) => void;
}

export class TDGameEngine {
  private container: HTMLDivElement;
  private callbacks: GameEngineCallbacks;

  // Three.js core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private clock: THREE.Clock;
  private frameId: number = 0;
  private isSoftwareGl: boolean = false;

  // Scene objects
  private nodeMeshes: { group: THREE.Group; rune: THREE.Mesh; index: number }[] = [];
  private towerModels: Map<string, TowerModel> = new Map();
  private enemyModels: Map<string, EnemyMeshModel> = new Map();
  private projectileMeshes: Map<string, THREE.Group> = new Map();
  private particles: ParticleEffect[] = [];
  private particleGroup: THREE.Group;
  private rangeIndicator: THREE.Mesh;

  // Game state
  public lives: number = INITIAL_LIVES;
  public gold: number = INITIAL_GOLD;
  public currentWave: number = 1;
  public gameSpeed: number = 1.0;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;

  public placedTowers: Map<string, PlacedTower> = new Map();
  public enemies: Map<string, EnemyInstance> = new Map();
  public projectiles: Projectile[] = [];

  // Wave spawning state
  private waveQueue: { type: any; count: number; interval: number }[] = [];
  private currentSpawnBatch: { type: any; count: number; interval: number } | null = null;
  private spawnTimer: number = 0;
  private isWaveActive: boolean = false;
  private waveClearedReported: boolean = false;

  // Selection
  public selectedNodeIndex: number | null = null;
  public selectedTower: PlacedTower | null = null;
  public towerToPlace: TowerType | null = null;

  constructor(container: HTMLDivElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Light medieval blue sky
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.022);

    // 2. Camera (50-degree top-down perspective view matching prompt requirements)
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.5, 120);
    this.camera.position.set(0, 19, 16);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Lighting
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 3-point medieval studio light rig
    const keyLight = new THREE.DirectionalLight(0xfff3d1, 2.2); // Warm sunlight
    keyLight.position.set(16, 26, 12);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d6b38, 1.2);
    this.scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    rimLight.position.set(-12, 10, -12);
    this.scene.add(rimLight);

    // Particle Group
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    // Range Indicator Circle (Projected on ground)
    const rangeGeo = new THREE.RingGeometry(0.1, 1.0, 48);
    rangeGeo.rotateX(-Math.PI / 2);
    const rangeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    this.rangeIndicator = new THREE.Mesh(rangeGeo, rangeMat);
    this.rangeIndicator.position.y = 0.25;
    this.rangeIndicator.visible = false;
    this.scene.add(this.rangeIndicator);

    // Input & Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.clock = new THREE.Clock();

    // Build the 3D Medieval World
    this.buildWorld();

    // Attach listeners
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Start render loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  // -------------------------------------------------------------
  // WORLD BUILDING: Valleys, Cobblestone Path, Castles, Trees
  // -------------------------------------------------------------
  private buildWorld() {
    // 1. Lush Green Valley Ground
    const groundGeo = new THREE.PlaneGeometry(42, 36, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);

    // Add subtle procedural undulations to the terrain
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const distFromCenter = Math.hypot(vx, vz);
      // Gentle slope rising towards edges
      const edgeRise = Math.max(0, (distFromCenter - 11) * 0.15);
      const roll = Math.sin(vx * 0.3) * Math.cos(vz * 0.3) * 0.2;
      pos.setY(i, edgeRise + roll);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3f6212, // Rich medieval field green
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Dirt & Cobblestone Winding Road
    const pathCurve = new THREE.CatmullRomCurve3(
      WAYPOINTS.map(([x, z]) => new THREE.Vector3(x, 0.04, z))
    );
    const roadPoints = pathCurve.getPoints(90);

    // Create ribbon strip for road
    const roadGeo = new THREE.BufferGeometry();
    const roadVerts: number[] = [];
    const roadNorms: number[] = [];
    const roadIndices: number[] = [];
    const roadWidth = 1.35;

    for (let i = 0; i < roadPoints.length; i++) {
      const p = roadPoints[i];
      let tangent = new THREE.Vector3(1, 0, 0);
      if (i < roadPoints.length - 1) {
        tangent.subVectors(roadPoints[i + 1], p).normalize();
      } else if (i > 0) {
        tangent.subVectors(p, roadPoints[i - 1]).normalize();
      }
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const left = p.clone().addScaledVector(normal, roadWidth * 0.5);
      const right = p.clone().addScaledVector(normal, -roadWidth * 0.5);

      roadVerts.push(left.x, left.y, left.z);
      roadVerts.push(right.x, right.y, right.z);

      roadNorms.push(0, 1, 0, 0, 1, 0);

      if (i < roadPoints.length - 1) {
        const baseIdx = i * 2;
        roadIndices.push(baseIdx, baseIdx + 1, baseIdx + 2);
        roadIndices.push(baseIdx + 1, baseIdx + 3, baseIdx + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(roadVerts, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(roadNorms, 3));
    roadGeo.setIndex(roadIndices);

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x926c48, // Earthy cobblestone dirt
      roughness: 0.9,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.receiveShadow = true;
    this.scene.add(road);

    // 3. Castle Gate at Destination (Village Keep)
    const villageGate = createVillageGate();
    const endPoint = WAYPOINTS[WAYPOINTS.length - 1];
    villageGate.position.set(endPoint[0] + 0.8, 0, endPoint[1]);
    villageGate.rotation.y = -Math.PI / 2;
    this.scene.add(villageGate);

    // 4. Enemy Spawner Gate at Origin
    const spawnGate = createSpawnGate();
    const startPoint = WAYPOINTS[0];
    spawnGate.position.set(startPoint[0] - 0.5, 0, startPoint[1]);
    spawnGate.rotation.y = Math.PI / 2;
    this.scene.add(spawnGate);

    // 5. Build Spot Nodes
    BUILD_NODES.forEach((node) => {
      const { group, rune } = createBuildNodeMesh();
      group.position.set(node.x, 0, node.z);
      group.userData = { nodeIndex: node.index };
      this.scene.add(group);
      this.nodeMeshes.push({ group, rune, index: node.index });
    });

    // 6. Perimeter Pine Trees & Rocks (Outdoor barrier aesthetic)
    const treeCoords = [
      [-16, -12], [-14, -14], [-10, -13], [-6, -13], [0, -12], [8, -13], [14, -13],
      [-16, 12], [-12, 13], [-5, 12], [2, 13], [7, 12], [14, 12], [16, 10],
      [-15, 3], [-15, -4], [15, 0], [15, -6], [-2, -8], [4, -9], [12, -7],
      [-11, 8], [-4, -2], [5, 6], [12, 3],
    ];

    treeCoords.forEach(([tx, tz], i) => {
      const scale = 0.85 + (i % 5) * 0.15;
      const tree = createPineTree(scale);
      tree.position.set(tx, 0, tz);
      this.scene.add(tree);
    });

    const rockCoords = [
      [-12, -7], [-3, -6], [3, -7], [9, -4], [-8, 4], [0, 4], [8, 4], [13, 9],
      [-14, 8], [11, -9],
    ];
    rockCoords.forEach(([rx, rz], i) => {
      const rock = createRock(0.8 + (i % 3) * 0.3);
      rock.position.set(rx, 0, rz);
      this.scene.add(rock);
    });
  }

  // -------------------------------------------------------------
  // TOWER MANAGEMENT: Build, Upgrade, Sell, Targeting
  // -------------------------------------------------------------
  public buildTower(nodeIndex: number, type: TowerType): boolean {
    const node = BUILD_NODES.find((n) => n.index === nodeIndex);
    if (!node || node.towerId) return false;

    const stats = TOWER_DEFINITIONS[type];
    if (this.gold < stats.cost) return false;

    // Deduct gold
    this.gold -= stats.cost;
    this.callbacks.onGoldChange(this.gold);

    const towerId = `tower_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    node.towerId = towerId;

    const placedTower: PlacedTower = {
      id: towerId,
      nodeIndex,
      type,
      level: 1,
      x: node.x,
      z: node.z,
      targetingMode: 'first',
      lastShotTime: 0,
      totalDamageDealt: 0,
      kills: 0,
      rotation: 0,
    };
    this.placedTowers.set(towerId, placedTower);

    // Create 3D Tower Model
    const model = createTowerModel(type, 1);
    model.root.position.set(node.x, 0, node.z);
    this.scene.add(model.root);
    this.towerModels.set(towerId, model);

    // Audio SFX
    sounds.playBuild();

    // Spawn dust particle
    this.spawnParticle('arrow_hit', node.x, 0.4, node.z, '#e2e8f0');

    // Select the new tower
    this.selectTower(placedTower);
    return true;
  }

  public upgradeTower(towerId: string): boolean {
    const tower = this.placedTowers.get(towerId);
    if (!tower || tower.level >= 3) return false;

    const baseStats = TOWER_DEFINITIONS[tower.type];
    const upgradeCost = Math.round(baseStats.cost * baseStats.upgradeCostMultiplier * tower.level);
    if (this.gold < upgradeCost) return false;

    this.gold -= upgradeCost;
    this.callbacks.onGoldChange(this.gold);

    tower.level++;

    // Rebuild 3D model with level upgrade decorations
    const oldModel = this.towerModels.get(towerId);
    if (oldModel) {
      this.scene.remove(oldModel.root);
    }
    const newModel = createTowerModel(tower.type, tower.level);
    newModel.root.position.set(tower.x, 0, tower.z);
    this.scene.add(newModel.root);
    this.towerModels.set(towerId, newModel);

    sounds.playUpgrade();
    this.spawnParticle('explosion', tower.x, 1.2, tower.z, '#fbbf24');
    this.updateRangeIndicator();
    this.callbacks.onTowerSelect({ ...tower });
    return true;
  }

  public sellTower(towerId: string): boolean {
    const tower = this.placedTowers.get(towerId);
    if (!tower) return false;

    const baseStats = TOWER_DEFINITIONS[tower.type];
    const refund = Math.round(baseStats.cost * 0.6 * tower.level);
    this.gold += refund;
    this.callbacks.onGoldChange(this.gold);

    // Free node
    const node = BUILD_NODES.find((n) => n.index === tower.nodeIndex);
    if (node) node.towerId = null;

    // Remove 3D Model
    const model = this.towerModels.get(towerId);
    if (model) {
      this.scene.remove(model.root);
      this.towerModels.delete(towerId);
    }

    this.placedTowers.delete(towerId);
    sounds.playCoinChime();

    this.selectTower(null);
    return true;
  }

  public setTowerTargeting(towerId: string, mode: TargetingMode) {
    const tower = this.placedTowers.get(towerId);
    if (tower) {
      tower.targetingMode = mode;
      this.callbacks.onTowerSelect({ ...tower });
    }
  }

  // -------------------------------------------------------------
  // WAVE DISPATCH & SPAWNER
  // -------------------------------------------------------------
  public startWave(waveConfig: { waveNumber: number; enemies: { type: any; count: number; interval: number }[]; rewardBonus: number }) {
    if (this.isWaveActive) return;

    this.currentWave = waveConfig.waveNumber;
    this.waveQueue = [...waveConfig.enemies];
    this.currentSpawnBatch = null;
    this.spawnTimer = 0;
    this.isWaveActive = true;
    this.waveClearedReported = false;

    sounds.playWaveHorn();
  }

  public spawnSingleEnemy(type: any) {
    const stats = ENEMY_DEFINITIONS[type];
    const id = `enemy_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startPt = WAYPOINTS[0];

    const isFlying = stats.isFlying;
    const enemy: EnemyInstance = {
      id,
      type,
      health: stats.maxHealth,
      maxHealth: stats.maxHealth,
      speed: stats.speed,
      currentWaypointIndex: 0,
      x: startPt[0],
      y: isFlying ? 3.6 : 0,
      z: startPt[1],
      rotation: 0,
      slowTimer: 0,
      slowFactor: 0,
      isDead: false,
      hasReachedVillage: false,
      distanceTraveled: 0,
      spawnTime: this.clock.getElapsedTime(),
    };

    this.enemies.set(id, enemy);

    // 3D Model
    const model = createEnemyModel(type);
    model.root.position.set(enemy.x, enemy.y, enemy.z);
    this.scene.add(model.root);
    this.enemyModels.set(id, model);
  }

  // -------------------------------------------------------------
  // COMBAT SIMULATION & TICK
  // -------------------------------------------------------------
  private updateGame(delta: number) {
    if (this.isPaused || this.isGameOver || this.isVictory) return;

    const gameDelta = delta * this.gameSpeed;
    const now = this.clock.getElapsedTime();

    // 1. Wave Spawning
    if (this.isWaveActive) {
      if (!this.currentSpawnBatch && this.waveQueue.length > 0) {
        this.currentSpawnBatch = { ...this.waveQueue.shift()! };
        this.spawnTimer = 0;
      }

      if (this.currentSpawnBatch) {
        this.spawnTimer -= gameDelta;
        if (this.spawnTimer <= 0) {
          this.spawnSingleEnemy(this.currentSpawnBatch.type);
          this.currentSpawnBatch.count--;
          this.spawnTimer = this.currentSpawnBatch.interval;

          if (this.currentSpawnBatch.count <= 0) {
            this.currentSpawnBatch = null;
          }
        }
      } else if (this.waveQueue.length === 0 && this.enemies.size === 0) {
        // Wave completely cleared!
        this.isWaveActive = false;
        if (!this.waveClearedReported) {
          this.waveClearedReported = true;
          this.gold += 40 + this.currentWave * 15;
          this.callbacks.onGoldChange(this.gold);
          sounds.playCoinChime();
          this.callbacks.onWaveComplete(this.currentWave);
        }
      }
    }

    // 2. Enemy Movement & Logic
    const enemiesToRemove: string[] = [];
    const villageGatePoint = WAYPOINTS[WAYPOINTS.length - 1];

    this.enemies.forEach((enemy) => {
      // Handle slow timer
      if (enemy.slowTimer > 0) {
        enemy.slowTimer -= gameDelta;
        if (enemy.slowTimer <= 0) {
          enemy.slowFactor = 0;
        }
      }

      // Calculate effective speed
      const effectiveSpeed = enemy.speed * (1 - enemy.slowFactor);

      // Shaman pulse heal
      if (enemy.type === 'healer') {
        if (!enemy.lastHealTime || now - enemy.lastHealTime >= 2.0) {
          enemy.lastHealTime = now;
          this.pulseHealAllies(enemy);
        }
      }

      if (enemy.type === 'flying') {
        // Flies straight to the destination
        const dest = new THREE.Vector3(villageGatePoint[0], 3.6, villageGatePoint[1]);
        const cur = new THREE.Vector3(enemy.x, 3.6, enemy.z);
        const dir = dest.clone().sub(cur);
        const dist = dir.length();
        const moveDist = effectiveSpeed * gameDelta;

        if (dist <= moveDist || dist <= 0.4) {
          // Reached village
          this.damagePlayer(2);
          enemiesToRemove.push(enemy.id);
        } else {
          dir.normalize();
          enemy.x += dir.x * moveDist;
          enemy.z += dir.z * moveDist;
          enemy.rotation = Math.atan2(dir.x, dir.z);
          enemy.distanceTraveled += moveDist;
        }
      } else {
        // Standard path follower along waypoints
        const targetWp = WAYPOINTS[enemy.currentWaypointIndex + 1];
        if (!targetWp) {
          // Reached the end!
          const dmg = enemy.type === 'boss' ? 10 : (enemy.type === 'ogre' ? 4 : 1);
          this.damagePlayer(dmg);
          enemiesToRemove.push(enemy.id);
        } else {
          const cur = new THREE.Vector2(enemy.x, enemy.z);
          const tgt = new THREE.Vector2(targetWp[0], targetWp[1]);
          const dir = tgt.clone().sub(cur);
          const dist = dir.length();
          const moveDist = effectiveSpeed * gameDelta;

          if (dist <= 0.2 || dist <= moveDist) {
            enemy.currentWaypointIndex++;
            enemy.x = targetWp[0];
            enemy.z = targetWp[1];
          } else {
            dir.normalize();
            enemy.x += dir.x * moveDist;
            enemy.z += dir.y * moveDist;
            enemy.rotation = Math.atan2(dir.x, dir.y);
            enemy.distanceTraveled += moveDist;
          }
        }
      }

      // Sync 3D mesh
      const model = this.enemyModels.get(enemy.id);
      if (model) {
        model.root.position.set(enemy.x, enemy.y, enemy.z);
        model.root.rotation.y = enemy.rotation;
        if (model.animator) {
          model.animator(now * effectiveSpeed, enemy.slowFactor > 0);
        }
      }
    });

    enemiesToRemove.forEach((id) => this.removeEnemy(id));

    // 3. Tower Targeting & Shooting
    this.placedTowers.forEach((tower) => {
      const stats = TOWER_DEFINITIONS[tower.type];
      const model = this.towerModels.get(tower.id);
      if (!model) return;

      if (model.update) {
        model.update(gameDelta);
      }

      const effectiveRange = stats.range * (1 + (tower.level - 1) * 0.15);
      const effectiveRate = stats.fireRate * (1 + (tower.level - 1) * 0.2);

      // Find best target based on targeting mode
      const target = this.findBestTarget(tower, effectiveRange, stats.canTargetFlying);

      if (target) {
        // Aim turret head towards target
        const dx = target.x - tower.x;
        const dz = target.z - tower.z;
        const targetAngle = Math.atan2(dx, dz);
        tower.rotation = targetAngle;
        model.turretHead.rotation.y = targetAngle;

        // Ready to fire?
        if (now - tower.lastShotTime >= 1.0 / effectiveRate) {
          tower.lastShotTime = now;
          this.fireTower(tower, target, stats, model.firePoint);
        }
      }
    });

    // 4. Projectile Movement & Collision
    const projToRemove: Projectile[] = [];

    this.projectiles.forEach((proj) => {
      const targetEnemy = this.enemies.get(proj.targetEnemyId);

      // If target still alive, home in towards target position; otherwise target last known pos
      if (targetEnemy) {
        proj.targetPosition = [targetEnemy.x, targetEnemy.y + 0.5, targetEnemy.z];
      }

      const cur = new THREE.Vector3(proj.currentX, proj.currentY, proj.currentZ);
      const tgt = new THREE.Vector3(...proj.targetPosition);
      const dir = tgt.clone().sub(cur);
      const dist = dir.length();
      const step = proj.speed * gameDelta;

      if (dist <= step || dist <= 0.3) {
        // Hit target!
        this.handleProjectileImpact(proj);
        projToRemove.push(proj);
      } else {
        dir.normalize();
        proj.currentX += dir.x * step;
        proj.currentY += dir.y * step;
        proj.currentZ += dir.z * step;

        const pMesh = this.projectileMeshes.get(proj.id);
        if (pMesh) {
          pMesh.position.set(proj.currentX, proj.currentY, proj.currentZ);
          pMesh.lookAt(tgt);
        }
      }
    });

    projToRemove.forEach((p) => this.removeProjectile(p.id));

    // 5. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.lifetime += gameDelta;
      if (p.lifetime >= p.maxLifetime) {
        this.particles.splice(i, 1);
      }
    }
    this.renderParticles();
  }

  // -------------------------------------------------------------
  // COMBAT LOGIC HELPERS
  // -------------------------------------------------------------
  private findBestTarget(tower: PlacedTower, range: number, canTargetAir: boolean): EnemyInstance | null {
    let bestEnemy: EnemyInstance | null = null;
    let bestMetric = 0;

    this.enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      if (enemy.type === 'flying' && !canTargetAir) return;

      const dist = Math.hypot(enemy.x - tower.x, enemy.z - tower.z);
      if (dist > range) return;

      switch (tower.targetingMode) {
        case 'nearest':
          if (!bestEnemy || dist < bestMetric) {
            bestMetric = dist;
            bestEnemy = enemy;
          }
          break;
        case 'first':
          if (enemy.distanceTraveled > bestMetric) {
            bestMetric = enemy.distanceTraveled;
            bestEnemy = enemy;
          }
          break;
        case 'strongest':
          if (enemy.health > bestMetric) {
            bestMetric = enemy.health;
            bestEnemy = enemy;
          }
          break;
        case 'weakest':
          if (!bestEnemy || enemy.health < bestMetric) {
            bestMetric = enemy.health;
            bestEnemy = enemy;
          }
          break;
      }
    });

    return bestEnemy;
  }

  private fireTower(tower: PlacedTower, target: EnemyInstance, stats: any, firePointLocal: THREE.Vector3) {
    const projId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const damageMult = 1 + (tower.level - 1) * 0.45;
    const finalDamage = stats.damage * damageMult;

    // Compute fire point in world space
    const worldFirePos = new THREE.Vector3(tower.x, 0, tower.z)
      .add(firePointLocal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), tower.rotation));

    const proj: Projectile = {
      id: projId,
      type: tower.type,
      startX: worldFirePos.x,
      startY: worldFirePos.y,
      startZ: worldFirePos.z,
      currentX: worldFirePos.x,
      currentY: worldFirePos.y,
      currentZ: worldFirePos.z,
      targetEnemyId: target.id,
      targetPosition: [target.x, target.y + 0.5, target.z],
      damage: finalDamage,
      speed: tower.type === 'archer' ? 22 : (tower.type === 'cannon' ? 14 : 18),
      splashRadius: stats.splashRadius * (1 + (tower.level - 1) * 0.2),
      slowFactor: stats.slowFactor,
      slowDuration: stats.slowDuration,
      progress: 0,
    };
    this.projectiles.push(proj);

    // Create 3D Projectile Mesh
    const pGroup = new THREE.Group();
    if (tower.type === 'archer') {
      // Wood shaft + steel tip arrow
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      shaft.rotation.x = Math.PI / 2;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.2, 5),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      tip.rotation.x = Math.PI / 2;
      tip.position.z = 0.4;
      pGroup.add(shaft, tip);
      sounds.playArrowShoot();

    } else if (tower.type === 'cannon') {
      // Heavy iron cannonball
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.3 })
      );
      pGroup.add(ball);
      sounds.playCannonShoot();

    } else {
      // Glowing Frost Crystal
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.2),
        new THREE.MeshStandardMaterial({
          color: 0x67e8f9,
          emissive: 0x06b6d4,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.9,
        })
      );
      pGroup.add(crystal);
      sounds.playIceFreeze();
    }

    pGroup.position.set(proj.currentX, proj.currentY, proj.currentZ);
    this.scene.add(pGroup);
    this.projectileMeshes.set(projId, pGroup);
  }

  private handleProjectileImpact(proj: Projectile) {
    if (proj.type === 'cannon' && proj.splashRadius > 0) {
      // Area splash damage
      sounds.playExplosion();
      this.spawnParticle('explosion', proj.currentX, proj.currentY, proj.currentZ, '#f97316');

      this.enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        const dist = Math.hypot(enemy.x - proj.currentX, enemy.z - proj.currentZ);
        if (dist <= proj.splashRadius) {
          const falloff = 1 - (dist / proj.splashRadius) * 0.4; // 100% to 60% damage
          this.damageEnemy(enemy, proj.damage * falloff, true);
        }
      });
    } else {
      // Single target or ice
      const enemy = this.enemies.get(proj.targetEnemyId);
      if (enemy && !enemy.isDead) {
        if (proj.type === 'ice') {
          sounds.playIceFreeze();
          this.spawnParticle('ice_burst', enemy.x, enemy.y + 0.5, enemy.z, '#06b6d4');
          enemy.slowFactor = proj.slowFactor;
          enemy.slowTimer = proj.slowDuration;
          this.damageEnemy(enemy, proj.damage, false);
        } else {
          // Archer
          this.spawnParticle('arrow_hit', enemy.x, enemy.y + 0.5, enemy.z, '#38bdf8');
          this.damageEnemy(enemy, proj.damage, false);
        }
      }
    }
  }

  private damageEnemy(enemy: EnemyInstance, rawDamage: number, isPhysical: boolean) {
    const stats = ENEMY_DEFINITIONS[enemy.type];
    let damage = rawDamage;

    // Armored enemies absorb 50% physical/cannon damage
    if (isPhysical && stats.armorFactor > 0) {
      damage *= (1 - stats.armorFactor);
    }

    enemy.health -= damage;

    if (enemy.health <= 0 && !enemy.isDead) {
      enemy.isDead = true;
      this.gold += stats.coinReward;
      this.callbacks.onGoldChange(this.gold);
      sounds.playCoinChime();
      this.spawnParticle('coin_pickup', enemy.x, enemy.y + 1.2, enemy.z, '#fbbf24');
      this.removeEnemy(enemy.id);
    }
  }

  private pulseHealAllies(healer: EnemyInstance) {
    this.spawnParticle('heal_aura', healer.x, healer.y + 0.4, healer.z, '#10b981');
    const healRadius = 4.5;
    const healAmount = 28;

    this.enemies.forEach((ally) => {
      if (ally.id === healer.id || ally.isDead) return;
      const dist = Math.hypot(ally.x - healer.x, ally.z - healer.z);
      if (dist <= healRadius) {
        ally.health = Math.min(ally.maxHealth, ally.health + healAmount);
        this.spawnParticle('heal_aura', ally.x, ally.y + 0.6, ally.z, '#34d399');
      }
    });
  }

  private damagePlayer(amount: number) {
    this.lives = Math.max(0, this.lives - amount);
    this.callbacks.onLivesChange(this.lives);
    sounds.playLifeLost();

    if (this.lives <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      sounds.playGameOver();
      this.callbacks.onGameOver();
    }
  }

  private removeEnemy(id: string) {
    this.enemies.delete(id);
    const model = this.enemyModels.get(id);
    if (model) {
      this.scene.remove(model.root);
      this.enemyModels.delete(id);
    }
  }

  private removeProjectile(id: string) {
    const mesh = this.projectileMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.projectileMeshes.delete(id);
    }
    const idx = this.projectiles.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.projectiles.splice(idx, 1);
    }
  }

  // -------------------------------------------------------------
  // PARTICLES (Web Audio / Three.js Canvas Visualizer)
  // -------------------------------------------------------------
  public spawnParticle(type: ParticleEffect['type'], x: number, y: number, z: number, color: string) {
    const p: ParticleEffect = {
      id: `p_${Date.now()}_${Math.random()}`,
      type,
      x,
      y,
      z,
      color,
      lifetime: 0,
      maxLifetime: type === 'explosion' ? 0.45 : 0.35,
      scale: type === 'explosion' ? 1.6 : 0.8,
    };
    this.particles.push(p);
  }

  private renderParticles() {
    // Clear previous frame particles
    while (this.particleGroup.children.length > 0) {
      const child = this.particleGroup.children[0] as THREE.Mesh;
      this.particleGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }

    this.particles.forEach((p) => {
      const progress = p.lifetime / p.maxLifetime;
      const currentScale = p.scale * (1 + progress * 0.8);
      const opacity = 1 - progress;

      if (p.type === 'explosion') {
        const geo = new THREE.SphereGeometry(currentScale * 0.6, 6, 6);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.color),
          transparent: true,
          opacity: opacity * 0.7,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p.x, p.y + progress * 0.5, p.z);
        this.particleGroup.add(mesh);

      } else if (p.type === 'ice_burst') {
        const geo = new THREE.OctahedronGeometry(currentScale * 0.4);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.color),
          transparent: true,
          opacity: opacity * 0.8,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p.x, p.y, p.z);
        mesh.rotation.y = progress * 4;
        this.particleGroup.add(mesh);

      } else if (p.type === 'heal_aura') {
        const geo = new THREE.RingGeometry(currentScale * 0.2, currentScale * 0.3, 16);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(p.color),
          transparent: true,
          opacity: opacity * 0.6,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(p.x, p.y + progress * 0.4, p.z);
        this.particleGroup.add(mesh);
      }
    });
  }

  // -------------------------------------------------------------
  // SELECTION & INTERACTION (Raycasting Nodes & Towers)
  // -------------------------------------------------------------
  private onPointerDown(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check hit against node groups
    const interactables: THREE.Object3D[] = [];
    this.nodeMeshes.forEach((n) => interactables.push(n.group));

    const hits = this.raycaster.intersectObjects(interactables, true);
    if (hits.length > 0) {
      // Find parent with nodeIndex
      let obj: THREE.Object3D | null = hits[0].object;
      let nodeIdx: number | null = null;
      while (obj && obj !== this.scene) {
        if (obj.userData?.nodeIndex !== undefined) {
          nodeIdx = obj.userData.nodeIndex;
          break;
        }
        obj = obj.parent;
      }

      if (nodeIdx !== null) {
        this.handleNodeClick(nodeIdx);
      }
    } else {
      // Clicked outside: deselect
      this.selectNode(null);
      this.selectTower(null);
    }
  }

  private onPointerMove(e: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const interactables: THREE.Object3D[] = [];
    this.nodeMeshes.forEach((n) => interactables.push(n.group));

    const hits = this.raycaster.intersectObjects(interactables, true);

    // Reset rune opacities
    this.nodeMeshes.forEach((n) => {
      const isSelected = this.selectedNodeIndex === n.index;
      (n.rune.material as THREE.MeshBasicMaterial).opacity = isSelected ? 0.9 : 0.35;
    });

    if (hits.length > 0) {
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && obj !== this.scene) {
        if (obj.userData?.nodeIndex !== undefined) {
          const idx = obj.userData.nodeIndex;
          const target = this.nodeMeshes.find((nm) => nm.index === idx);
          if (target) {
            (target.rune.material as THREE.MeshBasicMaterial).opacity = 0.95;
          }
          break;
        }
        obj = obj.parent;
      }
    }
  }

  public handleNodeClick(nodeIndex: number) {
    const node = BUILD_NODES.find((n) => n.index === nodeIndex);
    if (!node) return;

    if (node.towerId) {
      // Tower exists here: select tower for upgrade/sell/targeting
      const tower = this.placedTowers.get(node.towerId);
      if (tower) {
        this.selectNode(nodeIndex);
        this.selectTower(tower);
      }
    } else {
      // Empty build spot
      if (this.towerToPlace) {
        // Place selected tower
        const success = this.buildTower(nodeIndex, this.towerToPlace);
        if (success) {
          this.towerToPlace = null;
        }
      } else {
        // Select empty node (reveals shop prompt)
        this.selectNode(nodeIndex);
        this.selectTower(null);
      }
    }
  }

  public selectNode(nodeIndex: number | null) {
    this.selectedNodeIndex = nodeIndex;
    this.callbacks.onNodeSelect(nodeIndex);
    this.updateRangeIndicator();
  }

  public selectTower(tower: PlacedTower | null) {
    this.selectedTower = tower;
    this.callbacks.onTowerSelect(tower);
    this.updateRangeIndicator();
  }

  private updateRangeIndicator() {
    if (this.selectedTower) {
      const stats = TOWER_DEFINITIONS[this.selectedTower.type];
      const range = stats.range * (1 + (this.selectedTower.level - 1) * 0.15);
      this.rangeIndicator.scale.set(range, range, range);
      this.rangeIndicator.position.set(this.selectedTower.x, 0.25, this.selectedTower.z);
      (this.rangeIndicator.material as THREE.MeshBasicMaterial).color.set(stats.color);
      this.rangeIndicator.visible = true;
    } else if (this.selectedNodeIndex !== null && this.towerToPlace) {
      const stats = TOWER_DEFINITIONS[this.towerToPlace];
      const node = BUILD_NODES.find((n) => n.index === this.selectedNodeIndex);
      if (node) {
        this.rangeIndicator.scale.set(stats.range, stats.range, stats.range);
        this.rangeIndicator.position.set(node.x, 0.25, node.z);
        (this.rangeIndicator.material as THREE.MeshBasicMaterial).color.set(stats.color);
        this.rangeIndicator.visible = true;
        return;
      }
      this.rangeIndicator.visible = false;
    } else {
      this.rangeIndicator.visible = false;
    }
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP
  // -------------------------------------------------------------
  private animate() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.updateGame(delta);
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  }

  private onWindowResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
