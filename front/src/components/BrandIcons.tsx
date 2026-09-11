type IconProps = {
  className?: string;
};

/** Ícone estilo Apple (silhueta) */
export function AppleLogoIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

/** Ícone estilo Google Calendar (cores oficiais aproximadas) */
export function GoogleCalendarIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#1A73E8" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
      <path fill="#fff" d="M5 9h14v11H5z" />
      <path fill="#EA4335" d="M7.5 12.2h2.1v5.1H7.5z" />
      <path fill="#FBBC04" d="M10.9 12.2h2.1v5.1h-2.1z" />
      <path fill="#34A853" d="M14.4 12.2H16.5v5.1H14.4z" />
      <path fill="#4285F4" d="M7.5 11.1h9v1.1h-9z" />
    </svg>
  );
}
