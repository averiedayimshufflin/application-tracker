'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import SealIcon from './SealIcon'

type OceanShellProps = {
  children: ReactNode
  className?: string
}

type MotionPanelProps = HTMLMotionProps<'div'> & {
  delay?: number
}

export function OceanShell({ children, className = '' }: OceanShellProps) {
  return (
    <main className={`ocean-shell min-h-screen overflow-hidden px-5 py-8 text-[var(--text)] sm:px-6 lg:px-8 ${className}`}>
      <motion.div
        aria-hidden="true"
        className="ocean-current ocean-current-a"
        animate={{ x: ['-8%', '4%', '-8%'], y: [0, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="ocean-current ocean-current-b"
        animate={{ x: ['5%', '-4%', '5%'], y: [0, -12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="kelp-field"
        animate={{ skewX: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative z-10 mx-auto w-full max-w-6xl">{children}</div>
    </main>
  )
}

export function MotionPanel({ children, className = '', delay = 0, ...props }: MotionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FloatingSeal({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        aria-hidden="true"
        className="absolute -inset-8 rounded-full bg-cyan-200/35 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <SealIcon className="relative h-full w-full drop-shadow-[0_24px_35px_rgba(18,88,112,0.18)]" />
    </motion.div>
  )
}

export function TideButton({
  children,
  className = '',
  ...props
}: HTMLMotionProps<'button'> & { children: ReactNode }) {
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`tide-button ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function BubbleRow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {[12, 28, 47, 66, 82].map((left, index) => (
        <motion.span
          key={left}
          className="bubble"
          style={{ left: `${left}%`, bottom: `${8 + index * 4}%` }}
          animate={{ y: [-6, -42, -6], opacity: [0.1, 0.45, 0.1], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
        />
      ))}
    </div>
  )
}
