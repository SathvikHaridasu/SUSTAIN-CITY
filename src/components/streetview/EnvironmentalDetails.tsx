
import * as THREE from 'three';
import { GridItem } from '@/utils/environmental';
import { TimeOfDay } from '@/utils/dayNightCycle';

export interface EnvironmentalProps {
  scene: THREE.Scene;
  collisionMeshes: THREE.Mesh[];
  currentTime: TimeOfDay;
}

export const addEnvironmentalDetails = (grid: GridItem[][], options: EnvironmentalProps) => {
  const { scene, collisionMeshes, currentTime } = options;
  
  try {
    // Add lampposts along roads - but be selective for performance
    grid.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (cell.building && cell.building.id === 'road') {
          // Only add lampposts to some road cells (reduced frequency)
          if (Math.random() > 0.9) {
            const lamppost = createLamppost(currentTime);
            lamppost.position.set(
              x - 9.5,
              0,
              y - 9.5
            );
            scene.add(lamppost);
          }
        }
      });
    });
    
    // Add park benches and small details in parks/green areas
    grid.forEach((row, x) => {
      row.forEach((cell, y) => {
        // Check if it's a park-like area
        if (cell.building && 
            (cell.building.id === 'park' || 
             cell.building.id === 'garden' || 
             cell.building.id === 'forest')) {
          if (Math.random() > 0.8) {
            const bench = createParkBench();
            bench.position.set(
              x - 9.5 + (Math.random() * 0.6 - 0.3),
              0,
              y - 9.5 + (Math.random() * 0.6 - 0.3)
            );
            bench.rotation.y = Math.random() * Math.PI * 2;
            scene.add(bench);
            
            // Add collision for the bench with simplified geometry
            const benchCollision = new THREE.Mesh(
              new THREE.BoxGeometry(0.7, 0.5, 0.4),
              new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
            );
            benchCollision.position.copy(bench.position);
            benchCollision.position.y = 0.25;
            benchCollision.rotation.y = bench.rotation.y;
            scene.add(benchCollision);
            collisionMeshes.push(benchCollision);
          }
        }
      });
    });
  } catch (error) {
    console.error("Error adding environmental details:", error);
  }
};

// Create a lamppost object with optimized geometry
export const createLamppost = (timeOfDay: TimeOfDay) => {
  const group = new THREE.Group();
  
  // Pole - simplified geometry
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6); // Reduced segments
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 1.25;
  pole.castShadow = true;
  group.add(pole);
  
  // Light fixture - simplified geometry
  const fixtureGeometry = new THREE.SphereGeometry(0.15, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2); // Reduced segments
  const fixtureMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
  fixture.position.y = 2.5;
  fixture.rotation.x = Math.PI;
  fixture.castShadow = true;
  group.add(fixture);
  
  // Only add light effect at night or dusk for performance reasons
  if (timeOfDay === 'night' || timeOfDay === 'dusk') {
    // Use point light with limited radius for better performance
    const light = new THREE.PointLight(0xffeedd, 0.8, 4);
    light.position.y = 2.45;
    group.add(light);
    
    // Light glow effect with simplified geometry
    const glowGeometry = new THREE.SphereGeometry(0.12, 6, 4); // Reduced segments
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffdd,
      transparent: true,
      opacity: 0.4
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 2.45;
    group.add(glow);
  }
  
  return group;
};

// Create a park bench object with optimized geometry
export const createParkBench = () => {
  const group = new THREE.Group();
  
  // Seat - simplified geometry
  const seatGeometry = new THREE.BoxGeometry(0.7, 0.05, 0.3);
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const seat = new THREE.Mesh(seatGeometry, woodMaterial);
  seat.position.y = 0.4;
  seat.castShadow = true;
  group.add(seat);
  
  // Backrest - simplified geometry
  const backrestGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.05);
  const backrest = new THREE.Mesh(backrestGeometry, woodMaterial);
  backrest.position.y = 0.55;
  backrest.position.z = -0.15;
  backrest.rotation.x = Math.PI * 0.1;
  backrest.castShadow = true;
  group.add(backrest);
  
  // Legs - fewer legs for better performance
  const legGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.05);
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  
  // Just use 2 legs instead of 4 for performance
  const legPositions = [
    { x: 0.3, z: 0 },
    { x: -0.3, z: 0 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, metalMaterial);
    leg.position.set(pos.x, 0.2, pos.z);
    leg.castShadow = true;
    group.add(leg);
  });
  
  return group;
};
