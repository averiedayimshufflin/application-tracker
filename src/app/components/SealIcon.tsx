interface SealIconProps {
  className?: string
  title?: string
}

export default function SealIcon({ className, title = 'Arctic seal mascot' }: SealIconProps) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <path
        d="M12 72c11-5 24-5 38 0 14 5 26 4 34-3v17H12V72Z"
        fill="#8EC8C1"
        opacity=".28"
      />
      <path
        d="M50 82c-4-4-4-10 1-14 6-4 15-4 23-1-6 2-10 6-12 12-2 5-7 6-12 3Z"
        fill="#F8FFFC"
        stroke="#103745"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M53 78c-3 2-8 3-13 1-18-8-29-26-27-43 2-18 18-29 35-29 13 0 24 6 29 16 2 5 7 7 10 12 4 7 1 19-1 30-2 13-14 20-33 13Z"
        fill="#FEFFFC"
        stroke="#103745"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 65c3 6 8 7 13 2"
        stroke="#103745"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M69 55c4 5 8 5 11 0"
        stroke="#103745"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M38 34c4-2 8-2 12 0"
        stroke="#103745"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="35" cy="39" r="3.5" fill="#071A24" />
      <circle cx="57" cy="35" r="4" fill="#071A24" />
      <path d="M46 43c1 2 3 2 4 0" stroke="#071A24" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 43c0 3 4 3 5 0" stroke="#071A24" strokeWidth="2" strokeLinecap="round" />
      <circle cx="29" cy="45" r="3.2" fill="#FF98AC" opacity=".72" />
      <circle cx="62" cy="43" r="3.2" fill="#FF98AC" opacity=".72" />
      <path
        d="M17 73c6-4 14-4 24 1"
        stroke="#7ABAB3"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  )
}
