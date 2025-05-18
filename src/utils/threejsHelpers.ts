
import * as THREE from 'three';

/**
 * Creates an optimized WebGLRenderer with appropriate settings
 */
export function createOptimizedRenderer(
  width: number,
  height: number,
  options: { antialias?: boolean; alpha?: boolean; xrCompatible?: boolean } = {}
): THREE.WebGLRenderer {
  // Create WebGL renderer with specified options
  const renderer = new THREE.WebGLRenderer({
    antialias: options.antialias || false,
    alpha: options.alpha || false,
    powerPreference: 'high-performance',
    precision: 'mediump',
    // Remove xrCompatible from the constructor parameters
  });
  
  // Initialize renderer with appropriate settings
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  
  // Use useLegacyLights (false) instead of physicallyCorrectLights (true) in v0.162+
  renderer.useLegacyLights = false;
  
  // Set color space to SRGB for correct color rendering
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  
  // Enable shadows but with performance optimizations
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // Only update shadows once for static scenes
  
  // Set xrCompatible after renderer creation if specified
  if (options.xrCompatible !== undefined) {
    renderer.xr.enabled = true;
    
    // Configure WebXR session parameters for Oculus Quest 2
    renderer.xr.setReferenceSpaceType('local-floor'); // Use local-floor for better room-scale tracking
    
    // Force renderer's WebGL context to be compatible with WebXR
    if (renderer.getContext()) {
      const gl = renderer.getContext();
      // Make the context xrCompatible explicitly
      if (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext) {
        // Add event listener to prevent context loss
        gl.canvas.addEventListener('webglcontextlost', (event) => {
          event.preventDefault();
          console.log('WebGL context lost. Trying to restore.');
        });
        
        // Ensure WebXR visibility
        renderer.domElement.style.display = 'block';
      }
    }
    
    // Set up animation loop for VR mode
    renderer.setAnimationLoop(function() {
      // This empty animation loop is necessary for WebXR to function correctly
      // It will be replaced by the proper rendering loop when VR mode is entered
    });
  }
  
  return renderer;
}

/**
 * Creates an ambient light with appropriate intensity for time of day
 */
export function createAmbientLight(
  color: THREE.ColorRepresentation = 0xffffff,
  intensity: number = 0.5
): THREE.AmbientLight {
  return new THREE.AmbientLight(color, intensity);
}

/**
 * Creates a directional light configured for shadows
 */
export function createDirectionalLight(
  color: THREE.ColorRepresentation = 0xffffff, 
  intensity: number = 1.0,
  position: THREE.Vector3 = new THREE.Vector3(15, 25, 15)
): THREE.DirectionalLight {
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.copy(position);
  light.castShadow = true;
  
  // Optimize shadow camera settings
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  light.shadow.camera.left = -20;
  light.shadow.camera.right = 20;
  light.shadow.camera.top = 20;
  light.shadow.camera.bottom = -20;
  light.shadow.bias = -0.0005;
  
  return light;
}

/**
 * Creates a hemisphere light for better ambient illumination
 */
export function createHemisphereLight(
  skyColor: THREE.ColorRepresentation = 0x6699ff,
  groundColor: THREE.ColorRepresentation = 0x444444,
  intensity: number = 0.5
): THREE.HemisphereLight {
  return new THREE.HemisphereLight(skyColor, groundColor, intensity);
}

/**
 * Creates a plane for ground with optimized settings
 */
export function createGroundPlane(
  width: number = 40,
  height: number = 40,
  segmentsW: number = 20,
  segmentsH: number = 20,
  color: THREE.ColorRepresentation = 0xd2e0c8
): THREE.Mesh {
  // Reduce segment count for better performance
  const geometry = new THREE.PlaneGeometry(width, height, 10, 10);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.1,
  });
  
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  
  return ground;
}

/**
 * Creates a simple box geometry for basic shapes
 */
export function createSimpleBox(
  width: number = 1,
  height: number = 1, 
  depth: number = 1,
  color: THREE.ColorRepresentation = 0xffffff
): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.8,
    metalness: 0.1,
  });
  
  const box = new THREE.Mesh(geometry, material);
  box.castShadow = true;
  box.receiveShadow = true;
  
  return box;
}

/**
 * Improves movement by checking multiple collision points
 */
export function checkCollision(
  position: THREE.Vector3,
  direction: THREE.Vector3,
  collisionMeshes: THREE.Mesh[],
  radius: number = 0.3
): boolean {
  if (collisionMeshes.length === 0) return false;
  
  // Create a raycaster for collision detection
  const raycaster = new THREE.Raycaster();
  
  // Check from multiple points around the character for better collision detection
  const angles = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
  
  for (const angle of angles) {
    // Calculate offset position for this angle
    const offsetX = Math.cos(angle) * radius;
    const offsetZ = Math.sin(angle) * radius;
    
    // Set raycaster position and direction
    raycaster.set(
      new THREE.Vector3(
        position.x + offsetX,
        position.y + 0.5, // Check at eye level
        position.z + offsetZ
      ),
      direction
    );
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(collisionMeshes);
    if (intersects.length > 0 && intersects[0].distance < radius) {
      return true; // Collision detected
    }
  }
  
  return false; // No collision
}

/**
 * Apply VR-style rotation to camera based on mouse movement
 * This enables free look in all directions
 */
export function applyVRStyleRotation(
  pitchObject: THREE.Object3D,
  yawObject: THREE.Object3D,
  movementX: number,
  movementY: number,
  mouseSensitivity: number = 0.002
): void {
  // Apply yaw (horizontal/left-right) rotation
  yawObject.rotation.y -= movementX * mouseSensitivity;
  
  // Apply pitch (vertical/up-down) rotation with constraints to prevent over-rotation
  const newPitchRotation = pitchObject.rotation.x - movementY * mouseSensitivity;
  
  // Limit pitch rotation to avoid flipping (between -85 and 85 degrees in radians)
  const maxPitch = Math.PI * 0.45; // ~85 degrees
  pitchObject.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, newPitchRotation));
}
