import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Flag, Info, Building2 } from 'lucide-react';
import { useStore, skillStatus, skillById, areaName, kpiById } from '../lib/store.jsx';
import { StatusPill, Pill, Modal, SectionLabel, relDay } from '../components/ui.jsx';

const TOPICS = {
  'experiment-design': ['Sample size', 'Test duration', 'Minimum detectable effect'],
  'input-output': ['Metric trees', 'Leading vs lagging indicators', 'Owning an input metric'],
  'roadmap-comms': ['Now / Next / Later roadmaps', 'Confidence levels', 'Tailoring for sales vs engineering'],
  jtbd: ['Switch interviews', 'Job stories', 'Forces of progress'],
  cohorts: ['Retention curves', 'Cohort tables', 'Reading flattening curves'],
};

const DIM_LABEL = { remember: ['Remember', 'Quizzes · recalled after 7+ days'], apply: ['Apply', 'Graded projects'], explain: ['Explain', 'Voice interviews'] };

export default function SkillDetail() {
  const { id } = useParams();
  const { state, actions, notify } = useStore();
  const [flag, setFlag] = useState(false);
  const [reason, setReason] = useState('Not part of this role');
  const s = skillById(state, id);
  if (!s) return <p>Skill not found. <Link to="/app/skills" className="link">Back</Link></p>;
  const st = skillStatus(state, s.id);
  const e = state.evidence[s.id] || { remember: 'none', apply: 'none', explain: 'none', work: 0 };
  const concepts = state.concepts.filter((c) => c.skills.includes(s.id) && c.status !== 'out');
  const projects = state.projects.filter((p) => p.skills.includes(s.id) && p.status === 'graded');
  const interviews = state.interviews.filter((iv) => (iv.skills || []).includes(s.id) || (iv.projectId && state.projects.find((p) => p.id === iv.projectId)?.skills.includes(s.id)));
  const work = state.work.log.filter((w) => w.skills.includes(s.id));
  const buildsOn = s.buildsOn.map((b) => skillById(state, b)).filter(Boolean);
  const leadsTo = state.skills.filter((k) => k.buildsOn.includes(s.id));
  const topics = TOPICS[s.id] || [`${s.name}: core ideas`, `${s.name}: common mistakes`, `${s.name} in practice`];

  const detail = {
    remember: concepts.length ? `${concepts.length} linked concept${concepts.length > 1 ? 's' : ''}; ${concepts.filter((c) => c.last === 'right').length} answered correctly last time.` : 'No concepts yet. Add notes on this skill to start practising it.',
    apply: projects.length ? projects.map((p) => `${p.title} — ${p.result}`).join('; ') : 'No graded project yet.',
    explain: interviews.length ? interviews.map((iv) => `${iv.title} — ${iv.understanding}`).join('; ') : 'No interview yet.',
  };
  const col = { demonstrated: 'bg-indigo text-ivory', developing: 'bg-gold-soft text-gold-ink', none: 'bg-white text-muted border border-dashed border-soft' };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/app/skills" className="btn-quiet !px-2 self-start"><ArrowLeft size={18} />Skills gap</Link>
      <div className="flex flex-col gap-2">
        <span className="label">{areaName(s.area)} · {s.level}</span>
        <h1 className="text-[30px] font-extrabold leading-tight">{s.name}</h1>
        <div className="flex flex-wrap gap-2"><StatusPill status={st.status} />{s.addedByUser && <Pill tone="gold">Added by you</Pill>}{st.via && <Pill tone="white">Shown through {st.via}</Pill>}</div>
        <p className="text-[15.5px] leading-relaxed text-muted">{s.desc}</p>
      </div>

      <div><SectionLabel>Your journey with this skill</SectionLabel>
        <div className="card p-4 grid grid-cols-3 gap-2">
          {[['Learned', concepts.length ? relDay(concepts.map((c) => state.notes.find((n) => n.id === c.noteId)?.createdAt).filter(Boolean).sort()[0] || new Date().toISOString()) : 'Not yet', concepts.length ? `${concepts.length} concept${concepts.length > 1 ? 's' : ''} in your notes` : 'Add a note'],
            ['Practised', `${concepts.reduce((a, c) => a + (c.asked || 0), 0)} times`, 'spaced over time'],
            ['Used at work', work.length ? `${work.length} time${work.length > 1 ? 's' : ''}` : 'Not yet', work.length ? `last ${relDay(work[0].date).toLowerCase()}` : 'Log it when you do']].map(([k, v, sub], i) => (
            <div key={k} className={`rounded-xl p-3 flex flex-col gap-0.5 ${i === 2 && work.length ? 'bg-gold-soft' : 'bg-ivory'}`}>
              <span className="text-[11.5px] font-extrabold uppercase tracking-[0.06em] text-muted">{i + 1}. {k}</span>
              <span className="text-[17px] font-extrabold">{v}</span>
              <span className="text-[12px] text-muted">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div><SectionLabel>Your evidence</SectionLabel>
        <div className="card divide-y divide-line">
          {Object.entries(DIM_LABEL).map(([d, [l, sub]]) => (
            <div key={d} className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2"><span className="flex flex-col"><span className="font-extrabold">{l}</span><span className="text-[12px] text-muted">{sub}</span></span><span className={`pill ${col[st.via ? 'demonstrated' : e[d]]}`}>{st.via ? 'Shown through higher skill' : { demonstrated: 'Demonstrated', developing: 'Developing', none: 'No evidence' }[e[d]]}</span></div>
              <p className="text-[13.5px] text-muted">{detail[d]}</p>
            </div>
          ))}
          <div className="p-4 flex flex-col gap-2 bg-ivory">
            <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 font-extrabold"><Building2 size={17} />Used at work</span><Pill tone="outline">Self-reported · {work.length}</Pill></div>
            {work.length ? work.slice(0, 3).map((w) => <p key={w.id} className="text-[13.5px] border-l-[3px] border-gold pl-3"><span className="text-muted">{relDay(w.date)}:</span> {w.text}{w.kpi && <span className="text-muted"> · KPI: {kpiById(state, w.kpi)?.name}</span>}</p>) : <p className="text-[13.5px] text-muted">Nothing logged yet. Log work that uses this skill to connect learning to real impact.</p>}
            <p className="text-[12px] text-muted">Shown beside your assessed evidence. It never changes the status on its own.</p>
          </div>
        </div>
      </div>

      {st.status !== 'demonstrated' && (
        <div><SectionLabel>What to do next</SectionLabel>
          <div className="card p-5 flex flex-col gap-5">
            <div className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-indigo text-ivory text-[13px] font-extrabold flex items-center justify-center">1</span><div className="flex flex-col gap-2"><p className="font-extrabold">Study these topics</p><div className="flex flex-wrap gap-1.5">{topics.map((t) => <Pill key={t} tone="sand">{t}</Pill>)}</div><p className="text-[12.5px] text-muted flex gap-1.5"><Info size={14} className="shrink-0 mt-0.5" />Suggested by AI from the skill map. Check them against your course or a trusted source.</p></div></div>
            <div className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-indigo text-ivory text-[13px] font-extrabold flex items-center justify-center">2</span><div className="flex flex-col gap-2"><p className="font-extrabold">Add your notes</p><p className="text-[14px] text-muted">New concepts join your practice the same day.</p><Link to="/app/library/new" className="btn-ghost self-start">Add a note</Link></div></div>
            <div className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-full bg-indigo text-ivory text-[13px] font-extrabold flex items-center justify-center">3</span><div className="flex flex-col gap-2"><p className="font-extrabold">Prove it</p><p className="text-[14px] text-muted">{e.apply !== 'demonstrated' ? 'A graded project gives Apply evidence. ' : ''}{e.explain !== 'demonstrated' ? 'A voice interview gives Explain evidence.' : ''}</p>
              <div className="flex flex-wrap gap-2">{e.apply !== 'demonstrated' && <Link to={projects[0] ? `/app/projects/${projects[0].id}` : '/app/projects'} className="btn-primary">{projects[0] ? 'Revise project' : 'Find a project'}</Link>}{e.explain !== 'demonstrated' && <Link to={`/app/interviews/concept/${s.area}`} className="btn-ghost">Concept interview</Link>}<Link to="/app/practice?kind=skill" className="btn-quiet border border-line bg-white">Skill check</Link></div></div></div>
          </div>
        </div>
      )}

      {concepts.length > 0 && <div><SectionLabel>Linked concepts · {concepts.length}</SectionLabel><div className="flex flex-wrap gap-1.5">{concepts.map((c) => <Pill key={c.id} tone="white">{c.name}</Pill>)}</div></div>}
      {(buildsOn.length > 0 || leadsTo.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {buildsOn.length > 0 && <div className="card p-4"><span className="label">Builds on</span><div className="mt-2 flex flex-col gap-1">{buildsOn.map((b) => <Link key={b.id} to={`/app/skills/${b.id}`} className="link text-[14px]">{b.name}</Link>)}</div></div>}
          {leadsTo.length > 0 && <div className="card p-4"><span className="label">Leads to</span><div className="mt-2 flex flex-col gap-1">{leadsTo.map((b) => <Link key={b.id} to={`/app/skills/${b.id}`} className="link text-[14px]">{b.name}</Link>)}</div><p className="text-[12px] text-muted mt-2">Demonstrating a higher skill also demonstrates this one.</p></div>}
        </div>
      )}
      {!s.addedByUser && <button onClick={() => setFlag(true)} className="btn-quiet self-start text-muted"><Flag size={16} />This skill doesn’t fit my role</button>}
      <Modal open={flag} onClose={() => setFlag(false)} title="Tell us what’s wrong">
        <p className="text-[14px] text-muted mb-3">Your skill map won’t change now — everyone in a role is measured against the same standard. Flags guide our reviews, and fixes reach everyone.</p>
        <div className="flex flex-col gap-2">{['Not part of this role', 'Duplicate of another skill', 'Wrong level', 'Unclear description'].map((r) => <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-[1.5px] cursor-pointer ${reason === r ? 'border-indigo bg-sand' : 'border-line bg-white'}`}><input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-indigo" />{r}</label>)}</div>
        <textarea className="textarea mt-3" rows={2} placeholder="Comment (optional)" />
        <button onClick={() => { actions.flagSkill(s.id, reason); setFlag(false); notify('Thanks. We’ll review this skill.'); }} className="btn-primary w-full mt-3">Send flag</button>
      </Modal>
    </div>
  );
}
