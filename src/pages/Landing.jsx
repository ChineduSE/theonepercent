import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, NotebookPen, Zap, Briefcase, Mic, BarChart3, UserRound, ClipboardList, Sparkles, Target, FileText, ShieldCheck, Eye, Scale, ChevronDown, KeyRound } from 'lucide-react';
import { Logo, Wordmark, IMG } from '../components/ui.jsx';

const jump = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/store.jsx';

const LOOP = [
  { icon: NotebookPen, t: 'Capture', d: 'Add notes, PDFs and slides from any course, book or webinar.' },
  { icon: Zap, t: 'Practise', d: 'Five minutes, morning and evening, built only from what you learned.' },
  { icon: Briefcase, t: 'Apply', d: 'AI-generated projects with briefs, rubrics and deadlines.' },
  { icon: Mic, t: 'Defend', d: 'Voice interviews that ask why, not just what.' },
  { icon: BarChart3, t: 'See the gap', d: 'Every skill your target role needs, up to senior, with your evidence.' },
  { icon: UserRound, t: 'Show it', d: 'A portfolio of graded work you can share with employers.' },
];

const WORK = [
  { icon: ClipboardList, t: 'Work log', d: 'Sixty seconds a day. The AI asks what changed, and links each entry to your skills and KPIs.' },
  { icon: Sparkles, t: 'STAR stories', d: 'Entries become Situation, Task, Action, Result stories you can edit and approve.' },
  { icon: Target, t: 'Apply what you learn', d: 'Your notes meet your KPIs: concrete ways to use this week’s learning on this quarter’s goals.' },
  { icon: FileText, t: 'Career documents', d: 'Review self-assessments, promotion cases, CV bullets and interview answers, grounded in your own evidence.' },
];

const FAQ = [
  ['Is this another course platform?', 'No. Bring the learning you already have — courses, books, webinars, your own notes. The One Percent turns it into practice, projects and evidence.'],
  ['How is this different from asking a chatbot to quiz me?', 'It remembers everything you have learned, brings concepts back just before you forget them, measures you against a full skill map for your role, and connects quizzes, projects, interviews and your real work into one record.'],
  ['Who is it for?', 'Early-career professionals and career switchers in any role — product, engineering, data, marketing, business development and more. Type your role and the skill map is built for you.'],
  ['Are AI grades a qualification?', 'No. Every assessment shows its criteria and reasoning, and you can question it. Results are practice evidence, not professional certification.'],
  ['What happens to my work logs?', 'They are private by default, never shown on your portfolio, and never used to train AI. Documents you generate can hide company names and figures.'],
];

export default function Landing() {
  const nav = useNavigate();
  const [open, setOpen] = useState(0);
  return (
    <div className="bg-ivory text-indigo">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-indigo/95 backdrop-blur text-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/"><Wordmark dark /></Link>
          <nav className="hidden md:flex items-center gap-6 ml-8 text-[14px] font-semibold text-[#C9CBDA]">
            <a href="#how" onClick={jump('how')} className="hover:text-ivory">How it works</a>
            <a href="#work" onClick={jump('work')} className="hover:text-ivory">For working professionals</a>
            <a href="#trust" onClick={jump('trust')} className="hover:text-ivory">Trust</a>
            <a href="#faq" onClick={jump('faq')} className="hover:text-ivory">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="btn !min-h-10 text-ivory hover:bg-indigo-2">Sign in</Link>
            <Link to="/access" className="btn-gold !min-h-10">Get started</Link>
          </div>
        </div>
      </header>

      {/* Demo banner */}
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
            <span className="text-[12px] tracking-[0.14em] font-bold text-gold uppercase">Learning retention · Skill development · Career evidence</span>
            <h1 className="text-[40px] sm:text-[56px] leading-[1.05] font-extrabold">Own your intelligence.<br /><span className="text-gold">Own your craft.</span></h1>
            <p className="text-[18px] leading-relaxed text-[#D7D8E4] max-w-xl">Turn what you learn into knowledge you can use — and the work you do into evidence of your impact. AI creates the challenge. You do the thinking.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => nav('/login?demo=1')} className="btn-gold !min-h-12 !px-6 !text-[16px]">Try the live demo <ArrowRight size={18} /></button>
              <Link to="/access" className="btn !min-h-12 !px-6 border-[1.5px] border-ivory text-ivory hover:bg-indigo-2">Request beta access</Link>
            </div>
          </div>
          <div className="relative">
            <img src={IMG.logoGold} alt="" aria-hidden="true" className="absolute -right-10 -top-16 w-72 opacity-[0.07] pointer-events-none" />
            <div className="relative flex flex-col gap-4">
              <div className="bg-ivory text-indigo rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3"><span className="label">Evening practice · 3 of 6</span><span className="pill bg-indigo text-ivory">Scenario</span></div>
                <p className="font-bold text-[16px] leading-snug">Two days into an A/B test, the new KYC step converts 12% better. Your manager wants to ship today. What do you say?</p>
                <div className="mt-3 rounded-xl border-[1.5px] border-ok bg-ok-soft px-3 py-2.5 text-[14px] font-semibold">Wait for the planned sample size, then check the guardrail.</div>
                <p className="mt-2 text-[12.5px] text-muted">From your note · Experiment design basics</p>
              </div>
              <div className="bg-white text-indigo rounded-2xl p-5 shadow-2xl sm:ml-12">
                <div className="flex items-center justify-between mb-2"><span className="label">Work log · today</span><span className="pill bg-gold-soft text-gold-ink">Onboarding KPI</span></div>
                <p className="text-[14.5px] leading-snug">Set up the deferred-ID A/B test with fraud rate as the guardrail.</p>
                <p className="mt-2 text-[13px] font-bold text-ok">✓ Learned 13 days ago · used at work today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1"><span className="label">The problem</span><h2 className="mt-2 text-[30px] font-extrabold leading-tight">You learn a lot. Most of it fades.</h2></div>
        <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
          {[['Courses end', 'Notes go unread. When the moment comes to use what you learned, it isn’t there.'], ['AI answers for you', 'It’s easy to produce work you can’t explain. Interviews and real decisions expose the gap.'], ['Impact goes unrecorded', 'At review time you can’t remember what you achieved, or prove how you grew.']].map(([t, d]) => (
            <div key={t} className="card p-5"><p className="font-extrabold text-[17px]">{t}</p><p className="mt-2 text-[14.5px] leading-relaxed text-muted">{d}</p></div>
          ))}
        </div>
      </section>

      {/* Loop */}
      <section id="how" className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="label">How it works</span>
          <h2 className="mt-2 text-[30px] sm:text-[36px] font-extrabold leading-tight max-w-2xl">One connected loop. Each step feeds the next.</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LOOP.map(({ icon: Icon, t, d }, i) => (
              <div key={t} className="rounded-2xl border border-line p-6 bg-ivory">
                <div className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-indigo text-gold flex items-center justify-center"><Icon size={20} /></span><span className="text-[13px] font-bold text-muted">0{i + 1}</span></div>
                <p className="mt-4 font-extrabold text-[18px]">{t}</p>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[15px] text-muted max-w-3xl">Type any role — Product Manager, Business Development Officer, Data Analyst — and the AI builds the skill map from foundation to senior. Your quizzes, projects and interviews fill it with evidence across <strong className="text-indigo">Remember, Apply and Explain</strong>.</p>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="bg-indigo text-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <span className="text-[12px] tracking-[0.14em] font-bold text-gold uppercase">New · For working professionals</span>
          <h2 className="mt-2 text-[30px] sm:text-[36px] font-extrabold leading-tight max-w-3xl">Learn it, practise it, use it at work — and prove the impact.</h2>
          <p className="mt-4 text-[16px] text-[#D7D8E4] max-w-2xl">Already in a role? Log what you do, track your KPIs, and let the platform connect your learning to real results. Career switchers get credit too: your current work becomes transferable evidence for your target role.</p>
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {WORK.map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl bg-indigo-2 p-6 flex gap-4"><span className="w-11 h-11 shrink-0 rounded-xl bg-gold text-indigo flex items-center justify-center"><Icon size={21} /></span><div><p className="font-extrabold text-[18px]">{t}</p><p className="mt-1.5 text-[14.5px] leading-relaxed text-[#C9CBDA]">{d}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <span className="label">Trust</span>
        <h2 className="mt-2 text-[30px] font-extrabold leading-tight">Honest by design.</h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[[Eye, 'Every question shows its source', 'Each question links to the note it came from. Anything from outside your notes is labelled.'], [Scale, 'Every grade shows its reasoning', 'See the rubric, the score per criterion and why. Disagree? Request a second review.'], [ShieldCheck, 'Your data stays yours', 'Notes, recordings and work logs are private and never used to train AI. You control audio and sharing.']].map(([Icon, t, d]) => (
            <div key={t} className="card p-6"><Icon size={22} className="text-gold" /><p className="mt-3 font-extrabold text-[17px]">{t}</p><p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{d}</p></div>
          ))}
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center flex flex-col items-center gap-5">
        <Logo className="h-28" />
        <h2 className="text-[30px] sm:text-[36px] font-extrabold max-w-2xl leading-tight">We build our craft, one deliberate practice at a time.</h2>
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
