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
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 .5C5.649.5.5 5.649.5 12c0 5.096 3.301 9.422 7.88 10.948.575.106.785-.25.785-.555 0-.274-.01-1-.015-1.962-3.206.697-3.882-1.545-3.882-1.545-.524-1.332-1.278-1.687-1.278-1.687-1.044-.714.08-.7.08-.7 1.154.08 1.761 1.185 1.761 1.185 1.025 1.757 2.69 1.25 3.345.955.104-.742.401-1.25.73-1.538-2.56-.291-5.252-1.28-5.252-5.695 0-1.258.448-2.286 1.183-3.092-.118-.29-.513-1.46.112-3.044 0 0 .965-.309 3.162 1.18a10.88 10.88 0 0 1 5.758 0c2.196-1.489 3.159-1.18 3.159-1.18.627 1.583.232 2.753.114 3.044.737.806 1.18 1.834 1.18 3.092 0 4.426-2.696 5.4-5.265 5.686.413.355.78 1.058.78 2.134 0 1.54-.014 2.78-.014 3.158 0 .308.206.666.79.553 4.576-1.53 7.873-5.854 7.873-10.947C23.5 5.649 18.35.5 12 .5Z" fill="currentColor" />
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
