import type { ReactNode } from 'react';

type Phase = '卵泡期' | '排卵期' | '黄体期' | '月经期';

export function PhaseIcon({ phase }: { phase: Phase }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {phase === '卵泡期' && (
        <path
          {...common}
          d="M12 20c0-7 0-11 0-16M12 12c-5 0-7-3-7-6 4 0 7 2 7 6ZM12 16c4 0 6-2 7-5-4-.4-7 1-7 5Z"
        />
      )}
      {phase === '排卵期' && (
        <>
          <circle {...common} cx="12" cy="12" r="3.2" />
          <path
            {...common}
            d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"
          />
        </>
      )}
      {phase === '黄体期' && (
        <path {...common} d="M16.9 17.6A8 8 0 0 1 10 4a7 7 0 1 0 6.9 13.6Z" />
      )}
      {phase === '月经期' && (
        <path
          {...common}
          d="M12 3.5c2.7 4 5.7 7.2 5.7 10.7A5.7 5.7 0 0 1 6.3 14.2C6.3 10.7 9.3 7.5 12 3.5ZM9.2 14.2c0 1.6 1 2.6 2.4 2.9"
        />
      )}
    </svg>
  );
}

export function RunnerIcon({ strength = false }: { strength?: boolean }) {
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.45,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle {...p} cx="25" cy="9" r="3.2" />
      {strength ? (
        <>
          <path {...p} d="M24 14v13M17 19h14M20 27l-4 11M27 27l5 11" />
          <path {...p} d="M13 16v6M10 18v2M35 16v6M38 18v2M13 19h22" />
        </>
      ) : (
        <>
          <path
            {...p}
            d="m23 14-5 8 8 5 4-8M18 22l-7 5M26 27l-7 11M28 28l8 6M17 38h-5M36 34h4"
          />
          <path {...p} d="m29 18 5 4" />
        </>
      )}
    </svg>
  );
}

export function TulipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21V10M12 11c-4 0-6-3-6-7 3.1.2 5.1 1.3 6 3.4C12.9 5.3 14.9 4.2 18 4c0 4-2 7-6 7ZM12 17c-3.5 0-5-1.8-6-4 3.4-.2 5.4 1.2 6 4ZM12 19c2.8 0 4.4-1.3 5.4-3.1-2.8-.1-4.6.9-5.4 3.1Z" />
      </g>
    </svg>
  );
}

export function Doodle({ children }: { children?: ReactNode }) {
  return (
    <div className="doodle" aria-hidden="true">
      <svg viewBox="0 0 120 90">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M8 68c18-13 27-5 42-18s24-3 37-17 21-8 26-11" />
          <path d="M69 50c1-13 9-24 22-29-1 15-8 25-22 29ZM69 50c-10-7-17-5-23 1 8 5 16 5 23-1Z" />
          <circle cx="22" cy="21" r="9" />
          <path d="M22 8V4M22 38v-4M9 21H5M39 21h-4" />
        </g>
      </svg>
      {children}
    </div>
  );
}

export type { Phase };
