import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  textDark?: boolean;
  compact?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  showText = true,
  textDark = false,
  compact = false,
  className = '',
}) => {
  const blockGap = size * 0.12;
  const blockSize = (size - blockGap) / 2;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 4-block geometric courtyard mark */}
      <div
        className="relative shrink-0 grid grid-cols-2 p-1.5 rounded-xl bg-[#141416] border border-white/10 shadow-md"
        style={{
          width: size,
          height: size,
          gap: `${blockGap}px`,
          padding: `${size * 0.15}px`,
        }}
      >
        <span
          className="rounded-[3px] bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.4)] transition-all duration-300 group-hover:scale-105"
          style={{ width: blockSize, height: blockSize }}
        />
        <span
          className="rounded-[3px] bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.4)] transition-all duration-300 group-hover:scale-105"
          style={{ width: blockSize, height: blockSize }}
        />
        <span
          className="rounded-[3px] bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.4)] transition-all duration-300 group-hover:scale-105"
          style={{ width: blockSize, height: blockSize }}
        />
        <span
          className="rounded-[3px] bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.4)] transition-all duration-300 group-hover:scale-105"
          style={{ width: blockSize, height: blockSize }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-display font-extrabold tracking-[0.14em] leading-tight text-sm uppercase ${
              textDark ? 'text-zinc-900' : 'text-white'
            }`}
          >
            Courtyard
          </span>
          {!compact && (
            <span
              className={`text-[10px] tracking-wider font-medium uppercase ${
                textDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              Society Living System
            </span>
          )}
        </div>
      )}
    </div>
  );
};
