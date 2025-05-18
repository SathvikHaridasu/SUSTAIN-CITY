
import * as THREE from 'three';
import { TimeOfDay, TIME_SETTINGS } from '@/utils/dayNightCycle';
import { createOptimizedRenderer, createGroundPlane, createAmbientLight, createDirectionalLight, createHemisphereLight } from '@/utils/threejsHelpers';

export interface SceneSetupOptions {
  width: number;
  height: number;
  currentTime: TimeOfDay;
}

export const setupScene = (options: SceneSetupOptions) => {
  const { width, height, currentTime } = options;
  
  // Initialize scene with appropriate background and simplified fog
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(TIME_SETTINGS[currentTime].skyColor);
  scene.fog = new THREE.Fog(TIME_SETTINGS[currentTime].skyColor, 15, 35);
  
  // Create perspective camera with optimized settings for WebXR
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 40);
  camera.position.set(0, 1.6, 0); // Default eye height for VR mode (1.6m average eye height)
  camera.layers.enable(0); // Enable default layer
  
  // Create WebGL renderer with optimized settings using our helper
  const renderer = createOptimizedRenderer(width, height, {
    antialias: true, // Always enable antialiasing for VR
    xrCompatible: true // Important for WebXR compatibility
  });
  
  // Ensure proper WebXR configuration
  renderer.xr.enabled = true;
  
  // Setup ground plane using our helper
  const ground = createGroundPlane(40, 40, 10, 10); // Reduced ground segments
  scene.add(ground);
  
  // Add lighting
  addLighting(scene, currentTime);
  
  // Add boundary walls
  const boundaryWalls = createBoundaryWalls();
  boundaryWalls.forEach(wall => scene.add(wall));
  
  // Set up VR-style camera controls
  // Create camera rotation objects
  const pitchObject = new THREE.Object3D(); // For looking up and down
  const yawObject = new THREE.Object3D();   // For looking left and right
  
  // Position camera at eye level
  pitchObject.position.y = 1.6; // Eye level in meters - standard VR height
  yawObject.add(pitchObject);
  pitchObject.add(camera);
  
  return {
    scene,
    camera,
    renderer,
    boundaryWalls,
    pitchObject,
    yawObject
  };
};

export const createGround = () => {
  // Use significantly lower resolution for better performance
  const groundGeometry = new THREE.PlaneGeometry(40, 40, 10, 10);
  
  // Create a canvas-based ground texture with simpler patterns
  const canvas = document.createElement('canvas');
  canvas.width = 128; // Even smaller texture
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#d2e0c8';
    ctx.fillRect(0, 0, 128, 128);
    
    // Add some texture variation with fewer elements
    ctx.fillStyle = '#c2d0b8';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }
    
    // Simpler grid lines
    ctx.strokeStyle = '#b2c0a8';
    ctx.lineWidth = 1;
    const gridSize = 128 / 10; // Fewer grid lines
    
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, 128);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(128, i * gridSize);
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
  // Add ambient light using helper
  const ambientLight = createAmbientLight(
    0xffffff,
    TIME_SETTINGS[currentTime].ambientLightIntensity
  );
  scene.add(ambientLight);

  // Add directional light using helper
  const directionalLight = createDirectionalLight(
    TIME_SETTINGS[currentTime].directionalLightColor,
    TIME_SETTINGS[currentTime].directionalLightIntensity,
    new THREE.Vector3(15, 25, 15)
  );
  scene.add(directionalLight);
  
  // Add hemisphere light using helper
  const hemisphereLight = createHemisphereLight(
    TIME_SETTINGS[currentTime].skyColor, 
    0x444444, 
    0.2
  );
  scene.add(hemisphereLight);
};

export const createBoundaryWalls = () => {
  const walls: THREE.Mesh[] = [];
  // Use even simpler geometry for invisible walls
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
