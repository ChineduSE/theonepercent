import { Link } from 'react-router-dom';
import { Mic, Briefcase, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { AREAS } from '../lib/seed.js';
import { PageHeader, SectionLabel, ResultPill, relDay, Pill } from '../components/ui.jsx';

export default function Interviews() {
  const { state } = useStore();
  const defences = state.projects.filter((p) => p.status === 'graded' && p.interview === 'available');
  const stories = state.work.stories.filter((s) => s.status !== 'suggested');
  const Row = ({ to, icon: Icon, title, sub, tag }) => (
    <Link to={to} className="card p-4 flex items-center gap-4 hover:border-soft">
      <span className="w-11 h-11 rounded-xl bg-indigo text-gold flex items-center justify-center shrink-0"><Icon size={20} /></span>
      <span className="flex-1 flex flex-col gap-0.5"><span className="font-extrabold text-[15.5px] leading-snug">{title}</span><span className="text-[13px] text-muted">{sub}</span></span>
      {tag}<ChevronRight size={18} className="text-muted" />
    </Link>
  );
  return (
    <div>
      <PageHeader title="Voice interviews" sub="An AI interviewer asks you to explain and defend your thinking, then follows up. Understanding is scored; communication feedback is separate." />
      <SectionLabel>Defend a project</SectionLabel>
      <div className="flex flex-col gap-3 mb-6">
        {defences.length ? defences.map((p) => <Row key={p.id} to={`/app/interviews/project/${p.id}`} icon={Briefcase} title={p.title} sub={`Graded ${p.result} · about 12 minutes`} tag={<Pill tone="gold">Ready</Pill>} />) : <p className="text-[14px] text-muted">Graded projects appear here for a defence interview.</p>}
      </div>
      <SectionLabel>Concept interview by skill area</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {AREAS.slice(0, 4).map((a) => <Row key={a.id} to={`/app/interviews/concept/${a.id}`} icon={BookOpen} title={a.name} sub="About 10 minutes · explain and apply" />)}
      </div>
      <SectionLabel>Behavioural practice from your work stories</SectionLabel>
      <div className="flex flex-col gap-3 mb-6">
        {stories.map((s) => <Row key={s.id} to={`/app/interviews/story/${s.id}`} icon={Sparkles} title={`“Tell me about a time…” · ${s.title}`} sub="Uses your own STAR story · about 8 minutes" tag={s.practised ? <Pill tone="ok">Practised</Pill> : null} />)}
      </div>
      <SectionLabel>History</SectionLabel>
      <div className="flex flex-col gap-3">
        {state.interviews.map((iv) => (
          <div key={iv.id} className="card p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2"><span className="font-extrabold flex items-center gap-2"><Mic size={16} />{iv.title}</span><ResultPill result={iv.understanding} /></div>
            <span className="text-[13px] text-muted">{relDay(iv.date)} · {iv.duration}</span>
            <p className="text-[14px] border-l-[3px] border-gold pl-3">{iv.strongest}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
