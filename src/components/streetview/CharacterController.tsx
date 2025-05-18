
import * as THREE from 'three';
import { checkCollision } from '@/utils/threejsHelpers';

export interface MovementState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;    // New property for upward movement
  down: boolean;  // New property for downward movement
  rightMouseDown: boolean;
}

export interface CharacterControllerProps {
  characterRef: React.MutableRefObject<THREE.Group | null>;
  yawObject: React.MutableRefObject<THREE.Object3D>;
  pitchObject: React.MutableRefObject<THREE.Object3D>;
  isMovingRef: React.MutableRefObject<MovementState>;
  collisionMeshes: THREE.Mesh[];
  delta: number;
  footstepsAudio: THREE.Audio | null;
  audioLoader: THREE.AudioLoader | null;
  isSoundEnabled: boolean;
  onPositionUpdate: (x: number, y: number) => void;
  isInVR?: boolean;
}

export const createCharacter = (scene: THREE.Scene) => {
  const character = new THREE.Group();
  
  // Create a simple character for performance and visibility
  const headGeometry = new THREE.SphereGeometry(0.035, 8, 8);
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 0.95;
  head.castShadow = true;
  character.add(head);

  // Simplified body
  const bodyGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 6);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3366cc });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.8;
  body.castShadow = true;
  character.add(body);

  // Simplified legs
  const legsGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
  const legsMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const legs = new THREE.Mesh(legsGeometry, legsMaterial);
  legs.position.y = 0.4;
  legs.castShadow = true;
  character.add(legs);

  // Simplified collision cylinder
  const collisionGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 6);
  const collisionMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xff0000, 
    transparent: true, 
    opacity: 0.0
  });
  const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
  collisionMesh.position.y = 0.5;
  character.add(collisionMesh);
  
  // Initially hide the character (first person view by default)
  character.visible = false;
  character.position.y = 0;
  
  scene.add(character);
  
  return character;
};

export const updateCharacterPosition = (props: CharacterControllerProps) => {
  const { 
    characterRef, 
    yawObject,
    pitchObject,
    isMovingRef, 
    collisionMeshes, 
    delta, 
    footstepsAudio, 
    audioLoader, 
    isSoundEnabled,
    onPositionUpdate,
    isInVR = false
  } = props;
  
  if (!characterRef.current || !yawObject.current || !pitchObject.current) return;
  
  // Adjust speed for VR to make movement more comfortable
  const walkSpeed = (isInVR ? 2.2 : 1.8) * delta;
  const verticalSpeed = 1.5 * delta; // Speed for vertical movement
  
  // Calculate movement vector based on camera direction
  const moveDirection = new THREE.Vector3(0, 0, 0);
  
  // Get camera's forward and right vectors for movement direction
  // Forward vector (z-axis) - use combined yaw and pitch for true VR-style movement
  const cameraDirection = new THREE.Vector3(0, 0, -1);
  
  if (isInVR) {
    // In VR mode, get direction from the VR camera orientation
    // This ensures movement follows where you're looking in VR
    const vrCamera = yawObject.current.children[0] as THREE.Camera;
    vrCamera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Keep movement on the ground plane
    cameraDirection.normalize();
  } else {
    // Non-VR mode - standard behavior
    cameraDirection.applyQuaternion(yawObject.current.quaternion);
    
    // For free 360-degree movement, don't limit vertical component
    // This allows you to fly in the direction you're looking
    cameraDirection.normalize();
  }
  
  // Right vector (x-axis) - perpendicular to forward vector
  const cameraRight = new THREE.Vector3(1, 0, 0);
  cameraRight.applyQuaternion(yawObject.current.quaternion);
  cameraRight.normalize();
  
  // Apply movement inputs - in VR style, forward always means "where you're looking"
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
  
  // Apply vertical movement (Space and Shift keys)
  let verticalMovement = 0;
  if (isMovingRef.current.up) {
    verticalMovement += verticalSpeed;
  }
  if (isMovingRef.current.down) {
    verticalMovement -= verticalSpeed;
  }
  
  // Move if there's input direction
  if (moveDirection.lengthSq() > 0 || verticalMovement !== 0) {
    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
    
      // Play footstep sounds when moving horizontally
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
    }
    
    // Calculate potential new position
    const potentialX = characterRef.current.position.x + moveDirection.x * walkSpeed;
    const potentialY = characterRef.current.position.y + verticalMovement; // Apply vertical movement
    const potentialZ = characterRef.current.position.z + moveDirection.z * walkSpeed;
    
    // Use improved collision detection for horizontal movement
    const collision = moveDirection.lengthSq() > 0 ? checkCollision(
      characterRef.current.position,
      moveDirection,
      collisionMeshes,
      0.3 // Collision radius
    ) : false;
    
    // Only move horizontally if there's no collision
    if (!collision) {
      // Update character position
      characterRef.current.position.x = potentialX;
      characterRef.current.position.z = potentialZ;
      
      // Update camera position (x and z)
      yawObject.current.position.x = potentialX;
      yawObject.current.position.z = potentialZ;
    }
    
    // Update vertical position (with simple boundary checks)
    // Limit vertical movement to prevent going too high or too low
    const minHeight = 0.5;  // Minimum height (0.5 units above ground)
    const maxHeight = 20;   // Maximum height (20 units above ground)
    
    const newYPosition = Math.max(minHeight, Math.min(maxHeight, potentialY));
    characterRef.current.position.y = newYPosition;
    
    // In non-VR mode, also update camera's Y position
    if (!isInVR) {
      yawObject.current.position.y = newYPosition;
    }
      
    // Update position state for external tracking
    onPositionUpdate(
      Math.round(characterRef.current.position.x + 9.5),
      Math.round(characterRef.current.position.z + 9.5)
    );
  } else {
    // Stop footstep sound when not moving
    if (footstepsAudio?.isPlaying) {
      footstepsAudio.stop();
    }
  }
  
  // Rotate character to match camera direction
  if (characterRef.current.visible) {
    // Extract just the Y rotation (yaw) from the camera
    characterRef.current.rotation.y = yawObject.current.rotation.y;
  }
};
