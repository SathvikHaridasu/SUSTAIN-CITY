
import * as THREE from 'three';
import { TimeOfDay, TIME_SETTINGS } from '@/utils/dayNightCycle';

export interface SceneSetupOptions {
  width: number;
  height: number;
  currentTime: TimeOfDay;
}

export const setupScene = (options: SceneSetupOptions) => {
  const { width, height, currentTime } = options;
  
  // Initialize scene with appropriate background and fog
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TIME_SETTINGS[currentTime].skyColor);
  scene.fog = new THREE.Fog(TIME_SETTINGS[currentTime].skyColor, 10, 30);
  
  // Create perspective camera with optimized settings
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 40);
  
  // Create WebGL renderer with optimized settings
  const renderer = new THREE.WebGLRenderer({ 
    antialias: false, // Disable antialiasing for better performance
    powerPreference: 'high-performance',
    precision: 'mediump', // Use medium precision for better performance
  });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Performance optimizations
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
  renderer.setClearColor(TIME_SETTINGS[currentTime].skyColor);
  
  // Setup ground plane
  const ground = createGround();
  scene.add(ground);
  
  // Add lighting
  addLighting(scene, currentTime);
  
  // Add boundary walls
  const boundaryWalls = createBoundaryWalls();
  boundaryWalls.forEach(wall => scene.add(wall));
  
  return {
    scene,
    camera,
    renderer,
    boundaryWalls
  };
};

export const createGround = () => {
  // Use lower resolution for better performance
  const groundGeometry = new THREE.PlaneGeometry(40, 40, 20, 20);
  
  // Create a canvas-based ground texture
  const canvas = document.createElement('canvas');
  canvas.width = 256; // Reduced size for better performance
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#d2e0c8';
    ctx.fillRect(0, 0, 256, 256);
    
    // Add some texture variation
    ctx.fillStyle = '#c2d0b8';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 4 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // Add grid lines for roads
    ctx.strokeStyle = '#b2c0a8';
    ctx.lineWidth = 1;
    const gridSize = 256 / 20;
    
    for (let i = 0; i <= 20; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, 256);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(256, i * gridSize);
      ctx.stroke();
    }
  }
  
  const groundTexture = new THREE.CanvasTexture(canvas);
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(4, 4);
  
  const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.1,
  });
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  
  return ground;
};

export const addLighting = (scene: THREE.Scene, currentTime: TimeOfDay) => {
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    TIME_SETTINGS[currentTime].ambientLightIntensity
  );
  scene.add(ambientLight);

  // Add directional light (sun/moon) with shadows - optimized shadow settings
  const directionalLight = new THREE.DirectionalLight(
    TIME_SETTINGS[currentTime].directionalLightColor,
    TIME_SETTINGS[currentTime].directionalLightIntensity
  );
  directionalLight.position.set(15, 25, 15);
  directionalLight.castShadow = true;
  
  // Lower resolution for better performance
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  
  // Optimize shadow camera
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  directionalLight.shadow.bias = -0.0005; // Reduce shadow acne
  scene.add(directionalLight);
  
  // Add subtle hemisphere light for better ambient illumination
  const hemisphereLight = new THREE.HemisphereLight(
    TIME_SETTINGS[currentTime].skyColor, 
    0x444444, 
    0.2
  );
  scene.add(hemisphereLight);
};

export const createBoundaryWalls = () => {
  const walls: THREE.Mesh[] = [];
  // Use simpler geometry for invisible walls
  const wallGeometry = new THREE.BoxGeometry(40, 5, 1);
  const wallMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x888888,
    transparent: true,
    opacity: 0.0 // Invisible walls, just for collision
  });
  
  // North wall
  const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
  northWall.position.set(0, 2.5, -20.5);
  walls.push(northWall);
  
  // South wall
  const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
  southWall.position.set(0, 2.5, 20.5);
  walls.push(southWall);
  
  // East wall
  const eastWall = new THREE.Mesh(wallGeometry, wallMaterial);
  eastWall.rotation.y = Math.PI / 2;
  eastWall.position.set(20.5, 2.5, 0);
  walls.push(eastWall);
  
  // West wall
  const westWall = new THREE.Mesh(wallGeometry, wallMaterial);
  westWall.rotation.y = Math.PI / 2;
  westWall.position.set(-20.5, 2.5, 0);
  walls.push(westWall);
  
  return walls;
};
