import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Upload, Search, HelpCircle, FileText, Layers, Zap, Pencil } from 'lucide-react';
import { useStore, skillById, uid } from '../lib/store.jsx';
import { PageHeader, Segmented, Pill, Modal, relDay, Progress, Empty } from '../components/ui.jsx';

// "Meaning search" (simulated embeddings): related phrases expand to concept names.
const MEANING = [
  [/decid|what to build|priorit|choose|rank/i, ['RICE', 'MoSCoW', 'Opportunity cost', 'Cost of delay', 'Kano']],
  [/measure|metric|number|track/i, ['North Star', 'Vanity', 'Input metrics', 'Guardrail']],
  [/test|experiment|prove/i, ['Hypothesis', 'Control', 'Sample size', 'Guardrail', 'Testing with']],
  [/people|stakeholder|boss|manager|politic/i, ['Power–interest', 'RACI', 'Disagree']],
  [/customer|user|research|understand/i, ['Jobs to be done', 'Switch interviews', 'Four product risks']],
  [/phone|feature phone|offline/i, ['USSD']],
];

export function ConceptModal({ concept, onClose }) {
  const { state, actions, notify } = useStore();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(concept?.name || '');
  const [summary, setSummary] = useState(concept?.summary || '');
  if (!concept) return null;
  const note = state.notes.find((n) => n.id === concept.noteId);
  const hasQs = state.questions.some((q) => q.concept === concept.id);
  return (
    <Modal open onClose={onClose} title={concept.name}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {concept.status === 'out' && <Pill tone="outline">Out of scope</Pill>}
          {concept.status === 'queued' && <Pill tone="gold">Queued for practice</Pill>}
          {concept.status === 'retired' && <Pill tone="outline">Retired</Pill>}
          {concept.status === 'active' && <Pill tone="indigo">In practice</Pill>}
          {concept.userEdited && <Pill tone="white"><Pencil size={12} />Edited by you</Pill>}
        </div>
        {!edit ? <p className="text-[15px] leading-relaxed">{concept.summary}</p> : (
          <div className="flex flex-col gap-2">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Concept name" />
            <textarea className="textarea" rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} aria-label="Summary used in practice" />
            <button onClick={() => { actions.updateConcept(concept.id, { name, summary, userEdited: true }); setEdit(false); notify('Saved. The AI won’t overwrite your version.'); }} className="btn-primary self-start">Save correction</button>
          </div>
        )}
        <div><span className="label">Source passage</span><p className="mt-1.5 text-[14px] leading-relaxed border-l-[3px] border-gold pl-3">“{concept.passage}”</p>
          {note && <Link to={`/app/library/note/${note.id}`} onClick={onClose} className="text-[13.5px] link mt-1 inline-block">{note.title}</Link>}</div>
        <div><span className="label">Linked skills</span><div className="mt-1.5 flex flex-wrap gap-1.5">{concept.skills.length ? concept.skills.map((s) => <Link key={s} to={`/app/skills/${s}`} onClick={onClose} className="pill bg-sand text-indigo">{skillById(state, s)?.name}</Link>) : <span className="text-[14px] text-muted">None — not related to {state.user.role}.</span>}</div></div>
        {concept.status === 'active' && <div className="grid grid-cols-3 gap-2 text-center">
          <div className="card p-3"><p className="text-[18px] font-extrabold">{concept.asked}</p><p className="text-[12px] text-muted">Times asked</p></div>
          <div className="card p-3"><p className="text-[18px] font-extrabold capitalize">{concept.last || '—'}</p><p className="text-[12px] text-muted">Last result</p></div>
          <div className="card p-3"><p className="text-[18px] font-extrabold">{relDay(concept.due)}</p><p className="text-[12px] text-muted">Next review</p></div>
        </div>}
        <div className="flex flex-wrap gap-2">
          {concept.status === 'active' && (hasQs ? <button onClick={() => nav(`/app/practice?concept=${concept.id}`)} className="btn-primary"><Zap size={17} />Practise this now</button> : <span className="text-[13.5px] text-muted">Questions for this concept join your next session.</span>)}
          {concept.status === 'out' && <button onClick={() => { actions.updateConcept(concept.id, { status: 'active', override: true }); notify('Included. It will appear in practice.'); onClose(); }} className="btn-primary">This is relevant</button>}
          {concept.status === 'queued' && <button onClick={() => { actions.updateConcept(concept.id, { status: 'active', due: new Date().toISOString() }); notify('Moved up. It joins your next session.'); onClose(); }} className="btn-primary">Practise this soon</button>}
          {!edit && <button onClick={() => setEdit(true)} className="btn-ghost">Edit</button>}
          {concept.status !== 'out' && concept.status !== 'retired' && <button onClick={() => { actions.updateConcept(concept.id, { status: 'retired' }); notify('Removed from practice.'); onClose(); }} className="btn-quiet">Not a concept</button>}
        </div>
      </div>
    </Modal>
  );
}

export default function Library() {
  const { state } = useStore();
  const [tab, setTab] = useState('notes');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const [askOpen, setAskOpen] = useState(true);

  const concepts = useMemo(() => {
    const t = q.trim().toLowerCase();
    let list = state.concepts;
    if (filter !== 'all') list = list.filter((c) => (filter === 'in' ? c.status === 'active' : c.status === filter));
    if (!t) return list;
    const extra = MEANING.filter(([re]) => re.test(t)).flatMap(([, n]) => n.map((x) => x.toLowerCase()));
    return list.filter((c) => c.name.toLowerCase().includes(t) || c.summary.toLowerCase().includes(t) || extra.some((x) => c.name.toLowerCase().includes(x)));
  }, [q, filter, state.concepts]);

  const notes = state.notes.filter((n) => !q || `${n.title} ${n.body} ${n.source}`.toLowerCase().includes(q.toLowerCase()));
  const groups = notes.reduce((acc, n) => { const k = n.collection || 'Other notes'; (acc[k] = acc[k] || []).push(n); return acc; }, {});
  const count = (id) => state.concepts.filter((c) => c.noteId === id && c.status !== 'out').length;
  const outCount = (id) => state.concepts.filter((c) => c.noteId === id && c.status === 'out').length;

  return (
    <div>
      <PageHeader title="Library" sub="Everything you’ve captured, and the concepts the AI found in it."
        action={<div className="flex gap-2"><Link to="/app/library/upload" className="btn-ghost"><Upload size={17} />Upload</Link><Link to="/app/library/new" className="btn-primary"><Plus size={17} />Note</Link></div>} />
      <label className="input flex items-center gap-2 mb-3"><Search size={18} className="text-muted" /><input className="flex-1 outline-none bg-transparent" placeholder="Search by word or meaning — try “deciding what to build”" value={q} onChange={(e) => { setQ(e.target.value); if (e.target.value) setTab('concepts'); }} aria-label="Search library" /></label>
      <Segmented value={tab} onChange={setTab} options={[['notes', `Notes · ${state.notes.length}`], ['uploads', `Uploads · ${state.uploads.length}`], ['concepts', `Concepts · ${state.concepts.length}`]]} className="mb-5" />

      {tab === 'notes' && (
        <div className="flex flex-col gap-5">
          {askOpen && (
            <div className="card p-4 border-gold border-[1.5px] bg-[#FFFBF1] flex flex-col gap-3">
              <span className="label !text-gold-ink flex items-center gap-1.5"><HelpCircle size={14} />Quick question about a note</span>
              <p className="text-[15px]">In “Inspired, ch. 4–5” you wrote <strong>MLP</strong>. Did you mean <strong>Minimum Lovable Product</strong>?</p>
              <div className="flex gap-2"><button onClick={() => setAskOpen(false)} className="btn-primary">Yes</button><Link to="/app/library/note/n6" className="btn-ghost">No, let me edit</Link></div>
            </div>
          )}
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="flex flex-col gap-2">
              <span className="label">{g}</span>
              {list.map((n) => (
                <Link key={n.id} to={`/app/library/note/${n.id}`} className="card p-4 flex flex-col gap-1.5 hover:border-soft">
                  <div className="flex items-start justify-between gap-3"><p className="font-bold text-[16px] leading-snug">{n.title}</p><span className="text-[12.5px] text-muted whitespace-nowrap">{relDay(n.createdAt)}</span></div>
                  <p className="text-[13.5px] text-muted">{n.sourceType} · {n.source}</p>
                  <div className="flex gap-1.5 flex-wrap"><Pill tone="sand">{count(n.id)} concepts</Pill>{outCount(n.id) > 0 && <Pill tone="outline">{outCount(n.id)} out of scope</Pill>}</div>
                </Link>
              ))}
            </div>
          ))}
          {notes.length === 0 && <Empty icon={FileText} title="No notes match" body="Try another word, or search concepts by meaning." />}
        </div>
      )}

      {tab === 'uploads' && (
        <div className="flex flex-col gap-3">
          {state.uploads.map((u) => (
            <div key={u.id} className="card p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3"><p className="font-bold text-[15px] break-all">{u.name}</p>
                {u.status === 'ready' && <Pill tone="indigo">Ready</Pill>}{u.status === 'processing' && <Pill tone="gold">Processing</Pill>}{u.status === 'attention' && <Pill tone="sand">Needs attention</Pill>}</div>
              <p className="text-[13.5px] text-muted">{u.pages} pages · {u.size} · {relDay(u.createdAt)}{u.concepts ? ` · ${u.concepts} concepts` : ''}</p>
              {u.status === 'processing' && <><Progress value={u.progress} /><p className="text-[13px] text-muted">Extracting text · slide 31 of 50. You can leave this screen.</p></>}
              {u.status === 'attention' && <><p className="text-[14px]">{u.note} We couldn’t read their text.</p><button className="btn-ghost self-start">Run text recognition on 3 pages</button></>}
            </div>
          ))}
          <Link to="/app/library/upload" className="btn-ghost self-start"><Upload size={17} />Upload a file</Link>
        </div>
      )}

      {tab === 'concepts' && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">{[['all', 'All'], ['in', 'In practice'], ['queued', 'Queued'], ['out', 'Out of scope'], ['retired', 'Retired']].map(([v, l]) => <button key={v} onClick={() => setFilter(v)} className={`pill !text-[13px] !py-2 !px-3.5 cursor-pointer border-[1.5px] ${filter === v ? 'bg-indigo text-ivory border-indigo' : 'bg-white border-line text-indigo'}`}>{l}</button>)}</div>
          {q && <p className="text-[13.5px] text-muted">{concepts.length} results for “{q}”, including matches by meaning.</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            {concepts.map((c) => (
              <button key={c.id} onClick={() => setOpen(c)} className={`card p-4 text-left flex flex-col gap-1.5 hover:border-soft cursor-pointer ${c.status === 'out' ? 'border-dashed bg-ivory' : ''}`}>
                <div className="flex items-start justify-between gap-2"><span className={`font-bold text-[15px] ${c.status === 'out' ? 'text-muted' : ''}`}>{c.name}</span>
                  {c.status === 'out' ? <Pill tone="outline">Out of scope</Pill> : c.status === 'queued' ? <Pill tone="gold">Queued</Pill> : c.status === 'retired' ? <Pill tone="outline">Retired</Pill> : c.override ? <Pill tone="sand">In scope · your choice</Pill> : null}</div>
                <span className="text-[13px] text-muted">{c.status === 'out' ? `No matching ${state.user.role} skill` : c.skills.map((s) => skillById(state, s)?.name).join(' · ') || 'Not on your skill map yet'}</span>
              </button>
            ))}
          </div>
          {concepts.length === 0 && <Empty icon={Layers} title="Nothing here yet" />}
        </div>
      )}
      {open && <ConceptModal concept={state.concepts.find((c) => c.id === open.id)} onClose={() => setOpen(null)} />}
    </div>
  );
}

export { uid };
