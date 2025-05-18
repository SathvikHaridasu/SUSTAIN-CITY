import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { GridItem } from "@/utils/environmental";
import { TimeOfDay, TIME_SETTINGS } from "@/utils/dayNightCycle";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

// Import refactored components
import { setupScene } from "./streetview/SceneSetup";
import { addBuildingToScene } from "./streetview/BuildingRenderer";
import { addEnvironmentalDetails } from "./streetview/EnvironmentalDetails";
import {
  createCharacter,
  updateCharacterPosition,
} from "./streetview/CharacterController";
import CityMiniMap from "./streetview/CityMiniMap";
import StreetViewTutorial from "./streetview/StreetViewTutorial";
import StreetViewControls from "./streetview/StreetViewControls";
import PositionIndicator from "./streetview/PositionIndicator";

// Import the VR-style rotation function
import { applyVRStyleRotation } from "@/utils/threejsHelpers";

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
  initialPosition = { x: 10, y: 10 },
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vrButtonRef = useRef<HTMLElement | null>(null);
  const [position, setPosition] = useState({
    x: initialPosition.x,
    y: initialPosition.y,
    height: 0,
  });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const collisionMeshesRef = useRef<THREE.Mesh[]>([]);
  const isMovingRef = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    up: boolean;     // Add up movement state
    down: boolean;    // Add down movement state
    rightMouseDown: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,       // Initialize up movement
    down: false,      // Initialize down movement
    rightMouseDown: false,
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
  const sceneInitializedRef = useRef<boolean>(false);

  // VR-style movement and rotation state
  const pitchObject = useRef<THREE.Object3D>(new THREE.Object3D());
  const yawObject = useRef<THREE.Object3D>(new THREE.Object3D());
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const vrModeRef = useRef<boolean>(true);

  // Sound effects and tutorial state
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  // WebXR support
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isInVR, setIsInVR] = useState(false);

  // Performance optimization with adaptive frame rate targeting
  const fpsLimit = 60; // Target 60 FPS
  const fpsInterval = 1000 / fpsLimit;
  const lastFrameTimeRef = useRef<number>(0);
  const frameRateHistoryRef = useRef<number[]>([]);
  const adaptiveQualityRef = useRef<number>(1.0); // Quality modifier (1.0 = full quality)
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const currentFpsRef = useRef<number>(0);

  // Mouse sensitivity for VR-style look controls
  const mouseSensitivity = 0.002;

  // Memoized grid to prevent unnecessary rebuilds
  const memoizedGrid = useMemo(() => grid, [JSON.stringify(grid)]);

  useEffect(() => {
    // Check if WebXR is supported
    if ("xr" in navigator) {
      navigator.xr
        ?.isSessionSupported("immersive-vr")
        .then((supported) => {
          setIsVRSupported(supported);
          console.log("WebXR VR support:", supported);
        })
        .catch((err) => {
          console.error("Error checking WebXR support:", err);
          setIsVRSupported(false);
        });
    } else {
      console.log("WebXR not available in this browser");
      setIsVRSupported(false);
    }
  }, []);

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

  // PointerLock API functions for VR-style controls
  const requestPointerLock = () => {
    if (!containerRef.current || isInVR) return;

    const element = containerRef.current;

    element.requestPointerLock =
      element.requestPointerLock ||
      (element as any).mozRequestPointerLock ||
      (element as any).webkitRequestPointerLock;

    if (element.requestPointerLock) {
      element.requestPointerLock();
    }
  };

  const exitPointerLock = () => {
    if (isInVR) return; // Don't exit pointer lock in VR mode

    document.exitPointerLock =
      document.exitPointerLock ||
      (document as any).mozExitPointerLock ||
      (document as any).webkitExitPointerLock;

    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  };

  // Main scene initialization effect
  useEffect(() => {
    if (!isOpen || !containerRef.current || sceneInitializedRef.current) return;

    console.log(
      "Initializing Street View scene with VR-style controls and WebXR support"
    );

    // Increase the attempt counter to track initialization attempts
    initAttemptRef.current += 1;
    console.log(
      `Initializing Sustain City Street View (attempt ${initAttemptRef.current})`
    );

    try {
      // Initialize Three.js scene with error handling
      const {
        scene,
        camera,
        renderer,
        boundaryWalls,
        pitchObject: pitch,
        yawObject: yaw,
      } = setupScene({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        currentTime,
      });

      // Enable WebXR support
      if (renderer.xr) {
        renderer.xr.enabled = true;

        // Add VR button but keep a reference to remove it later
        if (isVRSupported) {
          const vrButton = VRButton.createButton(renderer);
          vrButton.style.position = "absolute";
          vrButton.style.bottom = "20px";
          vrButton.style.left = "50%";
          vrButton.style.transform = "translateX(-50%)";
          vrButton.style.zIndex = "100";
          vrButton.style.display = "none"; // We'll manage showing it through our own UI
          document.body.appendChild(vrButton);
          vrButtonRef.current = vrButton;

          // Listen for session start/end
          renderer.xr.addEventListener("sessionstart", () => {
            console.log("WebXR session started");
            setIsInVR(true);

            // Position the camera properly in VR mode
            if (characterRef.current) {
              const position = characterRef.current.position;
              camera.position.set(position.x, 1.6, position.z); // Set eye height for VR
            }
          });

          renderer.xr.addEventListener("sessionend", () => {
            console.log("WebXR session ended");
            setIsInVR(false);
          });
        }
      }

      // Set references to track objects
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      pitchObject.current = pitch;
      yawObject.current = yaw;

      // Add renderer to DOM
      containerRef.current.appendChild(renderer.domElement);

      // Add boundary walls for collision detection
      boundaryWalls.forEach((wall) => scene.add(wall));
      collisionMeshesRef.current = [...boundaryWalls];

      // Position character and camera at ground level initially
      const eyeLevel = 0.95;
      yawObject.current.position.set(
        position.x - 9.5,
        eyeLevel,
        position.y - 9.5
      );
      scene.add(yawObject.current);

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

      // Use memoized grid to prevent unnecessary rebuilds
      buildCity(scene, memoizedGrid);

      // Handle window resize with debounce for improved performance
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (
            !containerRef.current ||
            !cameraRef.current ||
            !rendererRef.current
          )
            return;

          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;

          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();

          rendererRef.current.setSize(width, height, false); // false to improve performance
          rendererNeedsUpdateRef.current = true;
        }, 250); // Wait 250ms after resize events stop
      };

      window.addEventListener("resize", handleResize);

      // VR-style mouse look controls
      const handleMouseMove = (e: MouseEvent) => {
        // Only apply VR-style rotation if pointer is locked or right mouse button is down
        // and not in VR mode
        if (
          !isInVR &&
          (isPointerLocked || isMovingRef.current.rightMouseDown)
        ) {
          const movementX =
            e.movementX ||
            (e as any).mozMovementX ||
            (e as any).webkitMovementX ||
            0;
          const movementY =
            e.movementY ||
            (e as any).mozMovementY ||
            (e as any).webkitMovementY ||
            0;

          if (pitchObject.current && yawObject.current) {
            // Apply VR-style rotation
            applyVRStyleRotation(
              pitchObject.current,
              yawObject.current,
              movementX,
              movementY,
              mouseSensitivity
            );
            rendererNeedsUpdateRef.current = true;
          }
        }
      };

      // Mouse button handlers
      const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 2 && !isInVR) {
          // Right mouse button
          isMovingRef.current.rightMouseDown = true;
          if (containerRef.current) {
            containerRef.current.style.cursor = "grabbing";
          }
        } else if (e.button === 0 && !isInVR) {
          // Left mouse button
          // Request pointer lock for VR-style look
          requestPointerLock();
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 2 && !isInVR) {
          // Right mouse button
          isMovingRef.current.rightMouseDown = false;
          if (containerRef.current) {
            containerRef.current.style.cursor = "grab";
          }
        }
      };

      // Handle pointer lock state changes
      const handlePointerLockChange = () => {
        if (isInVR) return; // Don't change pointer lock in VR mode

        setIsPointerLocked(
          document.pointerLockElement === containerRef.current ||
            (document as any).mozPointerLockElement === containerRef.current ||
            (document as any).webkitPointerLockElement === containerRef.current
        );
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("pointerlockchange", handlePointerLockChange);
      document.addEventListener(
        "mozpointerlockchange",
        handlePointerLockChange
      );
      document.addEventListener(
        "webkitpointerlockchange",
        handlePointerLockChange
      );

      // Set up keyboard controls with improved responsiveness
      const handleKeyDown = (e: KeyboardEvent) => {
        if (isInVR) return; // Don't handle keyboard in VR mode

        let needsUpdate = false;
        switch (e.code) {
          case "KeyW":
            isMovingRef.current.forward = true;
            needsUpdate = true;
            break;
          case "KeyS":
            isMovingRef.current.backward = true;
            needsUpdate = true;
            break;
          case "KeyA":
            isMovingRef.current.left = true;
            needsUpdate = true;
            break;
          case "KeyD":
            isMovingRef.current.right = true;
            needsUpdate = true;
            break;
          case "Space":
            isMovingRef.current.up = true;
            needsUpdate = true;
            break;
          case "ShiftLeft":
          case "ShiftRight":
            isMovingRef.current.down = true;
            needsUpdate = true;
            break;
          case "KeyV":
            // Toggle between first person and third person views
            toggleViewMode();
            needsUpdate = true;
            break;
          case "KeyM":
            // Toggle sound
            setIsSoundEnabled((prev) => !prev);
            break;
          case "KeyL":
            // Toggle pointer lock mode
            if (document.pointerLockElement) {
              exitPointerLock();
            } else {
              requestPointerLock();
            }
            break;
          case "Escape":
            // Exit and close street view
            onClose();
            break;
        }

        if (needsUpdate) {
          rendererNeedsUpdateRef.current = true;
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (isInVR) return; // Don't handle keyboard in VR mode

        let needsUpdate = false;
        switch (e.code) {
          case "KeyW":
            isMovingRef.current.forward = false;
            needsUpdate = true;
            break;
          case "KeyS":
            isMovingRef.current.backward = false;
            needsUpdate = true;
            break;
          case "KeyA":
            isMovingRef.current.left = false;
            needsUpdate = true;
            break;
          case "KeyD":
            isMovingRef.current.right = false;
            needsUpdate = true;
            break;
          case "Space":
            isMovingRef.current.up = false;
            needsUpdate = true;
            break;
          case "ShiftLeft":
          case "ShiftRight":
            isMovingRef.current.down = false;
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

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      // Disable right-click menu to allow for right mouse button controls
      const handleContextMenu = (e: Event) => {
        e.preventDefault();
      };

      containerRef.current.addEventListener("contextmenu", handleContextMenu);

      // Animation loop with improved performance optimizations
      clockRef.current.start();

      // Function to monitor performance and adjust quality settings
      const monitorPerformance = (frameTime: number) => {
        // Count frames for FPS calculation
        frameCountRef.current++;

        // Update FPS calculation every second
        const now = performance.now();
        if (now - lastFpsUpdateRef.current > 1000) {
          const elapsedSecs = (now - lastFpsUpdateRef.current) / 1000;
          currentFpsRef.current = frameCountRef.current / elapsedSecs;
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = now;

          // Adapt quality based on performance
          if (currentFpsRef.current < 40 && adaptiveQualityRef.current > 0.5) {
            adaptiveQualityRef.current = Math.max(
              0.5,
              adaptiveQualityRef.current - 0.1
            );
            if (rendererRef.current) {
              rendererRef.current.setPixelRatio(
                Math.min(
                  window.devicePixelRatio * adaptiveQualityRef.current,
                  1.5
                )
              );
            }
          } else if (
            currentFpsRef.current > 55 &&
            adaptiveQualityRef.current < 1.0
          ) {
            adaptiveQualityRef.current = Math.min(
              1.0,
              adaptiveQualityRef.current + 0.05
            );
            if (rendererRef.current) {
              rendererRef.current.setPixelRatio(
                Math.min(
                  window.devicePixelRatio * adaptiveQualityRef.current,
                  1.5
                )
              );
            }
          }
        }
      };

      const animate = (timestamp: number) => {
        if (!isOpen) return;

        // If using WebXR, let it handle the animation loop
        if (!isInVR) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        }

        // Throttle rendering for consistent performance
        const elapsed = timestamp - lastFrameTimeRef.current;

        // Cap to target FPS
        if (elapsed > fpsInterval || isInVR) {
          // Calculate time adjustment factor for consistent motion
          const frameCorrection = Math.min(elapsed / fpsInterval, 2.0); // Cap to avoid huge jumps

          // Update time tracking
          lastFrameTimeRef.current = timestamp - (elapsed % fpsInterval);

          try {
            // Handle character movement with collision detection
            if (
              characterRef.current &&
              yawObject.current &&
              pitchObject.current
            ) {
              const fixedDelta = (1 / 60) * frameCorrection;

              updateCharacterPosition({
                characterRef,
                yawObject,
                pitchObject,
                isMovingRef,
                collisionMeshes: collisionMeshesRef.current,
                delta: fixedDelta,
                footstepsAudio: footstepsAudioRef.current,
                audioLoader: audioLoaderRef.current,
                isSoundEnabled,
                onPositionUpdate: (x, y) => {
                  setPosition((prev) => {
                    if (prev.x !== x || prev.y !== y) {
                      rendererNeedsUpdateRef.current = true;
                      return { ...prev, x, y };
                    }
                    return prev;
                  });
                },
                isInVR,
              });
            }

            if (rendererNeedsUpdateRef.current || isInVR) {
              if (
                rendererRef.current &&
                sceneRef.current &&
                cameraRef.current
              ) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
                rendererNeedsUpdateRef.current = false;

                // Monitor performance
                if (!isInVR) {
                  // Skip performance monitoring in VR mode
                  monitorPerformance(elapsed);
                }
              }
            }
          } catch (error) {
            console.error("Error in animation loop:", error);
            setRenderError(
              "An error occurred while rendering the scene. Please try again."
            );
          }
        }
      };

      // Start the animation loop differently depending on VR mode
      lastFrameTimeRef.current = performance.now();
      lastFpsUpdateRef.current = performance.now();

      // For WebXR, we need to use setAnimationLoop instead of requestAnimationFrame
      if (renderer.xr) {
        renderer.setAnimationLoop(animate);
      } else {
        animate(lastFrameTimeRef.current);
      }

      sceneInitializedRef.current = true;

      // Trigger an immediate render to prevent blank screen
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // Cleanup function
      return () => {
        console.log("Cleaning up Street View scene");
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        document.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener(
          "pointerlockchange",
          handlePointerLockChange
        );
        document.removeEventListener(
          "mozpointerlockchange",
          handlePointerLockChange
        );
        document.removeEventListener(
          "webkitpointerlockchange",
          handlePointerLockChange
        );
        clearTimeout(resizeTimeout);

        if (containerRef.current) {
          containerRef.current.removeEventListener(
            "contextmenu",
            handleContextMenu
          );
        }

        if (rendererRef.current && containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
          renderer.setAnimationLoop(null); // Stop animation loop
        }

        if (audioListenerRef.current && cameraRef.current) {
          cameraRef.current.remove(audioListenerRef.current);
        }

        // Cancel animation frame
        if (animationFrameIdRef.current !== null) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }

        // Exit pointer lock if active
        if (document.pointerLockElement) {
          exitPointerLock();
        }

        // Remove VR button if exists
        if (vrButtonRef.current) {
          document.body.removeChild(vrButtonRef.current);
          vrButtonRef.current = null;
        }

        // Clean up scene resources
        if (sceneRef.current) {
          sceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              if (Array.isArray(object.material)) {
                object.material.forEach((material) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }

        sceneInitializedRef.current = false;
      };
    } catch (error) {
      console.error("Failed to initialize street view:", error);
      setRenderError(
        `Failed to initialize street view: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return () => {};
    }
  }, [
    isOpen,
    memoizedGrid,
    currentTime,
    onClose,
    isSoundEnabled,
    isPointerLocked,
    isVRSupported,
    isInVR,
  ]);

  const buildCity = (scene: THREE.Scene, grid: GridItem[][]) => {
    try {
      // Add buildings from the grid with improved performance
      grid.forEach((row, x) => {
        row.forEach((cell, y) => {
          if (cell.building) {
            addBuildingToScene(cell.building, x, y, {
              scene,
              currentTime,
              collisionMeshes: collisionMeshesRef.current,
            });
          }
        });
      });

      // Add environmental details for more realism
      addEnvironmentalDetails(grid, {
        scene,
        collisionMeshes: collisionMeshesRef.current,
        currentTime,
      });
    } catch (error) {
      console.error("Error building city:", error);
      setRenderError("Failed to build the city visualization.");
    }
  };

  // Function to enter VR mode with proper setup for Oculus Quest 2
  const handleEnterVR = () => {
    if (vrButtonRef.current) {
      console.log("Entering VR mode - click detected");

      // Ensure proper camera height for VR
      if (characterRef.current && yawObject.current) {
        // Set eye level for VR (approx. 1.6m standing height)
        yawObject.current.position.y = 1.6;

        // Ensure scene and camera are properly set for VR
        if (sceneRef.current && cameraRef.current) {
          // Make sure all content is visible in VR
          rendererNeedsUpdateRef.current = true;

          // Perform an immediate render before entering VR
          rendererRef.current?.render(sceneRef.current, cameraRef.current);
        }
      }

      // Click the WebXR VR button
      vrButtonRef.current.click();

      // Log VR entry for debugging
      console.log("WebXR VR entry requested");
    } else {
      console.error("VR button not available");
    }
  };

  // Perform an initial render to prevent blank screen
  useEffect(() => {
    if (
      isOpen &&
      sceneRef.current &&
      cameraRef.current &&
      rendererRef.current
    ) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      console.log("Performed initial Sustain City Street View render");

      // Force multiple renders during first few frames to ensure content displays
      let initialRenders = 0;
      const ensureRendered = () => {
        if (
          initialRenders < 5 &&
          rendererRef.current &&
          sceneRef.current &&
          cameraRef.current
        ) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          initialRenders++;
          requestAnimationFrame(ensureRendered);
        }
      };

      requestAnimationFrame(ensureRendered);
    }
  }, [isOpen]);

  // If not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        <div
          ref={containerRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          style={{ position: "relative" }}
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
                  sceneInitializedRef.current = false;
                  onClose();
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
          isVRSupported={isVRSupported}
        />

        <StreetViewControls
          onClose={onClose}
          onEnterVR={handleEnterVR}
          isVRSupported={isVRSupported}
        />

        {!isInVR && (
          <>
            <PositionIndicator position={position} />
            <CityMiniMap grid={grid} position={position} />
          </>
        )}

        {/* VR Mode Instructions */}
        {!isInVR && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-black/50 text-white text-sm rounded-md">
            <p>
              {isPointerLocked
                ? "VR Mode: Look around freely. WASD to move, Space/Shift for up/down. Press ESC to exit."
                : "Click in view to enable VR mode. WASD to move, Space/Shift for up/down, mouse to look."}
              {isVRSupported &&
                " Or use the Enter VR button to experience in Oculus Quest 2."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreetViewMode;
