<script lang="ts">
  interface Props {
    variant?: 'light' | 'dark'
  }

  let { variant = 'light', ...props }: Props = $props()

  const colors = $derived(variant === 'dark'
    ? { text: '#f8fafc', subtitle: '#94a3b8', dot: '#94a3b8' }
    : { text: '#1e293b', subtitle: '#64748b', dot: '#475569' }
  )
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="200"
  height="50"
  viewBox="0 0 200 50"
  {...props}
>
  <defs>
    <filter id="glow-{variant}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feFlood flood-color="#22c55e" flood-opacity="0.8" result="glowColor"/>
      <feComposite in="glowColor" in2="blur" operator="in" result="softGlow"/>
      <feMerge>
        <feMergeNode in="softGlow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="15" cy="15" r="4" fill={colors.dot} /> 
  <circle cx="15" cy="30" r="4" fill="#22c55e" filter="url(#glow-{variant})" /> 
  <circle cx="15" cy="45" r="4" fill={colors.dot} /> 
  <path d="M35 15 L 50 30 L 35 45" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-{variant})"/>
  <text x="62" y="32" font-family="Arial Black, sans-serif" font-weight="bold" font-size="28" fill={colors.text}>G360</text>
  <text x="62" y="46" font-family="monospace" font-size="9" fill={colors.subtitle} letter-spacing="3">BY CCUSI</text>
</svg>