
import React, { useEffect, useRef } from 'react';
import { PopulationState, getPopulationAgents } from '@/utils/populationSimulation';
import { GridItem } from '@/utils/environmental';
import { TimeOfDay } from '@/utils/dayNightCycle';
import * as THREE from 'three';

interface PopulationAgentsProps {
  grid: GridItem[][];
  population: PopulationState;
  timeOfDay: TimeOfDay;
  scene: THREE.Scene | null;
}

const PopulationAgents: React.FC<PopulationAgentsProps> = ({
  grid,
  population,
  timeOfDay,
  scene
}) => {
  const agentsRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!scene) return;

    // Create or clear agent group
    if (!agentsRef.current) {
      const group = new THREE.Group();
      group.name = 'populationAgents';
      scene.add(group);
      agentsRef.current = group;
    } else {
      // Remove all existing agents
      while (agentsRef.current.children.length > 0) {
        const child = agentsRef.current.children[0];
        agentsRef.current.remove(child);
        
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      }
    }

    // Don't render agents if population is too low
    if (population.total < 20) return;

    // Generate agent positions based on current time of day and population
    const agents = getPopulationAgents(grid, population, timeOfDay, 50);
    
    // Create agent geometries
    const residentGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const workerGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const visitorGeometry = new THREE.ConeGeometry(0.08, 0.15, 8);

    // Create materials with different colors
    const residentMaterial = new THREE.MeshBasicMaterial({ color: 0x6495ed }); // Blue
    const workerMaterial = new THREE.MeshBasicMaterial({ color: 0x32cd32 }); // Green
    const visitorMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 }); // Orange

    // Create meshes for each agent
    agents.forEach((agent, index) => {
      let mesh: THREE.Mesh;
      
      switch(agent.type) {
        case 'resident':
          mesh = new THREE.Mesh(residentGeometry, residentMaterial);
          break;
        case 'worker':
          mesh = new THREE.Mesh(workerGeometry, workerMaterial);
          break;
        case 'visitor':
          mesh = new THREE.Mesh(visitorGeometry, visitorMaterial);
          break;
        default:
          mesh = new THREE.Mesh(residentGeometry, residentMaterial);
      }
      
      // Adjust position within the grid cell to spread agents out
      const offsetX = (Math.random() - 0.5) * 0.8;
      const offsetZ = (Math.random() - 0.5) * 0.8;
      
      mesh.position.set(
        (agent.x - 9.5) + offsetX,
        0.2, // Just above ground level
        (agent.y - 9.5) + offsetZ
      );
      
      // Add some basic animation data
      mesh.userData = {
        originalPosition: { x: mesh.position.x, z: mesh.position.z },
        movementPhase: Math.random() * Math.PI * 2, // Random starting phase
        movementRadius: 0.2 + Math.random() * 0.3, // Random movement radius
        movementSpeed: 0.5 + Math.random() * 1.5, // Random movement speed
      };
      
      agentsRef.current?.add(mesh);
    });

    // Set up animation for agents
    const animateAgents = () => {
      if (!agentsRef.current) return;

      const time = Date.now() * 0.001;
      
      agentsRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          const userData = child.userData;
          
          // Apply wandering movement
          child.position.x = userData.originalPosition.x + 
            Math.sin(time * userData.movementSpeed + userData.movementPhase) * userData.movementRadius * 0.5;
          
          child.position.z = userData.originalPosition.z + 
            Math.cos(time * userData.movementSpeed + userData.movementPhase + 1.5) * userData.movementRadius;
          
          // Apply small bobbing motion
          child.position.y = 0.2 + Math.sin(time * 2 + userData.movementPhase) * 0.05;
          
          // Small rotation
          child.rotation.y += 0.01;
        }
      });
      
      requestAnimationFrame(animateAgents);
    };
    
    animateAgents();
    
  }, [grid, population, timeOfDay, scene]);

  return null; // This is a Three.js component, so it doesn't render any JSX
};

export default PopulationAgents;
