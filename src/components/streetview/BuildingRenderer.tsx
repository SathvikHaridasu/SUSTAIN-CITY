
import * as THREE from 'three';
import { Building } from '@/utils/buildings';
import { TimeOfDay, TIME_SETTINGS } from '@/utils/dayNightCycle';

export interface BuildingRenderOptions {
  scene: THREE.Scene;
  currentTime: TimeOfDay;
  collisionMeshes: THREE.Mesh[];
}

export const addBuildingToScene = (
  building: Building, 
  x: number, 
  y: number, 
  options: BuildingRenderOptions
) => {
  const { scene, currentTime, collisionMeshes } = options;
  let height = 0.5;
  
  // Determine building height based on category
  if (building.category === 'residential') {
    height = 1 * building.size.height;
  } else if (building.category === 'commercial') {
    height = 1.5 * building.size.height;
  } else if (building.category === 'industrial') {
    height = 1.2 * building.size.height;
  } else if (building.category === 'infrastructure') {
    height = 0.3 * building.size.height;
  } else if (building.category === 'entertainment' && 
             (building.id === 'park' || building.id === 'garden')) {
    height = 0.3 * building.size.height;
  } else if (building.category === 'educational' && building.id === 'farm') {
    height = 0.2 * building.size.height;
  }
  
  // Handle special building types
  if (building.category === 'residential' && building.id === 'residential-house') {
    renderResidentialHouse(building, x, y, height, scene, currentTime, collisionMeshes);
    return;
  } else if (building.category === 'infrastructure') {
    if (building.id === 'solar-farm') {
      renderSolarFarm(building, x, y, scene, collisionMeshes);
      return;
    } else if (building.id === 'road') {
      renderRoad(building, x, y, scene);
      return;
    }
  } else if ((building.category === 'entertainment' || building.category === 'healthcare') &&
            (building.id === 'park' || building.id === 'garden')) {
    renderPark(building, x, y, scene, collisionMeshes);
    return;
  } else if (building.category === 'educational' && building.id === 'farm') {
    renderFarm(building, x, y, scene, collisionMeshes);
    return;
  }
  
  // Handle standard building types
  renderStandardBuilding(building, x, y, height, scene, currentTime, collisionMeshes);
};

const renderResidentialHouse = (
  building: Building, 
  x: number, 
  y: number, 
  height: number, 
  scene: THREE.Scene, 
  currentTime: TimeOfDay,
  collisionMeshes: THREE.Mesh[]
) => {
  const buildingGroup = new THREE.Group();
  
  // Base of the house
  const baseGeometry = new THREE.BoxGeometry(building.size.width, height * 0.7, building.size.depth);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xe3d8b5 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.y = height * 0.35;
  base.castShadow = true;
  base.receiveShadow = true;
  buildingGroup.add(base);
  
  // Roof of the house
  const roofGeometry = new THREE.ConeGeometry(building.size.width * 0.7, height * 0.5, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = height * 0.7 + height * 0.25;
  roof.rotation.y = Math.PI / 4; // Rotate to align with base
  roof.castShadow = true;
  buildingGroup.add(roof);
  
  // Door
  const doorGeometry = new THREE.PlaneGeometry(0.2, 0.4);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, height * 0.35, building.size.depth / 2 + 0.01);
  buildingGroup.add(door);
  
  // Windows
  const windowGeometry = new THREE.PlaneGeometry(0.15, 0.15);
  const windowMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaccee,
    emissive: TIME_SETTINGS[currentTime].buildingLightsOn ? 0x223344 : 0x000000,
  });
  
  // Front windows
  const frontWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow1.position.set(-0.25, height * 0.4, building.size.depth / 2 + 0.01);
  buildingGroup.add(frontWindow1);
  
  const frontWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  frontWindow2.position.set(0.25, height * 0.4, building.size.depth / 2 + 0.01);
  buildingGroup.add(frontWindow2);
  
  // Side windows
  const sideWindow1 = new THREE.Mesh(windowGeometry, windowMaterial);
  sideWindow1.position.set(building.size.width / 2 + 0.01, height * 0.4, 0);
  sideWindow1.rotation.y = Math.PI / 2;
  buildingGroup.add(sideWindow1);
  
  const sideWindow2 = new THREE.Mesh(windowGeometry, windowMaterial);
  sideWindow2.position.set(-building.size.width / 2 - 0.01, height * 0.4, 0);
  sideWindow2.rotation.y = Math.PI / 2;
  buildingGroup.add(sideWindow2);
  
  buildingGroup.position.set(
    x - 9.5,
    0,
    y - 9.5
  );
  
  scene.add(buildingGroup);
  
  // Add collision detection
  const collisionGeometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth);
  const collisionMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  const collision = new THREE.Mesh(collisionGeometry, collisionMaterial);
  collision.position.set(x - 9.5, height / 2, y - 9.5);
  scene.add(collision);
  collisionMeshes.push(collision);
};

const renderSolarFarm = (
  building: Building, 
  x: number, 
  y: number, 
  scene: THREE.Scene,
  collisionMeshes: THREE.Mesh[]
) => {
  const solarFarmGroup = new THREE.Group();
  
  // Ground base
  const baseGeometry = new THREE.PlaneGeometry(building.size.width, building.size.depth);
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x777777 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.rotation.x = -Math.PI / 2;
  base.receiveShadow = true;
  solarFarmGroup.add(base);
  
  // Solar panels
  const panelCount = Math.floor(building.size.width * building.size.depth / 0.5);
  const panelGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
  const panelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d6ac7, 
    metalness: 0.7,
    roughness: 0.3 
  });
  
  for (let i = 0; i < panelCount; i++) {
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    
    // Position panels in a grid pattern
    const cols = Math.floor(building.size.width / 0.5);
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    panel.position.set(
      col * 0.5 - building.size.width / 2 + 0.25,
      0.1,
      row * 0.5 - building.size.depth / 2 + 0.25
    );
    
    // Angle panels toward the sun
    panel.rotation.x = -Math.PI / 6;
    panel.castShadow = true;
    
    solarFarmGroup.add(panel);
  }
  
  solarFarmGroup.position.set(
    x - 9.5,
    0,
    y - 9.5
  );
  
  scene.add(solarFarmGroup);
};

const renderRoad = (building: Building, x: number, y: number, scene: THREE.Scene) => {
  const roadGroup = new THREE.Group();
  
  // Road surface
  const roadGeometry = new THREE.PlaneGeometry(building.size.width, building.size.depth);
  const roadMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4d4d4d,
    roughness: 0.9 
  });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02; // Slightly above ground to prevent z-fighting
  road.receiveShadow = true;
  roadGroup.add(road);
  
  // Road markings
  const markingsGeometry = new THREE.PlaneGeometry(building.size.width * 0.1, building.size.depth * 0.8);
  const markingsMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.7 
  });
  const markings = new THREE.Mesh(markingsGeometry, markingsMaterial);
  markings.rotation.x = -Math.PI / 2;
  markings.position.y = 0.025; // Slightly above road
  markings.receiveShadow = true;
  roadGroup.add(markings);
  
  roadGroup.position.set(
    x - 9.5,
    0,
    y - 9.5
  );
  
  scene.add(roadGroup);
};

const renderPark = (
  building: Building, 
  x: number, 
  y: number, 
  scene: THREE.Scene,
  collisionMeshes: THREE.Mesh[]
) => {
  const parkGroup = new THREE.Group();
  
  // Ground base
  const groundGeometry = new THREE.CircleGeometry(Math.max(building.size.width, building.size.depth) * 0.5, 16);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x77cc77,
    roughness: 0.9,
    metalness: 0 
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  parkGroup.add(ground);
  
  // Trees
  const treeCount = Math.floor(Math.random() * 4) + 3;
  
  for (let i = 0; i < treeCount; i++) {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 0.25;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(0.25, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e8b57,
      roughness: 0.8
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 0.55;
    leaves.castShadow = true;
    tree.add(leaves);
    
    // Position trees around the park
    const angle = (i / treeCount) * Math.PI * 2;
    const radius = Math.max(building.size.width, building.size.depth) * 0.4 * Math.random();
    tree.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
    
    parkGroup.add(tree);
  }
  
  parkGroup.position.set(
    x - 9.5,
    0,
    y - 9.5
  );
  
  scene.add(parkGroup);
};

const renderFarm = (
  building: Building, 
  x: number, 
  y: number, 
  scene: THREE.Scene,
  collisionMeshes: THREE.Mesh[]
) => {
  const farmGroup = new THREE.Group();
  
  // Field base
  const fieldGeometry = new THREE.PlaneGeometry(building.size.width, building.size.depth, 8, 8);
  
  // Create varied height for field
  for (let i = 0; i < fieldGeometry.attributes.position.count; i++) {
    const y = fieldGeometry.attributes.position.getY(i);
    if (y !== 0) {
      fieldGeometry.attributes.position.setY(i, y + Math.random() * 0.2);
    }
  }
  
  const fieldMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xbee093,
    roughness: 0.9,
    metalness: 0 
  });
  const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
  field.rotation.x = -Math.PI / 2;
  field.receiveShadow = true;
  farmGroup.add(field);
  
  // Add crop rows
  const rowCount = Math.floor(building.size.width);
  const plantPerRow = Math.floor(building.size.depth);
  
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < plantPerRow; col++) {
      if (Math.random() > 0.7) {
        const plantGeometry = new THREE.CylinderGeometry(0.05, 0, 0.2, 6);
        const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x4d7d33 });
        const plant = new THREE.Mesh(plantGeometry, plantMaterial);
        
        plant.position.set(
          row * (building.size.width / rowCount) - building.size.width / 2 + (building.size.width / rowCount) / 2,
          0.1,
          col * (building.size.depth / plantPerRow) - building.size.depth / 2 + (building.size.depth / plantPerRow) / 2
        );
        
        plant.castShadow = true;
        farmGroup.add(plant);
      }
    }
  }
  
  farmGroup.position.set(
    x - 9.5,
    0,
    y - 9.5
  );
  
  scene.add(farmGroup);
};

const renderStandardBuilding = (
  building: Building, 
  x: number, 
  y: number, 
  height: number, 
  scene: THREE.Scene, 
  currentTime: TimeOfDay,
  collisionMeshes: THREE.Mesh[]
) => {
  let geometry;
  
  // Create appropriate geometry based on building category
  if (building.category === 'residential') {
    const segments = Math.max(2, Math.floor(height));
    geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth, segments, segments, segments);
  } else if (building.category === 'commercial') {
    const segments = Math.max(3, Math.floor(height * 1.5));
    geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth, segments, segments, segments);
  } else if (building.category === 'industrial') {
    geometry = new THREE.BoxGeometry(building.size.width, height * 0.8, building.size.depth);
  } else {
    geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth);
  }
  
  // Set material properties based on building category
  let color = 0xffffff;
  let metalness = 0.1;
  let roughness = 0.7;
  
  // Assign colors based on building category
  if (building.category === 'residential') {
    color = building.id === 'residential-house' ? 0xe3d8b5 : 0xc9d6e2;
  } else if (building.category === 'commercial') {
    color = 0x90b8d4;
    metalness = 0.3;
    roughness = 0.5;
  } else if (building.category === 'industrial') {
    color = 0xa3a3a3;
    metalness = 0.4;
    roughness = 0.6;
  } else if (building.category === 'infrastructure') {
    if (building.id === 'solar-farm') {
      color = 0x2d6ac7;
      metalness = 0.7;
      roughness = 0.3;
    } else if (building.id === 'road') {
      color = 0x4d4d4d;
      roughness = 0.9;
    } else {
      color = 0x777777;
      roughness = 0.9;
    }
  } else if ((building.category === 'entertainment' || building.category === 'healthcare') && 
             (building.id === 'park' || building.id === 'garden')) {
    // Parks/gardens (previously 'greenspace')
    color = 0x77cc77;
    roughness = 0.9;
    metalness = 0;
  } else if (building.category === 'educational' && building.id === 'farm') {
    // Farms (previously 'agricultural')
    color = 0xbee093;
    roughness = 0.9;
    metalness = 0;
  }
  
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    flatShading: (building.category === 'entertainment' && building.id === 'park') || 
                (building.category === 'educational' && building.id === 'farm'),
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  if (building.category === 'educational' && building.id === 'farm') {
    mesh.rotation.x = -Math.PI / 2;
  }
  
  const centerX = x + (building.size.width / 2) - 0.5;
  const centerZ = y + (building.size.depth / 2) - 0.5;
  
  mesh.position.set(
    centerX - 9.5,
    height / 2,
    centerZ - 9.5
  );
  
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  scene.add(mesh);
  
  // Add windows for buildings
  if (building.category === 'residential' || building.category === 'commercial') {
    addWindowsToBuilding(scene, mesh, building, height, currentTime);
  }
  
  // Add special effects for certain buildings
  if (TIME_SETTINGS[currentTime].buildingLightsOn) {
    if (building.category === 'residential' || building.category === 'commercial') {
      const lightColor = building.category === 'residential' ? 0xffcc77 : 0xccddff;
      const lightIntensity = building.category === 'residential' ? 0.4 : 0.6;
      
      const buildingLight = new THREE.PointLight(lightColor, lightIntensity, 3);
      buildingLight.position.set(0, height / 2, 0);
      mesh.add(buildingLight);
    }
  }
  
  // Add collision detection for buildings (except roads)
  if (building.id !== 'road' && !(
    (building.category === 'entertainment' && 
      (building.id === 'park' || building.id === 'garden')))) {
    // Create a collision box slightly larger than the building
    const collisionGeometry = new THREE.BoxGeometry(
      building.size.width,
      height,
      building.size.depth
    );
    const collisionMaterial = new THREE.MeshBasicMaterial({ 
      transparent: true, 
      opacity: 0 // Invisible collision mesh
    });
    const collision = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collision.position.copy(mesh.position);
    collision.rotation.copy(mesh.rotation);
    scene.add(collision);
    
    // Add to collision detection array
    collisionMeshes.push(collision);
  }
};

const addWindowsToBuilding = (
  scene: THREE.Scene, 
  buildingMesh: THREE.Mesh, 
  building: Building, 
  height: number,
  currentTime: TimeOfDay
) => {
  if (building.category === 'residential' && building.id === 'apartment-building') {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffee,
      emissive: TIME_SETTINGS[currentTime].buildingLightsOn ? 0x223344 : 0x000000,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const windowSize = 0.1;
    const floors = Math.floor(height);
    const windowsPerSide = 3;
    
    for (let floor = 0; floor < floors; floor++) {
      for (let i = 0; i < windowsPerSide; i++) {
        const frontWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterial
        );
        frontWindow.position.set(
          -building.size.width/4 + i * (building.size.width/2) / (windowsPerSide-1),
          floor * (height/floors) + (height/floors/2) - height/2,
          building.size.depth/2 + 0.01
        );
        frontWindow.rotateY(Math.PI);
        buildingMesh.add(frontWindow);
        
        const backWindow = new THREE.Mesh(
          new THREE.PlaneGeometry(windowSize, windowSize),
          windowMaterial
        );
        backWindow.position.set(
          building.size.width/4 - i * (building.size.width/2) / (windowsPerSide-1),
          floor * (height/floors) + (height/floors/2) - height/2,
          -building.size.depth/2 - 0.01
        );
        buildingMesh.add(backWindow);
      }
    }
  } else if (building.category === 'commercial') {
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x8bade3,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    
    const glassPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(building.size.width * 0.95, height * 0.95),
      glassMaterial
    );
    glassPanel.position.set(0, 0, building.size.depth/2 + 0.01);
    buildingMesh.add(glassPanel);
    
    const glassPanel2 = glassPanel.clone();
    glassPanel2.rotation.y = Math.PI;
    glassPanel2.position.set(0, 0, -building.size.depth/2 - 0.01);
    buildingMesh.add(glassPanel2);
  }
};
