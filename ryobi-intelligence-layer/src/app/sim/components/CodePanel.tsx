import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { ReactNode } from 'react';

const C = {
  key: 'var(--ryobi-green)',
  str: '#d8d3a8',
  num: '#8fd0e8',
  bool: '#e0a94a',
  punct: '#7c8074',
  verb: 'var(--ryobi-green-bright)',
  plain: 'var(--console-fg)',
};

/** Lightweight token colouring — deliberately regex-based, not a full parser. */
function colorize(line: string, index: number): ReactNode {
  const trimmed = line.trim();

  if (/^(POST|GET|PUT|PATCH|DELETE)\s/.test(trimmed)) {
    const [verb, ...rest] = trimmed.split(' ');
    return (
      <>
        <span style={{ color: C.verb, fontWeight: 600 }}>{verb}</span>{' '}
        <span style={{ color: C.str }}>{rest.join(' ')}</span>
      </>
    );
  }

  const nodes: ReactNode[] = [];
  const pattern = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b-?\d+(?:\.\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],])/g;

  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;

  while ((m = pattern.exec(line)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`p${index}-${k++}`} style={{ color: C.plain }}>
          {line.slice(last, m.index)}
        </span>,
      );
    }
    const [text, key, str, num, bool, punct] = m;
    const color = key ? C.key : str ? C.str : num ? C.num : bool ? C.bool : punct ? C.punct : C.plain;
    nodes.push(
      <span key={`t${index}-${k++}`} style={{ color }}>
        {text}
      </span>,
    );
    last = m.index + text.length;
  }

  if (last < line.length) {
    nodes.push(
      <span key={`p${index}-${k++}`} style={{ color: C.plain }}>
        {line.slice(last)}
      </span>,
    );
  }

  return nodes.length ? nodes : <span style={{ color: C.plain }}>{line}</span>;
}

export function CodePanel({
  title,
  badge,
  code,
  animate = true,
}: {
  title: string;
  badge: string;
  code: string;
  animate?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-md border"
      style={{ borderColor: 'var(--console-border)', background: 'var(--console-bg)' }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-2.5"
        style={{ borderColor: 'var(--console-border)' }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: 'var(--ryobi-green)' }}
          />
          <span
            className="truncate"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#fff' }}
          >
            {title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className="hidden sm:inline"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {badge}
          </span>
          <button
            onClick={copy}
            aria-label="Copy payload to clipboard"
            className="flex items-center gap-1 rounded px-1.5 py-1 transition-colors"
            style={{
              color: copied ? 'var(--ryobi-green-bright)' : 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'copied' : 'copy'}
          </button>
        </div>
      </div>

      <pre
        className="flex-1 overflow-auto p-4"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          lineHeight: 1.62,
          margin: 0,
          tabSize: 2,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={animate ? 'logline' : undefined}
            style={{
              animationDelay: animate ? `${Math.min(i * 14, 520)}ms` : undefined,
              whiteSpace: 'pre',
              display: 'flex',
              gap: 14,
            }}
          >
            <span
              aria-hidden
              className="shrink-0 select-none text-right tabular"
              style={{ color: 'rgba(255,255,255,0.2)', width: 22 }}
            >
              {i + 1}
            </span>
            <span className="min-w-0">{colorize(line, i)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
