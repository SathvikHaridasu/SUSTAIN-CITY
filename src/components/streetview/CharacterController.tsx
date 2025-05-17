
import * as THREE from 'three';

export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  rightMouseDown: boolean;
}

export interface CharacterControllerProps {
  characterRef: React.MutableRefObject<THREE.Group | null>;
  yawObject: React.MutableRefObject<THREE.Object3D>;
  isMovingRef: React.MutableRefObject<MovementState>;
  collisionMeshes: THREE.Mesh[];
  delta: number;
  footstepsAudio: THREE.Audio | null;
  audioLoader: THREE.AudioLoader | null;
  isSoundEnabled: boolean;
  onPositionUpdate: (x: number, y: number) => void;
}

export const createCharacter = (scene: THREE.Scene) => {
  const character = new THREE.Group();
  
  // Create a much smaller, realistic human figure
  // Overall height reduced to 1.2 meters (much shorter than average human)
  
  // Head - smaller proportional to body
  const headGeometry = new THREE.SphereGeometry(0.035, 12, 12);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.95; // Lower head position for more realistic height
  head.castShadow = true;
  character.add(head);

  // Body - thinner and shorter for realism
  const bodyGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3366cc });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.8; // Lower body position
  body.castShadow = true;
  character.add(body);

  // Legs - thinner and proper length
  const legsGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
  const legsMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const legs = new THREE.Mesh(legsGeometry, legsMaterial);
  legs.position.y = 0.4; // Lower legs position to touch ground precisely
  legs.castShadow = true;
  character.add(legs);

  // Add a collision cylinder for character - slimmer to match new proportions
  const collisionGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 8);
  const collisionMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.0, // Invisible
    wireframe: false 
  });
  const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
  collisionMesh.position.y = 0.5; // Lower collision mesh to match new character height
  character.add(collisionMesh);
  
  character.visible = false; // Initially hidden in first-person mode
  
  // Set character's initial position to ground level with absolute precision
  character.position.y = 0;
  
  scene.add(character);
  
  return character;
};

export const updateCharacterPosition = (props: CharacterControllerProps) => {
  const { 
    characterRef, 
    yawObject, 
    isMovingRef, 
    collisionMeshes, 
    delta, 
    footstepsAudio, 
    audioLoader, 
    isSoundEnabled,
    onPositionUpdate
  } = props;
  
  if (!characterRef.current || !yawObject.current) return;
  
  const walkSpeed = 1.8 * delta; // Slightly slower, more realistic walking speed
  
  // Calculate movement vector based on camera direction
  const moveDirection = new THREE.Vector3(0, 0, 0);
  
  // Get camera's forward and right vectors for movement direction
  // Forward vector (z-axis)
  const cameraDirection = new THREE.Vector3(0, 0, -1);
  cameraDirection.applyQuaternion(yawObject.current.quaternion);
  cameraDirection.y = 0; // Keep movement on xz plane
  cameraDirection.normalize();
  
  // Right vector (x-axis) - perpendicular to forward vector
  const cameraRight = new THREE.Vector3(1, 0, 0);
  cameraRight.applyQuaternion(yawObject.current.quaternion);
  cameraRight.y = 0; // Keep movement on xz plane
  cameraRight.normalize();
  
  // Apply movement inputs
  if (isMovingRef.current.forward) {
    moveDirection.add(cameraDirection);
  }
  if (isMovingRef.current.backward) {
    moveDirection.sub(cameraDirection);
  }
  if (isMovingRef.current.left) {
    moveDirection.sub(cameraRight);
  }
  if (isMovingRef.current.right) {
    moveDirection.add(cameraRight);
  }
  
  // Ensure character is always precisely on the ground - hard lock to ground level
  const groundLevel = 0;
  characterRef.current.position.y = groundLevel;
  
  // Normalize for diagonal movement (to prevent faster diagonal movement)
  if (moveDirection.lengthSq() > 0) {
    moveDirection.normalize();
    
    // Play footstep sounds when moving - only start if not already playing
    if (isSoundEnabled && footstepsAudio && audioLoader && !footstepsAudio.isPlaying) {
      audioLoader.load('/footsteps.mp3', function(buffer) {
        if (footstepsAudio) {
          footstepsAudio.setBuffer(buffer);
          footstepsAudio.setLoop(true);
          footstepsAudio.setVolume(0.3);
          footstepsAudio.play();
        }
      });
    }
    
    // Calculate potential new position
    const potentialX = characterRef.current.position.x + moveDirection.x * walkSpeed;
    const potentialZ = characterRef.current.position.z + moveDirection.z * walkSpeed;
    
    // Collision detection
    let collision = false;
    
    // Create a raycaster for collision detection
    const raycaster = new THREE.Raycaster();
    raycaster.set(
      new THREE.Vector3(characterRef.current.position.x, 0.5, characterRef.current.position.z),
      moveDirection
    );
    
    // Check for collisions with all collision meshes
    const intersects = raycaster.intersectObjects(collisionMeshes);
    if (intersects.length > 0 && intersects[0].distance < 0.3) {
      collision = true;
    }
    
    // Only move if there's no collision
    if (!collision) {
      // Update character position
      characterRef.current.position.x = potentialX;
      characterRef.current.position.z = potentialZ;
      
      // Update camera position - locked to eye level
      yawObject.current.position.x = potentialX;
      yawObject.current.position.z = potentialZ;
      
      // Adjusted eye level height for shorter character
      const eyeLevel = 0.95; // Lowered eye height to match smaller character
      yawObject.current.position.y = eyeLevel;
      
      // Update position state for external tracking
      onPositionUpdate(
        Math.round(potentialX + 9.5),
        Math.round(potentialZ + 9.5)
      );
    }
  } else {
    // Stop footstep sound when not moving
    if (footstepsAudio?.isPlaying) {
      footstepsAudio.stop();
    }
  }
};
