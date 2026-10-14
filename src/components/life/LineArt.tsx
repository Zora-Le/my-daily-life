import type { ReactNode } from 'react';
export type Phase = '卵泡期' | '排卵期' | '黄体期' | '月经期';
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.45,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
export function PhaseIcon({ phase }: { phase: Phase }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {phase === '卵泡期' && (
        <path
          {...stroke}
          d="M12 21V5m0 8c-5 0-7-3-7-6 4 0 7 2 7 6Zm0 4c4 0 6-2 7-5-4-.4-7 1-7 5Z"
        />
      )}
      {phase === '排卵期' && (
        <path
          {...stroke}
          d="M12 10.1C9.7 5.2 5.9 6.4 7 10.4c-4.4-1-5.4 3-1.2 4.1-2.5 3.5.8 6.1 3.5 2.9.6 4.4 5 4.4 5.5.2 3.2 2.5 6.2-.7 3.1-3.5 4.3-1.7 3-5.9-1.2-5.5 1.5-4-1.1-7.2-4-4.2Z"
        />
      )}
      {phase === '黄体期' && (
        <path {...stroke} d="M16.9 17.6A8 8 0 0 1 10 4a7 7 0 1 0 6.9 13.6Z" />
      )}
      {phase === '月经期' && (
        <path
          {...stroke}
          d="M12 3.5c2.7 4 5.7 7.2 5.7 10.7A5.7 5.7 0 0 1 6.3 14.2C6.3 10.7 9.3 7.5 12 3.5Z"
        />
      )}
    </svg>
  );
}
export function SportIcon({ strength = false }: { strength?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <g {...stroke}>
        <circle cx="25" cy="9" r="3" />
        {strength ? (
          <>
            <path d="M24 14v13M17 19h14M20 27l-4 11M27 27l5 11" />
            <path d="M13 16v6M10 18v2M35 16v6M38 18v2M13 19h22" />
          </>
        ) : (
          <>
            <path d="M8 29c7-5 12-5 18 0s10 5 15 1M7 35c7-5 12-5 18 0s10 5 16 1M23 14l-5 8 8 5 5-8M18 22l-6 5M26 27l-5 7" />
            <path d="m29 18 6 4" />
          </>
        )}
      </g>
    </svg>
  );
}
export function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g {...stroke}>
        <path d="M3 5.5c3.5-.8 6.5.1 9 2.2v12c-2.5-2.1-5.5-3-9-2.2v-12Z" />
        <path d="M21 5.5c-3.5-.8-6.5.1-9 2.2v12c2.5-2.1 5.5-3 9-2.2v-12Z" />
      </g>
    </svg>
  );
}
export function TulipIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        {...stroke}
        d="M12 21V10M12 11c-4 0-6-3-6-7 3 .2 5 1 6 3.4C13 5 15 4 18 4c0 4-2 7-6 7Zm0 6c-3 0-5-2-6-4 3 0 5 1 6 4Z"
      />
    </svg>
  );
}
export function Doodle({ children }: { children?: ReactNode }) {
  return (
    <div className="doodle" aria-hidden="true">
      {children}
    </div>
  );
}
