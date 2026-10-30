import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Mic, Briefcase, Lightbulb, Plus, Upload, Target, Sparkles, ChevronRight, ClipboardList } from 'lucide-react';
import { useStore, levelSummary, nextStep, kpiById, conceptById, areaName } from '../lib/store.jsx';
import { Pill, Progress, relDay, SectionLabel } from '../components/ui.jsx';
import WorkComposer from '../components/WorkComposer.jsx';

export function kpiProgress(k) {
  const span = k.target - k.start;
  return span === 0 ? 0 : Math.round(((k.current - k.start) / span) * 100);
}

export default function Home() {
  const { state } = useStore();
  const nav = useNavigate();
  const { user, projects, work } = state;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const active = projects.find((p) => p.status === 'in_progress');
  const offered = projects.find((p) => p.status === 'offered');
  const interviewReady = projects.find((p) => p.interview === 'available');
  const apply = work.implementations.find((m) => m.status === 'new');
  const suggested = work.stories.find((s) => s.status === 'suggested');
  const levels = levelSummary(state);
  const tot = levels.reduce((a, l) => a + l.total, 0);
  const dem = levels.reduce((a, l) => a + l.demonstrated, 0);
  const dev = levels.reduce((a, l) => a + l.developing, 0);
  const next = nextStep(state);
  const due = state.concepts.filter((c) => c.status === 'active' && new Date(c.due) <= new Date(Date.now() + 864e5)).length;
  const days = Array.from({ length: 14 }, (_, i) => 13 - i);
  const eveningDone = state.sessionsToday.evening;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[14px] font-semibold text-muted">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 className="text-[28px] font-extrabold">{greet}, {user.first}</h1>
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 items-start">
        <div className="flex flex-col gap-5">
          {/* Practice */}
          <div className="bg-indigo text-ivory rounded-3xl p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3"><span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">{hour < 15 ? 'Morning' : 'Evening'} practice</span><span className="text-[13px] text-[#C9CBDA]">6 questions · about 5 min</span></div>
            {eveningDone ? (
              <>
                <p className="text-[22px] font-extrabold leading-snug">Both sessions done today. See you tomorrow at {user.morning}.</p>
                <button onClick={() => nav('/app/practice?kind=extra')} className="btn self-start border-[1.5px] border-ivory text-ivory hover:bg-indigo-2">Practise a little more</button>
              </>
            ) : (
              <>
                <p className="text-[22px] font-extrabold leading-snug">Your five-minute practice is ready.</p>
                <p className="text-[14.5px] text-[#C9CBDA]">{due} concepts are due: reviews from last week, 3 new ones from yesterday’s stakeholder notes, and your weak spot on opportunity cost.</p>
                <button onClick={() => nav('/app/practice')} className="btn-gold !min-h-12 self-start !px-6">Start practice <ArrowRight size={18} /></button>
              </>
            )}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex gap-1" aria-label="Practice over the last 14 days">{days.map((d) => <span key={d} title={relDay(new Date(Date.now() - d * 864e5).toISOString())} className={`w-3.5 h-3.5 rounded-[4px] ${state.practiceDays.includes(d) ? 'bg-gold' : 'bg-indigo-3'}`} />)}</div>
              <span className="text-[12.5px] text-[#C9CBDA]">{state.practiceDays.length} of the last 14 days</span>
            </div>
          </div>

          {/* Work today */}
          <div className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 font-extrabold text-[17px]"><ClipboardList size={19} />Log one thing from today</span><Link to="/app/work" className="text-[13.5px] font-bold link">Work log</Link></div>
            <WorkComposer compact />
          </div>

          {/* Apply */}
          {apply && (
            <Link to="/app/work?tab=apply" className="card p-5 flex flex-col gap-2.5 border-gold border-[1.5px] bg-[#FFFBF1] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-2"><span className="label !text-gold-ink flex items-center gap-1.5"><Lightbulb size={14} />Apply what you learned</span><Pill tone="gold">KPI: {kpiById(state, apply.kpi)?.name}</Pill></div>
              <p className="text-[17px] font-extrabold leading-snug">{apply.title}</p>
              <p className="text-[14px] text-muted leading-relaxed">{apply.why}</p>
              <p className="text-[13px] font-semibold text-indigo">From: {apply.concepts.map((c) => conceptById(state, c)?.name).join(', ')}</p>
            </Link>
          )}

          {/* Projects and interview */}
          <div className="grid sm:grid-cols-2 gap-4">
            {active && (
              <Link to={`/app/projects/${active.id}`} className="card p-5 flex flex-col gap-2 hover:border-soft">
                <div className="flex items-center justify-between gap-2"><span className="label flex items-center gap-1.5"><Briefcase size={14} />Active project</span><Pill tone="gold">Due {relDay(active.due)}</Pill></div>
                <p className="font-extrabold text-[16px] leading-snug">{active.title}</p>
                <Progress value={active.progress} className="mt-1" /><span className="text-[12.5px] text-muted">Draft started · document submission</span>
              </Link>
            )}
            {interviewReady && (
              <Link to={`/app/interviews/project/${interviewReady.id}`} className="card p-5 flex flex-col gap-2 hover:border-soft">
                <span className="label flex items-center gap-1.5"><Mic size={14} />Interview ready · 12 min</span>
                <p className="font-extrabold text-[16px] leading-snug">Defend your onboarding funnel project</p>
                <span className="text-[13.5px] text-muted">You scored Meets. Now explain your reasoning out loud.</span>
              </Link>
            )}
            {offered && (
              <Link to="/app/projects" className="card p-5 flex flex-col gap-2 hover:border-soft sm:col-span-2">
                <span className="label">New project unlocked · {areaName(offered.area)}</span>
                <p className="font-extrabold text-[16px] leading-snug">{offered.title}</p>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Skills */}
          <Link to="/app/skills" className="card p-5 flex flex-col gap-3 hover:border-soft">
            <div className="flex items-center justify-between"><span className="label">Skills gap · {user.role}</span><ChevronRight size={18} /></div>
            <div className="flex h-3 rounded-full overflow-hidden bg-white border border-dashed border-soft">
              <div className="bg-indigo" style={{ width: `${(dem / tot) * 100}%` }} /><div className="bg-gold" style={{ width: `${(dev / tot) * 100}%` }} />
            </div>
            <p className="text-[14px]"><strong>{dem}</strong> demonstrated · <strong>{dev}</strong> developing · <strong>{tot - dem - dev}</strong> not covered</p>
            {next && <p className="text-[14px] text-muted border-t border-line pt-3">Next step: <strong className="text-indigo">{next.name}</strong> ({next.level}) in {areaName(next.area)}.</p>}
          </Link>

          {/* KPIs */}
          <Link to="/app/work?tab=goals" className="card p-5 flex flex-col gap-3.5 hover:border-soft">
            <div className="flex items-center justify-between"><span className="label flex items-center gap-1.5"><Target size={14} />Your goals at {work.profile.company}</span><ChevronRight size={18} /></div>
            {work.kpis.map((k) => (
              <div key={k.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13.5px] gap-2"><span className="font-bold">{k.name}</span><span className="text-muted whitespace-nowrap">{k.current.toLocaleString()}{k.unit} · target {k.target.toLocaleString()}{k.unit}</span></div>
                <Progress value={kpiProgress(k)} tone="gold" />
              </div>
            ))}
          </Link>

          {suggested && (
            <Link to="/app/work?tab=stories" className="card p-5 flex flex-col gap-2 hover:border-soft">
              <span className="label flex items-center gap-1.5"><Sparkles size={14} />New STAR story drafted</span>
              <p className="font-extrabold text-[16px]">{suggested.title}</p>
              <span className="text-[13.5px] text-muted">Built from {suggested.entries.length} of your work entries. Review and approve it.</span>
            </Link>
          )}

          <div>
            <SectionLabel>Capture</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/app/library/new" className="btn-ghost"><Plus size={18} />Add note</Link>
              <Link to="/app/library/upload" className="btn-ghost"><Upload size={18} />Upload</Link>
              <Link to="/app/practice?kind=skill" className="btn-quiet col-span-2 border border-line bg-white"><Target size={17} />Take a skill check</Link>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3 text-[13.5px] text-muted"><Check size={18} className="text-ok shrink-0" />Last note: “{state.notes[0]?.title}” · {relDay(state.notes[0]?.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}
