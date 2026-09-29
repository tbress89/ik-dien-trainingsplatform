import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...rest }: IconProps, strokeWidth = 2) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  };
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p })}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...base(p, 2.2)}>
    <path d="M19 12H5" />
    <path d="m11 18-6-6 6-6" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base({ size: 14, ...p }, 2.4)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base({ size: 14, ...p }, 2.6)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p, 2.6)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export const BookmarkIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base({ size: 18, ...p })} fill={filled ? 'currentColor' : 'none'}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
);

export const AgeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V6l8-3 8 3v14" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

export const PlayersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7" />
    <path d="M18.5 14.8c1.7.8 2.7 2.6 3 5.2" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const FieldIcon = (p: IconProps) => (
  <svg {...base(p, 2.2)}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M12 5v14" />
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <svg {...base(p, 2.4)}>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base(p, 2.4)}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </svg>
);

export const PencilIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base({ size: 14, ...p }, 2.4)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p }, 2.4)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p }, 2.4)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 4l13 8-13 8z" fill="currentColor" />
  </svg>
);

export const StopIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
  </svg>
);

export const ShareIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
);

export const FilterIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
  </svg>
);

export const RestartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
  </svg>
);

export const WhistleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="14" r="5" />
    <path d="M12.5 10.5 21 7v4l-6 1.5M9 14h.01" />
  </svg>
);

export const PrinterIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <path d="M7 14h10v7H7z" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);

export const TagIcon = (p: IconProps) => (
  <svg {...base({ size: 11, ...p }, 2.2)}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </svg>
);

export const GripIcon = (p: IconProps) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    {[6, 12, 18].flatMap((y) => [<circle key={`a${y}`} cx="9" cy={y} r="1.6" />, <circle key={`b${y}`} cx="15" cy={y} r="1.6" />])}
  </svg>
);

/** Three ascending bars, filled up to `level`. */
export function DifficultyBars({ level, width = 5, base = 6, step = 4 }: { level: number; width?: number; base?: number; step?: number }) {
  return (
    <span className="diff-bars" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          style={{ width, height: base + n * step, background: n <= level ? 'var(--purple)' : 'var(--line-strong)' }}
        />
      ))}
    </span>
  );
}
