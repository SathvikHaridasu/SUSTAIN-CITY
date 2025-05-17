import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Building, isValidPlacement } from '@/utils/buildings';
import { GridItem } from '@/utils/environmental';
import { TimeOfDay, TIME_SETTINGS } from '@/utils/dayNightCycle';
import { useToast } from '@/components/ui/use-toast';
import { PopulationState } from '@/utils/populationSimulation';
import { DisasterState } from '@/utils/naturalDisasters';
import { isUpgradedBuilding } from '@/utils/buildingUpgrades';
import PopulationAgents from './PopulationAgents';

interface CityGridProps {
  grid: GridItem[][];
  setGrid: React.Dispatch<React.SetStateAction<GridItem[][]>>;
  selectedBuilding: Building | null;
  onCellUpdate: () => void;
  currentTime: TimeOfDay;
  population: PopulationState;
  disasterState: DisasterState;
  onShowBuildingUpgrades?: (building: Building, location: { x: number; y: number }) => void;
  onEnterStreetView?: (location: { x: number; y: number }) => void; // New prop
}

const CityGrid: React.FC<CityGridProps> = ({ 
  grid,
  setGrid,
  selectedBuilding,
  onCellUpdate,
  currentTime,
  population,
  disasterState,
  onShowBuildingUpgrades,
  onEnterStreetView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const buildingMeshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const hoveredCellRef = useRef<{ x: number, y: number } | null>(null);
  const [highlightMesh, setHighlightMesh] = useState<THREE.Mesh | null>(null);
  const [rotationMesh, setRotationMesh] = useState<THREE.Mesh | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [selectedMesh, setSelectedMesh] = useState<THREE.Mesh | null>(null);
  const [buildingBeingPlaced, setBuildingBeingPlaced] = useState<Building | null>(null);
  const [buildingRotation, setBuildingRotation] = useState<number>(0);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const buildingLightsRef = useRef<{[key: string]: THREE.PointLight}>({});
  
  const { toast } = useToast();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(TIME_SETTINGS[currentTime].skyColor);
    scene.fog = new THREE.Fog(TIME_SETTINGS[currentTime].skyColor, 20, 40);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(10, 15, 15);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controlsRef.current = controls;

    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const groundGeometry = new THREE.PlaneGeometry(20, 20, 20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xd2e0c8,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const edgesGeometry = new THREE.EdgesGeometry(groundGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xbbbbbb });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.rotation.x = -Math.PI / 2;
    edges.position.y = 0.01;
    scene.add(edges);

    const ambientLight = new THREE.AmbientLight(
      0xffffff, 
      TIME_SETTINGS[currentTime].ambientLightIntensity
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const directionalLight = new THREE.DirectionalLight(
      TIME_SETTINGS[currentTime].directionalLightColor, 
      TIME_SETTINGS[currentTime].directionalLightIntensity
    );
    directionalLight.position.set(15, 25, 15);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const highlightGeo = new THREE.BoxGeometry(1, 0.1, 1);
    const highlightMat = new THREE.MeshBasicMaterial({ 
      color: 0x4a88f7, 
      transparent: true, 
      opacity: 0.3,
    });
    const highlight = new THREE.Mesh(highlightGeo, highlightMat);
    highlight.position.set(0, 0.05, 0);
    highlight.visible = false;
    scene.add(highlight);
    setHighlightMesh(highlight);

    const rotationGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
    const rotationMat = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.3,
    });
    const rotation = new THREE.Mesh(rotationGeo, rotationMat);
    rotation.position.set(0, 0.05, 0);
    rotation.visible = false;
    scene.add(rotation);
    setRotationMesh(rotation);

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [currentTime]);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    Object.values(buildingMeshesRef.current).forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    buildingMeshesRef.current = {};
    
    grid.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell.building) {
          addBuildingMesh(cell.building, x, y);
        }
      });
    });
  }, [grid, currentTime]);

  // Update the building being placed when selectedBuilding changes
  useEffect(() => {
    setBuildingBeingPlaced(selectedBuilding);
    if (selectedBuilding) {
      setBuildingRotation(0);
    }
  }, [selectedBuilding]);

  const addBuildingMesh = (building: Building, x: number, y: number) => {
    if (!sceneRef.current) return;
    
    let height = 0.5;
    
    if (building.category === 'residential') {
      height = 1 * building.size.height;
    } else if (building.category === 'commercial') {
      height = 1.5 * building.size.height;
    } else if (building.category === 'industrial') {
      height = 1.2 * building.size.height;
    } else if (building.category === 'infrastructure') {
      height = 0.3 * building.size.height;
    } else if (building.category === 'greenspace') {
      height = 0.3 * building.size.height;
    } else if (building.category === 'agricultural') {
      height = 0.2 * building.size.height;
    }
    
    let geometry;
    
    if (building.category === 'residential') {
      if (building.id === 'residential-house') {
        const baseGeometry = new THREE.BoxGeometry(building.size.width, height * 0.7, building.size.depth);
        const roofGeometry = new THREE.ConeGeometry(building.size.width * 0.7, height * 0.5, 4);
        
        geometry = baseGeometry;
      } else {
        const segments = Math.max(2, Math.floor(height));
        geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth, segments, segments, segments);
      }
    } else if (building.category === 'commercial') {
      const segments = Math.max(3, Math.floor(height * 1.5));
      geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth, segments, segments, segments);
    } else if (building.category === 'industrial') {
      const factoryGroup = new THREE.Group();
      const baseGeometry = new THREE.BoxGeometry(building.size.width, height * 0.8, building.size.depth);
      geometry = baseGeometry;
    } else if (building.category === 'infrastructure') {
      if (building.id === 'solar-farm') {
        geometry = new THREE.BoxGeometry(building.size.width, height * 0.1, building.size.depth);
      } else if (building.id === 'road') {
        geometry = new THREE.BoxGeometry(building.size.width, height * 0.1, building.size.depth);
      } else {
        geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth);
      }
    } else if (building.category === 'greenspace') {
      geometry = new THREE.SphereGeometry(
        Math.max(building.size.width, building.size.depth) * 0.6, 
        8, 
        6, 
        0, 
        Math.PI * 2, 
        0, 
        Math.PI / 2
      );
    } else if (building.category === 'agricultural') {
      const segments = Math.max(2, Math.floor(building.size.width * 2));
      geometry = new THREE.PlaneGeometry(building.size.width, building.size.depth, segments, segments);
      
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        const y = geometry.attributes.position.getY(i);
        if (y !== 0) {
          geometry.attributes.position.setY(i, y + Math.random() * 0.2);
        }
      }
    } else {
      geometry = new THREE.BoxGeometry(building.size.width, height, building.size.depth);
    }
    
    let color = 0xffffff;
    let metalness = 0.1;
    let roughness = 0.7;
    
    if (building.category === 'residential') {
      if (building.id === 'residential-house') {
        color = 0xe3d8b5;
      } else {
        color = 0xc9d6e2;
      }
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
    } else if (building.category === 'greenspace') {
      color = 0x77cc77;
      roughness = 0.9;
      metalness = 0;
    } else if (building.category === 'agricultural') {
      color = 0xbee093;
      roughness = 0.9;
      metalness = 0;
    }

    // Check for building upgrades and modify appearance
    if (isUpgradedBuilding(building) && building.upgrades.length > 0) {
      // Visual enhancements for upgraded buildings
      if (building.upgrades.includes('solar-panels')) {
        metalness = Math.max(0.4, metalness);
        // Blue tint for solar panels
        color = new THREE.Color(color).offsetHSL(0.6, 0.1, 0).getHex();
      }
      
      if (building.upgrades.includes('green-roof')) {
        // Green tint for green roofs
        color = new THREE.Color(color).offsetHSL(0.3, 0.15, 0).getHex();
      }
      
      if (building.upgrades.includes('water-recycling')) {
        // Cyan tint for water recycling
        color = new THREE.Color(color).offsetHSL(0.5, 0.1, 0).getHex();
      }
    }
    
    const material = new THREE.MeshStandardMaterial({ 
      color,
      roughness,
      metalness,
      flatShading: building.category === 'greenspace' || building.category === 'agricultural',
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    
    if (buildingRotation > 0) {
      mesh.rotation.y = buildingRotation * (Math.PI / 180);
    }
    
    if (building.category === 'agricultural') {
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
    
    if (building.category === 'residential' && building.id === 'apartment-building') {
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0x223344,
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
          mesh.add(frontWindow);
          
          const backWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(windowSize, windowSize),
            windowMaterial
          );
          backWindow.position.set(
            building.size.width/4 - i * (building.size.width/2) / (windowsPerSide-1), 
            floor * (height/floors) + (height/floors/2) - height/2, 
            -building.size.depth/2 - 0.01
          );
          mesh.add(backWindow);
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
      mesh.add(glassPanel);
      
      const glassPanel2 = glassPanel.clone();
      glassPanel2.rotation.y = Math.PI;
      glassPanel2.position.set(0, 0, -building.size.depth/2 - 0.01);
      mesh.add(glassPanel2);
    } else if (building.category === 'greenspace') {
      const treeCount = Math.floor(Math.random() * 4) + 3;
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9,
      });
      const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2e8b57,
        roughness: 0.8,
      });
      
      for (let i = 0; i < treeCount; i++) {
        const tree = new THREE.Group();
        
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.08, 0.5, 5),
          trunkMaterial
        );
        
        const leaves = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 6),
          leafMaterial
        );
        leaves.position.y = 0.3;
        
        tree.add(trunk);
        tree.add(leaves);
        
        tree.position.set(
          (Math.random() - 0.5) * building.size.width * 0.8,
          height * 0.2,
          (Math.random() - 0.5) * building.size.depth * 0.8
        );
        
        mesh.add(tree);
      }
    }

    // Add upgrade visual indicators
    if (isUpgradedBuilding(building) && building.upgrades.length > 0) {
      if (building.upgrades.includes('solar-panels')) {
        const solarPanelGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const solarPanelMaterial = new THREE.MeshStandardMaterial({
          color: 0x1e3799,
          metalness: 0.8,
          roughness: 0.2,
        });
        
        const solarPanel = new THREE.Mesh(solarPanelGeometry, solarPanelMaterial);
        solarPanel.position.y = height / 2 + 0.05;
        mesh.add(solarPanel);
      }
      
      if (building.upgrades.includes('green-roof')) {
        const greenRoofGeometry = new THREE.BoxGeometry(building.size.width * 0.8, 0.1, building.size.depth * 0.8);
        const greenRoofMaterial = new THREE.MeshStandardMaterial({
          color: 0x2ecc71,
          roughness: 0.9,
          metalness: 0.1,
        });
        
        const greenRoof = new THREE.Mesh(greenRoofGeometry, greenRoofMaterial);
        greenRoof.position.y = height / 2 + 0.05;
        mesh.add(greenRoof);
      }
      
      // Add upgrade indicator
      const upgradeIndicatorGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const upgradeIndicatorMaterial = new THREE.MeshBasicMaterial({
        color: 0x2ecc71,
        transparent: true,
        opacity: 0.8,
      });
      
      const upgradeIndicator = new THREE.Mesh(upgradeIndicatorGeometry, upgradeIndicatorMaterial);
      upgradeIndicator.position.set(0, height + 0.2, 0);
      mesh.add(upgradeIndicator);
      
      // Add pulsing animation to the indicator
      const pulseAnimation = () => {
        const time = Date.now() * 0.001;
        upgradeIndicator.scale.x = 1 + Math.sin(time * 3) * 0.2;
        upgradeIndicator.scale.y = 1 + Math.sin(time * 3) * 0.2;
        upgradeIndicator.scale.z = 1 + Math.sin(time * 3) * 0.2;
        
        requestAnimationFrame(pulseAnimation);
      };
      
      pulseAnimation();
    }
    
    sceneRef.current.add(mesh);
    
    const meshId = `${x}-${y}`;
    buildingMeshesRef.current[meshId] = mesh;
    
    mesh.scale.y = 0.01;
    const targetScale = 1;
    
    const animateBuilding = () => {
      if (mesh.scale.y < targetScale) {
        mesh.scale.y += 0.05;
        requestAnimationFrame(animateBuilding);
      } else {
        mesh.scale.y = targetScale;
      }
    };
    
    animateBuilding();
    
    // Add building lights based on building type
    if (TIME_SETTINGS[currentTime].buildingLightsOn) {
      if (building.category === 'residential' || building.category === 'commercial') {
        const lightColor = building.category === 'residential' ? 0xffcc77 : 0xccddff;
        const lightIntensity = building.category === 'residential' ? 0.4 : 0.6;
        
        const buildingLight = new THREE.PointLight(lightColor, lightIntensity, 3);
        buildingLight.position.set(0, height / 2, 0);
        mesh.add(buildingLight);
        
        const meshId = `${x}-${y}`;
        buildingLightsRef.current[meshId] = buildingLight;
      }
    }
    
    // Add special effects for certain building types
    if (building.category === 'commercial' && building.id === 'shopping-center') {
      // Add dynamic light for commercial buildings with color cycling
      const pulsingLight = new THREE.PointLight(0xffaaaa, 0.3, 2);
      pulsingLight.position.set(0, height, 0);
      mesh.add(pulsingLight);
      
      // Simple animation for the light color
      const animateLightColor = () => {
        const time = Date.now() * 0.001;
        const r = Math.sin(time * 0.7) * 0.5 + 0.5;
        const g = Math.sin(time * 0.5) * 0.5 + 0.5;
        const b = Math.sin(time * 0.3) * 0.5 + 0.5;
        
        pulsingLight.color.setRGB(r, g, b);
        requestAnimationFrame(animateLightColor);
      };
      
      animateLightColor();
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!containerRef.current || !sceneRef.current || !cameraRef.current || !gridHelperRef.current || !highlightMesh) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersection = new THREE.Vector3();
    
    raycasterRef.current.ray.intersectPlane(plane, intersection);
    
    const gridX = Math.floor(intersection.x + 10);
    const gridY = Math.floor(intersection.z + 10);
    
    if (gridX >= 0 && gridX < 20 && gridY >= 0 && gridY < 20) {
      highlightMesh.position.set(
        Math.floor(intersection.x) + 0.5, 
        0.05, 
        Math.floor(intersection.z) + 0.5
      );
      
      if (!highlightMesh.visible) {
        highlightMesh.visible = true;
      }
      
      if (buildingBeingPlaced) {
        const size = buildingBeingPlaced.size;
        const isRotated = buildingRotation === 90 || buildingRotation === 270;
        const width = isRotated ? size.depth : size.width;
        const depth = isRotated ? size.width : size.depth;
        
        highlightMesh.scale.set(width, 1, depth);
      } else {
        highlightMesh.scale.set(1, 1, 1);
      }
      
      if (rotationMesh && selectedMesh) {
        rotationMesh.position.copy(selectedMesh.position);
        rotationMesh.position.y = 0.05;
        rotationMesh.visible = true;
      } else if (rotationMesh) {
        rotationMesh.visible = false;
      }
      
      hoveredCellRef.current = { x: gridX, y: gridY };
    } else {
      highlightMesh.visible = false;
      if (rotationMesh) rotationMesh.visible = false;
      hoveredCellRef.current = null;
    }
    
    if (!isDragging && !isRotating) {
      const buildingObjects = Object.values(buildingMeshesRef.current);
      const intersects = raycasterRef.current.intersectObjects(buildingObjects);
      
      if (intersects.length > 0) {
        containerRef.current.style.cursor = 'pointer';
      } else {
        containerRef.current.style.cursor = buildingBeingPlaced ? 'cell' : 'default';
      }
    }
  };
  
  const handleClick = (event: MouseEvent) => {
    if (controlsRef.current?.enabled && isDragging) return;
    
    // Check if Alt key is pressed for street view mode
    if (event.altKey && hoveredCellRef.current && onEnterStreetView) {
      onEnterStreetView(hoveredCellRef.current);
      return;
    }
    
    if (hoveredCellRef.current && buildingBeingPlaced) {
      const isRotated = buildingRotation === 90 || buildingRotation === 270;
      const width = isRotated ? buildingBeingPlaced.size.depth : buildingBeingPlaced.size.width;
      const depth = isRotated ? buildingBeingPlaced.size.width : buildingBeingPlaced.size.depth;
      
      if (
        hoveredCellRef.current.x + width > 20 ||
        hoveredCellRef.current.y + depth > 20
      ) {
        toast({
          title: "Invalid Placement",
          description: "Building would extend outside the grid boundaries.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate space is not occupied
      let isOccupied = false;
      for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < depth; dy++) {
          const x = hoveredCellRef.current.x + dx;
          const y = hoveredCellRef.current.y + dy;
          if (x < 20 && y < 20 && grid[x][y].building) {
            isOccupied = true;
            break;
          }
        }
        if (isOccupied) break;
      }
      
      if (isOccupied) {
        toast({
          title: "Space Occupied",
          description: "This space is already occupied by a building.",
          variant: "destructive",
        });
        return;
      }
      
      const validationResult = isValidPlacement(grid, hoveredCellRef.current.x, hoveredCellRef.current.y, buildingBeingPlaced);
      if (!validationResult.valid) {
        toast({
          title: "Invalid Placement",
          description: validationResult.reason || "This building cannot be placed here.",
          variant: "destructive",
        });
        return;
      }
      
      // Create a rotated building if needed
      const rotatedBuilding = { ...buildingBeingPlaced };
      
      placeBuilding(rotatedBuilding, hoveredCellRef.current.x, hoveredCellRef.current.y);
    } else {
      if (!cameraRef.current) return;
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const buildingObjects = Object.values(buildingMeshesRef.current);
      const intersects = raycasterRef.current.intersectObjects(buildingObjects);
      
      if (intersects.length > 0) {
        const selectedObject = intersects[0].object as THREE.Mesh;
        
        if (selectedMesh) {
          (selectedMesh.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
        }
        
        (selectedObject.material as THREE.MeshStandardMaterial).emissive.set(0x333333);
        setSelectedMesh(selectedObject);
        
        const meshId = Object.keys(buildingMeshesRef.current).find(
          key => buildingMeshesRef.current[key] === selectedObject
        );
        
        if (meshId) {
          const [xStr, yStr] = meshId.split('-');
          const x = parseInt(xStr), y = parseInt(yStr);
          
          if (grid[x][y].building) {
            // Show upgrade option if feature is available
            if (onShowBuildingUpgrades) {
              toast({
                title: "Building Selected",
                description: `${grid[x][y].building.name} - Press 'R' to rotate, 'Delete' to remove, or 'U' to upgrade`,
              });
            } else {
              toast({
                title: "Building Selected",
                description: `${grid[x][y].building.name} - Press 'R' to rotate or 'Delete' to remove`,
              });
            }
            
            // Right-click or Alt+click to enter street view at this location
            if (event.button === 2 || event.altKey) {
              if (onEnterStreetView) {
                onEnterStreetView({ x, y });
              }
            }
          }
        }
      } else {
        // If clicking on the ground, check for street view activation with right-click or Alt+click
        if ((event.button === 2 || event.altKey) && hoveredCellRef.current && onEnterStreetView) {
          onEnterStreetView(hoveredCellRef.current);
        } else if (selectedMesh) {
          (selectedMesh.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
          setSelectedMesh(null);
        }
      }
    }
  };

  useEffect(() => {
    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('click', handleClick);
    
    return () => {
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('click', handleClick);
    };
  }, [buildingBeingPlaced, buildingRotation, isDragging, selectedMesh, onShowBuildingUpgrades]);

  const placeBuilding = (building: Building, x: number, y: number) => {
    const width = building.size.width;
    const depth = building.size.depth;
    
    if (x + width > 20 || y + depth > 20) {
      toast({
        title: "Invalid Placement",
        description: "Building would extend outside the grid boundaries.",
        variant: "destructive",
      });
      return;
    }
    
    for (let dx = 0; dx < width; dx++) {
      for (let dy = 0; dy < depth; dy++) {
        if (grid[x + dx][y + dy].building) {
          toast({
            title: "Space Occupied",
            description: "This space is already occupied by a building.",
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    const validationResult = isValidPlacement(grid, x, y, building);
    if (!validationResult.valid) {
      toast({
        title: "Invalid Placement",
        description: validationResult.reason || "This building cannot be placed here.",
        variant: "destructive",
      });
      return;
    }
    
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      
      newGrid[x][y] = { 
        ...newGrid[x][y], 
        building: building
      };
      
      for (let dx = 0; dx < width; dx++) {
        for (let dy = 0; dy < depth; dy++) {
          if (dx === 0 && dy === 0) continue;
          if (x + dx >= 20 || y + dy >= 20) continue;
          
          newGrid[x + dx][y + dy] = { 
            ...newGrid[x + dx][y + dy], 
            building: null
          };
        }
      }
      
      return newGrid;
    });
    
    addBuildingMesh(building, x, y);
    
    onCellUpdate();
    
    toast({
      title: "Building Placed",
      description: `${building.name} has been added to your city.`,
    });
  };

  const helpText = selectedMesh 
    ? onShowBuildingUpgrades
      ? 'Press R to rotate, Delete to remove, or U to upgrade the selected building. Alt+Click for Street View.'
      : 'Press R to rotate or Delete to remove the selected building. Alt+Click for Street View.'
    : buildingBeingPlaced 
      ? 'Click to place the building, press R to rotate before placing. Alt+Click for Street View.'
      : 'Drag buildings from the palette or click to select existing buildings. Alt+Click or right-click for Street View.';

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden relative"
      style={{ cursor: isDragging ? 'grabbing' : selectedMesh ? 'move' : buildingBeingPlaced ? 'cell' : 'default' }}
    >
      <PopulationAgents 
        grid={grid}
        population={population}
        timeOfDay={currentTime}
        scene={sceneRef.current}
      />
      
      <div className="absolute bottom-4 left-4 right-4 text-center bg-black/40 text-white p-2 rounded-full backdrop-blur-sm text-sm">
        {helpText}
      </div>
    </div>
  );
};

declare global {
  interface Window {
    BUILDINGS: Building[];
  }
}

export default CityGrid;
