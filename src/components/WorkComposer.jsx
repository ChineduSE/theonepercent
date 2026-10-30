import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { useStore, uid, skillById, kpiById } from '../lib/store.jsx';
import { analyseWorkEntry } from '../lib/ai.js';
import { Pill, Spinner } from './ui.jsx';

// Daily work log entry with the AI follow-up question (decision W: under 60 seconds).
export default function WorkComposer({ compact = false, onDone }) {
  const { state, actions, notify } = useStore();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null); // entry awaiting result
  const [result, setResult] = useState('');

  const submit = () => {
    if (text.trim().length < 10) return;
    setBusy(true);
    setTimeout(() => {
      const a = analyseWorkEntry(text, state.work.kpis);
      const entry = { id: uid('w'), date: new Date().toISOString(), text: text.trim(), skills: a.skills, kpi: a.kpi, result: a.hasResult ? 'Result included in entry.' : null, followUp: a.followUp };
      if (a.hasResult) {
        const sentences = text.split(/(?<=[.!?;])\s+/);
        const re = /\d|increased|reduced|cut|saved|grew|dropped|rose|approved|agreed|signed off/i;
        const hit = sentences.find((s) => /\d/.test(s)) || sentences.find((s) => re.test(s)) || text;
        const clause = hit.split(/,\s*|\band\b/).find((c) => re.test(c)) || hit;
        entry.result = clause.trim().replace(/^\w/, (m) => m.toUpperCase());
      }
      actions.addWorkEntry(entry);
      setBusy(false); setText('');
      if (a.followUp) setPending(entry);
      else { notify(`Logged. Linked to ${a.skills.length} skill${a.skills.length > 1 ? 's' : ''}${a.kpi ? ' and a KPI' : ''}.`); onDone?.(); }
    }, 900);
  };

  const saveResult = (skip) => {
    actions.updateWorkEntry(pending.id, skip ? { followUp: null } : { result: result.trim(), followUp: null });
    notify(skip ? 'Saved. You can add the result later.' : 'Result added. This entry is now ready for a STAR story.');
    setPending(null); setResult(''); onDone?.();
  };

  if (pending) {
    return (
      <div className="flex flex-col gap-3 fade-in">
        <div className="flex flex-wrap gap-1.5">{pending.skills.map((s) => <Pill key={s} tone="sand">{skillById(state, s)?.name}</Pill>)}{pending.kpi && <Pill tone="gold">KPI: {kpiById(state, pending.kpi)?.name}</Pill>}</div>
        <div className="rounded-xl bg-indigo text-ivory p-3.5 flex gap-2.5 text-[14.5px]"><Sparkles size={18} className="text-gold shrink-0 mt-0.5" />{pending.followUp}</div>
        <textarea className="textarea" rows={2} value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g. The team agreed to fix the top cause first; tickets dropped 12% in a week." aria-label="What changed?" />
        <div className="flex gap-2"><button onClick={() => saveResult(false)} disabled={!result.trim()} className="btn-primary flex-1">Add result</button><button onClick={() => saveResult(true)} className="btn-quiet">Later</button></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <textarea className="textarea" rows={compact ? 2 : 3} value={text} onChange={(e) => setText(e.target.value)} aria-label="What did you work on today?"
        placeholder="What did you work on today? e.g. Watched 5 users try the new KYC step; 3 got stuck finding their NIN." />
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] text-muted flex-1">Private. Linked to your skills and KPIs automatically.</span>
        <button onClick={submit} disabled={busy || text.trim().length < 10} className="btn-primary">{busy ? <Spinner /> : <Send size={16} />}Log it</button>
      </div>
    </div>
  );
}
