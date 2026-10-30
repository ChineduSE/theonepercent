import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Link2, CheckCircle2, ChevronDown, Mic, RotateCcw, CalendarPlus } from 'lucide-react';
import { useStore, conceptById, skillById, areaName } from '../lib/store.jsx';
import { dayISO } from '../lib/seed.js';
import { Pill, ResultPill, Spinner, relDay, SectionLabel } from '../components/ui.jsx';

function gradeSubmission(p, writeup) {
  const w = writeup.toLowerCase();
  const strong = /assum|test|if .* wrong|sensitiv/.test(w);
  const tradeoff = /trade|instead|cost of|drop|left out/.test(w);
  const g = p.rubric.map((r, i) => {
    const result = i === 0 ? (strong ? 'Exceeds' : 'Meets') : i === 1 ? (tradeoff ? 'Exceeds' : 'Meets') : 'Meets';
    const reasons = [
      strong ? 'You applied the framework consistently and tested how the ranking changes when key assumptions move. That is what separates a strong prioritisation.' : 'You applied the framework consistently and stated your assumptions. To exceed, show how the ranking changes if a key assumption is wrong.',
      tradeoff ? 'You named what you dropped, its cost, and how to reduce that cost — exactly what this criterion asks.' : 'You named what was dropped. To exceed, propose a cheap way to reduce the cost of dropping it.',
      'The note is clear and respectful of each request. To exceed, answer the CEO’s likely objection before she raises it.',
    ];
    return { name: r.name, result, reason: reasons[i] || 'Meets the stated criterion.', quote: writeup.split(/[.\n]/).find((s) => s.trim().length > 20)?.trim() || 'Your recommended roadmap.' };
  });
  const ex = g.filter((x) => x.result === 'Exceeds').length;
  return { grade: g, result: ex >= 2 ? 'Exceeds' : 'Meets', summary: ex >= 2 ? 'Strong work. Your reasoning is visible and your trade-offs are honest.' : 'Your approach is sound and your scoring is consistent. Make your trade-offs and assumptions more explicit to exceed.', nextStep: 'Add one sentence per dropped item on what it would take to bring it back.' };
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { state, actions, notify } = useStore();
  const nav = useNavigate();
  const p = state.projects.find((x) => x.id === id);
  const fileRef = useRef();
  const [file, setFile] = useState(p?.draftFile || '');
  const [link, setLink] = useState('');
  const [writeup, setWriteup] = useState('I scored all 9 items with RICE and stated my assumptions for reach and confidence. If the USSD reach estimate is wrong by half, it still ranks third, so the plan holds. I left the referral programme out of Q1: the trade-off is slower growth, but failed payments are losing existing users. To reduce that cost, we can test a lightweight referral link in month 2.');
  const [grading, setGrading] = useState(-1);
  const [openC, setOpenC] = useState(0);
  const [dispute, setDispute] = useState('none');
  if (!p) return <p>Project not found. <Link to="/app/projects" className="link">Back to projects</Link></p>;

  const submit = () => {
    setGrading(0);
    [1, 2, 3].forEach((s) => setTimeout(() => setGrading(s), 900 * s));
    setTimeout(() => {
      const r = gradeSubmission(p, writeup);
      actions.setProject(p.id, { status: 'graded', ...r, gradedAt: new Date().toISOString(), attempts: (p.attempts || 0) + 1, interview: 'available', submittedFile: file || link });
      actions.bumpEvidence(p.skills, 'apply', r.result === 'Not yet' ? 'developing' : 'demonstrated');
      actions.addNotification({ text: `Your grade is ready: ${r.result}. See the reasoning for each criterion.`, kind: 'Grade', to: `/app/projects/${p.id}` });
      setGrading(-1); window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3600);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      <Link to="/app/projects" className="btn-quiet !px-2 self-start"><ArrowLeft size={18} />Projects</Link>
      <div className="flex flex-col gap-3">
        <span className="label">{state.user.role} project · {areaName(p.area)}</span>
        <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight">{p.title}</h1>
        <div className="flex flex-wrap gap-2">{p.due && p.status !== 'graded' && <Pill tone="gold">Due {relDay(p.due)}</Pill>}<Pill tone="sand">{p.hours || 'About 2 hours'}</Pill><Pill tone="sand">{p.level}</Pill>{p.status === 'graded' && <ResultPill result={p.result} />}</div>
      </div>

      {p.status === 'graded' && (
        <div className="flex flex-col gap-4">
          <div className="bg-indigo text-ivory rounded-3xl p-5 sm:p-6 flex flex-col gap-2">
            <div className="flex justify-between gap-2"><span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">Overall result</span><span className="text-[13px] text-[#C9CBDA]">Not yet · Meets · Exceeds</span></div>
            <p className="text-[32px] font-extrabold">{p.result}</p>
            <p className="text-[15px] leading-relaxed text-[#E3E4EE]">{p.summary}</p>
            <p className="text-[12.5px] text-[#9A9DB5]">Graded {relDay(p.gradedAt)} · attempt {p.attempts} of 3</p>
          </div>
          <SectionLabel right={<span className="text-[12.5px] text-muted">Tap a criterion to see why</span>}>By criterion</SectionLabel>
          <div className="card divide-y divide-line -mt-2">
            {p.grade.map((g, i) => (
              <div key={g.name}>
                <button onClick={() => setOpenC(openC === i ? -1 : i)} aria-expanded={openC === i} className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer"><span className="font-extrabold">{g.name}</span><span className="flex items-center gap-2"><ResultPill result={g.result} /><ChevronDown size={17} className={openC === i ? 'rotate-180' : ''} /></span></button>
                {openC === i && <div className="px-4 pb-4 flex flex-col gap-2 fade-in">
                  <p className="text-[13.5px] text-muted"><strong className="text-indigo">Criterion:</strong> {p.rubric[i]?.meets} <strong className="text-indigo">To exceed:</strong> {p.rubric[i]?.exceeds}</p>
                  <p className="text-[14.5px] leading-relaxed">{g.reason}</p>
                  <p className="text-[13.5px] border-l-[3px] border-gold pl-3 text-muted">From your submission: “{g.quote}”</p>
                </div>}
              </div>
            ))}
          </div>
          <div className="card p-4 border-gold border-[1.5px] bg-[#FFFBF1]"><span className="label !text-gold-ink">Your next step</span><p className="mt-1 font-semibold">{p.nextStep}</p></div>
          <div className="card p-4"><span className="label">Evidence added</span><p className="mt-1 text-[14px]">Apply evidence for {p.skills.map((s) => <Link key={s} to={`/app/skills/${s}`} className="link mr-1">{skillById(state, s)?.name}</Link>)}</p></div>
          {dispute === 'none' && <button onClick={() => setDispute('form')} className="link self-start text-[14px]">Question this grade</button>}
          {dispute === 'form' && <div className="card p-4 flex flex-col gap-2"><p className="font-extrabold">Request reassessment</p><textarea className="textarea" rows={3} defaultValue={`${p.grade[p.grade.length - 1].name}: my submission covers this — see the last section.`} /><button onClick={() => { setDispute('done'); actions.addDispute({ target: `${p.title} · ${p.grade[p.grade.length - 1].name}`, from: p.grade[p.grade.length - 1].result, to: 'Meets', note: 'Second review found the test plan on page 5.' }); }} className="btn-ghost self-start">Send for a second review</button></div>}
          {dispute === 'done' && <div className="card p-4 flex flex-col gap-1.5"><div className="flex justify-between"><p className="font-extrabold">Second review</p><ResultPill result="Meets" /></div><p className="text-[14px]">The second review agreed with your reason. Both reviews are kept in your history.</p></div>}
          <p className="text-[12.5px] text-muted">Assessed by AI against the stated criteria. This is practice evidence, not a professional qualification.</p>
          <div className="flex flex-wrap gap-3">
            {p.interview !== 'done' ? <button onClick={() => nav(`/app/interviews/project/${p.id}`)} className="btn-gold !min-h-12"><Mic size={18} />Defend this project · 12 min</button> : <Pill tone="ok">Interview done</Pill>}
            {(p.attempts || 1) < 3 && <button onClick={() => { actions.setProject(p.id, { status: 'in_progress', due: dayISO(5, 23, 59) }); notify('Revision opened. Your grade history is kept.'); }} className="btn-ghost !min-h-12"><RotateCcw size={17} />Revise · {3 - (p.attempts || 1)} attempts left</button>}
          </div>
        </div>
      )}

      <div className="bg-indigo-2 text-ivory rounded-3xl p-5 flex flex-col gap-2"><span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">The scenario</span><p className="text-[15px] leading-relaxed">{p.scenario}</p><p className="text-[16px] font-extrabold">{p.ask}</p></div>
      <div><SectionLabel>Deliverables</SectionLabel><div className="card p-4 flex flex-col gap-3">{p.deliverables.map((d, i) => <div key={d} className="flex gap-3 text-[15px]"><span className="w-6 h-6 shrink-0 rounded-full bg-sand flex items-center justify-center text-[13px] font-extrabold">{i + 1}</span>{d}</div>)}</div></div>
      <div><SectionLabel>How it’s assessed</SectionLabel><div className="card divide-y divide-line">{p.rubric.map((r) => <div key={r.name} className="p-4 flex flex-col gap-1"><div className="flex justify-between"><span className="font-extrabold">{r.name}</span><span className="text-[13px] font-bold text-muted">{r.weight}</span></div><p className="text-[13.5px] text-muted"><strong className="text-indigo">Meets:</strong> {r.meets}</p><p className="text-[13.5px] text-muted"><strong className="text-indigo">Exceeds:</strong> {r.exceeds}</p></div>)}</div><p className="text-[13px] text-muted mt-2">Results: Not yet, Meets or Exceeds. You can revise and resubmit twice.</p></div>
      <div><SectionLabel>Draws on your concepts</SectionLabel><div className="flex flex-wrap gap-1.5">{p.concepts.map((c) => conceptById(state, c)).filter(Boolean).map((c) => <Pill key={c.id} tone="white">{c.name}</Pill>)}</div></div>

      {p.status === 'offered' && <button onClick={() => { actions.setProject(p.id, { status: 'in_progress', due: dayISO(7, 23, 59), progress: 0 }); notify('Accepted. Due in 7 days.'); }} className="btn-primary !min-h-12">Accept · due in 7 days</button>}

      {p.status === 'in_progress' && grading < 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel>Your submission</SectionLabel>
          <button onClick={() => fileRef.current?.click()} className="card border-2 border-dashed p-4 flex items-center gap-3 text-left cursor-pointer hover:border-indigo"><FileText size={22} /><span className="flex-1 flex flex-col"><span className="font-bold">{file || 'Upload your document (PDF or DOCX)'}</span><span className="text-[13px] text-muted">{file ? 'Uploaded draft · tap to replace' : 'Or paste a public link below'}</span></span></button>
          <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0].name)} />
          <label className="input flex items-center gap-2"><Link2 size={17} className="text-muted" /><input className="flex-1 outline-none bg-transparent" placeholder="Public Google Docs, Notion or GitHub link" value={link} onChange={(e) => setLink(e.target.value)} /></label>
          <label className="flex flex-col gap-1.5"><span className="label">Summary of your approach</span><textarea className="textarea" rows={5} value={writeup} onChange={(e) => setWriteup(e.target.value)} /></label>
          {link && /github\.com\/[^/]+\/private|github\.com\/?$/.test(link) && <p className="text-[14px] text-bad font-semibold">We couldn’t open this repository. Make it public, then submit again. No attempt was used.</p>}
          <button onClick={submit} disabled={!file && !link} className="btn-primary !min-h-12">Submit for grading · attempt {(p.attempts || 0) + 1} of 3</button>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted"><span>Reminders: halfway and 24 hours before the due date.</span>{!p.extended && <button onClick={() => { actions.setProject(p.id, { due: new Date(new Date(p.due).getTime() + 7 * 864e5).toISOString(), extended: true }); notify('Due date moved by 7 days. You can do this once per project.'); }} className="link text-indigo flex items-center gap-1"><CalendarPlus size={14} />Need more time? Move the due date once</button>}</div>
        </div>
      )}
      {grading >= 0 && (
        <div className="card p-6 flex flex-col gap-3">
          <p className="font-extrabold text-[18px]">Grading your submission</p>
          {['Reading your submission', 'Checking each criterion against the rubric', 'Writing feedback and your next step'].map((t, i) => <div key={t} className={`flex items-center gap-3 font-semibold ${i <= grading ? '' : 'text-soft'}`}>{i < grading ? <CheckCircle2 size={20} className="text-ok" /> : i === grading ? <Spinner /> : <span className="w-5 h-5 rounded-full border-2 border-line" />}{t}</div>)}
        </div>
      )}
    </div>
  );
}
