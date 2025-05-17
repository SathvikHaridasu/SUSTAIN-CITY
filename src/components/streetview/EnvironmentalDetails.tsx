
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
  
  // Add lampposts along roads
  grid.forEach((row, x) => {
    row.forEach((cell, y) => {
      if (cell.building && cell.building.id === 'road') {
        // Only add lampposts to some road cells
        if (Math.random() > 0.85) {
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
      // Check if it's a park-like area (assuming parks can be in 'entertainment' or other categories)
      if (cell.building && 
          (cell.building.id === 'park' || 
           cell.building.id === 'garden' || 
           cell.building.id === 'forest')) {
        if (Math.random() > 0.7) {
          const bench = createParkBench();
          bench.position.set(
            x - 9.5 + (Math.random() * 0.6 - 0.3),
            0,
            y - 9.5 + (Math.random() * 0.6 - 0.3)
          );
          bench.rotation.y = Math.random() * Math.PI * 2;
          scene.add(bench);
          
          // Add collision for the bench
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
};

// Create a lamppost object
export const createLamppost = (timeOfDay: TimeOfDay) => {
  const group = new THREE.Group();
  
  // Pole
  const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 1.25;
  pole.castShadow = true;
  group.add(pole);
  
  // Light fixture
  const fixtureGeometry = new THREE.SphereGeometry(0.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const fixtureMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
  fixture.position.y = 2.5;
  fixture.rotation.x = Math.PI;
  fixture.castShadow = true;
  group.add(fixture);
  
  // Light (only on at night or dusk)
  if (timeOfDay === 'night' || timeOfDay === 'dusk') {
    const light = new THREE.PointLight(0xffeedd, 0.8, 5);
    light.position.y = 2.45;
    group.add(light);
    
    // Light glow effect
    const glowGeometry = new THREE.SphereGeometry(0.12, 8, 8);
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

// Create a park bench object
export const createParkBench = () => {
  const group = new THREE.Group();
  
  // Seat
  const seatGeometry = new THREE.BoxGeometry(0.7, 0.05, 0.3);
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const seat = new THREE.Mesh(seatGeometry, woodMaterial);
  seat.position.y = 0.4;
  seat.castShadow = true;
  group.add(seat);
  
  // Backrest
  const backrestGeometry = new THREE.BoxGeometry(0.7, 0.3, 0.05);
  const backrest = new THREE.Mesh(backrestGeometry, woodMaterial);
  backrest.position.y = 0.55;
  backrest.position.z = -0.15;
  backrest.rotation.x = Math.PI * 0.1;
  backrest.castShadow = true;
  group.add(backrest);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.05);
  const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  
  const legPositions = [
    { x: 0.3, z: 0.1 },
    { x: 0.3, z: -0.1 },
    { x: -0.3, z: 0.1 },
    { x: -0.3, z: -0.1 }
  ];
  
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, metalMaterial);
    leg.position.set(pos.x, 0.2, pos.z);
    leg.castShadow = true;
    group.add(leg);
  });
  
  return group;
};
