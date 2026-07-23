import type { CSSProperties, ReactNode } from 'react';

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: 'var(--ryobi-green)' }}
      />
      <span
        className="uppercase"
        style={{ letterSpacing: '0.12em', color: 'var(--muted-foreground)' }}
      >
        {children}
      </span>
    </div>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1
      className="mt-4"
      style={{
        fontSize: 'clamp(28px, 5vw, 50px)',
        fontWeight: 800,
        lineHeight: 1.03,
        letterSpacing: '-0.03em',
      }}
    >
      {children}
    </h1>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-4 max-w-3xl"
      style={{ fontSize: 16.5, lineHeight: 1.62, color: 'var(--muted-foreground)' }}
    >
      {children}
    </p>
  );
}

export function Panel({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`rounded-md border ${className}`}
      style={{ borderColor: 'var(--border)', background: 'var(--card)', ...style }}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  right,
  dark = false,
}: {
  title: ReactNode;
  right?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
      style={{
        borderColor: dark ? 'var(--console-border)' : 'var(--border)',
        color: dark ? '#fff' : 'inherit',
      }}
    >
      <div
        className="flex min-w-0 items-center gap-2"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}
      >
        {title}
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  color,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border p-4" style={{ borderColor: 'var(--border)' }}>
      <div
        className="tabular"
        style={{
          fontFamily: mono ? 'var(--font-display)' : 'var(--font-sans)',
          fontSize: 26,
          fontWeight: 800,
          lineHeight: 1.05,
          color: color ?? 'var(--foreground)',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </div>
      <div
        className="mt-1.5 uppercase"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          letterSpacing: '0.07em',
          color: 'var(--muted-foreground)',
        }}
      >
        {label}
      </div>
      {hint && (
        <div className="mt-1" style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export function Pill({
  children,
  tone = 'neutral',
  title,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'warn' | 'error' | 'info';
  title?: string;
}) {
  const map = {
    neutral: { fg: 'var(--muted-foreground)', bg: 'var(--muted)' },
    brand: { fg: 'var(--ryobi-green)', bg: 'var(--accent)' },
    warn: { fg: 'var(--status-warn)', bg: 'color-mix(in srgb, var(--status-warn) 13%, transparent)' },
    error: { fg: 'var(--status-error)', bg: 'color-mix(in srgb, var(--status-error) 13%, transparent)' },
    info: { fg: 'var(--status-info)', bg: 'color-mix(in srgb, var(--status-info) 13%, transparent)' },
  }[tone];

  return (
    <span
      title={title}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{
        background: map.bg,
        color: map.fg,
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </span>
  );
}

export function Callout({
  children,
  tone = 'brand',
}: {
  children: ReactNode;
  tone?: 'brand' | 'warn';
}) {
  const color = tone === 'brand' ? 'var(--ryobi-green)' : 'var(--status-warn)';
  return (
    <div
      className="rounded-md border-l-[3px] py-3 pl-4 pr-4"
      style={{
        borderColor: color,
        background: tone === 'brand' ? 'var(--accent)' : 'color-mix(in srgb, var(--status-warn) 9%, transparent)',
        fontSize: 13.5,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}
