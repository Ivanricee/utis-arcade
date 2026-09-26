interface RingIndicatorProps {
  filled: boolean
}

export default function RingIndicator({ filled }: RingIndicatorProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-6 shrink-0" fill="none">
      <circle
        cx="16"
        cy="16"
        r="8"
        stroke={filled ? '#ff8066' : '#8ee9f2'}
        strokeOpacity={filled ? 1 : 0.42}
        strokeWidth="5"
      />
      {filled && (
        <path
          d="M8.6 9.8a10 10 0 0 1 9.1-4.3"
          stroke="#ffe1d8"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}
