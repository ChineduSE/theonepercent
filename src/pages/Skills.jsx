import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Building2 } from 'lucide-react';
import { useStore, skillStatus, levelSummary, nextStep, DIMS, uid } from '../lib/store.jsx';
import { AREAS } from '../lib/seed.js';
import { PageHeader, StatusPill, Pill, Modal, SectionLabel } from '../components/ui.jsx';

const DIM_STYLE = { demonstrated: 'bg-indigo text-ivory border-indigo', developing: 'bg-gold-soft text-gold-ink border-gold-soft', none: 'bg-white text-soft border-soft border-dashed' };
const DIM_WORD = { demonstrated: 'demonstrated', developing: 'developing', none: 'no evidence' };

export function Dims({ e }) {
  return (
    <span className="flex gap-1" aria-label={DIMS.map((d) => `${d} ${DIM_WORD[e[d]]}`).join(', ')}>
      {DIMS.map((d) => <span key={d} className={`w-6 h-6 rounded-md border-[1.5px] text-[11px] font-extrabold flex items-center justify-center ${DIM_STYLE[e[d]]}`}>{d[0].toUpperCase()}</span>)}
    </span>
  );
}

export default function Skills() {
  const { state, actions, notify } = useStore();
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [check, setCheck] = useState(null);
  const levels = levelSummary(state);
  const dem = levels.reduce((a, l) => a + l.demonstrated, 0); const tot = levels.reduce((a, l) => a + l.total, 0);
  const next = nextStep(state);
  const added = state.skills.filter((s) => s.addedByUser);

  const runCheck = () => {
    const t = name.trim().toLowerCase();
    const dup = state.skills.find((s) => s.name.toLowerCase().includes(t) || t.includes(s.name.toLowerCase()) || (t.includes('rice') && s.id === 'prio-frameworks') || (t.includes('a/b') && s.id === 'ab-basics'));
    if (dup) setCheck({ type: 'dup', skill: dup });
    else if (/cook|football|guitar|dance|bake/.test(t)) setCheck({ type: 'unrelated' });
    else setCheck({ type: 'ok', level: /strategy|vision|lead|org/.test(t) ? 'Advanced' : 'Practitioner' });
  };
  const confirmAdd = () => {
    actions.addSkill({ id: uid('skill'), area: 'strat', name: name.trim().replace(/\b\w/, (m) => m.toUpperCase()), level: check.level, desc: `Learner-added skill for ${state.user.role}. Evidence is earned the same way as any other skill.` });
    notify('Added to your map as “Added by you”.'); setAdding(false); setName(''); setCheck(null);
  };

  const shown = (s) => {
    const st = skillStatus(state, s.id).status;
    if (filter === 'added') return s.addedByUser;
    if (filter === 'all') return true;
    return st === filter;
  };

  return (
    <div>
      <PageHeader title="Skills gap" sub={`${state.user.role} · framework v3 · ${tot} skills from Foundation to Senior`} action={<Pill tone="ok">Reviewed framework</Pill>} />
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 mb-6">
        <div className="card p-5 flex flex-col gap-3.5">
          <div className="flex justify-between"><span className="label">Progress toward senior</span><span className="text-[13.5px] font-bold">{dem} of {tot} demonstrated</span></div>
          {levels.map((l) => (
            <div key={l.level} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[13.5px]"><span className="font-bold">{l.level}</span><span className="text-muted">{l.demonstrated} demonstrated · {l.developing} developing · {l.total - l.demonstrated - l.developing} not covered</span></div>
              <div className="flex h-3 rounded-full overflow-hidden bg-white border border-dashed border-soft"><div className="bg-indigo" style={{ width: `${(l.demonstrated / l.total) * 100}%` }} /><div className="bg-gold" style={{ width: `${(l.developing / l.total) * 100}%` }} /></div>
            </div>
          ))}
          {added.length > 0 && <p className="text-[13.5px] font-semibold text-gold-ink">+{added.length} skill{added.length > 1 ? 's' : ''} beyond the standard map</p>}
          <div className="flex flex-wrap gap-4 text-[12.5px] text-muted pt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo" />Demonstrated</span><span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gold" />Developing</span><span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-dashed border-soft" />Not covered</span>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {next && <Link to={`/app/skills/${next.id}`} className="card p-5 flex flex-col gap-2 border-gold border-[1.5px] bg-[#FFFBF1] hover:shadow-md">
            <span className="label !text-gold-ink">Your next step</span>
            <p className="text-[17px] font-extrabold leading-snug">{next.name} is your closest gap ({next.level}).</p>
            <p className="text-[13.5px] text-muted">See what to study and how to prove it →</p>
          </Link>}
          <div className="card p-5 flex flex-col gap-2">
            <span className="label">How skills are proven</span>
            <p className="text-[13.5px] leading-relaxed text-muted"><strong className="text-indigo">R</strong> Remember (quizzes, recalled after 7+ days) · <strong className="text-indigo">A</strong> Apply (graded projects) · <strong className="text-indigo">E</strong> Explain (voice interviews). A skill is Demonstrated when all three are. <span className="inline-flex items-center gap-1"><Building2 size={13} /><strong className="text-indigo">Used at work</strong></span> is self-reported and shown beside, never counted.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[['all', 'All'], ['demonstrated', 'Demonstrated'], ['developing', 'Developing'], ['none', 'Not covered'], ['added', 'Added by you']].map(([v, l]) => <button key={v} onClick={() => setFilter(v)} className={`pill !text-[13px] !py-2 !px-3.5 cursor-pointer border-[1.5px] ${filter === v ? 'bg-indigo text-ivory border-indigo' : 'bg-white border-line text-indigo'}`}>{l}</button>)}
        <button onClick={() => setAdding(true)} className="btn-ghost !min-h-9 ml-auto"><Plus size={16} />Add a skill</button>
      </div>

      <div className="flex flex-col gap-5">
        {AREAS.map((a) => {
          const list = state.skills.filter((s) => s.area === a.id && shown(s));
          if (!list.length) return null;
          const all = state.skills.filter((s) => s.area === a.id && !s.addedByUser);
          const d = all.filter((s) => skillStatus(state, s.id).status === 'demonstrated').length;
          return (
            <div key={a.id}>
              <SectionLabel right={<span className="text-[12.5px] text-muted">{d} of {all.length} demonstrated</span>}>{a.name}</SectionLabel>
              <div className="card divide-y divide-line overflow-hidden">
                {list.map((s) => {
                  const st = skillStatus(state, s.id); const e = state.evidence[s.id] || { remember: 'none', apply: 'none', explain: 'none' };
                  return (
                    <Link key={s.id} to={`/app/skills/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ivory">
                      <span className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className="font-bold text-[15px]">{s.name}</span>
                        <span className="flex flex-wrap items-center gap-1.5"><StatusPill status={st.status} /><span className="text-[12px] text-muted">{s.level}</span>{s.addedByUser && <Pill tone="gold">Added by you</Pill>}{st.via && <span className="text-[12px] text-muted">via {st.via}</span>}{e.work > 0 && <span className="text-[12px] font-semibold text-indigo flex items-center gap-1"><Building2 size={12} />Used at work ×{e.work}</span>}</span>
                      </span>
                      <Dims e={st.via ? { remember: 'demonstrated', apply: 'demonstrated', explain: 'demonstrated' } : e} />
                      <ChevronRight size={17} className="text-muted shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={adding} onClose={() => { setAdding(false); setCheck(null); }} title="Add a skill the AI missed">
        <p className="text-[14px] text-muted mb-3">Your course went deeper than the standard map? Add the skill. The AI checks it’s real, related to {state.user.role}, and not a duplicate.</p>
        <input className="input" value={name} onChange={(e) => { setName(e.target.value); setCheck(null); }} placeholder="e.g. Pricing experiments, Agent banking flows" />
        {!check && <button disabled={name.trim().length < 3} onClick={runCheck} className="btn-primary w-full mt-3">Check skill</button>}
        {check?.type === 'dup' && <div className="mt-3 rounded-xl bg-sand p-3 flex flex-col gap-2 fade-in"><p className="text-[14px]">This is already covered by <strong>{check.skill.name}</strong>. Your notes on it will count there.</p><Link to={`/app/skills/${check.skill.id}`} className="btn-ghost self-start">Open {check.skill.name}</Link></div>}
        {check?.type === 'unrelated' && <p className="mt-3 text-[14px] text-bad font-semibold">This doesn’t look related to {state.user.role}, so it can’t be added to this map.</p>}
        {check?.type === 'ok' && <div className="mt-3 rounded-xl bg-ok-soft p-3 flex flex-col gap-2 fade-in"><p className="text-[14px]">Looks like a real {state.user.role} skill. Suggested level: <strong>{check.level}</strong>. It counts beside your progress toward senior, not inside it. If many learners add it, it may join the shared map.</p><button onClick={confirmAdd} className="btn-primary self-start">Add to my map</button></div>}
      </Modal>
    </div>
  );
}
