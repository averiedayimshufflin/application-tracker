'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BubbleRow, FloatingSeal, MotionPanel, OceanShell, TideButton } from './components/OceanUI'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    })
  }

  return (
    <OceanShell className="py-10">
      <MotionPanel className="ocean-card relative flex flex-col gap-10 overflow-hidden p-7 sm:p-9">
        <BubbleRow />
        <section className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-6">
            <p className="seal-pill tracking-normal">
              Seal shore tracker
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[#103745] sm:text-5xl">
              Float through applications with a tiny seal crew keeping watch.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[#587071]">
              Track companies, interviews, deadlines, and follow-ups in a soft ocean workspace with drifting currents,
              bubbly controls, and calm little reminders.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <TideButton
                type="button"
                onClick={signInWithGoogle}
              >
                <span aria-hidden="true">~</span>
                Sign in with Google
              </TideButton>
              <Link href="#reef" className="ocean-button-secondary">
                <span aria-hidden="true">+</span>
                Preview reef
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-72 items-center justify-center rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(198,239,232,0.68))] p-8 shadow-inner shadow-cyan-900/10">
            <div className="absolute bottom-5 left-7 h-20 w-4 rounded-full bg-[#5fa986]/70" />
            <div className="absolute bottom-4 left-12 h-28 w-3 rounded-full bg-[#79b797]/60" />
            <div className="absolute right-8 top-8 h-16 w-16 rounded-full border border-white/70 bg-white/30" />
            <FloatingSeal className="h-56 w-56" />
          </div>
        </section>

        <section id="reef" className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Applications', description: 'Shell-like cards hold every opportunity and status.' },
            { title: 'Interviews', description: 'Currents surface prep notes, times, and contacts.' },
            { title: 'Deadlines', description: 'Tide marks keep follow-ups and assessments visible.' },
            { title: 'Notes', description: 'Save recruiter names, questions, and next steps.' },
          ].map((item) => (
            <MotionPanel
              key={item.title}
              delay={0.08}
              className="ocean-tile p-5 text-sm text-[#587071]"
            >
              <h2 className="font-semibold text-[#103745]">{item.title}</h2>
              <p className="mt-2">{item.description}</p>
            </MotionPanel>
          ))}
        </section>
      </MotionPanel>
    </OceanShell>
  )
}
