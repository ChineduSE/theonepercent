import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, LogOut, RotateCcw, Smartphone, ShieldCheck } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { PageHeader, Toggle, SectionLabel, Modal, relDay, Segmented } from '../components/ui.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Settings() {
  const { state, actions, notify } = useStore();
  const nav = useNavigate();
  const u = state.user;
  const [roleSheet, setRoleSheet] = useState(false);
  const [del, setDel] = useState(false);
  const setN = (k, v) => actions.setUser({ notif: { ...u.notif, [k]: v } });

  const exportData = () => {
    const b = new Blob([JSON.stringify({ user: u, notes: state.notes, concepts: state.concepts, projects: state.projects, interviews: state.interviews, work: state.work }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'the-one-percent-export.json'; a.click();
    notify('Your data export has downloaded.');
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />
      <div className="card p-5 flex items-center gap-4 mb-2"><span className="w-14 h-14 rounded-full bg-indigo text-gold text-[18px] font-extrabold flex items-center justify-center">TA</span><div className="flex flex-col"><span className="text-[18px] font-extrabold">{u.name}</span><span className="text-[14px] text-muted">{u.email}</span></div></div>

      <SectionLabel>Learning</SectionLabel>
      <div className="card divide-y divide-line">
        <div className="flex items-center justify-between gap-3 p-4"><span className="flex flex-col"><span className="font-bold">Target role</span><span className="text-[13.5px] text-muted">{u.role}</span></span><button onClick={() => setRoleSheet(true)} className="btn-ghost !min-h-9">Change</button></div>
        <label className="flex items-center justify-between gap-3 p-4"><span className="font-bold">Familiarity</span><select className="input !w-auto !min-h-10" value={u.familiarity} onChange={(e) => actions.setUser({ familiarity: e.target.value })}>{['New to it', 'I know the basics', 'Practising (under 1 year)', 'Experienced (1–3 years)', 'Advanced (3+ years)'].map((x) => <option key={x}>{x}</option>)}</select></label>
        <div className="p-4 flex flex-col gap-3"><span className="font-bold">Practice</span><Segmented value={u.mode} onChange={(v) => actions.setUser({ mode: v })} options={[['twice', 'Twice a day'], ['once', 'Once a day']]} />
          <div className="flex gap-3 flex-wrap"><label className="flex items-center gap-2 text-[14px]">Morning<input type="time" className="input !w-auto !min-h-10" value={u.morning} onChange={(e) => actions.setUser({ morning: e.target.value })} /></label>{u.mode === 'twice' && <label className="flex items-center gap-2 text-[14px]">Evening<input type="time" className="input !w-auto !min-h-10" value={u.evening} onChange={(e) => actions.setUser({ evening: e.target.value })} /></label>}</div>
          <span className="text-[13px] text-muted">Time zone: {u.timezone} · at least 6 hours between sessions</span></div>
        <div className="p-4 flex flex-col gap-2"><span className="font-bold">Days off</span><div className="flex gap-1.5 flex-wrap">{DAYS.map((d) => <button key={d} onClick={() => actions.setUser({ daysOff: u.daysOff.includes(d) ? u.daysOff.filter((x) => x !== d) : [...u.daysOff, d] })} className={`w-12 h-10 rounded-lg border-[1.5px] font-bold text-[13.5px] cursor-pointer ${u.daysOff.includes(d) ? 'bg-indigo text-ivory border-indigo' : 'bg-white border-line'}`}>{d}</button>)}</div><span className="text-[13px] text-muted">No reminders on days off. Spaced repetition plans around them.</span></div>
      </div>

      <SectionLabel>Notifications · at most 3 a day</SectionLabel>
      <div className="card px-4 divide-y divide-line">
        <Toggle on={u.notif.practice} onChange={(v) => setN('practice', v)} label="Practice ready" sub="Morning and evening" />
        <Toggle on={u.notif.project} onChange={(v) => setN('project', v)} label="New project and deadlines" sub="Offers, halfway and 24-hour reminders" />
        <Toggle on={u.notif.grade} onChange={(v) => setN('grade', v)} label="Grades and interviews" />
        <Toggle on={u.notif.worklog} onChange={(v) => setN('worklog', v)} label="Work log prompt" sub="18:30 on workdays: “Log one thing from today”" />
        <Toggle on={u.notif.apply} onChange={(v) => setN('apply', v)} label="Apply-at-work suggestions" sub="When something you learned fits a goal" />
        <Toggle on={u.emailBackup} onChange={(v) => actions.setUser({ emailBackup: v })} label="Email when push isn’t available" sub="Never both for the same reminder" />
        <div className="py-3 flex gap-3 items-start text-[13.5px] text-muted"><Smartphone size={18} className="shrink-0 mt-0.5" /><span><strong className="text-indigo">Install the app:</strong> on Android, tap Install in Chrome’s menu. On iPhone, Share → Add to Home Screen, then turn on reminders inside the app.</span></div>
      </div>

      <SectionLabel>Assessment reviews</SectionLabel>
      <div className="card divide-y divide-line">{state.disputes.map((d) => <div key={d.id} className="p-4 flex flex-col gap-0.5"><span className="font-bold text-[14.5px]">{d.target}</span><span className="text-[13px] text-muted">{d.from} → {d.to} · {relDay(d.date)} · {d.note}</span></div>)}</div>

      <SectionLabel>Privacy and data</SectionLabel>
      <div className="card px-4 divide-y divide-line">
        <Toggle on={u.keepAudio} onChange={(v) => actions.setUser({ keepAudio: v })} label="Keep interview audio" sub={u.keepAudio ? 'On: recordings kept until you delete them' : 'Off: deleted once the transcript is made'} />
        <div className="py-3 flex gap-3 text-[13.5px] text-muted"><ShieldCheck size={18} className="text-ok shrink-0" />Notes, uploads, transcripts and work logs are private and never used to train AI. Learn more in our privacy summary.</div>
        <button onClick={exportData} className="w-full py-3 flex items-center gap-2 font-bold text-left cursor-pointer"><Download size={17} />Export my data</button>
        <button onClick={() => setDel(true)} className="w-full py-3 font-bold text-bad text-left cursor-pointer">Delete account</button>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={() => { actions.logout(); nav('/'); }} className="btn-ghost"><LogOut size={17} />Sign out</button>
        <button onClick={() => { actions.reset(); try { localStorage.removeItem('top-tour'); } catch { /* ignore */ } }} className="btn-quiet border border-line bg-white"><RotateCcw size={16} />Reset demo data</button>
      </div>
      <p className="text-[12.5px] text-muted mt-4">Prototype: AI responses are simulated with realistic logic. The PRD defines the production AI pipelines.</p>

      <Modal open={roleSheet} onClose={() => setRoleSheet(false)} title="Change your target role?">
        <div className="flex flex-col gap-2.5 text-[14.5px] leading-relaxed">
          <p><strong>Your notes stay.</strong> Every concept is re-checked against the new role, so some may become out of scope.</p>
          <p><strong>Your skills gap switches</strong> to the new role’s map. Earned evidence is kept and re-mapped where it fits.</p>
          <p><strong>Your work log stays</strong> and is re-linked to the new role’s skills.</p>
          <p><strong>Active projects</strong> stay open until you finish or close them.</p>
        </div>
        <div className="flex flex-col gap-2 mt-5"><button onClick={() => { setRoleSheet(false); nav('/onboarding'); }} className="btn-primary">Choose a new role</button><button onClick={() => setRoleSheet(false)} className="btn-ghost">Keep {u.role}</button></div>
      </Modal>
      <Modal open={del} onClose={() => setDel(false)} title="Delete your account?">
        <p className="text-[14.5px] leading-relaxed">This removes your notes, uploads, projects, transcripts, work log and portfolio within 30 days. Export first if you want a copy.</p>
        <p className="text-[13px] text-muted mt-2">In this demo, deleting resets the demo account and signs you out.</p>
        <div className="flex gap-2 mt-5"><button onClick={() => { actions.reset(); actions.logout(); nav('/'); }} className="btn-danger flex-1">Delete</button><button onClick={() => setDel(false)} className="btn-ghost flex-1">Cancel</button></div>
      </Modal>
      <Link to="/app/admin" className="hidden">Admin</Link>
    </div>
  );
}
