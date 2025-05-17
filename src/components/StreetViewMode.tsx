
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GridItem } from '@/utils/environmental';
import { Building } from '@/utils/buildings';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TimeOfDay, TIME_SETTINGS } from '@/utils/dayNightCycle';

// Import refactored components
import { setupScene, createBoundaryWalls } from './streetview/SceneSetup';
import { addBuildingToScene } from './streetview/BuildingRenderer';
import { addEnvironmentalDetails } from './streetview/EnvironmentalDetails';
import { createCharacter, updateCharacterPosition } from './streetview/CharacterController';
import CityMiniMap from './streetview/CityMiniMap';
import StreetViewTutorial from './streetview/StreetViewTutorial';
import StreetViewControls from './streetview/StreetViewControls';
import PositionIndicator from './streetview/PositionIndicator';

interface StreetViewModeProps {
  grid: GridItem[][];
  currentTime: TimeOfDay;
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

const StreetViewMode: React.FC<StreetViewModeProps> = ({
  grid,
  currentTime,
  isOpen,
  onClose,
  initialPosition = { x: 10, y: 10 }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialPosition.x, y: initialPosition.y, height: 0 });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const collisionMeshesRef = useRef<THREE.Mesh[]>([]);
  const isMovingRef = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    rightMouseDown: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    rightMouseDown: false
  });
  const clockRef = useRef(new THREE.Clock());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioListenerRef = useRef<THREE.AudioListener | null>(null);
  const footstepsAudioRef = useRef<THREE.Audio | null>(null);
  const audioLoaderRef = useRef<THREE.AudioLoader | null>(null);
  const firstPersonModeRef = useRef<boolean>(true);
  const lastTimeUpdateRef = useRef<number>(0);
  const rendererNeedsUpdateRef = useRef<boolean>(true);
  const animationFrameIdRef = useRef<number | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const initAttemptRef = useRef<number>(0);
  
  // Movement vectors and rotation state
  const pitchObject = useRef(new THREE.Object3D());
  const yawObject = useRef(new THREE.Object3D());
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const pitchLimitRef = useRef({min: -Math.PI/2 * 0.95, max: Math.PI/2 * 0.95}); // Limit to about ±85°
  
  // Sound effects and tutorial state
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // Performance optimization
  const fpsLimit = 60;
  const fpsInterval = 1000 / fpsLimit;

  useEffect(() => {
    if (isOpen && initialPosition) {
      // Update position when initialPosition changes
      setPosition({ x: initialPosition.x, y: initialPosition.y, height: 0 });
      setIsTransitioning(true);
      setShowTutorial(true);
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
        setTimeout(() => {
          setShowTutorial(false);
        }, 5000);
      }, 1500);

      // Reset any previous error state
      setRenderError(null);
    }
  }, [isOpen, initialPosition]);

  useEffect(() => {
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      const timeSettings = TIME_SETTINGS[currentTime];
      
      // Update background color
      sceneRef.current.background = new THREE.Color(timeSettings.skyColor);
      sceneRef.current.fog = new THREE.Fog(timeSettings.skyColor, 10, 30);
      
      // Mark that renderer needs update
      rendererNeedsUpdateRef.current = true;
    }
  }, [currentTime]);

  // Main scene initialization effect
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    
    // Increase the attempt counter to track initialization attempts
    initAttemptRef.current += 1;
    console.log(`Initializing Street View (attempt ${initAttemptRef.current})`);

    try {
      // Initialize Three.js scene with error handling
      const { scene, camera, renderer, boundaryWalls } = setupScene({
        width: containerRef.current.clientWidth || 800,
        height: containerRef.current.clientHeight || 600,
        currentTime
      });
      
      // Use lower resolution for better performance
      renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
      
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      containerRef.current.appendChild(renderer.domElement);
      
      // Add boundary walls to collision meshes
      collisionMeshesRef.current = [...boundaryWalls];
      
      // Setup camera position and rotation objects
      // Position character and camera at ground level (y=0)
      const eyeLevel = 0.95;
      camera.position.set(position.x - 9.5, eyeLevel, position.y - 9.5);
      yawObject.current.position.set(position.x - 9.5, eyeLevel, position.y - 9.5);
      pitchObject.current.rotation.x = 0;
      yawObject.current.rotation.y = 0;
      
      // Setup yaw and pitch objects for full 360° rotation
      yawObject.current.add(pitchObject.current);
      pitchObject.current.add(camera);
      scene.add(yawObject.current);

      // Initialize controls for mouse movement tracking
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI - 0.1;
      controls.minPolarAngle = 0.1;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enabled = false; // Disable by default, we'll use custom right-click rotation
      controlsRef.current = controls;

      // Audio setup
      const audioListener = new THREE.AudioListener();
      camera.add(audioListener);
      audioListenerRef.current = audioListener;
      
      const footstepsAudio = new THREE.Audio(audioListener);
      footstepsAudioRef.current = footstepsAudio;
      scene.add(footstepsAudio);
      
      const audioLoader = new THREE.AudioLoader();
      audioLoaderRef.current = audioLoader;

      // Create character (hidden in first person but used for collision detection)
      const character = createCharacter(scene);
      characterRef.current = character;
      
      // Position character at the starting point - ENSURE ground level (y=0)
      character.position.set(position.x - 9.5, 0, position.y - 9.5);
      
      // Build the city from the grid data
      buildCity(scene, grid);

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        
        rendererRef.current.setSize(width, height);
        rendererNeedsUpdateRef.current = true;
      };

      window.addEventListener('resize', handleResize);

      // Right-click handling for camera rotation (Roblox-style)
      const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 2) { // Right mouse button
          isMovingRef.current.rightMouseDown = true;
          if (containerRef.current) {
            containerRef.current.style.cursor = 'grabbing';
          }
        }
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 2) { // Right mouse button
          isMovingRef.current.rightMouseDown = false;
          if (containerRef.current) {
            containerRef.current.style.cursor = 'grab';
          }
        }
      };

      // Mouse movement handler for camera rotation - ALLOW full 360° rotation
      const mouseSensitivity = 0.002; // Adjust sensitivity as needed
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isMovingRef.current.rightMouseDown || !yawObject.current || !pitchObject.current) return;
        
        const movementX = e.movementX || (e as any).mozMovementX || (e as any).webkitMovementX || 0;
        const movementY = e.movementY || (e as any).mozMovementY || (e as any).webkitMovementY || 0;
        
        // Apply yaw rotation (left-right) - allowing full 360° rotation
        yawObject.current.rotation.y -= movementX * mouseSensitivity;
        
        // Apply pitch rotation (up-down) with limits to prevent flipping
        const newPitchAngle = pitchObject.current.rotation.x - movementY * mouseSensitivity;
        pitchObject.current.rotation.x = Math.max(
          pitchLimitRef.current.min, 
          Math.min(pitchLimitRef.current.max, newPitchAngle)
        );
        
        // Mark that renderer needs update
        rendererNeedsUpdateRef.current = true;
      };

      // Add mouse event listeners
      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      // Set up keyboard controls with better responsiveness
      const handleKeyDown = (e: KeyboardEvent) => {
        let needsUpdate = false;
        switch (e.code) {
          case 'KeyW':
            isMovingRef.current.forward = true;
            needsUpdate = true;
            break;
          case 'KeyS':
            isMovingRef.current.backward = true;
            needsUpdate = true;
            break;
          case 'KeyA':
            isMovingRef.current.left = true;
            needsUpdate = true;
            break;
          case 'KeyD':
            isMovingRef.current.right = true;
            needsUpdate = true;
            break;
          case 'KeyV':
            // Toggle between first person and third person views
            toggleViewMode();
            needsUpdate = true;
            break;
          case 'KeyM':
            // Toggle sound
            setIsSoundEnabled(prev => !prev);
            break;
          case 'Escape':
            // Exit and close dialog
            onClose();
            break;
        }
        
        if (needsUpdate) {
          rendererNeedsUpdateRef.current = true;
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        let needsUpdate = false;
        switch (e.code) {
          case 'KeyW':
            isMovingRef.current.forward = false;
            needsUpdate = true;
            break;
          case 'KeyS':
            isMovingRef.current.backward = false;
            needsUpdate = true;
            break;
          case 'KeyA':
            isMovingRef.current.left = false;
            needsUpdate = true;
            break;
          case 'KeyD':
            isMovingRef.current.right = false;
            needsUpdate = true;
            break;
        }
        
        if (needsUpdate) {
          rendererNeedsUpdateRef.current = true;
        }
      };

      // Toggle between first-person and third-person views
      const toggleViewMode = () => {
        if (!characterRef.current) return;
        
        firstPersonModeRef.current = !firstPersonModeRef.current;
        characterRef.current.visible = !firstPersonModeRef.current;
        rendererNeedsUpdateRef.current = true;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Disable right-click menu to allow for right mouse button controls
      const handleContextMenu = (e: Event) => {
        e.preventDefault();
      };
      
      containerRef.current.addEventListener('contextmenu', handleContextMenu);

      // Animation loop with performance optimization
      clockRef.current.start();
      let lastFrameTime = 0;
      
      const animate = () => {
        if (!isOpen) return;
        
        animationFrameIdRef.current = requestAnimationFrame(animate);
        
        const now = performance.now();
        const elapsed = now - lastFrameTime;
        
        // Throttle FPS for better performance
        if (elapsed > fpsInterval) {
          // Get ready for next frame by setting lastFrameTime = now + any time adjustment
          lastFrameTime = now - (elapsed % fpsInterval);
          
          try {
            // Handle character movement with collision detection
            if (characterRef.current && yawObject.current) {
              updateCharacterPosition({
                characterRef,
                yawObject,
                isMovingRef,
                collisionMeshes: collisionMeshesRef.current,
                delta: clockRef.current.getDelta(),
                footstepsAudio: footstepsAudioRef.current,
                audioLoader: audioLoaderRef.current,
                isSoundEnabled,
                onPositionUpdate: (x, y) => {
                  setPosition(prev => {
                    if (prev.x !== x || prev.y !== y) {
                      rendererNeedsUpdateRef.current = true;
                      return { ...prev, x, y };
                    }
                    return prev;
                  });
                }
              });
            }
            
            // Only render if something has changed
            if (rendererNeedsUpdateRef.current) {
              if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
                rendererNeedsUpdateRef.current = false;
              }
            }
          } catch (error) {
            console.error("Error in animation loop:", error);
            setRenderError("An error occurred while rendering the scene. Please try again.");
          }
        }
      };
      
      // Start the animation loop
      animate();
      
      // Trigger an immediate render to prevent blank screen
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
        
        if (containerRef.current) {
          containerRef.current.removeEventListener('contextmenu', handleContextMenu);
        }
        
        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        
        if (audioListenerRef.current && cameraRef.current) {
          cameraRef.current.remove(audioListenerRef.current);
        }
        
        // Cancel animation frame
        if (animationFrameIdRef.current !== null) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        
        // Clean up scene resources
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
      };
    } catch (error) {
      console.error("Failed to initialize street view:", error);
      setRenderError(`Failed to initialize street view: ${error instanceof Error ? error.message : "Unknown error"}`);
      return () => {};
    }
  }, [isOpen, grid, currentTime, onClose, position.x, position.y]);

  const buildCity = (scene: THREE.Scene, grid: GridItem[][]) => {
    try {
      // Add buildings from the grid with improved performance
      grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell.building) {
            addBuildingToScene(cell.building, x, y, { 
              scene, 
              currentTime, 
              collisionMeshes: collisionMeshesRef.current 
            });
          }
        });
      });

      // Add environmental details for more realism
      addEnvironmentalDetails(grid, { 
        scene, 
        collisionMeshes: collisionMeshesRef.current, 
        currentTime 
      });
    } catch (error) {
      console.error("Error building city:", error);
      setRenderError("Failed to build the city visualization.");
    }
  };

  // Perform an initial render to prevent blank screen
  useEffect(() => {
    if (isOpen && sceneRef.current && cameraRef.current && rendererRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      console.log("Performed initial render");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Street View Mode</DialogTitle>
        <DialogDescription className="sr-only">
          Explore the city in 3D first-person view. Use W to move forward, S to move backward, and hold right-click to look around.
        </DialogDescription>
        
        <div className="relative h-full w-full">
          <div 
            ref={containerRef} 
            className="h-full w-full cursor-grab active:cursor-grabbing"
            style={{ position: 'relative' }}
          />
          
          {renderError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white p-4 z-50">
              <div className="bg-red-900 p-4 rounded-lg max-w-md text-center">
                <h3 className="text-lg font-bold mb-2">Rendering Error</h3>
                <p>{renderError}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-white text-red-900 rounded font-medium"
                  onClick={() => {
                    setRenderError(null);
                    // Force re-render by toggling the dialog
                    onClose();
                    setTimeout(() => {
                      // This would require a small modification to the parent component
                      // to allow reopening after a brief delay
                      console.log("Attempting to reinitialize street view");
                    }, 500);
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          <StreetViewTutorial 
            isTransitioning={isTransitioning}
            showTutorial={showTutorial}
            position={position}
            onClose={() => setShowTutorial(false)}
          />
          
          <StreetViewControls onClose={onClose} />
          <PositionIndicator position={position} />
          <CityMiniMap grid={grid} position={position} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreetViewMode;
