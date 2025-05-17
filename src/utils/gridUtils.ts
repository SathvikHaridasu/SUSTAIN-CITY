
import { GridItem } from '@/utils/environmental';

/**
 * Creates an empty 20x20 grid filled with null building references
 */
export const createEmptyGrid = (): GridItem[][] => {
  const grid: GridItem[][] = [];
  for (let x = 0; x < 20; x++) {
    grid[x] = [];
    for (let y = 0; y < 20; y++) {
      grid[x][y] = { x, y, building: null };
    }
  }
  return grid;
};
