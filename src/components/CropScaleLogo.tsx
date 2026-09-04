import React from 'react';

export type LogoVariant = 'brackets' | 'monogram' | 'nested' | 'aperture';

interface CropScaleLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
  variant?: LogoVariant;
}

export const CropScaleLogo: React.FC<CropScaleLogoProps> = ({
  className = '',
  size = 32,
  glow = false,
  variant = 'brackets',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute -inset-1.5 bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 rounded-2xl blur-md opacity-40 animate-pulse pointer-events-none"
        />
      )}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative select-none drop-shadow-md"
      >
        <defs>
          <linearGradient id={`csBg_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d1117" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#0a0e1a" />
          </linearGradient>

          <linearGradient id={`csBrand_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#3b82f6" />
            <stop offset="75%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id={`csCyan_${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id={`csViolet_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id={`csUnified_${variant}`} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id={`csRim_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.15" />
          </linearGradient>

          <linearGradient id={`csArtboardFill_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#162032" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0b101d" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id={`csAmber_${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Squircle Base Container with Beveled Rim */}
        <rect
          x="20"
          y="20"
          width="472"
          height="472"
          rx="116"
          fill={`url(#csBg_${variant})`}
          stroke="#1b2434"
          strokeWidth="4"
        />
        <rect
          x="20"
          y="20"
          width="472"
          height="472"
          rx="116"
          fill="none"
          stroke={`url(#csRim_${variant})`}
          strokeWidth="3.5"
        />

        {/* Variant 1: Brackets (Precision Crop & Diagonal Scale Arrow - Premium Upgraded) */}
        {variant === 'brackets' && (
          <g>
            {/* Ambient Radial Bloom */}
            <circle cx="256" cy="256" r="160" fill={`url(#csUnified_${variant})`} opacity="0.16" />

            {/* Hairline Grid & Rule of Thirds Guides */}
            <line x1="256" y1="96" x2="256" y2="416" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 7" strokeOpacity="0.22" />
            <line x1="96" y1="256" x2="416" y2="256" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="5 7" strokeOpacity="0.22" />

            {/* 4 Precision Crop Corner Brackets */}
            <path
              d="M116 192 V140 C116 126.745 126.745 116 140 116 H192"
              stroke={`url(#csUnified_${variant})`}
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M320 116 H372 C385.255 116 396 126.745 396 140 V192"
              stroke={`url(#csUnified_${variant})`}
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M116 320 V372 C116 385.255 126.745 396 140 396 H192"
              stroke={`url(#csUnified_${variant})`}
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M320 396 H372 C385.255 396 396 385.255 396 372 V320"
              stroke={`url(#csUnified_${variant})`}
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Center Target Artboard Canvas */}
            <rect
              x="166"
              y="166"
              width="180"
              height="180"
              rx="28"
              fill={`url(#csArtboardFill_${variant})`}
              stroke={`url(#csUnified_${variant})`}
              strokeWidth="10"
              strokeOpacity="0.9"
            />

            {/* 4 Corner Transform Nodes (CAD / Figma Style) */}
            <circle cx="166" cy="166" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
            <circle cx="346" cy="166" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
            <circle cx="166" cy="346" r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="3" />
            <circle cx="346" cy="346" r="8" fill="#818cf8" stroke="#ffffff" strokeWidth="3" />

            {/* Dynamic Scaling Vector (Diagonal) */}
            <line
              x1="204"
              y1="308"
              x2="308"
              y2="204"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
              strokeOpacity="0.95"
            />

            {/* Scale Chevron Arrow: Top-Right (Outward) */}
            <path
              d="M264 204 H308 V248"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Scale Chevron Arrow: Bottom-Left (Outward) */}
            <path
              d="M248 308 H204 V264"
              stroke="#38bdf8"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Concentric Dual-Ring Center Anchor / Pivot Node */}
            <circle cx="256" cy="256" r="26" fill="#38bdf8" opacity="0.2" />
            <circle cx="256" cy="256" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="3.5" />
            <circle cx="256" cy="256" r="5" fill="#38bdf8" />
          </g>
        )}

        {/* Variant 2: Monogram (Interlocking CS - Modern Tech Startup) */}
        {variant === 'monogram' && (
          <g>
            <circle cx="256" cy="256" r="150" fill={`url(#csBrand_${variant})`} opacity="0.15" />
            {/* Stylized 'C' with Crop Nodes */}
            <path
              d="M360 156 H200 C160.235 156 128 188.235 128 228 V284 C128 323.765 160.235 356 200 356 H360"
              stroke={`url(#csCyan_${variant})`}
              strokeWidth="38"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Precision Crop ticks on C */}
            <circle cx="360" cy="156" r="12" fill="#ffffff" />
            <circle cx="360" cy="356" r="12" fill="#ffffff" />

            {/* Stylized 'S' woven dynamically */}
            <path
              d="M336 212 C300 188 240 188 220 220 C196 256 316 264 292 300 C272 332 212 332 176 308"
              stroke={`url(#csViolet_${variant})`}
              strokeWidth="36"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Scale Sparkle in Center */}
            <path
              d="M256 210 L262 250 L302 256 L262 262 L256 302 L250 262 L210 256 L250 250 Z"
              fill="#ffffff"
            />
          </g>
        )}

        {/* Variant 3: Nested Artboards (Dual-Ratio Fitting - Apple / Minimalist) */}
        {variant === 'nested' && (
          <g>
            <circle cx="256" cy="256" r="140" fill={`url(#csBrand_${variant})`} opacity="0.16" />
            
            {/* Background Original Layer (Portrait 3:4 Frame) */}
            <rect
              x="148"
              y="116"
              width="216"
              height="280"
              rx="20"
              fill="#1e293b"
              fillOpacity="0.4"
              stroke={`url(#csViolet_${variant})`}
              strokeWidth="10"
              strokeDasharray="16 10"
            />

            {/* Foreground Target Layer (Square 1:1 Scaled Frame) */}
            <rect
              x="136"
              y="136"
              width="240"
              height="240"
              rx="28"
              fill="#111827"
              fillOpacity="0.8"
              stroke={`url(#csCyan_${variant})`}
              strokeWidth="16"
            />

            {/* Corner Scale Indicators */}
            <circle cx="136" cy="136" r="14" fill="#38bdf8" stroke="#ffffff" strokeWidth="4" />
            <circle cx="376" cy="136" r="14" fill="#38bdf8" stroke="#ffffff" strokeWidth="4" />
            <circle cx="136" cy="376" r="14" fill="#38bdf8" stroke="#ffffff" strokeWidth="4" />
            <circle cx="376" cy="376" r="14" fill="#818cf8" stroke="#ffffff" strokeWidth="4" />

            {/* Dual Scale Arrows */}
            <path
              d="M226 256 H286 M256 226 V286"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="256" cy="256" r="42" fill="none" stroke="#38bdf8" strokeWidth="6" strokeDasharray="8 6" />
          </g>
        )}

        {/* Variant 4: Aperture & Crosshair (Pro Imaging Studio & Lens) */}
        {variant === 'aperture' && (
          <g>
            <circle cx="256" cy="256" r="140" fill={`url(#csBrand_${variant})`} opacity="0.18" />

            {/* 4 Overlapping Dynamic Geometric Framing Blades */}
            {/* Top Blade */}
            <path
              d="M120 136 H352 L308 196 H120 Z"
              fill={`url(#csCyan_${variant})`}
              opacity="0.9"
            />
            {/* Right Blade */}
            <path
              d="M376 120 V352 L316 308 V120 Z"
              fill={`url(#csBrand_${variant})`}
              opacity="0.9"
            />
            {/* Bottom Blade */}
            <path
              d="M392 376 H160 L204 316 H392 Z"
              fill={`url(#csViolet_${variant})`}
              opacity="0.9"
            />
            {/* Left Blade */}
            <path
              d="M136 392 V160 L196 204 V392 Z"
              fill={`url(#csBrand_${variant})`}
              opacity="0.9"
            />

            {/* Center Viewport Frame */}
            <rect
              x="200"
              y="200"
              width="112"
              height="112"
              rx="16"
              fill="#0d1117"
              stroke="#ffffff"
              strokeWidth="8"
            />

            {/* Precision Crosshair */}
            <line x1="256" y1="180" x2="256" y2="332" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <line x1="180" y1="256" x2="332" y2="256" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="256" cy="256" r="18" fill="none" stroke="#ffffff" strokeWidth="5" />
            <circle cx="256" cy="256" r="5" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </div>
  );
};

export function getLogoSvgString(variant: LogoVariant = 'brackets'): string {
  const defs = `
    <defs>
      <linearGradient id="csBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d1117" />
        <stop offset="50%" stop-color="#111827" />
        <stop offset="100%" stop-color="#0a0e1a" />
      </linearGradient>
      <linearGradient id="csBrand" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="40%" stop-color="#3b82f6" />
        <stop offset="75%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
      <linearGradient id="csCyan" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
      <linearGradient id="csUnified" x1="15%" y1="15%" x2="85%" y2="85%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="35%" stop-color="#2563eb" />
        <stop offset="70%" stop-color="#4f46e5" />
        <stop offset="100%" stop-color="#7c3aed" />
      </linearGradient>
      <linearGradient id="csRim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.85" />
        <stop offset="40%" stop-color="#3b82f6" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#4f46e5" stop-opacity="0.15" />
      </linearGradient>
      <linearGradient id="csArtboardFill" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#162032" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0b101d" stop-opacity="0.95" />
      </linearGradient>
    </defs>
    <rect x="20" y="20" width="472" height="472" rx="116" fill="url(#csBg)" stroke="#1b2434" stroke-width="4" />
    <rect x="20" y="20" width="472" height="472" rx="116" fill="none" stroke="url(#csRim)" stroke-width="3.5" />
  `;

  let body = '';
  if (variant === 'brackets') {
    body = `
      <circle cx="256" cy="256" r="160" fill="url(#csUnified)" opacity="0.16" />
      <line x1="256" y1="96" x2="256" y2="416" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 7" stroke-opacity="0.22" />
      <line x1="96" y1="256" x2="416" y2="256" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 7" stroke-opacity="0.22" />
      <path d="M116 192 V140 C116 126.745 126.745 116 140 116 H192" stroke="url(#csUnified)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M320 116 H372 C385.255 116 396 126.745 396 140 V192" stroke="url(#csUnified)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M116 320 V372 C116 385.255 126.745 396 140 396 H192" stroke="url(#csUnified)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M320 396 H372 C385.255 396 396 385.255 396 372 V320" stroke="url(#csUnified)" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="166" y="166" width="180" height="180" rx="28" fill="url(#csArtboardFill)" stroke="url(#csUnified)" stroke-width="10" stroke-opacity="0.9" />
      <circle cx="166" cy="166" r="8" fill="#38bdf8" stroke="#ffffff" stroke-width="3" />
      <circle cx="346" cy="166" r="8" fill="#38bdf8" stroke="#ffffff" stroke-width="3" />
      <circle cx="166" cy="346" r="8" fill="#38bdf8" stroke="#ffffff" stroke-width="3" />
      <circle cx="346" cy="346" r="8" fill="#818cf8" stroke="#ffffff" stroke-width="3" />
      <line x1="204" y1="308" x2="308" y2="204" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-opacity="0.95" />
      <path d="M264 204 H308 V248" stroke="#ffffff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M248 308 H204 V264" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="256" cy="256" r="26" fill="#38bdf8" opacity="0.2" />
      <circle cx="256" cy="256" r="14" fill="#0f172a" stroke="#ffffff" stroke-width="3.5" />
      <circle cx="256" cy="256" r="5" fill="#38bdf8" />
    `;
  } else if (variant === 'monogram') {
    body = `
      <circle cx="256" cy="256" r="150" fill="url(#csBrand)" opacity="0.15" />
      <path d="M360 156 H200 C160.235 156 128 188.235 128 228 V284 C128 323.765 160.235 356 200 356 H360" stroke="url(#csCyan)" stroke-width="38" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="360" cy="156" r="12" fill="#ffffff" />
      <circle cx="360" cy="356" r="12" fill="#ffffff" />
      <path d="M336 212 C300 188 240 188 220 220 C196 256 316 264 292 300 C272 332 212 332 176 308" stroke="url(#csViolet)" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M256 210 L262 250 L302 256 L262 262 L256 302 L250 262 L210 256 L250 250 Z" fill="#ffffff" />
    `;
  } else if (variant === 'nested') {
    body = `
      <circle cx="256" cy="256" r="140" fill="url(#csBrand)" opacity="0.16" />
      <rect x="148" y="116" width="216" height="280" rx="20" fill="#1e293b" fill-opacity="0.4" stroke="url(#csViolet)" stroke-width="10" stroke-dasharray="16 10" />
      <rect x="136" y="136" width="240" height="240" rx="28" fill="#111827" fill-opacity="0.8" stroke="url(#csCyan)" stroke-width="16" />
      <circle cx="136" cy="136" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="4" />
      <circle cx="376" cy="136" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="4" />
      <circle cx="136" cy="376" r="14" fill="#38bdf8" stroke="#ffffff" stroke-width="4" />
      <circle cx="376" cy="376" r="14" fill="#818cf8" stroke="#ffffff" stroke-width="4" />
      <path d="M226 256 H286 M256 226 V286" stroke="#ffffff" stroke-width="10" stroke-linecap="round" />
      <circle cx="256" cy="256" r="42" fill="none" stroke="#38bdf8" stroke-width="6" stroke-dasharray="8 6" />
    `;
  } else {
    body = `
      <circle cx="256" cy="256" r="140" fill="url(#csBrand)" opacity="0.18" />
      <path d="M120 136 H352 L308 196 H120 Z" fill="url(#csCyan)" opacity="0.9" />
      <path d="M376 120 V352 L316 308 V120 Z" fill="url(#csBrand)" opacity="0.9" />
      <path d="M392 376 H160 L204 316 H392 Z" fill="url(#csViolet)" opacity="0.9" />
      <path d="M136 392 V160 L196 204 V392 Z" fill="url(#csBrand)" opacity="0.9" />
      <rect x="200" y="200" width="112" height="112" rx="16" fill="#0d1117" stroke="#ffffff" stroke-width="8" />
      <line x1="256" y1="180" x2="256" y2="332" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
      <line x1="180" y1="256" x2="332" y2="256" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
      <circle cx="256" cy="256" r="18" fill="none" stroke="#ffffff" stroke-width="5" />
      <circle cx="256" cy="256" r="5" fill="#38bdf8" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">${defs}${body}</svg>`;
}
