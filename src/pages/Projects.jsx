import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Lock } from 'lucide-react';
import { useStore, uid, areaName } from '../lib/store.jsx';
import { AREAS, dayISO } from '../lib/seed.js';
import { PageHeader, Pill, ResultPill, Progress, Modal, relDay, SectionLabel } from '../components/ui.jsx';

const TEMPLATE = {
  disc: { title: 'Synthesise 40 support tickets into three product opportunities', scenario: 'A savings app has 40 recent support tickets and 6 interview notes. The team wants to know what to fix first.', ask: 'Find the patterns, frame the top problem, and recommend what to explore.', concepts: ['c-jtbd', 'c-switch', 'c-four-risks'], skills: ['research-synthesis', 'problem-framing'] },
  prio: { title: 'Cut a 12-item backlog to a 6-week release', scenario: 'A logistics startup must ship a driver app update in 6 weeks with 3 engineers.', ask: 'Choose what ships and explain what you cut.', concepts: ['c-rice', 'c-moscow', 'c-oppcost'], skills: ['prio-frameworks', 'tradeoffs'] },
  metr: { title: 'Design an experiment for a new savings nudge', scenario: 'A neobank wants to test weekly “save ₦2,000” nudges.', ask: 'Write the hypothesis, metrics, sample and stopping rule.', concepts: ['c-hypothesis', 'c-sample', 'c-guardrail'], skills: ['experiment-design'] },
  deliv: { title: 'Write the release plan for a card-freezing feature', scenario: 'Users want to freeze a lost card instantly in the app.', ask: 'Write the stories and a phased rollout with rollback criteria.', concepts: ['c-mlp'], skills: ['user-stories', 'release-planning'] },
  stake: { title: 'Brief a sceptical CFO on a pricing experiment', scenario: 'The CFO fears that testing a lower fee will cut revenue.', ask: 'Write the one-page brief and anticipate her objections.', concepts: ['c-pi-grid', 'c-disagree'], skills: ['stakeholder-alignment', 'product-briefs'] },
  strat: { title: 'Scope a minimum lovable USSD savings product', scenario: 'A microfinance bank wants feature-phone users to save daily.', ask: 'Define the smallest release users would love, within USSD limits.', concepts: ['c-mlp', 'c-ussd-timeout'], skills: ['mlp', 'ussd-design'] },
};

export default function Projects() {
  const { state, actions, notify } = useStore();
  const nav = useNavigate();
  const [req, setReq] = useState(false);
  const [area, setArea] = useState('disc');
  const offered = state.projects.filter((p) => p.status === 'offered');
  const active = state.projects.filter((p) => p.status === 'in_progress' || p.status === 'grading');
  const graded = state.projects.filter((p) => p.status === 'graded');

  const accept = (p) => { actions.setProject(p.id, { status: 'in_progress', due: dayISO(7, 23, 59), progress: 0 }); notify(`Accepted. Due ${new Date(dayISO(7)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}. Reminders at the halfway point and 24 hours before.`); };
  const request = () => {
    const t = TEMPLATE[area];
    const id = uid('p');
    actions.addProject({
      id, status: 'offered', area, level: 'Practitioner', hours: 'About 2 hours', submission: 'document', unlockReason: 'You requested this project.',
      title: t.title, scenario: t.scenario, ask: t.ask, deliverables: ['Your analysis or plan (1–3 pages)', 'Your recommendation and its trade-off', 'How you would know it worked'],
      rubric: [{ name: 'Problem understanding', weight: '35%', meets: 'States the problem and who has it.', exceeds: 'Uses evidence to rank problems.' }, { name: 'Quality of recommendation', weight: '40%', meets: 'Clear, feasible and tied to the problem.', exceeds: 'Names risks and how to reduce them.' }, { name: 'Communication', weight: '25%', meets: 'Easy to follow.', exceeds: 'Tailored to the audience.' }],
      concepts: t.concepts, skills: t.skills,
    });
    setReq(false); notify('Your project brief is ready under “New for you”.');
  };
  const areaReady = (a) => state.concepts.filter((c) => c.status === 'active' && c.skills.some((s) => state.skills.find((k) => k.id === s)?.area === a)).length;

  return (
    <div>
      <PageHeader title="Projects" sub="Realistic briefs built from your concepts and your role. Graded against stated criteria." action={<button onClick={() => setReq(true)} className="btn-ghost"><Plus size={17} />Request a project</button>} />
      {offered.length > 0 && <SectionLabel>New for you</SectionLabel>}
      <div className="flex flex-col gap-3 mb-5">
        {offered.map((p) => (
          <div key={p.id} className="card p-5 flex flex-col gap-3 border-gold border-[1.5px]">
            <div className="flex flex-wrap items-center justify-between gap-2"><Pill tone="gold">{p.level} · {areaName(p.area)}</Pill><span className="text-[13px] text-muted">{p.hours}</span></div>
            <Link to={`/app/projects/${p.id}`} className="text-[18px] font-extrabold leading-snug hover:underline">{p.title}</Link>
            <p className="text-[14px] text-muted">{p.unlockReason} Draws on: {p.concepts.map((c) => state.concepts.find((x) => x.id === c)?.name).filter(Boolean).join(', ')}.</p>
            <div className="flex flex-wrap gap-2"><button onClick={() => accept(p)} className="btn-primary">Accept · due in 7 days</button><Link to={`/app/projects/${p.id}`} className="btn-ghost">Read the brief</Link><button onClick={() => { actions.setProject(p.id, { status: 'declined' }); notify('No problem. It will be offered again later.'); }} className="btn-quiet">Not now</button></div>
          </div>
        ))}
      </div>

      {active.length > 0 && <SectionLabel>In progress</SectionLabel>}
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {active.map((p) => (
          <Link key={p.id} to={`/app/projects/${p.id}`} className="card p-5 flex flex-col gap-2 hover:border-soft">
            <div className="flex items-center justify-between gap-2"><Pill tone="gold">Due {relDay(p.due)}</Pill><span className="text-[13px] text-muted capitalize">{p.submission}</span></div>
            <p className="font-extrabold text-[16px] leading-snug">{p.title}</p>
            <Progress value={p.progress || 5} /><span className="text-[12.5px] text-muted">{p.progress ? 'Draft started' : 'Not started'}{p.attempts ? ` · attempt ${p.attempts + 1} of 3` : ''}</span>
          </Link>
        ))}
      </div>

      <SectionLabel>Graded</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {graded.map((p) => (
          <Link key={p.id} to={`/app/projects/${p.id}`} className="card p-5 flex flex-col gap-2 hover:border-soft">
            <div className="flex items-center justify-between gap-2"><ResultPill result={p.result} /><span className="text-[12.5px] text-muted">Graded {relDay(p.gradedAt)}</span></div>
            <p className="font-extrabold text-[16px] leading-snug">{p.title}</p>
            <span className="text-[13px] font-semibold">{p.interview === 'done' ? 'Interview done' : 'Defence interview ready'} · {3 - (p.attempts || 1)} revisions left{p.inPortfolio ? ' · in portfolio' : ''}</span>
          </Link>
        ))}
      </div>

      <SectionLabel>Coming up</SectionLabel>
      <div className="card p-4 border-dashed bg-ivory flex items-center gap-3"><Lock size={18} className="text-muted" /><span className="text-[14px]"><strong>Strategy and vision</strong> · {Math.min(4, areaReady('strat'))} of 5 concepts practised. One more unlocks a project.</span></div>

      <Modal open={req} onClose={() => setReq(false)} title="Request a project">
        <p className="text-[14px] text-muted mb-3">Areas need at least 5 practised concepts so the project draws on what you’ve learned.</p>
        <div className="flex flex-col gap-2">
          {AREAS.map((a) => { const n = areaReady(a.id); const ok = n >= 3; return (
            <button key={a.id} disabled={!ok} onClick={() => setArea(a.id)} className={`text-left p-3.5 rounded-xl border-[1.5px] flex justify-between items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${area === a.id ? 'border-indigo bg-sand' : 'border-line bg-white'}`}>
              <span className="flex flex-col"><span className="font-bold">{a.name}</span><span className="text-[12.5px] text-muted">{ok ? `${n} concepts practised` : `${n} of 5 concepts · locked`}</span></span>{!ok && <Lock size={16} />}
            </button>); })}
        </div>
        <button onClick={request} className="btn-primary w-full mt-4 !min-h-12">Generate project</button>
      </Modal>
      {state.projects.length === 0 && <button onClick={() => nav('/app/practice')} className="btn-primary">Practise to unlock projects</button>}
    </div>
  );
}
