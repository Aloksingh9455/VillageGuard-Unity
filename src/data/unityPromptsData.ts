/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UnityPromptEntry {
  id: number;
  title: string;
  category: 'Foundation' | 'Enemies' | 'Towers' | 'Architecture' | 'UI & Audio' | 'Production';
  prompt: string;
  summary: string;
  csharpCode?: string;
  codeFilename?: string;
  editorSteps: string[];
  tips: string[];
  inspectorFields?: { name: string; type: string; description: string }[];
}

export const UNITY_PROMPTS: UnityPromptEntry[] = [
  {
    id: 1,
    title: 'Master Plan (4-Week Roadmap)',
    category: 'Foundation',
    prompt: `I am a beginner making a 3D tower defense game in Unity (C#) called "Village Guard". Enemies walk along a waypoint path to my village. I place 3 tower types (Archer, Cannon with splash damage, Ice with slow) on build spots. I earn coins per kill and upgrade towers between waves. Give me a day-by-day plan for 4 weeks with one small testable goal each day. Keep the explanations simple.`,
    summary: 'A 28-day agile roadmap taking you from blank URP scene to a polished multi-wave tower defense game, with testable daily milestones.',
    editorSteps: [
      'Week 1 (Movement & Waves): Days 1-7 set up the map, waypoints, basic enemy movement, wave spawner, lives system, and health bars.',
      'Week 2 (Towers & Combat): Days 8-14 implement node build spots, archer tower targeting, homing arrows, cannon splash damage, and ice tower slowing.',
      'Week 3 (Economy & UI): Days 15-21 build gold rewards, shop panel, tower upgrade & sell mechanics, targeting modes (First/Nearest/Strongest), and sound effects.',
      'Week 4 (Polish & Release): Days 22-28 add special enemy types (Flying, Armored, Healer), main menu, pause with 2x speed, level saving, and Android build.'
    ],
    tips: [
      'Never skip a daily test! Each day ends with a working play button press.',
      'Keep your first prototype in greybox cubes before adding 3D art.',
      'Use Unity Version Control (Git with Git LFS) right from Day 1.'
    ]
  },
  {
    id: 2,
    title: 'Project and Map Setup',
    category: 'Foundation',
    prompt: `Explain step by step how to set up a Unity 3D (URP) project for a tower defense game: folder structure, ground plane, a winding path, waypoint objects, build spot nodes, and a top-down camera at about 50 degrees. Give exact menu clicks in the Unity Editor.`,
    summary: 'Exact editor hierarchy, folder conventions, ground plane geometry, and camera angle for an isometric 50° medieval battlefield.',
    editorSteps: [
      '1. Open Unity Hub > New Project > "3D (URP)" > Name it "VillageGuard".',
      '2. In Project window, create folders: `_Project/Scripts`, `_Project/Prefabs`, `_Project/Materials`, `_Project/Audio`, `_Project/Art`.',
      '3. In Hierarchy, right-click > 3D Object > Plane. Rename to "Ground". Scale to (3, 1, 3).',
      '4. Create an Empty GameObject named "Waypoints". Inside it, create empty children "Point (0)", "Point (1)", etc., positioned along an S-curve.',
      '5. Create an Empty GameObject named "BuildNodes". Add Cylinder children (Scale: 1.2, 0.1, 1.2) with a stone material and Tag them "BuildNode".',
      '6. Select "Main Camera". Set Transform Position to (0, 16, -14), Rotation to (50, 0, 0), Projection to "Perspective" (FOV: 45) or "Orthographic" (Size: 10).'
    ],
    tips: [
      'Set your Build Nodes layer to a custom layer named "Nodes" to make raycasting faster and cleaner.',
      'Add a Directional Light rotated (50, -30, 0) with Soft Shadows enabled for warm medieval sunlight.'
    ]
  },
  {
    id: 3,
    title: 'Waypoints and Enemy Movement',
    category: 'Enemies',
    prompt: `Write a Unity C# script where enemies spawn at a gate and follow a list of waypoints (children of an empty object) to the village. They should rotate smoothly toward the next point, reduce the player's lives on arrival, and then be destroyed. Explain how to attach each script in the Editor.`,
    summary: 'Centralized waypoints array provider with smooth path-following, rotation interpolation, and life deduction on arrival.',
    codeFilename: 'Waypoints.cs & EnemyMovement.cs',
    csharpCode: `// ==========================================
// File: Waypoints.cs
// Attach this to an empty GameObject named "Waypoints"
// ==========================================
using UnityEngine;

public class Waypoints : MonoBehaviour
{
    public static Transform[] points;

    void Awake()
    {
        points = new Transform[transform.childCount];
        for (int i = 0; i < points.Length; i++)
        {
            points[i] = transform.GetChild(i);
        }
    }
}

// ==========================================
// File: EnemyMovement.cs
// Attach this to your Enemy prefab
// ==========================================
using UnityEngine;

[RequireComponent(typeof(Enemy))]
public class EnemyMovement : MonoBehaviour
{
    private Transform target;
    private int wavePointIndex = 0;
    private Enemy enemy;

    void Start()
    {
        enemy = GetComponent<Enemy>();
        if (Waypoints.points != null && Waypoints.points.Length > 0)
        {
            target = Waypoints.points[0];
        }
    }

    void Update()
    {
        if (target == null) return;

        // Move toward waypoint using modified speed (handles ice slow)
        Vector3 dir = target.position - transform.position;
        transform.Translate(dir.normalized * enemy.speed * Time.deltaTime, Space.World);

        // Smoothly rotate to face direction of travel
        if (dir != Vector3.zero)
        {
            Quaternion targetRotation = Quaternion.LookRotation(dir);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, 10f * Time.deltaTime);
        }

        // Check if reached current waypoint
        if (Vector3.Distance(transform.position, target.position) <= 0.2f)
        {
            GetNextWaypoint();
        }
    }

    void GetNextWaypoint()
    {
        if (wavePointIndex >= Waypoints.points.Length - 1)
        {
            EndPath();
            return;
        }

        wavePointIndex++;
        target = Waypoints.points[wavePointIndex];
    }

    void EndPath()
    {
        PlayerStats.Lives -= enemy.damageToVillage;
        WaveSpawner.EnemiesAlive--;
        Destroy(gameObject);
    }
}`,
    editorSteps: [
      '1. Create an empty GameObject named "Waypoints" in your scene. Attach the `Waypoints.cs` script.',
      '2. Create child GameObjects along the road representing each turn.',
      '3. On your Enemy Prefab, attach `Enemy.cs` and `EnemyMovement.cs`.',
      '4. Ensure the enemy has a Box Collider or Capsule Collider.'
    ],
    tips: [
      'Because `Waypoints.points` is a static array initialized in Awake, enemies can find points instantly without needing an Inspector link.',
      'Use `Space.World` in `transform.Translate` so movement isn\'t skewed by the enemy\'s local rotation.'
    ]
  },
  {
    id: 4,
    title: 'Wave Spawner',
    category: 'Architecture',
    prompt: `Write a Unity C# WaveSpawner script with a serializable Wave class (enemy prefab, count, spawn interval). Add a countdown between waves, start the next wave only when all enemies are dead, and trigger a win when the last wave is cleared. Make sure a wave cannot end while enemies are still spawning.`,
    summary: 'Coroutines-based wave orchestrator with countdown timer, active enemy tracking, and victory state trigger.',
    codeFilename: 'WaveSpawner.cs',
    csharpCode: `using System.Collections;
using UnityEngine;
using TMPro;

[System.Serializable]
public class Wave
{
    public string waveName = "Wave 1";
    public GameObject enemyPrefab;
    public int count = 5;
    public float rate = 1.0f; // Seconds between spawns
}

public class WaveSpawner : MonoBehaviour
{
    public static int EnemiesAlive = 0;

    [Header("Wave Setup")]
    public Wave[] waves;
    public Transform spawnPoint;
    public float timeBetweenWaves = 5.0f;

    [Header("UI Reference")]
    public TextMeshProUGUI waveCountdownText;
    public GameManager gameManager;

    private float countdown = 2.0f;
    private int waveIndex = 0;
    private bool isSpawning = false;

    void Update()
    {
        // Don't advance if enemies are still alive or currently spawning
        if (EnemiesAlive > 0 || isSpawning)
        {
            return;
        }

        // Check if all waves are cleared
        if (waveIndex == waves.Length)
        {
            if (gameManager != null) gameManager.WinLevel();
            this.enabled = false;
            return;
        }

        if (countdown <= 0f)
        {
            StartCoroutine(SpawnWave());
            countdown = timeBetweenWaves;
            return;
        }

        countdown -= Time.deltaTime;
        countdown = Mathf.Clamp(countdown, 0f, Mathf.Infinity);

        if (waveCountdownText != null)
        {
            waveCountdownText.text = $"Next Wave: {Mathf.Ceil(countdown):00}s";
        }
    }

    IEnumerator SpawnWave()
    {
        isSpawning = true;
        PlayerStats.Rounds++;
        Wave wave = waves[waveIndex];
        EnemiesAlive += wave.count;

        for (int i = 0; i < wave.count; i++)
        {
            SpawnEnemy(wave.enemyPrefab);
            yield return new WaitForSeconds(1f / wave.rate);
        }

        waveIndex++;
        isSpawning = false;
    }

    void SpawnEnemy(GameObject enemyPrefab)
    {
        Instantiate(enemyPrefab, spawnPoint.position, spawnPoint.rotation);
    }
}`,
    editorSteps: [
      '1. Create an empty GameObject named "GameMaster" and attach `WaveSpawner.cs`.',
      '2. In the Inspector, set "Spawn Point" to your SpawnGate Transform.',
      '3. Expand the "Waves" array and set the Size (e.g. 10).',
      '4. Drag your Goblin, Wolf, Ogre, and Boss prefabs into each wave slot and configure count & rate.'
    ],
    tips: [
      'The boolean `isSpawning` is critical: without it, a wave could trigger before the previous wave finished instantiating.',
      'Always decrement `EnemiesAlive` in both `Enemy.Die()` and `EnemyMovement.EndPath()`.'
    ]
  },
  {
    id: 5,
    title: 'Enemy Types & Stats',
    category: 'Enemies',
    prompt: `Create 4 enemy types for my Unity tower defense game (Goblin, Wolf, Ogre, Boss) using one Enemy script with adjustable speed, health, and coin reward. Give me balanced stat numbers for each and explain how to make prefabs from them.`,
    summary: 'A unified, data-driven Enemy script supporting polymorphic stats, damage reduction, and death particle/sound hooks.',
    codeFilename: 'Enemy.cs',
    csharpCode: `using UnityEngine;

public class Enemy : MonoBehaviour
{
    [Header("Base Attributes")]
    public string enemyName = "Goblin";
    public float startHealth = 100f;
    [HideInInspector] public float health;
    public float startSpeed = 3f;
    [HideInInspector] public float speed;
    public int coinReward = 10;
    public int damageToVillage = 1;

    [Header("Special Attributes")]
    public bool isFlying = false;
    [Range(0f, 0.9f)] public float armorReduction = 0f; // e.g. 0.5 for armored enemies

    [Header("Effects")]
    public GameObject deathEffect;

    private bool isDead = false;

    void Start()
    {
        health = startHealth;
        speed = startSpeed;
    }

    public void TakeDamage(float amount, bool isPhysical = false)
    {
        if (isDead) return;

        // Apply armor damage reduction if physical
        if (isPhysical && armorReduction > 0f)
        {
            amount *= (1f - armorReduction);
        }

        health -= amount;

        if (health <= 0f)
        {
            Die();
        }
    }

    public void Slow(float slowFactor, float duration)
    {
        // slowFactor: e.g. 0.5 = 50% speed
        speed = startSpeed * (1f - slowFactor);
        CancelInvoke(nameof(ResetSpeed));
        Invoke(nameof(ResetSpeed), duration);
    }

    void ResetSpeed()
    {
        speed = startSpeed;
    }

    void Die()
    {
        if (isDead) return;
        isDead = true;

        PlayerStats.Money += coinReward;
        WaveSpawner.EnemiesAlive--;

        if (deathEffect != null)
        {
            Instantiate(deathEffect, transform.position, Quaternion.identity);
        }

        Destroy(gameObject);
    }
}`,
    editorSteps: [
      '1. Attach `Enemy.cs` and `EnemyMovement.cs` to your model.',
      '2. Configure Goblin: Health=80, Speed=3.2, Reward=12, Damage=1.',
      '3. Configure Wolf: Health=110, Speed=4.5, Reward=16, Damage=1.',
      '4. Configure Ogre: Health=550, Speed=1.6, Reward=50, Damage=4.',
      '5. Configure Boss: Health=1600, Speed=1.2, Reward=150, Damage=10.',
      '6. Drag each configured GameObject from Hierarchy to `_Project/Prefabs` to create Prefabs.'
    ],
    tips: [
      'Use `CancelInvoke(nameof(ResetSpeed))` before starting a new slow timer so multiple ice attacks refresh the duration without ending early.',
      'Tag your enemy prefabs with the Tag "Enemy".'
    ]
  },
  {
    id: 6,
    title: 'Tower Targeting and Shooting',
    category: 'Towers',
    prompt: `Write a Unity C# Tower script that finds the nearest enemy in range every 0.25 seconds, rotates the turret head smoothly to face it, and fires projectiles at a set fire rate. Include a range gizmo and explain how to set up the tower prefab (base, head, fire point).`,
    summary: 'Modular Tower controller with periodic target search (reducing CPU overhead), smooth turret head tracking, and gizmo visualization.',
    codeFilename: 'Tower.cs',
    csharpCode: `using UnityEngine;

public class Tower : MonoBehaviour
{
    public enum TargetingMode { Nearest, First, Strongest, Weakest }

    [Header("Attributes")]
    public float range = 6f;
    public float fireRate = 1f; // Shots per second
    public bool canTargetAir = true;
    public TargetingMode targetingMode = TargetingMode.Nearest;

    [Header("Unity Setup")]
    public Transform partToRotate; // Turret head
    public Transform firePoint;
    public GameObject projectilePrefab;
    public string enemyTag = "Enemy";

    private Transform currentTarget;
    private float fireCountdown = 0f;

    void Start()
    {
        // Search for targets 4 times per second instead of every single frame
        InvokeRepeating(nameof(UpdateTarget), 0f, 0.25f);
    }

    void UpdateTarget()
    {
        GameObject[] enemies = GameObject.FindGameObjectsWithTag(enemyTag);
        float shortestDistance = Mathf.Infinity;
        GameObject bestTarget = null;

        foreach (GameObject enemyObj in enemies)
        {
            Enemy enemy = enemyObj.GetComponent<Enemy>();
            if (enemy == null || (!canTargetAir && enemy.isFlying)) continue;

            float distanceToEnemy = Vector3.Distance(transform.position, enemyObj.transform.position);
            if (distanceToEnemy <= range)
            {
                if (targetingMode == TargetingMode.Nearest && distanceToEnemy < shortestDistance)
                {
                    shortestDistance = distanceToEnemy;
                    bestTarget = enemyObj;
                }
            }
        }

        currentTarget = bestTarget != null ? bestTarget.transform : null;
    }

    void Update()
    {
        if (currentTarget == null) return;

        // Lock onto target (rotate turret head on Y axis only)
        Vector3 dir = currentTarget.position - transform.position;
        Quaternion lookRotation = Quaternion.LookRotation(dir);
        Vector3 rotation = Quaternion.Lerp(partToRotate.rotation, lookRotation, Time.deltaTime * 10f).eulerAngles;
        partToRotate.rotation = Quaternion.Euler(0f, rotation.y, 0f);

        // Fire at fire rate
        if (fireCountdown <= 0f)
        {
            Shoot();
            fireCountdown = 1f / fireRate;
        }

        fireCountdown -= Time.deltaTime;
    }

    void Shoot()
    {
        GameObject projectileGO = Instantiate(projectilePrefab, firePoint.position, firePoint.rotation);
        Projectile projectile = projectileGO.GetComponent<Projectile>();
        if (projectile != null)
        {
            projectile.Seek(currentTarget);
        }
    }

    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(transform.position, range);
    }
}`,
    editorSteps: [
      '1. Hierarchy layout: Create Empty "Tower_Archer". Add child "Base" (cylinder) and child "Head" (cube/turret).',
      '2. Inside "Head", create an Empty child "FirePoint" positioned at the muzzle tip.',
      '3. Attach `Tower.cs` to the root "Tower_Archer".',
      '4. Drag "Head" into `Part To Rotate`, "FirePoint" into `Fire Point`, and your Arrow into `Projectile Prefab`.'
    ],
    tips: [
      'Rotating only `rotation.y` keeps the turret head upright and prevents tilting toward the ground.',
      '`InvokeRepeating` saves immense CPU compared to querying all enemies in `Update()`.'
    ]
  },
  {
    id: 7,
    title: 'Projectiles (Homing, Splash, Slow)',
    category: 'Towers',
    prompt: `Write a Unity C# Projectile script that homes in on a target. Support three modes: single-target damage (archer), splash damage with a radius (cannon), and a slow effect with a percentage and duration (ice). Include a hit effect prefab.`,
    summary: 'A 3-in-1 projectile supporting single-target piercing, Physics.OverlapSphere area splash, and ice slow debuff.',
    codeFilename: 'Projectile.cs',
    csharpCode: `using UnityEngine;

public class Projectile : MonoBehaviour
{
    private Transform target;

    [Header("Flight")]
    public float speed = 18f;

    [Header("Combat Stats")]
    public float damage = 25f;
    public float explosionRadius = 0f; // > 0 enables splash
    public bool isPhysical = true;

    [Header("Slow Effect (Ice Spire)")]
    public bool applySlow = false;
    [Range(0.1f, 0.9f)] public float slowFactor = 0.5f; // 50% slow
    public float slowDuration = 3.5f;

    [Header("Visual Effects")]
    public GameObject impactEffect;

    public void Seek(Transform _target)
    {
        target = _target;
    }

    void Update()
    {
        if (target == null)
        {
            Destroy(gameObject);
            return;
        }

        Vector3 dir = target.position - transform.position;
        float distanceThisFrame = speed * Time.deltaTime;

        // Check if projectile reached target this frame
        if (dir.magnitude <= distanceThisFrame)
        {
            HitTarget();
            return;
        }

        transform.Translate(dir.normalized * distanceThisFrame, Space.World);
        transform.LookAt(target);
    }

    void HitTarget()
    {
        if (impactEffect != null)
        {
            GameObject effectIns = Instantiate(impactEffect, transform.position, transform.rotation);
            Destroy(effectIns, 2f);
        }

        if (explosionRadius > 0f)
        {
            Explode();
        }
        else
        {
            Damage(target);
        }

        Destroy(gameObject);
    }

    void Explode()
    {
        Collider[] colliders = Physics.OverlapSphere(transform.position, explosionRadius);
        foreach (Collider collider in colliders)
        {
            if (collider.CompareTag("Enemy"))
            {
                Damage(collider.transform);
            }
        }
    }

    void Damage(Transform enemyTransform)
    {
        Enemy enemy = enemyTransform.GetComponent<Enemy>();
        if (enemy != null)
        {
            enemy.TakeDamage(damage, isPhysical);
            if (applySlow)
            {
                enemy.Slow(slowFactor, slowDuration);
            }
        }
    }

    void OnDrawGizmosSelected()
    {
        if (explosionRadius > 0f)
        {
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, explosionRadius);
        }
    }
}`,
    editorSteps: [
      '1. Create 3 Projectile Prefabs: "Arrow", "Cannonball", "IceBolt".',
      '2. Arrow: damage=25, explosionRadius=0, applySlow=false, speed=22.',
      '3. Cannonball: damage=70, explosionRadius=2.5, isPhysical=true, speed=14.',
      '4. IceBolt: damage=15, explosionRadius=1.2, applySlow=true, slowFactor=0.5, slowDuration=3.5.'
    ],
    tips: [
      'If target dies mid-flight, `if (target == null)` safely destroys the projectile to avoid NullReferenceException.',
      'Use `Destroy(effectIns, 2f)` so particle prefabs clean themselves up automatically.'
    ]
  },
  {
    id: 8,
    title: 'Build and Upgrade System',
    category: 'Architecture',
    prompt: `Write a Unity C# BuildManager and Node system. The player selects a tower from the shop, taps a build spot to place it, and coins are deducted. Tapping an existing tower opens an upgrade/sell panel. Upgrades increase damage, range, and fire rate. Selling refunds 60% of the cost. Make it work with both mouse and mobile touch.`,
    summary: 'Interactive node placement system with Singleton BuildManager, mobile touch raycasting, upgrade tiers, and 60% salvage refund.',
    codeFilename: 'BuildManager.cs & Node.cs',
    csharpCode: `// ==========================================
// File: Node.cs
// Attach this to each Build Node GameObject in scene
// ==========================================
using UnityEngine;
using UnityEngine.EventSystems;

public class Node : MonoBehaviour
{
    public Color hoverColor;
    public Color notEnoughMoneyColor;
    public Vector3 positionOffset = new Vector3(0, 0.5f, 0);

    [HideInInspector] public GameObject tower;
    [HideInInspector] public TowerBlueprint towerBlueprint;
    [HideInInspector] public int upgradeLevel = 1;

    private Renderer rend;
    private Color startColor;
    private BuildManager buildManager;

    void Start()
    {
        rend = GetComponent<Renderer>();
        startColor = rend.material.color;
        buildManager = BuildManager.instance;
    }

    public Vector3 GetBuildPosition()
    {
        return transform.position + positionOffset;
    }

    void OnMouseDown()
    {
        // Don't click through UI elements (Buttons, Shop, etc.)
        if (EventSystem.current.IsPointerOverGameObject()) return;

        if (tower != null)
        {
            buildManager.SelectNode(this);
            return;
        }

        if (!buildManager.CanBuild) return;

        BuildTower(buildManager.GetTowerToBuild());
    }

    void BuildTower(TowerBlueprint blueprint)
    {
        if (PlayerStats.Money < blueprint.cost) return;

        PlayerStats.Money -= blueprint.cost;

        GameObject _tower = Instantiate(blueprint.prefab, GetBuildPosition(), Quaternion.identity);
        tower = _tower;
        towerBlueprint = blueprint;
        upgradeLevel = 1;
    }

    public void UpgradeTower()
    {
        int upgradeCost = Mathf.RoundToInt(towerBlueprint.cost * 1.5f * upgradeLevel);
        if (PlayerStats.Money < upgradeCost) return;

        PlayerStats.Money -= upgradeCost;
        upgradeLevel++;

        Tower t = tower.GetComponent<Tower>();
        if (t != null)
        {
            t.range *= 1.2f;
            t.fireRate *= 1.25f;
        }
    }

    public void SellTower()
    {
        int refund = Mathf.RoundToInt(towerBlueprint.cost * 0.6f * upgradeLevel);
        PlayerStats.Money += refund;

        Destroy(tower);
        towerBlueprint = null;
        upgradeLevel = 1;
    }
}

// ==========================================
// File: BuildManager.cs (Singleton)
// ==========================================
using UnityEngine;

[System.Serializable]
public class TowerBlueprint
{
    public string name;
    public GameObject prefab;
    public int cost;
}

public class BuildManager : MonoBehaviour
{
    public static BuildManager instance;

    void Awake()
    {
        if (instance != null) { Destroy(gameObject); return; }
        instance = this;
    }

    private TowerBlueprint towerToBuild;
    private Node selectedNode;
    public NodeUI nodeUI;

    public bool CanBuild => towerToBuild != null;
    public bool HasMoney => PlayerStats.Money >= towerToBuild.cost;

    public void SelectTowerToBuild(TowerBlueprint tower)
    {
        towerToBuild = tower;
        DeselectNode();
    }

    public TowerBlueprint GetTowerToBuild() => towerToBuild;

    public void SelectNode(Node node)
    {
        if (selectedNode == node)
        {
            DeselectNode();
            return;
        }

        selectedNode = node;
        towerToBuild = null;
        nodeUI.SetTarget(node);
    }

    public void DeselectNode()
    {
        selectedNode = null;
        nodeUI.Hide();
    }
}`,
    editorSteps: [
      '1. Attach `BuildManager.cs` to the GameMaster GameObject.',
      '2. Ensure each BuildNode has a Box or Mesh Collider so `OnMouseDown` fires.',
      '3. In Shop UI, hook button clicks to `BuildManager.instance.SelectTowerToBuild(blueprint)`.',
      '4. Connect `NodeUI` for the upgrade/sell floating card.'
    ],
    tips: [
      'Always test `EventSystem.current.IsPointerOverGameObject()` on touch devices to prevent accidental tower builds when tapping UI buttons.',
      'On mobile, `Input.GetTouch(0).fingerId` should be passed to `IsPointerOverGameObject(fingerId)`.'
    ]
  },
  {
    id: 9,
    title: 'UI with TextMeshPro',
    category: 'UI & Audio',
    prompt: `Explain how to build the UI for my Unity tower defense game using TextMeshPro: a top bar with coins, lives, and wave number; a bottom shop bar with 3 tower buttons; an upgrade/sell panel; and game over and win screens with restart buttons. Include the C# script and how to link the button OnClick events.`,
    summary: 'Complete TextMeshPro canvas architecture with responsive anchor constraints, dynamic HUD binding, and game state modal overlays.',
    codeFilename: 'UIManager.cs',
    csharpCode: `using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;

public class UIManager : MonoBehaviour
{
    [Header("Top Bar")]
    public TextMeshProUGUI coinsText;
    public TextMeshProUGUI livesText;
    public TextMeshProUGUI waveText;

    [Header("Panels")]
    public GameObject gameOverPanel;
    public GameObject winPanel;
    public GameObject upgradePanel;

    [Header("Upgrade Panel Details")]
    public TextMeshProUGUI upgradeCostText;
    public Button upgradeButton;
    public TextMeshProUGUI sellRefundText;

    private Node targetNode;

    void Update()
    {
        if (coinsText != null) coinsText.text = $"Gold: {PlayerStats.Money}";
        if (livesText != null) livesText.text = $"Lives: {PlayerStats.Lives}";
        if (waveText != null) waveText.text = $"Wave: {PlayerStats.Rounds}";
    }

    public void ShowUpgradePanel(Node node)
    {
        targetNode = node;
        upgradePanel.SetActive(true);
        int upgradeCost = Mathf.RoundToInt(node.towerBlueprint.cost * 1.5f * node.upgradeLevel);
        int refund = Mathf.RoundToInt(node.towerBlueprint.cost * 0.6f * node.upgradeLevel);

        upgradeCostText.text = $"Upgrade ({upgradeCost}g)";
        sellRefundText.text = $"Sell (+{refund}g)";
        upgradeButton.interactable = PlayerStats.Money >= upgradeCost;
    }

    public void OnUpgradeClicked()
    {
        if (targetNode != null)
        {
            targetNode.UpgradeTower();
            ShowUpgradePanel(targetNode);
        }
    }

    public void OnSellClicked()
    {
        if (targetNode != null)
        {
            targetNode.SellTower();
            upgradePanel.SetActive(false);
        }
    }

    public void TriggerGameOver()
    {
        gameOverPanel.SetActive(true);
    }

    public void TriggerWin()
    {
        winPanel.SetActive(true);
    }

    public void RestartGame()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
}`,
    editorSteps: [
      '1. Hierarchy > UI > Canvas. Set Canvas Scaler to "Scale With Screen Size" (1920 x 1080, Match: 0.5).',
      '2. Add TopBar Panel anchored to Top-Stretch (Height: 80). Add TMP text elements for Coins, Lives, Waves.',
      '3. Add BottomBar Panel anchored to Bottom-Center with 3 tower buttons (Archer, Cannon, Ice).',
      '4. Add GameOver and Win modal panels, initially deactivated (disabled checkbox in Inspector).',
      '5. Wire button `OnClick()` events to `UIManager.RestartGame()`, `OnUpgradeClicked()`, etc.'
    ],
    tips: [
      'Setting Canvas Scaler to "Scale With Screen Size" prevents UI from collapsing or overflowing on phones and tablets.',
      'Always reset `Time.timeScale = 1f` inside `RestartGame()` so the restarted game is never stuck paused.'
    ]
  },
  {
    id: 10,
    title: 'Enemy Health Bars (World Space Billboards)',
    category: 'UI & Audio',
    prompt: `Add a world-space health bar above each enemy in Unity. It should face the camera and change color from green to red as health drops. My Enemy script has a \`health\` variable and a \`TakeDamage(float)\` method. Give the full script and setup steps.`,
    summary: 'Camera-facing billboard health bar with normalized fill slider and dynamic green-to-red color gradient.',
    codeFilename: 'HealthBar.cs',
    csharpCode: `using UnityEngine;
using UnityEngine.UI;

public class HealthBar : MonoBehaviour
{
    public Slider slider;
    public Gradient gradient;
    public Image fill;

    private Camera cam;

    void Start()
    {
        cam = Camera.main;
    }

    public void SetMaxHealth(float health)
    {
        slider.maxValue = health;
        slider.value = health;
        fill.color = gradient.Evaluate(1f);
    }

    public void SetHealth(float health)
    {
        slider.value = health;
        // Evaluate gradient based on health fraction (0 to 1)
        fill.color = gradient.Evaluate(slider.normalizedValue);
    }

    void LateUpdate()
    {
        // Billboard: Always orient toward the camera
        if (cam != null)
        {
            transform.LookAt(transform.position + cam.transform.forward);
        }
    }
}`,
    editorSteps: [
      '1. On your Enemy Prefab, right-click > UI > Canvas. Set Render Mode to "World Space".',
      '2. Scale Canvas to (0.015, 0.015, 0.015) and position it at (0, 2.2, 0) above the enemy.',
      '3. Inside Canvas, right-click > UI > Slider. Remove "Handle Slide Area" child.',
      '4. In Gradient field, set left key to Red (0%) and right key to Green (100%).',
      '5. Hook `Enemy.TakeDamage` to call `healthBar.SetHealth(health)`.'
    ],
    tips: [
      'Using `cam.transform.forward` inside `LateUpdate` prevents health bars from appearing mirror-reversed when viewed from different angles.',
      'World-space canvases inherit enemy movement automatically when parented.'
    ]
  },
  {
    id: 11,
    title: 'Tower Targeting Modes (Nearest, First, Strongest)',
    category: 'Towers',
    prompt: `Extend my Unity Tower script with targeting modes: Nearest, First (furthest along the path), Strongest (highest health), and Weakest. Add a UI button to switch modes for the selected tower.`,
    summary: 'Advanced targeting algorithms allowing strategic prioritization (First along path, Strongest boss, Weakest cleanup, Nearest).',
    codeFilename: 'TargetingSystem.cs',
    csharpCode: `using UnityEngine;

public partial class Tower : MonoBehaviour
{
    public void CycleTargetingMode()
    {
        switch (targetingMode)
        {
            case TargetingMode.Nearest:
                targetingMode = TargetingMode.First;
                break;
            case TargetingMode.First:
                targetingMode = TargetingMode.Strongest;
                break;
            case TargetingMode.Strongest:
                targetingMode = TargetingMode.Weakest;
                break;
            case TargetingMode.Weakest:
                targetingMode = TargetingMode.Nearest;
                break;
        }
    }

    // Extended evaluation method
    GameObject EvaluateTarget(GameObject[] enemies)
    {
        GameObject bestEnemy = null;
        float bestMetric = 0f;

        foreach (GameObject enemyObj in enemies)
        {
            Enemy enemy = enemyObj.GetComponent<Enemy>();
            if (enemy == null || (!canTargetAir && enemy.isFlying)) continue;

            float dist = Vector3.Distance(transform.position, enemyObj.transform.position);
            if (dist > range) continue;

            switch (targetingMode)
            {
                case TargetingMode.Nearest:
                    // Minimize distance
                    if (bestEnemy == null || dist < bestMetric)
                    {
                        bestMetric = dist;
                        bestEnemy = enemyObj;
                    }
                    break;

                case TargetingMode.First:
                    // Maximize waypoint index + progress
                    EnemyMovement mov = enemyObj.GetComponent<EnemyMovement>();
                    float progress = mov != null ? mov.GetDistanceTraveled() : 0f;
                    if (progress > bestMetric)
                    {
                        bestMetric = progress;
                        bestEnemy = enemyObj;
                    }
                    break;

                case TargetingMode.Strongest:
                    // Maximize current health
                    if (enemy.health > bestMetric)
                    {
                        bestMetric = enemy.health;
                        bestEnemy = enemyObj;
                    }
                    break;

                case TargetingMode.Weakest:
                    // Minimize current health
                    if (bestEnemy == null || enemy.health < bestMetric)
                    {
                        bestMetric = enemy.health;
                        bestEnemy = enemyObj;
                    }
                    break;
            }
        }

        return bestEnemy;
    }
}`,
    editorSteps: [
      '1. In `EnemyMovement.cs`, add a float `distanceTraveled += dir.magnitude` to track path progress.',
      '2. In `NodeUI`, add a "Targeting: [Mode]" Button.',
      '3. OnClick, call `selectedTower.CycleTargetingMode()` and refresh button text.'
    ],
    tips: [
      '"First" targeting is crucial for preventing fast wolves from slipping through your defenses.',
      '"Strongest" targeting directs heavy cannons to tenderize ogres and bosses first.'
    ]
  },
  {
    id: 12,
    title: 'Flying, Armored & Healer Special Enemies',
    category: 'Enemies',
    prompt: `Write Unity C# scripts for: (1) a flying enemy that ignores waypoints and flies straight to the village, hit only by Archer and Ice towers; (2) an armored enemy that takes reduced cannon damage; (3) a healer enemy that heals nearby enemies every 2 seconds.`,
    summary: 'Scripts for all 3 special enemy classes that test player tower composition.',
    codeFilename: 'SpecialEnemies.cs',
    csharpCode: `using UnityEngine;

// 1. Flying Enemy - Straight line flight directly to destination
public class FlyingEnemyMovement : MonoBehaviour
{
    public Transform destination;
    public float flyAltitude = 4f;
    private Enemy enemy;

    void Start()
    {
        enemy = GetComponent<Enemy>();
        transform.position = new Vector3(transform.position.x, flyAltitude, transform.position.z);
        if (destination == null)
        {
            destination = GameObject.FindWithTag("VillageGate").transform;
        }
    }

    void Update()
    {
        if (destination == null) return;
        Vector3 targetPos = new Vector3(destination.position.x, flyAltitude, destination.position.z);
        transform.position = Vector3.MoveTowards(transform.position, targetPos, enemy.speed * Time.deltaTime);
        transform.LookAt(targetPos);

        if (Vector3.Distance(transform.position, targetPos) < 0.5f)
        {
            PlayerStats.Lives -= enemy.damageToVillage;
            WaveSpawner.EnemiesAlive--;
            Destroy(gameObject);
        }
    }
}

// 2. Healer Enemy - Periodic pulse healing
public class HealerEnemy : MonoBehaviour
{
    public float healRadius = 5f;
    public float healAmount = 25f;
    public float healInterval = 2f;
    public GameObject healAuraEffect;

    void Start()
    {
        InvokeRepeating(nameof(PulseHeal), healInterval, healInterval);
    }

    void PulseHeal()
    {
        Collider[] hits = Physics.OverlapSphere(transform.position, healRadius);
        foreach (Collider hit in hits)
        {
            if (hit.CompareTag("Enemy") && hit.gameObject != gameObject)
            {
                Enemy ally = hit.GetComponent<Enemy>();
                if (ally != null)
                {
                    ally.health = Mathf.Min(ally.startHealth, ally.health + healAmount);
                }
            }
        }

        if (healAuraEffect != null)
        {
            Instantiate(healAuraEffect, transform.position, Quaternion.identity);
        }
    }
}`,
    editorSteps: [
      '1. For Wyvern: attach `FlyingEnemyMovement.cs`, set `isFlying = true` on `Enemy.cs`.',
      '2. For Armored Knight: set `armorReduction = 0.5` on `Enemy.cs`.',
      '3. For Shaman: attach `HealerEnemy.cs` with `healRadius = 5` and a green particle prefab.'
    ],
    tips: [
      'Flying enemies enforce placing Archer towers near the center of the map.',
      'Healer shamans must be targeted with "Nearest" or single-target towers before they restore ogres to full health.'
    ]
  },
  {
    id: 13,
    title: 'Sound and Particle Effects',
    category: 'UI & Audio',
    prompt: `Add sound effects and particle effects to my Unity tower defense game: shooting, explosion, ice hit, coin pickup, wave start, and background music. Write a simple AudioManager script with a singleton and explain where to find free sounds and particle assets.`,
    summary: 'Centralized AudioManager singleton with pitch randomization and free asset references.',
    codeFilename: 'AudioManager.cs',
    csharpCode: `using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public static AudioManager instance;

    [Header("Audio Sources")]
    public AudioSource sfxSource;
    public AudioSource musicSource;

    [Header("Sound Clips")]
    public AudioClip arrowShootClip;
    public AudioClip cannonShootClip;
    public AudioClip explosionClip;
    public AudioClip iceFreezeClip;
    public AudioClip coinPickupClip;
    public AudioClip waveStartClip;
    public AudioClip victoryClip;
    public AudioClip gameOverClip;

    void Awake()
    {
        if (instance != null) { Destroy(gameObject); return; }
        instance = this;
        DontDestroyOnLoad(gameObject);
    }

    public void PlaySFX(AudioClip clip, float pitchVariation = 0.1f)
    {
        if (clip == null || sfxSource == null) return;
        sfxSource.pitch = 1f + Random.Range(-pitchVariation, pitchVariation);
        sfxSource.PlayOneShot(clip);
    }

    public void PlayArrowShoot() => PlaySFX(arrowShootClip);
    public void PlayCannonShoot() => PlaySFX(cannonShootClip);
    public void PlayExplosion() => PlaySFX(explosionClip);
    public void PlayIceFreeze() => PlaySFX(iceFreezeClip);
    public void PlayCoinPickup() => PlaySFX(coinPickupClip);
    public void PlayWaveStart() => PlaySFX(waveStartClip);
}`,
    editorSteps: [
      '1. Create an Empty GameObject named "AudioManager" with 2 AudioSource components (SFX and Music).',
      '2. Download free CC0 audio from Kenney.nl (Impact Sounds, RPG Audio) and freesound.org.',
      '3. Drag sound clips into the Inspector slots of `AudioManager.cs`.',
      '4. Call `AudioManager.instance.PlayArrowShoot()` inside `Tower.Shoot()`.'
    ],
    tips: [
      'Randomizing pitch by ±0.1 (`sfxSource.pitch = 1f + Random.Range(-0.1f, 0.1f)`) makes repeated shooting sounds 10x more satisfying without ear fatigue.'
    ]
  },
  {
    id: 14,
    title: 'Main Menu and Pause System',
    category: 'UI & Audio',
    prompt: `Create a main menu scene (Play, Settings, Quit) and a pause menu for my Unity tower defense game. Include a volume slider and a 2x fast-forward button using Time.timeScale. Give the scripts and Editor steps.`,
    summary: 'Full game pause, fast-forward 2x toggle, volume audio mixer binding, and scene transition logic.',
    codeFilename: 'PauseMenu.cs',
    csharpCode: `using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class PauseMenu : MonoBehaviour
{
    public GameObject pauseMenuUI;
    public Slider volumeSlider;
    private bool isPaused = false;
    private bool isFastForward = false;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            TogglePause();
        }
    }

    public void TogglePause()
    {
        isPaused = !isPaused;
        pauseMenuUI.SetActive(isPaused);
        Time.timeScale = isPaused ? 0f : (isFastForward ? 2f : 1f);
    }

    public void ToggleFastForward()
    {
        isFastForward = !isFastForward;
        if (!isPaused)
        {
            Time.timeScale = isFastForward ? 2f : 1f;
        }
    }

    public void SetVolume(float volume)
    {
        AudioListener.volume = volume;
    }

    public void LoadMainMenu()
    {
        Time.timeScale = 1f;
        SceneManager.LoadScene("MainMenu");
    }
}`,
    editorSteps: [
      '1. Create a PauseMenu Panel (dark transparent background). Set active = false.',
      '2. Add Resume, 2x Speed, Volume Slider, and Main Menu buttons.',
      '3. In Main Menu scene, add Play, Level Select, and Quit buttons.',
      '4. Add both scenes to File > Build Settings > "Scenes in Build".'
    ],
    tips: [
      'When using `Time.timeScale = 2f`, ensure all projectile and enemy movement multiplies by `Time.deltaTime` so physics scale properly.'
    ]
  },
  {
    id: 15,
    title: 'Multiple Levels and Saving (PlayerPrefs)',
    category: 'Architecture',
    prompt: `Add multiple levels to my Unity tower defense game with a level select screen, star ratings based on remaining lives, and saved progress using PlayerPrefs. Show how to load scenes and unlock the next level after winning.`,
    summary: 'Persistent level progression, 3-star rating algorithm based on remaining lives, and PlayerPrefs storage.',
    codeFilename: 'SaveSystem.cs',
    csharpCode: `using UnityEngine;

public static class SaveSystem
{
    public static void SaveLevelClear(int levelIndex, int livesRemaining, int maxLives)
    {
        // Calculate stars: 3 stars = 100% lives, 2 stars >= 50% lives, 1 star = survived
        int stars = 1;
        float ratio = (float)livesRemaining / maxLives;
        if (ratio >= 0.99f) stars = 3;
        else if (ratio >= 0.5f) stars = 2;

        // Store highest star rating
        int previousStars = PlayerPrefs.GetInt($"Level_{levelIndex}_Stars", 0);
        if (stars > previousStars)
        {
            PlayerPrefs.SetInt($"Level_{levelIndex}_Stars", stars);
        }

        // Unlock next level
        int reachedLevel = PlayerPrefs.GetInt("LevelReached", 1);
        if (levelIndex + 1 > reachedLevel)
        {
            PlayerPrefs.SetInt("LevelReached", levelIndex + 1);
        }

        PlayerPrefs.Save();
    }

    public static int GetStars(int levelIndex) => PlayerPrefs.GetInt($"Level_{levelIndex}_Stars", 0);
    public static int GetLevelReached() => PlayerPrefs.GetInt("LevelReached", 1);
}`,
    editorSteps: [
      '1. In Level Select scene, create 3-5 Level Buttons with star icons.',
      '2. Query `SaveSystem.GetLevelReached()` to set `button.interactable = levelNumber <= reachedLevel`.',
      '3. In `GameManager.WinLevel()`, call `SaveSystem.SaveLevelClear(currentLevel, PlayerStats.Lives, 20)`.'
    ],
    tips: [
      'Call `PlayerPrefs.Save()` explicitly to ensure data is written immediately to disk on Android and WebGL.'
    ]
  },
  {
    id: 16,
    title: 'Mobile Android Build & Optimization',
    category: 'Production',
    prompt: `Explain how to build my Unity tower defense game for Android: switching platform, package name, touch input fixes, resizing UI for different screen sizes, performance tips for low-end phones, and how to generate an AAB for Google Play.`,
    summary: 'Complete Android deployment checklist: target API, touch handling, AAB generation, and low-end mobile performance tips.',
    editorSteps: [
      '1. File > Build Settings > Select "Android" > Click "Switch Platform".',
      '2. Player Settings > Other Settings: Set Package Name: `com.YourStudio.VillageGuard`, Minimum API: Android 8.0 (API 26), Target: Latest (API 34+).',
      '3. Under Identification: Set "Scripting Backend" to IL2CPP and check "ARM64".',
      '4. Build Settings: Check "Build App Bundle (Google Play)" to export an .aab file instead of .apk.',
      '5. In Publishing Settings: Create a new Keystore with password and alias.',
      '6. Performance: Target 60 FPS in code via `Application.targetFrameRate = 60;` and set URP Render Scale to 0.85 on low-spec profiles.'
    ],
    tips: [
      'Google Play requires 64-bit support (ARM64) and Android App Bundle (.aab) format.',
      'Disable real-time dynamic shadows on low-tier mobile devices to double framerate.'
    ]
  },
  {
    id: 17,
    title: 'Game Balance & Economy',
    category: 'Architecture',
    prompt: `Here are my tower and enemy stats: [paste your numbers]. Analyze the balance. Tell me which tower is too strong or too weak, whether the waves ramp up fairly, and suggest new numbers for 10 waves.`,
    summary: 'DPS/Gold efficiency formulas, Time-to-Kill (TTK) modeling, and curve-based wave difficulty balancing.',
    editorSteps: [
      '1. Compute Tower Efficiency: DPS per gold = (Damage * FireRate) / Cost.',
      '2. Archer: (25 * 1.2) / 100 = 0.30 DPS/gold (Benchmark single target).',
      '3. Cannon: (70 * 0.5) / 140 = 0.25 DPS/gold (Deals up to 0.75+ against clusters).',
      '4. Ice: (15 * 0.8) / 125 = 0.10 DPS/gold (Utility multiplier doubles all other towers\' damage window).',
      '5. Ensure wave total enemy HP scales at 1.35x per wave while player gold income scales at 1.28x.'
    ],
    tips: [
      'If Cannon splash damage is too high, players build zero Archers. Keep Cannon slow so fast wolves easily bypass it.'
    ]
  },
  {
    id: 18,
    title: 'Debugging & Common Unity TD Gotchas',
    category: 'Production',
    prompt: `In my Unity tower defense game, [describe the problem]. Here is my script: [paste code]. Here is the console error: [paste error]. Explain the cause in simple words and give the fixed code.`,
    summary: 'The top 5 most common Unity Tower Defense bugs, root causes in plain English, and battle-tested fixes.',
    editorSteps: [
      'Bug 1 (NullReference on Projectile Hit): Target died to another tower mid-flight. Fix: Always check `if (target == null) { Destroy(gameObject); return; }` in Projectile.Update().',
      'Bug 2 (Clicking Shop Builds Towers Underneath): Touch event passed through UI. Fix: Add `if (EventSystem.current.IsPointerOverGameObject()) return;` inside Node.OnMouseDown().',
      'Bug 3 (Enemy Stops At Waypoint): Waypoint comparison `transform.position == target.position` fails due to floating point. Fix: Use `Vector3.Distance(transform.position, target.position) <= 0.2f`.',
      'Bug 4 (Wave Ends While Spawning): Enemies alive counter checked before spawn finished. Fix: Guard wave progression with `if (EnemiesAlive > 0 || isSpawning) return;`.',
      'Bug 5 (Enemies Moving Super Fast At 2x): Movement wasn\'t multiplied by Time.deltaTime. Fix: Always multiply speed by `Time.deltaTime`.'
    ],
    tips: [
      'Always check the Unity Console window (`Ctrl+Shift+C`) and double-click the error message to jump directly to the offending line.'
    ]
  },
  {
    id: 19,
    title: 'Art, Assets & Licensing',
    category: 'Production',
    prompt: `Suggest a low-poly medieval art style for my tower defense game and list free assets (Kenney.nl, Unity Asset Store, Mixamo, freesound.org) for the towers, enemies, village, trees, and UI. Tell me what to check in each asset's license before publishing.`,
    summary: 'Curated directory of free medieval assets, Mixamo animation pipeline, and commercial licensing guidelines.',
    editorSteps: [
      '1. 3D Models: Kenney Medieval Kit (CC0, free for commercial use, zero attribution required).',
      '2. Characters & Animations: Mixamo.com (Free Adobe account, export Goblin/Knight meshes with Walk/Run/Attack/Die FBX).',
      '3. Environments: Kenney Nature Kit (low-poly pine trees, cobblestone road tiles, rocks).',
      '4. Sound Effects: Freesound.org (Filter by "Creative Commons 0" to avoid copyright claims).',
      '5. UI Assets: Kenney UI Pack (medieval wood borders, fantasy icons).'
    ],
    tips: [
      'CC0: Public domain, safe for any game.',
      'CC-BY: Requires crediting the author in your game credits screen.',
      'Never use assets marked CC-NC (Non-Commercial) in a commercial game release.'
    ]
  },
  {
    id: 20,
    title: 'Game Polish (10 Juice Techniques)',
    category: 'Production',
    prompt: `Review my Unity tower defense game design: [describe what you have]. Suggest 10 improvements that would make it more fun and polished, ordered from easiest to hardest to implement.`,
    summary: '10 game-feel enhancements ("juice") ranked by effort: screen shake, damage numbers, audio pitch shifts, ragdolls, and path telegraphing.',
    editorSteps: [
      '1. Sound Pitch Variation (5 mins): Randomize audio pitch by ±0.1 on every shot.',
      '2. Tower Placement Dust (10 mins): Spawn a small smoke puff particle when placing towers.',
      '3. Screen Shake on Explosions (15 mins): Add subtle camera shake on cannon impact.',
      '4. Floating Damage Text (30 mins): Spawn rising text numbers on critical hits or kills.',
      '5. Enemy Hit Flash (30 mins): Tint enemy material white for 0.05 seconds when taking damage.',
      '6. Tower Recoil Animation (45 mins): Kick cannon barrel backward and lerp forward on shoot.',
      '7. Dynamic Range Circle (1 hr): Project a glowing circle on ground when hovering a node.',
      '8. Fast-Forward 2x Button (1 hr): Implement smooth `Time.timeScale` speed switching.',
      '9. Waypoint Dot Trail (1.5 hrs): Animate glowing dots along the path showing the road direction.',
      '10. Ragdoll Physics on Death (2 hrs): Enable active ragdoll joints on defeated ogres.'
    ],
    tips: [
      'Game polish is what transforms a student prototype into a hit game on Steam and Google Play!'
    ]
  }
];
