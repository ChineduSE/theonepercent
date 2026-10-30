import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { PageHeader, Segmented, Pill, Modal, relDay } from '../components/ui.jsx';

export default function Admin() {
  const { state, actions, notify } = useStore();
  const a = state.admin;
  const [tab, setTab] = useState('frameworks');
  const [newCode, setNewCode] = useState(false);
  const [code, setCode] = useState({ code: '', label: '', max: 50 });
  const costs = [['Concept extraction', 0.04], ['Question generation', 0.09], ['Answer grading', 0.03], ['Project grading', 0.12], ['Voice interviews', 0.38], ['Work log and documents', 0.06]];
  const total = costs.reduce((s, [, v]) => s + v, 0);
  return (
    <div>
      <PageHeader kicker="Founder only" title="Admin" sub="Frameworks, quality, access and cost — the controls behind the learner experience." />
      <Segmented value={tab} onChange={setTab} options={[['frameworks', 'Frameworks'], ['flags', 'Flags'], ['access', 'Access'], ['quality', 'Quality'], ['cost', 'AI cost']]} className="mb-5" />

      {tab === 'frameworks' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[620px] text-[14px]">
            <thead><tr className="bg-ivory text-left text-[12px] uppercase tracking-[0.06em] text-muted">{['Role', 'Learners', 'Status', 'Version', 'Open flags', ''].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
            <tbody>{a.roles.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <td className="px-4 py-3 font-bold">{r.name}</td><td className="px-4 py-3">{r.learners}</td>
                <td className="px-4 py-3"><Pill tone={r.status === 'Reviewed' ? 'ok' : 'gold'}>{r.status}</Pill></td><td className="px-4 py-3">v{r.version}</td>
                <td className="px-4 py-3">{r.flags > 0 ? <Pill tone="bad">{r.flags}</Pill> : '—'}</td>
                <td className="px-4 py-3">{r.status !== 'Reviewed' ? <button onClick={() => { actions.setAdmin((ad) => { const x = ad.roles.find((y) => y.name === r.name); x.status = 'Reviewed'; x.version += 1; }); notify(`${r.name} v${r.version + 1} published as Reviewed. Learners keep their evidence.`); }} className="btn-ghost !min-h-9">Review and publish</button> : <span className="text-muted text-[13px]">Up to date</span>}</td>
              </tr>))}</tbody>
          </table>
          <p className="p-4 text-[13px] text-muted border-t border-line">New roles are generated on first use, pass an automatic quality check, and go live as “AI-generated”. Review the most-used roles first.</p>
        </div>
      )}

      {tab === 'flags' && (
        <div className="flex flex-col gap-4">
          <span className="label">“This skill doesn’t fit my role”</span>
          {[...state.flags.map((f) => ({ role: state.user.role, skill: state.skills.find((s) => s.id === f.skillId)?.name, count: 1, pct: 'new', reason: f.reason })), ...a.flags].map((f, i) => (
            <div key={i} className="card p-4 flex flex-wrap items-center gap-3"><span className="flex-1 flex flex-col"><span className="font-bold">{f.role} · “{f.skill}”</span><span className="text-[13px] text-muted">{f.count} learner{f.count > 1 ? 's' : ''} ({f.pct}) · mostly “{f.reason}”</span></span>{(f.pct === 'new' || parseInt(f.pct, 10) >= 10) && <Pill tone="bad">Review now</Pill>}<button className="btn-ghost !min-h-9">Open skill</button></div>
          ))}
          <span className="label mt-2">Suggested for the shared map</span>
          {a.suggestions.map((s) => <div key={s.skill} className="card p-4 flex flex-wrap items-center gap-3"><span className="flex-1 flex flex-col"><span className="font-bold">{s.role} · “{s.skill}”</span><span className="text-[13px] text-muted">{s.note}</span></span><button onClick={() => notify(`“${s.skill}” added to the ${s.role} framework. Those learners’ evidence carries over.`)} className="btn-primary !min-h-9">Add to framework</button></div>)}
        </div>
      )}

      {tab === 'access' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between"><span className="label">Invite codes</span><button onClick={() => setNewCode(true)} className="btn-ghost !min-h-9"><Plus size={16} />New code</button></div>
          {a.invites.map((c) => (
            <div key={c.code} className="card p-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-extrabold">{c.code} <span className="font-semibold text-muted text-[13.5px]">· {c.label}</span></span><Pill tone={c.active ? 'ok' : 'outline'}>{c.active ? 'Active' : 'Off'}</Pill></div>
              <div className="h-2 rounded-full bg-sand overflow-hidden"><div className="h-full bg-indigo" style={{ width: `${(c.used / c.max) * 100}%` }} /></div>
              <span className="text-[13px] text-muted">{c.used} of {c.max} places used · link: /join/{c.code}</span>
            </div>
          ))}
          <span className="label mt-2">Access requests</span>
          {a.requests.map((r) => <div key={r.name} className="card p-4 flex flex-wrap items-center gap-3"><span className="flex-1 flex flex-col"><span className="font-bold">{r.name} · {r.role}</span><span className="text-[13px] text-muted">From {r.source} · {relDay(r.date)}</span></span><button onClick={() => notify(`Invite sent to ${r.name}.`)} className="btn-primary !min-h-9">Send invite</button></div>)}
          <Modal open={newCode} onClose={() => setNewCode(false)} title="New invite code">
            <div className="flex flex-col gap-3"><input className="input uppercase" placeholder="CODE, e.g. BOOTCAMP-W2" value={code.code} onChange={(e) => setCode({ ...code, code: e.target.value.toUpperCase() })} /><input className="input" placeholder="Wave label" value={code.label} onChange={(e) => setCode({ ...code, label: e.target.value })} /><input className="input" inputMode="numeric" placeholder="Max uses" value={code.max} onChange={(e) => setCode({ ...code, max: Number(e.target.value) || 0 })} />
              <button disabled={!code.code} onClick={() => { actions.setAdmin((ad) => { ad.invites.push({ ...code, used: 0, active: true }); }); setNewCode(false); notify(`Code created. Share the link /join/${code.code}`); }} className="btn-primary">Create</button></div>
          </Modal>
        </div>
      )}

      {tab === 'quality' && (
        <div className="grid sm:grid-cols-3 gap-3">
          {[['Grading gold set', '46 of 50', 'within one result level · prompt v1.4'], ['Disputes this week', '31 · 4 overturned', '0.6% of all gradings'], ['Hallucination guard', '212 concepts dropped', 'quote not found in note · last 7 days'], ['Frameworks', '6 roles', '2 reviewed · 4 AI-generated'], ['Out-of-scope overrides', '3.1%', 'of flagged concepts'], ['Clarifying questions', '74% answered', 'within 3 days']].map(([t, v, s]) => (
            <div key={t} className="card p-4 flex flex-col gap-1"><span className="label">{t}</span><span className="text-[22px] font-extrabold">{v}</span><span className="text-[13px] text-muted">{s}</span></div>
          ))}
        </div>
      )}

      {tab === 'cost' && (
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-end"><span className="label">AI cost per active learner per week</span><span className="text-[24px] font-extrabold">${total.toFixed(2)}</span></div>
          {costs.map(([l, v]) => (
            <div key={l} className="flex flex-col gap-1"><div className="flex justify-between text-[13.5px]"><span>{l}</span><span className="font-bold">${v.toFixed(2)}</span></div><div className="h-2.5 rounded-full bg-sand overflow-hidden"><div className="h-full bg-indigo" style={{ width: `${(v / 0.4) * 100}%` }} /></div></div>
          ))}
          <p className="text-[13px] text-muted">Illustrative figures for the demo. Voice interviews dominate cost, which is why they have time limits and daily caps during beta.</p>
        </div>
      )}
    </div>
  );
}
