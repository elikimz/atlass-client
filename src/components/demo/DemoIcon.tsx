import type { ReactNode, SVGProps } from 'react'

export type DemoIconName = 'grid' | 'tasks' | 'layers' | 'user-plus' | 'training' | 'wallet' | 'arrow-right' | 'play' | 'check' | 'clock' | 'lock' | 'copy' | 'external' | 'refresh' | 'spark' | 'chart' | 'plus' | 'minus' | 'filter' | 'shield' | 'video'

interface DemoIconProps extends SVGProps<SVGSVGElement> {
  name: DemoIconName
  size?: number
}

export default function DemoIcon({ name, size = 18, ...props }: DemoIconProps) {
  const shared = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  }

  const paths: Record<DemoIconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    tasks: <><path d="M9 11l2 2 7-7" /><path d="M21 12a9 9 0 1 1-3.4-7.05" /><path d="M8 3h8" /></>,
    layers: <><path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" /><path d="m3 12 9 4.5 9-4.5" /><path d="m3 16.5 9 4.5 9-4.5" /></>,
    'user-plus': <><path d="M16 20v-1.8a3.8 3.8 0 0 0-3.8-3.8H6.8A3.8 3.8 0 0 0 3 18.2V20" /><circle cx="9.5" cy="7.3" r="3.8" /><path d="M19 8v6M22 11h-6" /></>,
    training: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11.3V16c2.8 2.4 7.2 2.4 10 0v-4.7" /><path d="M21 9v6" /></>,
    wallet: <><path d="M4 6.5h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" /><path d="M2 9h17.5a1.5 1.5 0 0 1 0 3H17" /><path d="M6 4.5h11" /></>,
    'arrow-right': <><path d="M4 12h16" /><path d="m13 5 7 7-7 7" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
    refresh: <><path d="M20 11a8.1 8.1 0 0 0-14.7-3L3 11" /><path d="M3 5v6h6" /><path d="M4 13a8.1 8.1 0 0 0 14.7 3L21 13" /><path d="M21 19v-6h-6" /></>,
    spark: <><path d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h17" /><path d="m7 15 3-3 3 2 5-6" /><path d="M15 8h3v3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    filter: <><path d="M4 5h16" /><path d="M7 12h10" /><path d="M10 19h4" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  }

  return <svg {...shared}>{paths[name]}</svg>
}
