'use client';

import * as THREE from 'three';

// Color Palette
export const COLORS = {
  primary: '#FAF0E8',
  secondary: '#EDDED0',
  architectural: '#C5A180',
  accent: '#C08C72',
  strong: '#985D48',
  person: '#3A261D',
  pathway: '#C08C72', // Terracotta for the path
};

// Generate procedural noise texture for a "super texture" clay/matte feel
let cachedNoiseTexture: THREE.CanvasTexture | null = null;

export function getNoiseTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedNoiseTexture) return cachedNoiseTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const imgData = ctx.createImageData(512, 512);
  for (let i = 0; i < imgData.data.length; i += 4) {
    const val = Math.random() * 255;
    imgData.data[i] = val;
    imgData.data[i + 1] = val;
    imgData.data[i + 2] = val;
    imgData.data[i + 3] = 40; 
  }
  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  cachedNoiseTexture = texture;
  return texture;
}

// Generate procedural dotted texture for the abstract ground plane
let cachedDottedTexture: THREE.CanvasTexture | null = null;

export function getDottedTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedDottedTexture) return cachedDottedTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background (Cream color to match the environment, preventing black rendering)
  ctx.fillStyle = COLORS.primary; // #FAF0E8
  ctx.fillRect(0, 0, 256, 256);

  // Draw dots
  ctx.fillStyle = 'rgba(192, 140, 114, 0.25)'; // Slightly stronger terracotta dots

  
  const spacing = 32;
  const radius = 2;
  
  for (let x = 0; x <= 256; x += spacing) {
    for (let y = 0; y <= 256; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10); // Repeat across the large plane
  
  cachedDottedTexture = texture;
  return texture;
}
