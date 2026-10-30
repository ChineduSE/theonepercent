import { Link, useNavigate } from 'react-router-dom';
import { Lock, FileText } from 'lucide-react';
import { useStore, skillStatus } from '../lib/store.jsx';
import { ResultPill, Wordmark, Mark, fmtDate } from '../components/ui.jsx';

const redact = (t, on) => (on ? t.replace(/PayLite/g, 'a Lagos fintech').replace(/₦[\d,]+/g, 'a small amount') : t);

export default function PublicPortfolio() {
  const { state } = useStore();
  const nav = useNavigate();
  const pf = state.portfolio;
  const banner = (
    <div className="bg-sand text-[13px] font-semibold">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex flex-wrap gap-2 items-center justify-between"><span className="text-muted">Demo · public view, no sign-in needed</span>{state.session.loggedIn && <button onClick={() => nav('/app/portfolio')} className="link cursor-pointer">Back to editor</button>}</div>
    </div>
  );
  if (!pf.published) {
    return (
      <div className="min-h-screen bg-ivory">{banner}
        <div className="max-w-md mx-auto px-5 py-24 text-center flex flex-col items-center gap-4">
          <Lock size={36} className="text-soft" /><h1 className="text-[24px] font-extrabold">This portfolio is private</h1>
          <p className="text-muted">The owner hasn’t published it, or has unpublished it.</p>
          {state.session.loggedIn ? <Link to="/app/portfolio" className="btn-primary">Publish it from the editor</Link> : <Link to="/" className="btn-ghost">About The One Percent</Link>}
        </div>
      </div>
    );
  }
  const projects = state.projects.filter((p) => pf.projects.includes(p.id) && p.status === 'graded');
  const stories = state.work.stories.filter((s) => pf.stories.includes(s.id) && s.status === 'approved');
  const skills = state.skills.filter((s) => skillStatus(state, s.id).status === 'demonstrated');
  const iv = (pid) => state.interviews.find((x) => x.projectId === pid);
  return (
    <div className="min-h-screen bg-ivory">
      {banner}
      <header className="bg-indigo text-ivory">
        <div className="max-w-3xl mx-auto px-5 py-10 flex flex-col gap-4">
          <div className="flex items-center gap-4"><span className="w-16 h-16 rounded-full bg-gold text-indigo text-[22px] font-extrabold flex items-center justify-center">TA</span><div><h1 className="text-[28px] font-extrabold">{state.user.name}</h1><p className="text-gold font-bold">Working toward {state.user.role}</p></div></div>
          <p className="text-[16px] leading-relaxed text-[#E3E4EE] max-w-2xl">{pf.headline}</p>
          <p className="text-[13px] text-[#9A9DB5]">Lagos, Nigeria · practising on The One Percent since September 2026</p>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-6">
        <section className="flex flex-col gap-3"><span className="label">Graded projects</span>
          {projects.map((p) => (
            <article key={p.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2"><ResultPill result={p.result} /><span className="text-[12.5px] text-muted">{fmtDate(p.gradedAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
              <h2 className="text-[18px] font-extrabold leading-snug">{p.title}</h2>
              <p className="text-[14.5px] text-muted leading-relaxed">{p.scenario}</p>
              <div className="flex flex-col">{p.grade.map((g) => <div key={g.name} className="flex justify-between gap-3 py-2 border-t border-line text-[14px]"><span>{g.name}</span><strong>{g.result}</strong></div>)}</div>
              {pf.highlight && iv(p.id) && <div className="rounded-xl bg-ivory p-3"><span className="label">From the defence interview</span><p className="mt-1 text-[14px] italic">{iv(p.id).strongest}</p></div>}
              <span className="text-[14px] font-bold flex items-center gap-1.5"><FileText size={15} />Submission available on request</span>
            </article>
          ))}
        </section>
        {stories.length > 0 && (
          <section className="flex flex-col gap-3"><span className="label">Impact at work · self-reported</span>
            {stories.map((s) => (
              <article key={s.id} className="card p-5 flex flex-col gap-2">
                <h2 className="text-[17px] font-extrabold">{s.title}</h2>
                {[['Situation', s.situation], ['Action', s.action], ['Result', s.result]].map(([l, t]) => <p key={l} className="text-[14.5px] leading-relaxed"><strong>{l}:</strong> {redact(t, pf.redact)}</p>)}
              </article>
            ))}
          </section>
        )}
        <section className="flex flex-col gap-3"><span className="label">Demonstrated skills</span>
          <div className="flex flex-wrap gap-1.5">{skills.map((s) => <span key={s.id} className="pill bg-white border border-line">{s.name}</span>)}</div>
          <p className="text-[13px] text-muted">Each skill is backed by recall over time, a graded project and a voice interview.</p>
        </section>
        <footer className="border-t border-line pt-6 flex flex-col items-center gap-3 text-center">
          <p className="text-[12.5px] text-muted max-w-md">Results are AI assessments against stated criteria on The One Percent. They are practice evidence, not professional qualifications. Work stories are self-reported.</p>
          <Link to="/" className="flex items-center gap-2"><Mark className="h-7" /><span className="text-[12px] tracking-[0.14em] font-extrabold">THE ONE PERCENT</span></Link>
        </footer>
      </main>
    </div>
  );
}

export { Wordmark };
