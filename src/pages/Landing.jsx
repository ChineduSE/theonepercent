import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sunrise, Lightbulb, PenLine, Mic, FileText, NotebookPen, Zap, Briefcase, BarChart3, UserRound, ClipboardList, Sparkles, Target, ShieldCheck, Eye, Scale, ChevronDown, KeyRound, Repeat, Check } from 'lucide-react';
import { Logo, Wordmark, IMG } from '../components/ui.jsx';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/store.jsx';

const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };

const DAY = [
  { time: '07:30', icon: Sunrise, t: 'On the commute', d: 'Five minutes of practice from last night’s course notes. Just enough to make it stick.' },
  { time: '11:00', icon: Lightbulb, t: 'At your desk', d: 'A suggestion to use what you learned on this quarter’s goal. Learning stops being homework.' },
  { time: '18:30', icon: PenLine, t: 'Before you log off', d: 'Log one thing you did today. The AI asks what changed, and links it to your skills and KPIs.' },
  { time: 'Weekly', icon: Mic, t: 'Prove you can do it', d: 'A realistic project and a voice interview that ask you to apply and defend your thinking.' },
  { time: 'Review season', icon: FileText, t: 'Show how far you’ve come', d: 'Your self-assessment, promotion case and CV bullets, built from your own evidence.' },
];

const PILLARS = [
  { k: 'Learn', d: 'Keep what you study.', items: [[NotebookPen, 'Capture notes, PDFs and slides'], [Zap, 'Five-minute practice, morning and evening'], [Repeat, 'Concepts return just before you forget']] },
  { k: 'Apply', d: 'Use it where it counts.', items: [[Briefcase, 'Projects with briefs and rubrics'], [Lightbulb, 'Ideas to apply learning to your KPIs'], [ClipboardList, 'A 60-second daily work log']] },
  { k: 'Prove', d: 'Make your growth visible.', items: [[BarChart3, 'Skills gap up to senior, with evidence'], [Sparkles, 'STAR stories and voice interviews'], [UserRound, 'Career documents and a shareable portfolio']] },
];

const FAQ = [
  ['Who is it for?', 'Early-career professionals, roughly 0–3 years into their role, in any field: product, engineering, data, marketing, business development and more. Type your role and the skill map is built for you. Career switchers are welcome too: your current job already counts.'],
  ['I’m busy. How much time does it take?', 'About ten minutes a day: five minutes of practice in the morning and evening, plus 60 seconds to log your work. Projects and interviews are weekly and always show their time commitment.'],
  ['Is this another course platform?', 'No. Bring the learning you already do — courses, books, webinars, your own notes. The One Percent turns it into practice, application at work and evidence of growth.'],
  ['How is this different from asking a chatbot?', 'It remembers everything you’ve learned and done, brings concepts back before you forget, measures you against a full skill map for your role, and connects practice, projects, interviews and your real work into one record.'],
  ['Is my work information safe?', 'Your work log is private by default, never shown on your portfolio, and never used to train AI. Documents you generate can hide company names and figures.'],
  ['Are AI grades a qualification?', 'No. Every assessment shows its criteria and reasoning, and you can question it. Results are practice evidence, not certification. Work stories are labelled as self-reported.'],
];

export default function Landing() {
  const nav = useNavigate();
  const [open, setOpen] = useState(0);
  return (
    <div className="bg-ivory text-indigo">
      <header className="sticky top-0 z-30 bg-indigo/95 backdrop-blur text-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/"><Wordmark dark /></Link>
          <nav className="hidden md:flex items-center gap-6 ml-8 text-[14px] font-semibold text-[#C9CBDA]">
            <a href="#day" onClick={jump('day')} className="hover:text-ivory">How it works</a>
            <a href="#pillars" onClick={jump('pillars')} className="hover:text-ivory">Features</a>
            <a href="#trust" onClick={jump('trust')} className="hover:text-ivory">Trust</a>
            <a href="#faq" onClick={jump('faq')} className="hover:text-ivory">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="btn !min-h-10 text-ivory hover:bg-indigo-2">Sign in</Link>
            <Link to="/access" className="btn-gold !min-h-10">Get started</Link>
          </div>
        </div>
      </header>

      <div className="bg-gold-soft text-gold-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
          <span className="flex items-center gap-2 font-extrabold"><KeyRound size={16} />Live demo</span>
          <span>Email <code className="font-bold bg-white/70 px-1.5 py-0.5 rounded">{DEMO_EMAIL}</code></span>
          <span>Password <code className="font-bold bg-white/70 px-1.5 py-0.5 rounded">{DEMO_PASSWORD}</code></span>
          <button onClick={() => nav('/login?demo=1')} className="ml-auto font-extrabold underline underline-offset-2 cursor-pointer">Open the demo →</button>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-indigo text-ivory overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div className="flex flex-col gap-6">
            <span className="text-[12px] tracking-[0.14em] font-bold text-gold uppercase">For early-career professionals</span>
            <h1 className="text-[40px] sm:text-[56px] leading-[1.05] font-extrabold">Own your intelligence.<br /><span className="text-gold">Own your craft.</span></h1>
            <p className="text-[18px] leading-relaxed text-[#D7D8E4] max-w-xl">For professionals who learn on the side and grow on the job. Turn every course into knowledge you use at work — and every week of work into proof of how far you’ve come.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => nav('/login?demo=1')} className="btn-gold !min-h-12 !px-6 !text-[16px]">Try the live demo <ArrowRight size={18} /></button>
              <Link to="/access" className="btn !min-h-12 !px-6 border-[1.5px] border-ivory text-ivory hover:bg-indigo-2">Request beta access</Link>
            </div>
            <p className="text-[14px] text-[#9A9DB5]">AI creates the challenge. You do the thinking.</p>
          </div>
          <div className="relative">
            <img src={IMG.logoGold} alt="" aria-hidden="true" className="absolute -right-10 -top-16 w-72 opacity-[0.06] pointer-events-none" />
            <div className="relative flex flex-col gap-3">
              <div className="bg-ivory text-indigo rounded-2xl p-4 shadow-2xl flex gap-3 items-start">
                <span className="w-9 h-9 rounded-xl bg-indigo text-gold flex items-center justify-center shrink-0"><Sunrise size={18} /></span>
                <div><p className="label">07:30 · Practice</p><p className="font-bold text-[15px] leading-snug mt-0.5">Early A/B results look great. Do you ship today?</p><p className="text-[13px] text-ok font-bold mt-1">✓ Wait for the planned sample size</p></div>
              </div>
              <div className="bg-white text-indigo rounded-2xl p-4 shadow-2xl flex gap-3 items-start sm:ml-8">
                <span className="w-9 h-9 rounded-xl bg-gold text-indigo flex items-center justify-center shrink-0"><Lightbulb size={18} /></span>
                <div><p className="label">11:00 · Apply at work</p><p className="font-bold text-[15px] leading-snug mt-0.5">Set a stopping rule before your onboarding test ends</p><p className="text-[13px] text-muted mt-1">From your notes · moves your onboarding KPI</p></div>
              </div>
              <div className="bg-white text-indigo rounded-2xl p-4 shadow-2xl flex gap-3 items-start sm:ml-16">
                <span className="w-9 h-9 rounded-xl bg-indigo text-gold flex items-center justify-center shrink-0"><FileText size={18} /></span>
                <div><p className="label">Review season</p><p className="font-bold text-[15px] leading-snug mt-0.5">Self-assessment drafted from 12 work entries and 3 stories</p><p className="text-[13px] text-muted mt-1">Every claim linked to your evidence</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid md:grid-cols-3 gap-8">
        <div><span className="label">The problem</span><h2 className="mt-2 text-[30px] font-extrabold leading-tight">Early in your career, growth is hard to see.</h2><p className="mt-3 text-[15px] text-muted leading-relaxed">You’re working hard and learning on the side. But effort doesn’t automatically become ability — or proof of it.</p></div>
        <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
          {[['You learn after hours', 'A course on Saturday, forgotten by Monday. When the moment comes to use it at work, it isn’t there.'], ['AI moves faster than you', 'It helps you ship work you can’t fully explain. Then a manager asks “why?” and the gap shows.'], ['Your wins disappear', 'Review season comes and you can’t remember what you achieved, or show how much you’ve grown.']].map(([t, d]) => (
            <div key={t} className="card p-5"><p className="font-extrabold text-[17px]">{t}</p><p className="mt-2 text-[14.5px] leading-relaxed text-muted">{d}</p></div>
          ))}
        </div>
      </section>

      {/* A day in your week */}
      <section id="day" className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="label">How it works</span>
          <h2 className="mt-2 text-[30px] sm:text-[36px] font-extrabold leading-tight max-w-2xl">Ten minutes a day, woven into your work week.</h2>
          <div className="mt-10 grid md:grid-cols-5 gap-4">
            {DAY.map(({ time, icon: Icon, t, d }, i) => (
              <div key={t} className="relative rounded-2xl border border-line bg-ivory p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-indigo text-gold flex items-center justify-center"><Icon size={18} /></span><span className="text-[12.5px] font-extrabold text-gold-ink">{time}</span></div>
                <p className="font-extrabold text-[16.5px] leading-snug">{t}</p>
                <p className="text-[14px] leading-relaxed text-muted">{d}</p>
                {i < DAY.length - 1 && <ArrowRight size={18} className="hidden md:block absolute -right-[15px] top-1/2 text-soft" />}
              </div>
            ))}
          </div>
          <p className="mt-8 text-[15px] text-muted max-w-3xl">Type any role — Product Manager, Business Development Officer, Data Analyst — and the AI builds its skill map from foundation to senior. Everything you practise, apply and log becomes evidence across <strong className="text-indigo">Remember, Apply and Explain</strong>.</p>
        </div>
      </section>

      {/* Learn Apply Prove */}
      <section id="pillars" className="bg-indigo text-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="text-[12px] tracking-[0.14em] font-bold text-gold uppercase">One connected loop</span>
          <h2 className="mt-2 text-[30px] sm:text-[36px] font-extrabold leading-tight max-w-3xl">Learn it. Apply it. Prove it.</h2>
          <p className="mt-4 text-[16px] text-[#D7D8E4] max-w-2xl">Most tools stop at learning. The One Percent follows your knowledge all the way into your work — and back out as evidence of what you can do.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {PILLARS.map(({ k, d, items }) => (
              <div key={k} className="rounded-2xl bg-indigo-2 p-6 flex flex-col gap-4">
                <div><p className="text-[26px] font-extrabold text-gold">{k}</p><p className="text-[15px] text-[#C9CBDA]">{d}</p></div>
                <div className="flex flex-col gap-3">{items.map(([Icon, t]) => <span key={t} className="flex items-center gap-3 text-[15px] font-semibold"><span className="w-9 h-9 rounded-lg bg-indigo flex items-center justify-center shrink-0"><Icon size={17} className="text-gold" /></span>{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example persona */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <span className="label">An example journey</span>
          <h2 className="mt-2 text-[30px] font-extrabold leading-tight">Meet Tolu, ten months into her first product role.</h2>
          <p className="mt-3 text-[15.5px] leading-relaxed text-muted">Tolu moved from customer support into an associate product manager role at a Lagos fintech. She learns from a PM course at night and owns onboarding completion at work. This is the demo account — sign in and walk her week.</p>
          <p className="mt-2 text-[12.5px] text-muted">Tolu is a fictional example used in the demo.</p>
        </div>
        <div className="card p-6 flex flex-col gap-3">
          {[['Learned', 'RICE prioritisation from her course', 'Week 2'], ['Practised', '9 times, spaced over three weeks', 'Remember ✓'], ['Applied', 'Cut the sprint backlog from 14 items to 6', 'Used at work'], ['Defended', 'Explained her trade-offs in a voice interview', 'Explain ✓'], ['Proved', 'A STAR story in her review self-assessment', 'Review-ready']].map(([k, t, tag], i) => (
            <div key={k} className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${i === 4 ? 'bg-gold text-indigo' : 'bg-indigo text-ivory'}`}><Check size={15} strokeWidth={3} /></span>
              <span className="flex-1"><strong>{k}:</strong> <span className="text-muted">{t}</span></span>
              <span className="pill bg-sand text-indigo hidden sm:inline-flex">{tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Switchers */}
      <section className="bg-gold-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-wrap items-center gap-6">
          <Target size={32} className="text-gold-ink" />
          <div className="flex-1 min-w-64"><p className="text-[20px] font-extrabold">Switching careers? Your current job already counts.</p><p className="text-[15px] text-gold-ink mt-1">Log the work you do today, and we map it to the skills of the role you want — transferable evidence you can use in interviews.</p></div>
          <Link to="/access" className="btn-primary">Get started</Link>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <span className="label">Trust</span>
        <h2 className="mt-2 text-[30px] font-extrabold leading-tight">Honest by design.</h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[[Eye, 'Every question shows its source', 'Each question links to the note it came from. Anything from outside your notes is labelled.'], [Scale, 'Every grade shows its reasoning', 'See the rubric, the result per criterion and why. Disagree? Request a second review.'], [ShieldCheck, 'Your work stays private', 'Work logs, notes and recordings are never shown publicly or used to train AI. Documents can hide company names.']].map(([Icon, t, d]) => (
            <div key={t} className="card p-6"><Icon size={22} className="text-gold" /><p className="mt-3 font-extrabold text-[17px]">{t}</p><p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-white border-y border-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-[30px] font-extrabold">Questions</h2>
          <div className="mt-6 flex flex-col divide-y divide-line">
            {FAQ.map(([q, a], i) => (
              <div key={q}>
                <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="w-full flex items-center justify-between gap-4 py-4 text-left font-bold text-[16px] cursor-pointer">{q}<ChevronDown size={18} className={`shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} /></button>
                {open === i && <p className="pb-4 text-[15px] leading-relaxed text-muted fade-in">{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center flex flex-col items-center gap-5">
        <Logo className="h-28" />
        <h2 className="text-[30px] sm:text-[36px] font-extrabold max-w-2xl leading-tight">Grow on the job. Prove how far you’ve come.</h2>
        <p className="text-[16px] text-muted">We build our craft, one deliberate practice at a time.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => nav('/login?demo=1')} className="btn-primary !min-h-12 !px-6">Try the live demo</button>
          <Link to="/access" className="btn-ghost !min-h-12 !px-6">Request beta access</Link>
        </div>
      </section>

      <footer className="bg-indigo text-[#9A9DB5] text-[13px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap gap-4 items-center">
          <Wordmark dark />
          <span className="ml-auto">© 2026 The One Percent · Terms · Privacy · Contact</span>
        </div>
      </footer>
    </div>
  );
}
