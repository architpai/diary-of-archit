import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function DiaryMailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="6" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8l10.5 7.5c.5.4 1 .4 1.5 0L25.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21l5-4M24 21l-5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export function DiaryGitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M7 7L5 2M21 7L23 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
      <path d="M14 15l-1.5 2h3L14 15z" fill="currentColor" opacity="0.7" />
      <path d="M12.5 17Q14 19 15.5 17" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function DiaryLinkedInIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="22" height="22" rx="3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="7" y="20" fontSize="14" fontFamily="Patrick Hand, cursive" fontWeight="bold" fill="currentColor">in</text>
    </svg>
  );
}
