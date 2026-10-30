import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { X, BookOpen, Map, Check, ArrowRight, Target } from 'lucide-react';
import { useStore, skillById, conceptById } from '../lib/store.jsx';
import { gradeShort } from '../lib/ai.js';
import { AREAS } from '../lib/seed.js';
import { Pill, relDay, PageHeader } from '../components/ui.jsx';

const TYPE_LABEL = { mcq: 'Multiple choice', multi: 'Select all that apply', short: 'Short answer', scenario: 'Scenario' };

function skillCheckQuestions(state, areaId) {
  const skills = state.skills.filter((s) => s.area === areaId && !s.addedByUser);
  const bank = state.questions.filter((q) => q.fromMap && skills.some((s) => s.id === q.skill));
  const others = state.skills.filter((s) => s.area !== areaId);
  const gen = skills.slice(0, 5 - bank.length).map((s, i) => {
    const wrong = [others[(i * 3) % others.length], others[(i * 3 + 5) % others.length], others[(i * 3 + 11) % others.length]].map((o) => o.desc);
    const opts = [['a', s.desc], ['b', wrong[0]], ['c', wrong[1]], ['d', wrong[2]]];
    const rot = i % 4; const rotated = [...opts.slice(rot), ...opts.slice(0, rot)].map(([, t], j) => [String.fromCharCode(97 + j), t]);
    const correct = rotated.find(([, t]) => t === s.desc)[0];
    return { id: `skq-${s.id}`, concept: null, skill: s.id, fromMap: true, type: 'mcq', level: s.level, prompt: `Which of these best describes what “${s.name}” looks like in practice?`, options: rotated, correct: [correct], explain: `${s.name} (${s.level}): ${s.desc}` };
  });
  return [...bank, ...gen].slice(0, 5);
}

function buildSession(state, kind, conceptId) {
  const qs = state.questions.filter((q) => q.concept && conceptById(state, q.concept)?.status === 'active');
  if (kind === 'concept') return qs.filter((q) => q.concept === conceptId).slice(0, 3);
  if (kind === 'note') return qs.filter((q) => conceptById(state, q.concept)?.noteId === conceptId).slice(0, 4);
  const ranked = [...qs].sort((a, b) => {
    const ca = conceptById(state, a.concept), cb = conceptById(state, b.concept);
    return (new Date(ca.due) - new Date(cb.due)) || (ca.strength - cb.strength);
  });
  if (kind === 'extra') return ranked.filter((q) => conceptById(state, q.concept).strength < 0.7).slice(0, 5);
  const picked = ranked.slice(0, 5);
  const mapQ = state.questions.find((q) => q.fromMap);
  return [...picked, mapQ].filter(Boolean).slice(0, 6);
}

export default function Practice() {
  const { state, actions } = useStore();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const kind = params.get('kind') || (params.get('concept') ? 'concept' : params.get('note') ? 'note' : 'scheduled');
  const [area, setArea] = useState(null);
  const session = useMemo(() => (kind === 'skill' ? (area ? skillCheckQuestions(state, area) : []) : buildSession(state, kind, params.get('concept') || params.get('note'))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, area]);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState([]);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(null); // { result, criteria }
  const [results, setResults] = useState([]);
  const [dispute, setDispute] = useState('closed');
  const [done, setDone] = useState(false);

  if (kind === 'skill' && !area) {
    return (
      <div>
        <PageHeader kicker="Skill check" title="Prove what you already know" sub="Questions built from your role’s skill map, not from your notes. They are labelled so you always know the source. Strong answers move skills toward Demonstrated." />
        <div className="grid sm:grid-cols-2 gap-3">
          {AREAS.map((a) => <button key={a.id} onClick={() => setArea(a.id)} className="card p-5 text-left flex items-center justify-between gap-3 hover:border-indigo cursor-pointer"><span className="flex flex-col gap-1"><span className="font-extrabold">{a.name}</span><span className="text-[13px] text-muted">5 questions · about 3 min</span></span><Target size={20} /></button>)}
        </div>
      </div>
    );
  }

  if (session.length === 0) {
    return <div className="card p-8 text-center flex flex-col items-center gap-3"><p className="text-[18px] font-extrabold">You’re all caught up</p><p className="text-muted">Add a note to practise something new.</p><Link to="/app/library/new" className="btn-primary">Add a note</Link></div>;
  }

  const q = session[Math.min(i, session.length - 1)];
  const concept = q.concept ? conceptById(state, q.concept) : null;
  const note = concept ? state.notes.find((n) => n.id === concept.noteId) : null;
  const isShort = q.type === 'short';
  const canCheck = isShort ? answer.trim().length > 3 : sel.length > 0;

  const check = () => {
    let r;
    if (isShort) r = gradeShort(answer, q.criteria);
    else r = { result: [...sel].sort().join() === [...q.correct].sort().join() ? 'right' : 'wrong' };
    setChecked(r); setResults([...results, r.result]);
    actions.recordAnswer(q, r.result);
  };
  const next = () => {
    if (i + 1 >= session.length) { setDone(true); actions.completeSession(kind); return; }
    setI(i + 1); setSel([]); setAnswer(''); setChecked(null); setDispute('closed');
  };
  const toggle = (id) => { if (checked) return; if (q.type === 'multi') setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]); else setSel([id]); };

  if (done) {
    const right = results.filter((r) => r === 'right').length, part = results.filter((r) => r === 'partial').length;
    const touched = [...new Set(session.flatMap((s) => (s.concept ? conceptById(state, s.concept)?.skills || [] : [s.skill])))].map((id) => skillById(state, id)).filter(Boolean);
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="bg-indigo text-ivory rounded-3xl p-6 flex flex-col gap-2">
          <span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">Session complete</span>
          <p className="text-[26px] font-extrabold leading-tight">{right} correct, {part} partly correct, {results.length - right - part} to revisit</p>
          <p className="text-[14.5px] text-[#C9CBDA]">Remember evidence updated for {touched.length} skills. Apply and Explain come from projects and interviews.</p>
        </div>
        <span className="label">When each concept comes back</span>
        <div className="card divide-y divide-line">
          {session.map((s, k) => {
            const c = s.concept ? conceptById(state, s.concept) : null; const r = results[k];
            return (
              <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="flex flex-col"><span className="font-bold text-[15px]">{c ? c.name : skillById(state, s.skill)?.name}</span><span className="text-[13px] text-muted">{r === 'right' ? 'Correct' : r === 'partial' ? 'Partly correct' : 'To revisit'}{!c && ' · skill check'}</span></span>
                <Pill tone={r === 'right' ? 'sand' : 'gold'}>{c ? relDay(c.due) : 'Evidence updated'}</Pill>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3"><button onClick={() => nav('/app')} className="btn-primary">Back to home</button><button onClick={() => nav('/app/skills')} className="btn-ghost">See skills gap</button><button onClick={() => { setI(0); setSel([]); setAnswer(''); setChecked(null); setResults([]); setDone(false); nav('/app/practice?kind=extra'); }} className="btn-quiet">Practise a little more</button></div>
      </div>
    );
  }

  const verdict = checked && { right: ['Correct', 'bg-ok-soft border-ok'], wrong: ['Not quite', 'bg-bad-soft border-bad'], partial: [`Partly there · ${checked.criteria?.filter((c) => c.met).length} of ${checked.criteria?.length} criteria met`, 'bg-gold-soft border-[#8A6A1F]'] }[checked.result];

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link to="/app" aria-label="End session" className="btn-quiet !px-2"><X size={20} /></Link>
        <div className="flex-1 flex gap-1.5">{session.map((_, k) => <div key={k} className={`flex-1 h-2 rounded-full ${k < i || (k === i && checked) ? 'bg-indigo' : k === i ? 'bg-gold' : 'bg-line'}`} />)}</div>
        <span className="text-[13px] font-bold text-muted">{i + 1} of {session.length}</span>
      </div>
      <span className="label">{kind === 'skill' ? 'Skill check' : kind === 'extra' ? 'Extra practice' : `${new Date().getHours() < 15 ? 'Morning' : 'Evening'} practice`}</span>
      <div className="flex flex-wrap gap-2"><Pill tone="indigo">{TYPE_LABEL[q.type]}</Pill>{concept && <Pill tone="sand">{concept.name}</Pill>}{q.fromMap && <Pill tone="gold"><Map size={13} />From your role’s skill map</Pill>}<Pill tone="white">{q.level}</Pill></div>
      <h1 className="text-[21px] font-extrabold leading-snug">{q.prompt}</h1>

      {isShort ? (
        <label className="flex flex-col gap-1.5"><span className="label">Your answer</span><textarea className="textarea" rows={4} value={answer} readOnly={!!checked} onChange={(e) => setAnswer(e.target.value)} placeholder="Write it in your own words." /></label>
      ) : (
        <div className="flex flex-col gap-2" role="group" aria-label="Answer options">
          {q.options.map(([id, t]) => {
            const s = sel.includes(id), c = q.correct.includes(id);
            let cls = s ? 'border-indigo bg-sand' : 'border-line bg-white hover:border-soft';
            let tag = null;
            if (checked && c) { cls = 'border-ok bg-ok-soft'; tag = s ? 'Your answer · correct' : 'Correct answer'; } else if (checked && s) { cls = 'border-bad bg-bad-soft'; tag = 'Your answer'; }
            return (
              <button key={id} onClick={() => toggle(id)} aria-pressed={s} className={`flex items-start gap-3 text-left p-3.5 rounded-xl border-[1.5px] cursor-pointer ${cls}`}>
                <span className={`mt-0.5 w-5 h-5 shrink-0 border-2 flex items-center justify-center ${q.type === 'multi' ? 'rounded-md' : 'rounded-full'} ${s ? 'bg-indigo border-indigo text-ivory' : 'border-soft'}`}>{s && <Check size={13} strokeWidth={3} />}</span>
                <span className="flex-1 flex flex-col gap-1"><span className="text-[15px] font-semibold leading-snug">{t}</span>{tag && <span className="text-[12.5px] font-extrabold">{tag}</span>}</span>
              </button>
            );
          })}
        </div>
      )}

      {checked && (
        <div className={`rounded-2xl p-4 border-[1.5px] flex flex-col gap-3 fade-in ${verdict[1]}`}>
          <p className="text-[17px] font-extrabold">{verdict[0]}</p>
          {isShort && (
            <div className="flex flex-col gap-1.5"><span className="label">Assessed against {q.criteria.length} criteria</span>
              {checked.criteria.map((c) => <div key={c.text} className="flex gap-2 text-[14px]"><span className="font-extrabold w-16 shrink-0">{c.met ? 'Met' : 'Not yet'}</span><span>{c.text}</span></div>)}
              <p className="text-[13.5px] text-muted mt-1"><strong className="text-indigo">Model answer:</strong> {q.model}</p>
            </div>
          )}
          <p className="text-[14.5px] leading-relaxed">{q.explain}</p>
          <div className="border-t border-indigo/10 pt-2.5 text-[13px] text-muted flex items-center gap-2">
            {concept ? <><BookOpen size={15} /><span>From your note: <Link className="link text-muted" to={`/app/library/note/${note?.id}`}>{note?.title}</Link> · “{concept.passage}”</span></> : <><Map size={15} />Generated from the {state.user.role} skill map: {skillById(state, q.skill)?.name}</>}
          </div>
          {dispute === 'closed' && <button onClick={() => setDispute('open')} className="link text-[14px] self-start">Question this assessment</button>}
          {dispute === 'open' && (
            <div className="bg-white rounded-xl p-3 flex flex-col gap-2">
              <label className="flex flex-col gap-1.5"><span className="text-[14px] font-bold">Why do you think this is wrong?</span><textarea className="textarea" rows={2} id="dispute" placeholder="e.g. My answer covers the second criterion in the last sentence." /></label>
              <button onClick={() => { setDispute('sent'); actions.addDispute({ target: `Practice · ${concept?.name || 'Skill check'}`, from: verdict[0], to: verdict[0], note: 'Second review is running with your reason attached.' }); }} className="btn-ghost !min-h-10">Request a second review</button>
            </div>
          )}
          {dispute === 'sent' && <p className="text-[13.5px] font-semibold">Sent. A second review runs with your reason attached. Both results stay visible in Settings › Assessment reviews.</p>}
        </div>
      )}

      <div className="sticky bottom-24 lg:bottom-4">
        {!checked ? <button disabled={!canCheck} onClick={check} className="btn-primary w-full !min-h-12">{canCheck ? 'Check answer' : isShort ? 'Write your answer to continue' : q.type === 'multi' ? 'Select all that apply' : 'Choose an answer'}</button>
          : <button onClick={next} className="btn-primary w-full !min-h-12">{i + 1 >= session.length ? 'See results' : 'Next question'}<ArrowRight size={18} /></button>}
      </div>
    </div>
  );
}
