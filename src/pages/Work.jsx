import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardList, Sparkles, Target, Lightbulb, FileText, Briefcase, Check, Plus, Copy, Download, Mic, BookOpen, Trash2, ShieldCheck, CircleCheck, X, Pencil } from 'lucide-react';
import { useStore, uid, skillById, kpiById, conceptById } from '../lib/store.jsx';
import { draftStory, generateDocument, suggestImplementation } from '../lib/ai.js';
import { PageHeader, Pill, Progress, Modal, Toggle, Spinner, relDay, fmtDate, SectionLabel, Empty } from '../components/ui.jsx';
import WorkComposer from '../components/WorkComposer.jsx';
import { kpiProgress } from './Home.jsx';

const TABS = [['log', 'Work log', ClipboardList], ['stories', 'STAR stories', Sparkles], ['goals', 'Goals & KPIs', Target], ['apply', 'Apply learning', Lightbulb], ['documents', 'Documents', FileText], ['context', 'Role context', Briefcase]];

/* ---------------- Log ---------------- */
function LogTab({ setTab }) {
  const { state, actions, notify } = useStore();
  const [select, setSelect] = useState(false);
  const [picked, setPicked] = useState([]);
  const [kpiFilter, setKpiFilter] = useState('all');
  const [answering, setAnswering] = useState(null);
  const [res, setRes] = useState('');
  const log = state.work.log.filter((e) => kpiFilter === 'all' || e.kpi === kpiFilter);

  const build = () => {
    const entries = state.work.log.filter((e) => picked.includes(e.id));
    const kpi = kpiById(state, entries.find((e) => e.kpi)?.kpi);
    const d = draftStory(entries, kpi);
    actions.addStory({ id: uid('s'), status: 'draft', title: entries[0].text.split(/[.,;]/)[0].split(' ').slice(0, 7).join(' '), entries: picked, skills: [...new Set(entries.flatMap((e) => e.skills))].slice(0, 3), kpi: kpi?.id || null, ...d });
    setSelect(false); setPicked([]); notify('STAR draft created from your entries. Review it before you use it.'); setTab('stories');
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="flex flex-col gap-4">
        <div className="card p-5"><p className="font-extrabold text-[17px] mb-3">What did you work on today?</p><WorkComposer /></div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setKpiFilter('all')} className={`pill !text-[13px] !py-2 !px-3.5 cursor-pointer border-[1.5px] ${kpiFilter === 'all' ? 'bg-indigo text-ivory border-indigo' : 'bg-white border-line'}`}>All · {state.work.log.length}</button>
          {state.work.kpis.map((k) => <button key={k.id} onClick={() => setKpiFilter(k.id)} className={`pill !text-[13px] !py-2 !px-3.5 cursor-pointer border-[1.5px] ${kpiFilter === k.id ? 'bg-indigo text-ivory border-indigo' : 'bg-white border-line'}`}>{k.name}</button>)}
          <button onClick={() => { setSelect(!select); setPicked([]); }} className="btn-ghost !min-h-9 ml-auto"><Sparkles size={16} />{select ? 'Cancel' : 'Build a STAR story'}</button>
        </div>
        {select && <div className="rounded-xl bg-gold-soft text-gold-ink p-3 flex flex-wrap items-center gap-3 text-[14px] font-semibold sticky top-16 z-10">Select the entries that tell one story ({picked.length} selected)<button disabled={!picked.length} onClick={build} className="btn-primary !min-h-9 ml-auto">Draft STAR story</button></div>}
        <div className="flex flex-col gap-3">
          {log.map((e) => {
            const learned = e.learnedLink && conceptById(state, e.learnedLink);
            return (
              <div key={e.id} className={`card p-4 flex gap-3 ${picked.includes(e.id) ? 'border-indigo border-[1.5px]' : ''}`}>
                {select && <input type="checkbox" className="w-5 h-5 mt-1 accent-indigo shrink-0" checked={picked.includes(e.id)} onChange={() => setPicked(picked.includes(e.id) ? picked.filter((x) => x !== e.id) : [...picked, e.id])} aria-label="Select entry" />}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between gap-2"><span className="text-[12.5px] font-bold text-muted">{relDay(e.date)}{e.project ? ` · ${e.project}` : ''}</span><button onClick={() => { actions.deleteWorkEntry(e.id); notify('Entry deleted.'); }} aria-label="Delete entry" className="text-soft hover:text-bad cursor-pointer"><Trash2 size={15} /></button></div>
                  <p className="text-[15px] leading-relaxed">{e.text}</p>
                  {e.result ? <p className="text-[14px] font-semibold text-ok flex gap-1.5"><Check size={16} className="shrink-0 mt-0.5" />{e.result}</p>
                    : answering === e.id ? (
                      <div className="flex flex-col gap-2 fade-in"><p className="text-[13.5px] rounded-lg bg-indigo text-ivory p-2.5 flex gap-2"><Sparkles size={15} className="text-gold shrink-0 mt-0.5" />{e.followUp || 'What changed because of this?'}</p><div className="flex gap-2"><input className="input !min-h-10" value={res} onChange={(x) => setRes(x.target.value)} placeholder="The result, ideally with a number" /><button onClick={() => { actions.updateWorkEntry(e.id, { result: res, followUp: null }); setAnswering(null); setRes(''); notify('Result added.'); }} disabled={!res.trim()} className="btn-primary !min-h-10">Add</button></div></div>
                    ) : <button onClick={() => setAnswering(e.id)} className="self-start pill bg-gold-soft text-gold-ink cursor-pointer !py-1.5"><Sparkles size={13} />AI asks: what changed because of this?</button>}
                  <div className="flex flex-wrap gap-1.5">{e.skills.map((s) => <Link key={s} to={`/app/skills/${s}`} className="pill bg-sand text-indigo">{skillById(state, s)?.name}</Link>)}{e.kpi && <Pill tone="gold">KPI: {kpiById(state, e.kpi)?.name}</Pill>}</div>
                  {learned && <p className="text-[12.5px] text-muted flex items-center gap-1.5"><BookOpen size={13} />Learned “{learned.name}” in your notes · now used at work</p>}
                </div>
              </div>
            );
          })}
          {log.length === 0 && <Empty icon={ClipboardList} title="No entries for this KPI yet" />}
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:sticky lg:top-20">
        <div className="card p-4 flex flex-col gap-2"><span className="label">This month</span><p className="text-[28px] font-extrabold leading-none">{state.work.log.length}</p><p className="text-[13px] text-muted">entries · {state.work.log.filter((e) => e.result).length} with results · {state.work.log.filter((e) => e.kpi).length} linked to KPIs</p></div>
        <div className="card p-4 flex flex-col gap-2"><span className="label">Most-used skills at work</span>
          {Object.entries(state.work.log.flatMap((e) => e.skills).reduce((a, s) => ({ ...a, [s]: (a[s] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, n]) => <div key={s} className="flex justify-between text-[13.5px]"><span>{skillById(state, s)?.name}</span><span className="font-bold">{n}</span></div>)}
        </div>
        <div className="card p-4 flex gap-2.5 text-[13px] text-muted"><ShieldCheck size={18} className="text-ok shrink-0" />Your work log is private, never shown on your portfolio, and never used to train AI. Avoid logging anything covered by an NDA.</div>
      </div>
    </div>
  );
}

/* ---------------- Stories ---------------- */
function StoryCard({ s }) {
  const { state, actions, notify } = useStore();
  const [edit, setEdit] = useState(s.status === 'suggested' ? false : false);
  const [f, setF] = useState({ situation: s.situation, task: s.task, action: s.action, result: s.result });
  const status = { suggested: ['Suggested by AI', 'gold'], draft: ['Draft', 'sand'], approved: ['Approved', 'indigo'] }[s.status];
  const hl = (t) => t.split(/(\[[^\]]+\])/).map((p, i) => (p.startsWith('[') ? <mark key={i} className="bg-gold-soft text-gold-ink rounded px-1 font-semibold">{p}</mark> : p));
  return (
    <div className={`card p-5 flex flex-col gap-3 ${s.status === 'suggested' ? 'border-gold border-[1.5px]' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><Pill tone={status[1]}>{status[0]}</Pill><span className="text-[12.5px] text-muted">From {s.entries.length} work entr{s.entries.length > 1 ? 'ies' : 'y'}{s.practised ? ' · practised in interview' : ''}</span></div>
      <p className="text-[18px] font-extrabold">{s.title}</p>
      {s.status === 'suggested' && <p className="text-[13.5px] text-muted">We noticed {s.entries.length} related entries and grouped them into a story. Nothing is used until you approve it.</p>}
      {!edit ? (
        <div className="grid gap-2.5">{[['S', 'Situation', s.situation], ['T', 'Task', s.task], ['A', 'Action', s.action], ['R', 'Result', s.result]].map(([k, l, t]) => (
          <div key={k} className="flex gap-3"><span className="w-7 h-7 shrink-0 rounded-lg bg-indigo text-gold text-[13px] font-extrabold flex items-center justify-center">{k}</span><p className="text-[14.5px] leading-relaxed"><strong>{l}:</strong> {hl(t)}</p></div>
        ))}</div>
      ) : (
        <div className="flex flex-col gap-2">{['situation', 'task', 'action', 'result'].map((k) => <label key={k} className="flex flex-col gap-1"><span className="label">{k}</span><textarea className="textarea" rows={k === 'action' ? 4 : 2} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>)}</div>
      )}
      <div className="flex flex-wrap gap-1.5">{s.skills.map((k) => <Pill key={k} tone="sand">{skillById(state, k)?.name}</Pill>)}{s.kpi && <Pill tone="gold">KPI: {kpiById(state, s.kpi)?.name}</Pill>}</div>
      <div className="flex flex-wrap gap-2 pt-1">
        {edit ? <button onClick={() => { actions.updateStory(s.id, f); setEdit(false); notify('Story saved.'); }} className="btn-primary">Save</button> : <button onClick={() => setEdit(true)} className="btn-ghost"><Pencil size={15} />Edit</button>}
        {s.status !== 'approved' && <button onClick={() => { actions.updateStory(s.id, { ...f, status: 'approved' }); notify('Approved. It can now be used in documents and interviews.'); }} className="btn-primary"><Check size={16} />Approve</button>}
        {s.status === 'approved' && <Link to={`/app/interviews/story/${s.id}`} className="btn-gold"><Mic size={16} />Practise in an interview</Link>}
        <button onClick={() => { actions.deleteStory(s.id); notify(s.status === 'suggested' ? 'Dismissed.' : 'Story deleted.'); }} className="btn-quiet">{s.status === 'suggested' ? 'Dismiss' : 'Delete'}</button>
      </div>
    </div>
  );
}
function StoriesTab({ setTab }) {
  const { state } = useStore();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[14.5px] text-muted max-w-2xl">Your story bank. Each story is built only from your own entries. Gaps are marked like <mark className="bg-gold-soft text-gold-ink rounded px-1 font-semibold">[this]</mark> instead of being invented.</p><button onClick={() => setTab('log')} className="btn-ghost"><Plus size={16} />Build from entries</button></div>
      {state.work.stories.map((s) => <StoryCard key={s.id} s={s} />)}
    </div>
  );
}

/* ---------------- Goals ---------------- */
function GoalsTab() {
  const { state, actions, notify } = useStore();
  const [adding, setAdding] = useState(false);
  const [nk, setNk] = useState({ name: '', start: '', target: '', unit: '%', due: 'End of Q1' });
  const [upd, setUpd] = useState({});
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[14.5px] text-muted max-w-2xl">Your goals at {state.work.profile.company}. Work entries link here automatically, so at review time you see impact by goal, not a list of tasks.</p><button onClick={() => setAdding(true)} className="btn-ghost"><Plus size={16} />Add a goal</button></div>
      {state.work.kpis.map((k) => {
        const entries = state.work.log.filter((e) => e.kpi === k.id);
        const pct = kpiProgress(k);
        return (
          <div key={k.id} className="card p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[18px] font-extrabold">{k.name}</p><p className="text-[14px] text-muted">{k.goal} · {k.due}</p></div><Pill tone={pct >= 50 ? 'ok' : 'gold'}>{pct}% of the way</Pill></div>
            <div className="flex items-end gap-4 flex-wrap"><div><span className="label">Start</span><p className="text-[18px] font-extrabold">{k.start.toLocaleString()}{k.unit}</p></div><div><span className="label">Now</span><p className="text-[26px] font-extrabold text-gold-ink">{k.current.toLocaleString()}{k.unit}</p></div><div><span className="label">Target</span><p className="text-[18px] font-extrabold">{k.target.toLocaleString()}{k.unit}</p></div>
              <div className="ml-auto flex gap-2 items-center"><input className="input !w-28 !min-h-10" inputMode="numeric" placeholder="New value" value={upd[k.id] || ''} onChange={(e) => setUpd({ ...upd, [k.id]: e.target.value })} aria-label={`Update ${k.name}`} /><button disabled={!upd[k.id]} onClick={() => { actions.updateKpi(k.id, { current: Number(upd[k.id]) }); setUpd({ ...upd, [k.id]: '' }); notify('Goal updated.'); }} className="btn-primary !min-h-10">Update</button></div></div>
            <Progress value={pct} tone="gold" />
            <div className="border-t border-line pt-3"><span className="label">Your contributions · {entries.length}</span>
              <div className="mt-2 flex flex-col gap-2">{entries.map((e) => <div key={e.id} className="text-[13.5px] flex gap-2"><span className="text-muted w-20 shrink-0">{fmtDate(e.date)}</span><span>{e.text.slice(0, 120)}{e.text.length > 120 ? '…' : ''}{e.result && <strong className="text-ok"> → {e.result}</strong>}</span></div>)}{entries.length === 0 && <p className="text-[13.5px] text-muted">No entries linked yet.</p>}</div>
            </div>
          </div>
        );
      })}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add a goal or KPI">
        <div className="flex flex-col gap-3">
          <input className="input" placeholder="Name, e.g. Repeat payments" value={nk.name} onChange={(e) => setNk({ ...nk, name: e.target.value })} />
          <div className="grid grid-cols-3 gap-2"><input className="input" placeholder="Start" inputMode="numeric" value={nk.start} onChange={(e) => setNk({ ...nk, start: e.target.value })} /><input className="input" placeholder="Target" inputMode="numeric" value={nk.target} onChange={(e) => setNk({ ...nk, target: e.target.value })} /><input className="input" placeholder="Unit" value={nk.unit} onChange={(e) => setNk({ ...nk, unit: e.target.value })} /></div>
          <input className="input" placeholder="By when" value={nk.due} onChange={(e) => setNk({ ...nk, due: e.target.value })} />
          <button disabled={!nk.name || !nk.target} onClick={() => { const s = Number(nk.start || 0), t = Number(nk.target); actions.addKpi({ id: uid('k'), name: nk.name, goal: `${t > s ? 'Raise' : 'Reduce'} ${nk.name.toLowerCase()} from ${s}${nk.unit} to ${t}${nk.unit}`, start: s, target: t, current: s, unit: nk.unit, direction: t > s ? 'up' : 'down', due: nk.due }); setAdding(false); notify('Goal added. New work entries will link to it.'); }} className="btn-primary">Add goal</button>
        </div>
      </Modal>
    </div>
  );
}

/* ---------------- Apply (implementation layer) ---------------- */
function ApplyTab() {
  const { state, actions, notify } = useStore();
  const [outcome, setOutcome] = useState(null);
  const [text, setText] = useState('');
  const [checks, setChecks] = useState({});
  const [gen, setGen] = useState(false);
  const list = state.work.implementations.filter((m) => m.status !== 'dismissed');
  const statusPill = { new: ['New', 'gold'], planned: ['Planned', 'sand'], tried: ['Tried · outcome logged', 'ok'] };

  const generate = () => {
    setGen(true);
    setTimeout(() => {
      const used = new Set(state.work.implementations.flatMap((m) => m.concepts));
      const c = state.concepts.find((x) => x.status === 'active' && !used.has(x.id) && x.skills.length) || state.concepts[0];
      actions.addImpl(suggestImplementation(c, state.work.kpis, state.work.profile));
      setGen(false); notify('New suggestion added.');
    }, 1200);
  };
  const saveOutcome = () => {
    const m = outcome;
    const entry = { id: uid('w'), date: new Date().toISOString(), text: `Applied: ${m.title}.`, skills: [...new Set(m.concepts.flatMap((c) => conceptById(state, c)?.skills || []))].slice(0, 3), kpi: m.kpi, result: text, learnedLink: m.concepts[0] };
    actions.addWorkEntry(entry);
    actions.updateImpl(m.id, { status: 'tried', outcome: text, outcomeEntry: entry.id });
    setOutcome(null); setText(''); notify('Outcome logged to your work log and linked to the KPI.');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-indigo text-ivory rounded-3xl p-5 flex flex-col gap-2">
        <span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">How this works</span>
        <p className="text-[15px] leading-relaxed text-[#E3E4EE]">We combine <strong className="text-ivory">what you’re learning</strong> (your notes), <strong className="text-ivory">your goals</strong> (KPIs), and <strong className="text-ivory">your role context</strong> (job description and company) to suggest concrete ways to apply your learning this week. These are options to consider, not instructions.</p>
        <button onClick={generate} disabled={gen} className="btn-gold self-start mt-1">{gen ? <Spinner /> : <Lightbulb size={17} />}Suggest another idea</button>
      </div>
      {list.map((m) => {
        const k = kpiById(state, m.kpi); const sp = statusPill[m.status];
        return (
          <div key={m.id} className={`card p-5 flex flex-col gap-3 ${m.status === 'new' ? 'border-gold border-[1.5px]' : ''}`}>
            <div className="flex flex-wrap items-center gap-2"><Pill tone={sp[1]}>{sp[0]}</Pill>{k && <Pill tone="white"><Target size={12} />{k.name}: {k.current.toLocaleString()}{k.unit} → {k.target.toLocaleString()}{k.unit}</Pill>}</div>
            <p className="text-[18px] font-extrabold leading-snug">{m.title}</p>
            <div className="flex flex-wrap gap-1.5 items-center text-[13px] text-muted"><BookOpen size={14} />From your learning: {m.concepts.map((c) => <Pill key={c} tone="sand">{conceptById(state, c)?.name}</Pill>)}</div>
            <p className="text-[14.5px] leading-relaxed">{m.why}</p>
            <div className="flex flex-col gap-1.5">{m.steps.map((st, i) => {
              const key = `${m.id}-${i}`;
              return <label key={key} className="flex gap-3 items-start text-[14.5px] cursor-pointer"><input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo shrink-0" checked={!!checks[key] || m.status === 'tried'} onChange={() => setChecks({ ...checks, [key]: !checks[key] })} /><span className={checks[key] || m.status === 'tried' ? 'line-through text-muted' : ''}>{st}</span></label>;
            })}</div>
            <p className="text-[13.5px] text-muted"><strong className="text-indigo">Why it matters:</strong> {m.impact}</p>
            {m.status === 'tried' && <div className="rounded-xl bg-ok-soft p-3 text-[14px] flex gap-2"><CircleCheck size={18} className="text-ok shrink-0" /><span><strong>Outcome:</strong> {m.outcome}</span></div>}
            <div className="flex flex-wrap gap-2">
              {m.status === 'new' && <button onClick={() => { actions.updateImpl(m.id, { status: 'planned' }); notify('Planned. We’ll remind you on Friday to log how it went.'); }} className="btn-primary">Plan this</button>}
              {m.status !== 'tried' && <button onClick={() => setOutcome(m)} className="btn-ghost">I tried it · log the outcome</button>}
              {m.status !== 'tried' && <button onClick={() => { actions.updateImpl(m.id, { status: 'dismissed' }); notify('Dismissed. Suggestions will learn from this.'); }} className="btn-quiet"><X size={15} />Not relevant</button>}
            </div>
          </div>
        );
      })}
      <Modal open={!!outcome} onClose={() => setOutcome(null)} title="How did it go?">
        <p className="text-[14px] text-muted mb-3">{outcome?.title}</p>
        <textarea className="textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened? A number helps — e.g. agreed a stopping rule with my manager; test will run the full 3 weeks." />
        <p className="text-[12.5px] text-muted mt-2">This is saved to your work log, linked to the KPI and the concept you learned.</p>
        <button disabled={!text.trim()} onClick={saveOutcome} className="btn-primary w-full mt-3">Save outcome</button>
      </Modal>
    </div>
  );
}

/* ---------------- Documents ---------------- */
const DOCS = [['review', 'Performance review self-assessment', 'For quarterly or annual reviews'], ['promotion', 'Promotion case', 'When you ask for the next level'], ['cv', 'CV bullet points', 'Action-led bullets from your results'], ['interview', 'Interview answers (STAR)', 'From your approved stories'], ['update', 'Monthly update to my manager', 'Progress, wins and the decision you need'], ['linkedin', 'LinkedIn post', 'Share a win in your own voice']];
function DocumentsTab() {
  const { state, actions, notify } = useStore();
  const [redact, setRedact] = useState(true);
  const [busy, setBusy] = useState(null);
  const [doc, setDoc] = useState(null);
  const make = (t) => {
    setBusy(t);
    setTimeout(() => { const d = generateDocument(t, state, { redact }); setDoc({ ...d, type: t }); actions.addDocument({ id: uid('d'), type: t, title: d.title, createdAt: new Date().toISOString() }); setBusy(null); }, 1300);
  };
  const sources = `${state.work.stories.filter((s) => s.status !== 'suggested').length} STAR stories · ${state.work.log.filter((e) => e.result).length} work entries with results · ${state.work.kpis.length} goals`;
  return (
    <div className="flex flex-col gap-4">
      <div className="card px-4"><Toggle on={redact} onChange={setRedact} label="Hide company names and sensitive figures" sub={redact ? 'On: “PayLite” becomes “a Lagos fintech”; naira amounts are generalised.' : 'Off: uses your entries exactly as written.'} /></div>
      {!doc && (
        <div className="grid sm:grid-cols-2 gap-3">
          {DOCS.map(([t, title, sub]) => (
            <button key={t} onClick={() => make(t)} disabled={!!busy} className="card p-5 text-left flex flex-col gap-1.5 hover:border-indigo cursor-pointer disabled:opacity-60">
              <span className="flex items-center justify-between gap-2"><span className="font-extrabold text-[16px]">{title}</span>{busy === t ? <Spinner /> : <FileText size={18} className="text-muted" />}</span>
              <span className="text-[13.5px] text-muted">{sub}</span>
            </button>
          ))}
        </div>
      )}
      {!doc && <p className="text-[13px] text-muted">Built only from your own evidence: {sources}. Missing numbers are left as placeholders, never invented.</p>}
      {doc && (
        <div className="flex flex-col gap-3 fade-in">
          <div className="flex flex-wrap items-center gap-2"><p className="text-[20px] font-extrabold mr-auto">{doc.title}</p>
            <button onClick={() => { navigator.clipboard?.writeText(doc.body); notify('Copied to clipboard.'); }} className="btn-ghost !min-h-10"><Copy size={16} />Copy</button>
            <button onClick={() => { const b = new Blob([doc.body], { type: 'text/plain' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${doc.title.replace(/\s+/g, '-')}.txt`; a.click(); }} className="btn-ghost !min-h-10"><Download size={16} />Download</button>
            <button onClick={() => setDoc(null)} className="btn-quiet !min-h-10">All documents</button></div>
          <textarea className="textarea !text-[14.5px] !leading-relaxed font-medium" rows={18} value={doc.body} onChange={(e) => setDoc({ ...doc, body: e.target.value })} aria-label="Document text" />
          <p className="text-[13px] text-muted">Sources: {sources}. Edit freely — it’s your voice.</p>
        </div>
      )}
      <SectionLabel>Generated before</SectionLabel>
      <div className="card divide-y divide-line">{state.work.documents.map((d) => <div key={d.id} className="px-4 py-3 flex justify-between text-[14px]"><span className="font-semibold">{d.title}</span><span className="text-muted">{relDay(d.createdAt)}</span></div>)}</div>
    </div>
  );
}

/* ---------------- Role context ---------------- */
function ContextTab() {
  const { state, actions, notify } = useStore();
  const [p, setP] = useState(state.work.profile);
  const F = ({ k, label, rows }) => (
    <label className="flex flex-col gap-1.5"><span className="label">{label}</span>{rows ? <textarea className="textarea" rows={rows} value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} /> : <input className="input" value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} />}</label>
  );
  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="card p-5 flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-3">{F({ k: 'title', label: 'Job title' })}{F({ k: 'company', label: 'Company' })}{F({ k: 'team', label: 'Team' })}{F({ k: 'started', label: 'Started' })}</div>
        {F({ k: 'companyDesc', label: 'Company description', rows: 2 })}
        {F({ k: 'jd', label: 'Job description (paste it)', rows: 4 })}
        {F({ k: 'previous', label: 'Previous role' })}
        <button onClick={() => { actions.updateProfile(p); notify('Role context saved. Suggestions will use it.'); }} className="btn-primary self-start">Save</button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="card p-4 text-[13.5px] text-muted flex flex-col gap-2"><span className="label">Why we ask</span>Your job description and company context let the AI suggest ways to apply what you learn that fit your real job, and map your work to your target role’s skills.</div>
        <div className="card p-4 text-[13.5px] text-muted flex flex-col gap-2"><span className="label">Switching careers?</span>Log your current job here too. Work like “grouped 300 complaints into 6 causes” counts as transferable evidence for {state.user.role} skills such as Customer research synthesis.</div>
      </div>
    </div>
  );
}

export default function Work() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'log';
  const setTab = (t) => setParams({ tab: t });
  const { state } = useStore();
  return (
    <div>
      <PageHeader kicker={`${state.work.profile.title} · ${state.work.profile.company}`} title="Work" sub="Record what you do, connect it to your skills and goals, apply what you learn, and turn it into evidence when you need it." />
      <div className="flex gap-1 p-1 rounded-xl bg-sand overflow-x-auto scroll-thin mb-5" role="tablist">
        {TABS.map(([v, l, Icon]) => <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)} className={`flex items-center gap-2 whitespace-nowrap min-h-10 px-3.5 rounded-lg text-[14px] font-bold cursor-pointer ${tab === v ? 'bg-white shadow-sm' : 'text-muted hover:text-indigo'}`}><Icon size={16} />{l}</button>)}
      </div>
      <div className="fade-in" key={tab}>
        {tab === 'log' && <LogTab setTab={setTab} />}
        {tab === 'stories' && <StoriesTab setTab={setTab} />}
        {tab === 'goals' && <GoalsTab />}
        {tab === 'apply' && <ApplyTab />}
        {tab === 'documents' && <DocumentsTab />}
        {tab === 'context' && <ContextTab />}
      </div>
    </div>
  );
}
