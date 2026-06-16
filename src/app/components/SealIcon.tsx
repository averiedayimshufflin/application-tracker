interface SealIconProps {
  className?: string
  title?: string
}

export default function SealIcon({ className, title = 'Arctic seal mascot' }: SealIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <circle cx="32" cy="32" r="30" fill="#E8F0FC" />
      <path d="M18 34c0 10 14 18 18 18s18-8 18-18-8-20-18-20-18 10-18 20Z" fill="#FFFFFF" />
      <path d="M24 29c0 7 6 10 8 10s8-3 8-10-4-8-8-8-8 1-8 8Z" fill="#C6DFF8" />
      <circle cx="26" cy="32" r="3" fill="#16325C" />
      <circle cx="38" cy="32" r="3" fill="#16325C" />
      <path d="M28 42c2 2 6 2 8 0" stroke="#16325C" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 38c6 6 18 8 32 0" stroke="#A3C7F5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
