/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { TowerType, EnemyType } from '../types/game';

// Shared reusable materials to limit draw calls and memory
const materialsCache = new Map<string, THREE.Material>();

export function getMaterial(key: string, creator: () => THREE.Material): THREE.Material {
  if (!materialsCache.has(key)) {
    materialsCache.set(key, creator());
  }
  return materialsCache.get(key)!;
}

// -------------------------------------------------------------
// ENVIRONMENT & MAP MODELS
// -------------------------------------------------------------

// Procedural Pine Tree (Group of trunk + 3 foliage layers with natural taper)
export function createPineTree(scale: number = 1.0, tintVariance: number = 0.05): THREE.Group {
  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 1.2 * scale, 6);
  const trunkMat = getMaterial('treeTrunk', () => new THREE.MeshStandardMaterial({
    color: 0x4a2e1b,
    roughness: 0.9,
    metalness: 0.1,
  }));
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.6 * scale;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // 3 Foliage Cones
  const foliageMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1e5631).offsetHSL(0, 0, (Math.random() - 0.5) * tintVariance),
    roughness: 0.8,
    metalness: 0.05,
    flatShading: true,
  });

  const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.1 * scale, 1.3 * scale, 6), foliageMat);
  f1.position.y = 1.4 * scale;
  f1.castShadow = true;
  group.add(f1);

  const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.85 * scale, 1.1 * scale, 6), foliageMat);
  f2.position.y = 2.0 * scale;
  f2.castShadow = true;
  group.add(f2);

  const f3 = new THREE.Mesh(new THREE.ConeGeometry(0.55 * scale, 0.9 * scale, 6), foliageMat);
  f3.position.y = 2.6 * scale;
  f3.castShadow = true;
  group.add(f3);

  return group;
}

// Procedural Rock / Boulder
export function createRock(scale: number = 1.0): THREE.Mesh {
  const geo = new THREE.DodecahedronGeometry(0.6 * scale, 1);
  // Jitter vertices for organic rocky facets
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    const jitter = 1 + (Math.sin(vx * 7) * Math.cos(vz * 5)) * 0.12;
    pos.setXYZ(i, vx * jitter, vy * Math.max(0.2, jitter), vz * jitter);
  }
  geo.computeVertexNormals();

  const mat = getMaterial('rockMat', () => new THREE.MeshStandardMaterial({
    color: 0x6b7280,
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true,
  }));

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.3 * scale;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Village Keep / Castle Gate at path arrival
export function createVillageGate(): THREE.Group {
  const group = new THREE.Group();

  const stoneMat = getMaterial('castleStone', () => new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.2,
    flatShading: true,
  }));
  const woodMat = getMaterial('gateWood', () => new THREE.MeshStandardMaterial({
    color: 0x5c3d2e,
    roughness: 0.8,
  }));
  const roofMat = getMaterial('castleRoof', () => new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Crimson red medieval tile
    roughness: 0.6,
  }));
  const goldMat = getMaterial('flagGold', () => new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.6,
    roughness: 0.3,
  }));

  // Left & Right Gate Towers
  [-1.2, 1.2].forEach((xOffset) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 3.2, 8), stoneMat);
    tower.position.set(xOffset, 1.6, 0);
    tower.castShadow = true;
    group.add(tower);

    // Battlements
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.7, 0.4, 8), stoneMat);
    crown.position.set(xOffset, 3.4, 0);
    group.add(crown);

    // Conical Tower Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 8), roofMat);
    roof.position.set(xOffset, 4.2, 0);
    roof.castShadow = true;
    group.add(roof);

    // Flagpole & banner
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2), goldMat);
    pole.position.set(xOffset, 5.2, 0);
    group.add(pole);

    const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), goldMat);
    banner.position.set(xOffset + 0.3, 5.4, 0);
    banner.rotation.y = Math.PI / 2;
    group.add(banner);
  });

  // Archway Center Wall
  const archWall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.8), stoneMat);
  archWall.position.set(0, 2.5, 0);
  archWall.castShadow = true;
  group.add(archWall);

  // Wooden Portcullis Gate
  const gate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.2), woodMat);
  gate.position.set(0, 0.8, 0);
  group.add(gate);

  return group;
}

// Enemy Spawn Gate
export function createSpawnGate(): THREE.Group {
  const group = new THREE.Group();

  const darkWood = getMaterial('orcWood', () => new THREE.MeshStandardMaterial({
    color: 0x2b1d14,
    roughness: 0.9,
    metalness: 0.1,
  }));
  const skullMat = getMaterial('boneMat', () => new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.6,
  }));
  const fireMat = getMaterial('torchFire', () => new THREE.MeshBasicMaterial({
    color: 0xff4500,
  }));

  // Two Spiked Timber Posts
  [-1.0, 1.0].forEach((xOff) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.0, 6), darkWood);
    post.position.set(xOff, 1.5, 0);
    post.rotation.z = xOff * 0.08;
    post.castShadow = true;
    group.add(post);

    // Torch on post
    const torch = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 6), fireMat);
    torch.position.set(xOff, 3.1, 0);
    group.add(torch);
  });

  // Crossbeam with Spikes
  const cross = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.4), darkWood);
  cross.position.set(0, 2.4, 0);
  group.add(cross);

  // Skull totem in center
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), skullMat);
  skull.position.set(0, 2.9, 0);
  group.add(skull);

  return group;
}

// Build Spot (Node on the ground)
export function createBuildNodeMesh(): { group: THREE.Group; rune: THREE.Mesh } {
  const group = new THREE.Group();

  // Stone base pedestal
  const baseGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.22, 12);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.75,
    metalness: 0.2,
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.11;
  base.receiveShadow = true;
  group.add(base);

  // Glowing green rune ring on top (Tap a green build spot)
  const ringGeo = new THREE.RingGeometry(0.35, 0.78, 20);
  ringGeo.rotateX(-Math.PI / 2);
  const runeMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e, // Vibrant emerald green build node
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  });
  const rune = new THREE.Mesh(ringGeo, runeMat);
  rune.position.y = 0.23;
  group.add(rune);

  // Inner beacon dot
  const dotGeo = new THREE.CircleGeometry(0.2, 16);
  dotGeo.rotateX(-Math.PI / 2);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0x4ade80,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.y = 0.235;
  group.add(dot);

  return { group, rune };
}

// -------------------------------------------------------------
// COMPOSITE TOWER PROCEDURAL MODELS (3-12 Parts with Turret Heads)
// -------------------------------------------------------------

export interface TowerModel {
  root: THREE.Group;
  turretHead: THREE.Group;
  firePoint: THREE.Vector3;
  type: TowerType;
  update?: (delta: number) => void;
}

export function createTowerModel(type: TowerType, level: number = 1): TowerModel {
  const root = new THREE.Group();
  const turretHead = new THREE.Group();
  let firePoint = new THREE.Vector3(0, 2.4, 0);
  let updateFn: ((delta: number) => void) | undefined;

  const scaleMult = 1 + (level - 1) * 0.12;

  if (type === 'archer') {
    // 1. Stone foundation
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75 * scaleMult, 0.9 * scaleMult, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8, metalness: 0.1 })
    );
    base.position.y = 0.3;
    base.castShadow = true;
    root.add(base);

    // 2. Timber Tower Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * scaleMult, 0.68 * scaleMult, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 })
    );
    body.position.y = 1.3;
    body.castShadow = true;
    root.add(body);

    // 3. Wooden watch platform
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95 * scaleMult, 0.75 * scaleMult, 0.25, 8),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
    );
    platform.position.y = 2.05;
    platform.castShadow = true;
    root.add(platform);

    // Turret Head: Ballista / Crossbow on turntable
    turretHead.position.set(0, 2.2, 0);

    // Turntable
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
    );
    turretHead.add(mount);

    // Ballista wooden stock
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    stock.position.set(0, 0.2, 0.2);
    stock.castShadow = true;
    turretHead.add(stock);

    // Bow arms (Extends horizontally)
    const bow = new THREE.Mesh(
      new THREE.BoxGeometry(1.2 * scaleMult, 0.08, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.4, roughness: 0.3 })
    );
    bow.position.set(0, 0.2, 0.6);
    turretHead.add(bow);

    // Level banner flag
    if (level > 1) {
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      flagPole.position.set(0.4, 0.4, -0.3);
      turretHead.add(flagPole);
    }

    firePoint = new THREE.Vector3(0, 2.4, 0.8);
    root.add(turretHead);

  } else if (type === 'cannon') {
    // 1. Heavy Octagonal Bastion
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85 * scaleMult, 1.05 * scaleMult, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.3 })
    );
    base.position.y = 0.4;
    base.castShadow = true;
    root.add(base);

    // 2. Iron ring trim
    const trim = new THREE.Mesh(
      new THREE.TorusGeometry(0.85 * scaleMult, 0.08, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, metalness: 0.8, roughness: 0.25 })
    );
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.8;
    root.add(trim);

    // Turret Head: Heavy Iron Swivel Carriage & Brass Cannon
    turretHead.position.set(0, 0.9, 0);

    // Swivel mount
    const mount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.55, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    turretHead.add(mount);

    // Side brackets
    [-0.32, 0.32].forEach((x) => {
      const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.5, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 })
      );
      bracket.position.set(x, 0.35, 0);
      bracket.castShadow = true;
      turretHead.add(bracket);
    });

    // Cannon Barrel
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * scaleMult, 0.3 * scaleMult, 1.3 * scaleMult, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 })
    );
    barrel.rotation.x = Math.PI / 2 - 0.15; // Slightly elevated
    barrel.position.set(0, 0.42, 0.4);
    barrel.castShadow = true;
    turretHead.add(barrel);

    // Muzzle Flare Ring
    const muzzle = new THREE.Mesh(
      new THREE.TorusGeometry(0.24 * scaleMult, 0.06, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.9, roughness: 0.2 })
    );
    muzzle.position.set(0, 0.5, 1.05 * scaleMult);
    turretHead.add(muzzle);

    firePoint = new THREE.Vector3(0, 1.4, 1.1 * scaleMult);
    root.add(turretHead);

  } else {
    // ICE / FROST SPIRE
    // 1. Arcane runic obsidian pedestal
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7 * scaleMult, 0.95 * scaleMult, 0.7, 6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 })
    );
    base.position.y = 0.35;
    base.castShadow = true;
    root.add(base);

    // 2. Three surrounding frost spikes
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.18 * scaleMult, 1.1 * scaleMult, 5),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.8, transparent: true, opacity: 0.85 })
      );
      spike.position.set(Math.cos(angle) * 0.55 * scaleMult, 0.8, Math.sin(angle) * 0.55 * scaleMult);
      spike.rotation.x = Math.sin(angle) * -0.25;
      spike.rotation.z = Math.cos(angle) * 0.25;
      root.add(spike);
    }

    // Turret Head: Floating Glowing Ice Crystal that levitates and rotates
    turretHead.position.set(0, 1.6, 0);

    const crystalGeo = new THREE.OctahedronGeometry(0.55 * scaleMult, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0891b2,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.scale.set(0.8, 1.6, 0.8);
    crystal.castShadow = true;
    turretHead.add(crystal);

    // Small orbiting ice shards
    const orbitGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const shard = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.12 * scaleMult),
        crystalMat
      );
      const angle = (i * Math.PI * 2) / 3;
      shard.position.set(Math.cos(angle) * 0.75, 0, Math.sin(angle) * 0.75);
      orbitGroup.add(shard);
    }
    turretHead.add(orbitGroup);

    updateFn = (delta: number) => {
      crystal.rotation.y += delta * 2.0;
      orbitGroup.rotation.y -= delta * 3.0;
      crystal.position.y = Math.sin(Date.now() * 0.004) * 0.08;
    };

    firePoint = new THREE.Vector3(0, 1.8, 0.5);
    root.add(turretHead);
  }

  return { root, turretHead, firePoint, type, update: updateFn };
}

// -------------------------------------------------------------
// COMPOSITE ENEMY PROCEDURAL MODELS (3-12 Parts per Silhouette)
// -------------------------------------------------------------

export interface EnemyMeshModel {
  root: THREE.Group;
  healthBarCanvas?: HTMLCanvasElement;
  healthBarMesh?: THREE.Mesh;
  animator?: (time: number, isSlowed: boolean) => void;
}

export function createEnemyModel(type: EnemyType): EnemyMeshModel {
  const root = new THREE.Group();
  let animator: ((time: number, isSlowed: boolean) => void) | undefined;

  if (type === 'goblin') {
    // Agile green raider (Head with pointed ears, torso, legs, dagger)
    const skinMat = getMaterial('goblinSkin', () => new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.6,
      metalness: 0.1,
    }));
    const clothMat = getMaterial('goblinCloth', () => new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
    }));

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.35), clothMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    root.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), skinMat);
    head.position.set(0, 1.1, 0.05);
    head.castShadow = true;
    root.add(head);

    // Pointed ears
    [-0.24, 0.24].forEach((x) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 4), skinMat);
      ear.position.set(x, 1.15, 0);
      ear.rotation.z = x > 0 ? -1.1 : 1.1;
      root.add(ear);
    });

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), skinMat);
    legL.position.set(-0.16, 0.22, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), skinMat);
    legR.position.set(0.16, 0.22, 0);
    root.add(legL, legR);

    // Dagger
    const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.08), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
    dagger.position.set(0.35, 0.6, 0.2);
    dagger.rotation.x = 0.6;
    root.add(dagger);

    animator = (time: number) => {
      const swing = Math.sin(time * 12) * 0.45;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      torso.position.y = 0.65 + Math.abs(Math.sin(time * 12)) * 0.08;
    };

  } else if (type === 'wolf') {
    // Quadruped Dire Wolf (Body, 4 legs, head with snout, tail)
    const furMat = getMaterial('wolfFur', () => new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
    }));
    const eyesMat = getMaterial('wolfEyes', () => new THREE.MeshBasicMaterial({ color: 0xef4444 }));

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.9), furMat);
    body.position.y = 0.55;
    body.castShadow = true;
    root.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.45), furMat);
    head.position.set(0, 0.75, 0.55);
    head.castShadow = true;
    root.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.3), furMat);
    snout.position.set(0, 0.65, 0.85);
    root.add(snout);

    // Glowing Eyes
    [-0.1, 0.1].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyesMat);
      eye.position.set(x, 0.8, 0.72);
      root.add(eye);
    });

    // 4 Running Legs
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45), furMat);
    fl.position.set(-0.2, 0.22, 0.35);
    const fr = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45), furMat);
    fr.position.set(0.2, 0.22, 0.35);
    const bl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45), furMat);
    bl.position.set(-0.2, 0.22, -0.35);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.45), furMat);
    br.position.set(0.2, 0.22, -0.35);
    root.add(fl, fr, bl, br);

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.5), furMat);
    tail.position.set(0, 0.6, -0.55);
    tail.rotation.x = -0.7;
    root.add(tail);

    animator = (time: number) => {
      const swing = Math.sin(time * 16) * 0.7;
      fl.rotation.x = swing;
      fr.rotation.x = -swing;
      bl.rotation.x = -swing;
      br.rotation.x = swing;
      tail.rotation.y = Math.sin(time * 16) * 0.4;
    };

  } else if (type === 'armored') {
    // Ironclad Knight (Steel plate, shield with cross, sword, full helm)
    const steelMat = getMaterial('steelPlate', () => new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    }));
    const goldTrim = getMaterial('goldTrim', () => new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.8,
      roughness: 0.3,
    }));

    // Torso Breastplate
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.4), steelMat);
    chest.position.y = 0.8;
    chest.castShadow = true;
    root.add(chest);

    // Helmet with Visor
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.45, 8), steelMat);
    helm.position.set(0, 1.35, 0);
    helm.castShadow = true;
    root.add(helm);

    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    plume.position.set(0, 1.6, -0.05);
    root.add(plume);

    // Shield (on left arm)
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.5), goldTrim);
    shield.position.set(-0.45, 0.8, 0.1);
    root.add(shield);

    // Sword (on right arm)
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.12), steelMat);
    sword.position.set(0.45, 0.7, 0.2);
    sword.rotation.x = 0.4;
    root.add(sword);

    // Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.55), steelMat);
    legL.position.set(-0.2, 0.28, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.55), steelMat);
    legR.position.set(0.2, 0.28, 0);
    root.add(legL, legR);

    animator = (time: number) => {
      const swing = Math.sin(time * 8) * 0.35;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
    };

  } else if (type === 'flying') {
    // Sky Wyvern (Flies at elevated Y, bat-like wings flap)
    const dragonMat = getMaterial('wyvernSkin', () => new THREE.MeshStandardMaterial({
      color: 0x7e22ce,
      roughness: 0.5,
      metalness: 0.3,
    }));
    const wingMat = getMaterial('wyvernWings', () => new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      roughness: 0.7,
    }));

    // Elongated reptilian body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 6), dragonMat);
    body.rotation.x = -Math.PI / 2;
    body.position.y = 0;
    root.add(body);

    // Snaking neck & head
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 5), dragonMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.15, 0.75);
    root.add(head);

    // Left & Right Wings (Hinged for flapping)
    const wingL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), wingMat);
    wingL.position.set(-0.65, 0.1, 0);
    wingL.rotation.x = Math.PI / 2;

    const wingR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), wingMat);
    wingR.position.set(0.65, 0.1, 0);
    wingR.rotation.x = Math.PI / 2;
    root.add(wingL, wingR);

    animator = (time: number) => {
      const flap = Math.sin(time * 12) * 0.6;
      wingL.rotation.y = flap;
      wingR.rotation.y = -flap;
      root.position.y = 3.6 + Math.sin(time * 4) * 0.25;
    };

  } else if (type === 'healer') {
    // Forest Shaman (Robed mystic with antler staff)
    const robeMat = getMaterial('shamanRobe', () => new THREE.MeshStandardMaterial({
      color: 0x065f46,
      roughness: 0.9,
    }));
    const gemMat = getMaterial('healGem', () => new THREE.MeshBasicMaterial({ color: 0x10b981 }));

    // Conical Robe Body
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 8), robeMat);
    robe.position.y = 0.55;
    robe.castShadow = true;
    root.add(robe);

    // Head / Hood
    const hood = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), robeMat);
    hood.position.set(0, 1.2, 0);
    root.add(hood);

    // Healing Staff
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6), new THREE.MeshStandardMaterial({ color: 0x78350f }));
    staff.position.set(0.45, 0.8, 0.2);
    root.add(staff);

    // Glowing Gem on staff
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), gemMat);
    gem.position.set(0.45, 1.65, 0.2);
    root.add(gem);

    animator = (time: number) => {
      gem.rotation.y += 0.05;
      staff.rotation.z = Math.sin(time * 4) * 0.1;
    };

  } else if (type === 'ogre') {
    // Mountain Ogre (Hulking brute with massive spiked club)
    const ogreMat = getMaterial('ogreSkin', () => new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.85,
      metalness: 0.1,
    }));
    const clubMat = getMaterial('ogreClub', () => new THREE.MeshStandardMaterial({
      color: 0x3f2e21,
      roughness: 0.9,
    }));

    // Huge Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.0, 0.7), ogreMat);
    torso.position.y = 1.1;
    torso.castShadow = true;
    root.add(torso);

    // Head with jaw
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), ogreMat);
    head.position.set(0, 1.75, 0.15);
    head.castShadow = true;
    root.add(head);

    // Massive Spiked Club
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 1.6, 6), clubMat);
    club.position.set(0.7, 1.1, 0.3);
    club.rotation.x = 0.5;
    root.add(club);

    // Heavy Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7), ogreMat);
    legL.position.set(-0.3, 0.35, 0);
    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.7), ogreMat);
    legR.position.set(0.3, 0.35, 0);
    root.add(legL, legR);

    animator = (time: number) => {
      const swing = Math.sin(time * 5) * 0.4;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      torso.position.y = 1.1 + Math.abs(Math.sin(time * 5)) * 0.1;
    };

  } else {
    // BOSS TITAN
    const titanMat = getMaterial('titanSkin', () => new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.6,
      metalness: 0.7,
    }));
    const magmaMat = getMaterial('titanMagma', () => new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    const crownMat = getMaterial('titanCrown', () => new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 }));

    // Colossal Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.0), titanMat);
    torso.position.y = 1.6;
    torso.castShadow = true;
    root.add(torso);

    // Magma Core Chest
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.2), magmaMat);
    core.position.set(0, 1.7, 0.45);
    root.add(core);

    // Spiked Crowned Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), titanMat);
    head.position.set(0, 2.6, 0.1);
    root.add(head);

    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 5), crownMat);
    crown.position.set(0, 3.1, 0.1);
    root.add(crown);

    // Massive Pauldrons
    [-0.9, 0.9].forEach((x) => {
      const pauldron = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), titanMat);
      pauldron.position.set(x, 2.2, 0);
      root.add(pauldron);
    });

    // Stomping Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.5), titanMat);
    legL.position.set(-0.45, 0.45, 0);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.5), titanMat);
    legR.position.set(0.45, 0.45, 0);
    root.add(legL, legR);

    animator = (time: number) => {
      const swing = Math.sin(time * 3.5) * 0.35;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      crown.rotation.y += 0.01;
    };
  }

  return { root, animator };
}
