import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Zap, Lightbulb, Plus, Trash2 } from 'lucide-react';
import { useStore, uid, skillById } from '../lib/store.jsx';
import { extractConcepts, questionsForConcepts, suggestImplementation } from '../lib/ai.js';
import { Pill, Spinner, relDay, Modal } from '../components/ui.jsx';
import { ConceptModal } from './Library.jsx';

const TYPES = ['Course', 'Book', 'Webinar', 'Video', 'Article', 'Tutorial', 'Other'];

export default function NoteEditor() {
  const { id } = useParams();
  const { state, actions, notify } = useStore();
  const nav = useNavigate();
  const existing = state.notes.find((n) => n.id === id);
  const [title, setTitle] = useState(existing?.title || '');
  const [type, setType] = useState(existing?.sourceType || 'Course');
  const [source, setSource] = useState(existing?.source || '');
  const [body, setBody] = useState(existing?.body || '');
  const [stage, setStage] = useState('edit');
  const [step, setStep] = useState(0);
  const [found, setFound] = useState([]);
  const [noteId, setNoteId] = useState(existing?.id || null);
  const [open, setOpen] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [added, setAdded] = useState({});

  const noteConcepts = state.concepts.filter((c) => c.noteId === noteId);

  const process = () => {
    setStage('processing'); setStep(0);
    const steps = [0, 1, 2, 3];
    steps.forEach((s) => setTimeout(() => setStep(s + 1), 600 * (s + 1)));
    setTimeout(() => {
      const nid = noteId || uid('n');
      const all = extractConcepts(body);
      const known = new Set(state.concepts.filter((c) => c.noteId === nid).map((c) => c.name));
      const fresh = all.filter((c) => !known.has(c.name)).map((c) => ({ ...c, id: uid('c') }));
      const note = { id: nid, title: title || (body.split(/[.\n]/)[0] || 'Untitled note').slice(0, 60), sourceType: type, source: source || type, collection: '', createdAt: existing?.createdAt || new Date().toISOString(), body };
      if (existing) actions.updateNote(nid, note);
      actions.addNote(note, fresh);
      actions.addQuestions(questionsForConcepts(fresh, state.questions));
      setNoteId(nid); setFound(fresh); setStage('result');
    }, 2700);
  };

  const applyAtWork = () => {
    const c = found.find((f) => f.scope === 'in');
    if (!c) return;
    actions.addImpl(suggestImplementation(c, state.work.kpis, state.work.profile));
    notify('Added to Apply at work.');
    nav('/app/work?tab=apply');
  };

  const addSkill = (c) => {
    const sid = uid('skill');
    actions.addSkill({ id: sid, area: 'strat', name: c.suggestSkill, level: 'Practitioner', desc: c.summary });
    actions.updateConcept(c.id, { skills: [sid] });
    setAdded({ ...added, [c.id]: true });
    notify(`“${c.suggestSkill}” added to your skill map as “Added by you”.`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Link to="/app/library" className="btn-quiet !px-2"><ArrowLeft size={18} />Library</Link>
        <span className="ml-auto text-[13px] text-muted">{existing ? `Created ${relDay(existing.createdAt)}` : 'New note'}</span>
      </div>

      {stage === 'edit' && (
        <div className="flex flex-col gap-4">
          <input className="w-full bg-transparent text-[26px] font-extrabold outline-none placeholder:text-soft" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
          <div className="flex flex-wrap gap-1.5">{TYPES.map((t) => <button key={t} onClick={() => setType(t)} className={`pill !text-[13px] !py-2 !px-3.5 cursor-pointer border-[1.5px] ${type === t ? 'bg-indigo text-ivory border-indigo' : 'bg-white border-line text-indigo'}`}>{t}</button>)}</div>
          <input className="input" placeholder="Source name, e.g. Product School · PM Fundamentals" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source" />
          <textarea className="textarea !text-[16px] min-h-72" rows={12} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Note"
            placeholder={'In your own words: what is it, when is it used, an example.\n\nTry: “North Star metric: one number for the value customers get. Use OKRs to set quarterly goals. A/B test changes with a guardrail metric. Unit economics: compare CAC with LTV.”'} />
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={process} disabled={body.trim().length < 15} className="btn-primary !min-h-12">{existing ? 'Save and update concepts' : 'Save and find concepts'}</button>
            <span className="text-[13px] text-muted">Concepts are found when you save, not while you type.</span>
            {existing && <button onClick={() => setConfirmDel(true)} className="btn-quiet ml-auto text-bad"><Trash2 size={16} />Delete</button>}
          </div>
          {existing && noteConcepts.length > 0 && (
            <div className="mt-2"><span className="label">Concepts from this note · {noteConcepts.length}</span>
              <div className="mt-2 card divide-y divide-line">{noteConcepts.map((c) => (
                <button key={c.id} onClick={() => setOpen(c.id)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-ivory cursor-pointer">
                  <span className="flex flex-col"><span className={`font-bold text-[15px] ${c.status === 'out' ? 'text-muted' : ''}`}>{c.name}</span><span className="text-[12.5px] text-muted">{c.skills.map((s) => skillById(state, s)?.name).join(' · ') || 'No matching skill'}</span></span>
                  {c.status === 'out' ? <Pill tone="outline">Out of scope</Pill> : c.status === 'queued' ? <Pill tone="gold">Queued</Pill> : c.status === 'retired' ? <Pill tone="outline">Retired</Pill> : <Pill tone="sand">In practice</Pill>}
                </button>))}</div>
            </div>
          )}
        </div>
      )}

      {stage === 'processing' && (
        <div className="card p-6 flex flex-col gap-4 max-w-lg mx-auto mt-6">
          <p className="font-extrabold text-[20px]">Reading your note</p>
          {['Saving your note', 'Finding concepts', `Linking to ${state.user.role} skills`, 'Checking for duplicates', 'Writing questions'].map((t, i) => (
            <div key={t} className={`flex items-center gap-3 text-[15px] font-semibold ${i <= step ? 'text-indigo' : 'text-soft'}`}>{i < step ? <CheckCircle2 size={20} className="text-ok" /> : i === step ? <Spinner /> : <span className="w-5 h-5 rounded-full border-2 border-line" />}{t}</div>
          ))}
        </div>
      )}

      {stage === 'result' && (
        <div className="flex flex-col gap-4 fade-in">
          <div className="bg-indigo text-ivory rounded-3xl p-5 flex flex-col gap-1.5">
            <span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">Saved</span>
            <p className="text-[22px] font-extrabold">{found.length === 0 ? 'No new concepts found' : `${found.filter((f) => f.scope !== 'out').length} new concepts found`}</p>
            <p className="text-[14px] text-[#C9CBDA]">{found.length === 0 ? 'Try adding what it is, when it’s used and an example.' : 'Up to 5 new concepts join practice each day; the rest wait in a queue so reviews aren’t crowded out.'}</p>
          </div>
          {found.map((c) => (
            <div key={c.id} className={`card p-4 flex flex-col gap-2 ${c.scope === 'out' ? 'border-dashed bg-ivory' : ''}`}>
              <div className="flex items-start justify-between gap-2"><p className={`font-bold ${c.scope === 'out' ? 'text-muted' : ''}`}>{c.name}</p>
                {c.scope === 'out' ? <Pill tone="outline">Out of scope</Pill> : c.scope === 'missing' ? <Pill tone="gold">Not on your map yet</Pill> : <Pill tone="sand">{skillById(state, c.skills[0])?.name}</Pill>}</div>
              <p className="text-[13.5px] text-muted">{c.scope === 'out' ? `Not related to ${state.user.role}. It stays in your library but won’t appear in practice.` : c.summary}</p>
              <p className="text-[12.5px] text-muted border-l-2 border-gold pl-2">“{c.passage}”</p>
              {c.scope === 'missing' && !added[c.id] && <div className="rounded-xl bg-gold-soft p-3 flex flex-wrap items-center gap-3"><span className="text-[14px] text-gold-ink flex-1 min-w-48">This looks like a {state.user.role} skill that isn’t on your map yet. Add it?</span><button onClick={() => addSkill(c)} className="btn-primary !min-h-10"><Plus size={16} />Add as a skill</button></div>}
              {added[c.id] && <Pill tone="ok" className="self-start">Added to your skill map</Pill>}
            </div>
          ))}
          <div className="flex flex-wrap gap-3 mt-1">
            {found.some((f) => f.scope === 'in') && <button onClick={() => nav(`/app/practice?note=${noteId}`)} className="btn-primary !min-h-12"><Zap size={18} />Practise these now</button>}
            {found.some((f) => f.scope === 'in') && <button onClick={applyAtWork} className="btn-gold !min-h-12"><Lightbulb size={18} />How could I use this at work?</button>}
            <button onClick={() => setStage('edit')} className="btn-ghost !min-h-12">Back to note</button>
          </div>
        </div>
      )}
      {open && <ConceptModal concept={state.concepts.find((c) => c.id === open)} onClose={() => setOpen(null)} />}
      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Delete this note?">
        <p className="text-[15px] leading-relaxed">Its concepts stop appearing in practice, unless another note also contains them. Evidence you’ve already earned stays in your history.</p>
        <div className="flex gap-2 mt-5"><button onClick={() => { actions.deleteNote(existing.id); notify('Note deleted. Your earned evidence is kept.'); nav('/app/library'); }} className="btn-danger flex-1">Delete</button><button onClick={() => setConfirmDel(false)} className="btn-ghost flex-1">Keep it</button></div>
      </Modal>
    </div>
  );
}
