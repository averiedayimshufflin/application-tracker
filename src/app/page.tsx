'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SealIcon from './components/SealIcon'

export default function LoginPage() {
  const supabase = createClient()

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,250,255,1),_rgba(219,234,254,0.9))] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-800">
              Arctic tracker
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              A calm place to manage internship applications, interviews, and next steps.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Get moving with a polished launcher for your career search. Sign in to organize applications,
              track deadlines, and keep recruiter follow-ups easy.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-[2rem] bg-slate-100 p-8 shadow-inner shadow-slate-200/80">
            <SealIcon className="h-44 w-44" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Applications', description: 'Track all opportunities and status updates.' },
            { title: 'Interviews', description: 'Keep schedules, contacts, and prep notes together.' },
            { title: 'Deadlines', description: 'Never miss an application follow-up or assessment due date.' },
            { title: 'Notes', description: 'Save recruiter names, questions, and next steps.' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 shadow-sm"
            >
              <h2 className="font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2">{item.description}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
