
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function for debounce
export function debounce<F extends (...args: any[]) => any>(
  func: F, 
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<F>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Helper for random number generation in a range
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Helper to format large numbers with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(Math.round(num));
}

// Helper to generate a smooth color transition
export function interpolateColor(color1: string, color2: string, factor: number): string {
  function hex2rgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }
  
  function rgb2hex(rgb: number[]) {
    return "#" + rgb.map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }
  
  const c1 = hex2rgb(color1);
  const c2 = hex2rgb(color2);
  
  const result = c1.map((c, i) => Math.round(c + factor * (c2[i] - c)));
  return rgb2hex(result);
}

// Helper to generate a unique ID
export function uniqueId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}
