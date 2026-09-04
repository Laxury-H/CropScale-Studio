import type { ImageItem } from '../types';

// Helper to render an SVG string onto a high-res canvas and return a Blob & DataURL
async function createSampleImageItem(
  id: string,
  name: string,
  svgContent: string,
  width: number,
  height: number
): Promise<ImageItem> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);

  // Generate high quality blob url
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
  const blobUrl = URL.createObjectURL(blob);

  // Generate small thumbnail for sidebar
  const thumbCanvas = document.createElement('canvas');
  const thumbScale = Math.min(120 / width, 120 / height);
  thumbCanvas.width = Math.round(width * thumbScale);
  thumbCanvas.height = Math.round(height * thumbScale);
  const thumbCtx = thumbCanvas.getContext('2d')!;
  thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
  const thumbnailUrl = thumbCanvas.toDataURL('image/png', 0.85);

  return {
    id,
    name,
    size: blob.size,
    originalWidth: width,
    originalHeight: height,
    aspectRatio: width / height,
    blobUrl,
    thumbnailUrl,
    transform: {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    status: 'not_edited',
  };
}

export async function generateDemoImages(): Promise<ImageItem[]> {
  // Demo 1: Tall Geometric CNC Screen (468x716 like the user's paint example!)
  const svg1 = `
    <svg xmlns="http://www.w3.org/2000/svg" width="468" height="716" viewBox="0 0 468 716">
      <rect width="468" height="716" fill="#f8fafc"/>
      <!-- Inner Panel Border -->
      <rect x="74" y="58" width="320" height="600" rx="12" fill="#1e293b" stroke="#0f172a" stroke-width="4"/>
      <!-- Geometric Lattice Pattern Cutouts -->
      <g fill="#f8fafc">
        ${Array.from({ length: 6 }).map((_, r) => 
          Array.from({ length: 3 }).map((_, c) => `
            <polygon points="${134 + c * 80},${108 + r * 90} ${174 + c * 80},${138 + r * 90} ${134 + c * 80},${168 + r * 90} ${94 + c * 80},${138 + r * 90}" />
            <circle cx="${134 + c * 80}" cy="${138 + r * 90}" r="14" fill="#1e293b" />
            <circle cx="${134 + c * 80}" cy="${138 + r * 90}" r="8" fill="#f8fafc" />
          `).join('')
        ).join('')}
      </g>
      <!-- CNC Frame Outer Accents -->
      <rect x="94" y="78" width="280" height="560" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="8 6"/>
    </svg>
  `;

  // Demo 2: Off-center Floral/Botanical CNC Pattern (600x800 with white padding and off-center placement)
  const svg2 = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <rect width="600" height="800" fill="#ffffff"/>
      <!-- Floral CNC pattern shifted towards upper-right to test Auto Center Content -->
      <g transform="translate(180, 120)">
        <rect x="0" y="0" width="280" height="500" rx="16" fill="#334155"/>
        <!-- Lotus/Leaf Petals cutout -->
        <g fill="#ffffff">
          ${[0, 1, 2, 3].map(i => `
            <path d="M 140 ${60 + i * 110} C 80 ${90 + i * 110}, 80 ${150 + i * 110}, 140 ${160 + i * 110} C 200 ${150 + i * 110}, 200 ${90 + i * 110}, 140 ${60 + i * 110} Z" />
            <circle cx="140" cy="${110 + i * 110}" r="12" fill="#334155"/>
            <path d="M 60 ${110 + i * 110} Q 140 ${130 + i * 110} 220 ${110 + i * 110}" stroke="#ffffff" stroke-width="6" fill="none"/>
          `).join('')}
        </g>
      </g>
    </svg>
  `;

  // Demo 3: Modern Room Divider Screen (800x1200 with wood grain tint)
  const svg3 = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200">
      <rect width="800" height="1200" fill="#f1f5f9"/>
      <!-- Walnut Wood Finish Screen Panel -->
      <rect x="150" y="100" width="500" height="1000" rx="20" fill="#451a03" stroke="#290e02" stroke-width="8"/>
      <!-- Modern Slanted Slats Pattern -->
      <g stroke="#f1f5f9" stroke-width="12" stroke-linecap="round">
        ${Array.from({ length: 18 }).map((_, i) => `
          <line x1="200" y1="${180 + i * 48}" x2="600" y2="${240 + i * 48}" />
        `).join('')}
      </g>
      <!-- Center Medallion -->
      <circle cx="400" cy="600" r="80" fill="#451a03" stroke="#f1f5f9" stroke-width="8"/>
      <circle cx="400" cy="600" r="40" fill="#f1f5f9"/>
    </svg>
  `;

  return Promise.all([
    createSampleImageItem('demo-1', '01_Vach_CNC_Hinh_Hoc_468x716.png', svg1, 468, 716),
    createSampleImageItem('demo-2', '02_Vach_CNC_Hoa_Sen_600x800.png', svg2, 600, 800),
    createSampleImageItem('demo-3', '03_Vach_CNC_Nan_Go_800x1200.png', svg3, 800, 1200),
  ]);
}
