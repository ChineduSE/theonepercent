import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Ticket, Send } from 'lucide-react';
import { AuthFrame } from './Login.jsx';

const VALID = ['PITCH-DEMO', 'ALX-W1', 'PM-COMMUNITY'];

export default function Access() {
  const { code: linkCode } = useParams();
  const nav = useNavigate();
  const [stage, setStage] = useState(linkCode ? 'signup' : 'gate');
  const [code, setCode] = useState(linkCode ? linkCode.toUpperCase() : '');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ name: '', email: '', adult: false, terms: false });
  const [req, setReq] = useState({ name: '', email: '', role: '', source: '' });

  const checkCode = () => {
    if (VALID.includes(code.trim().toUpperCase())) { setErr(''); setStage('signup'); }
    else setErr('That code isn’t active. Try PITCH-DEMO for this demo, or request access below.');
  };

  return (
    <AuthFrame>
      {stage === 'gate' && (
        <>
          <span className="pill bg-gold-soft text-gold-ink">Private beta</span>
          <h1 className="mt-3 text-[28px] font-extrabold leading-tight">We’re in private beta</h1>
          <p className="mt-1 text-[15px] text-muted">We’re opening in small waves so every learner gets a great experience.</p>
          <div className="card p-5 mt-6 flex flex-col gap-3">
            <span className="flex items-center gap-2 font-extrabold"><Ticket size={18} />I have an invite code</span>
            <input className="input uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. PITCH-DEMO" aria-label="Invite code" />
            {err && <p className="text-[14px] text-bad font-semibold" role="alert">{err}</p>}
            <button onClick={checkCode} className="btn-primary">Continue</button>
            <p className="text-[13px] text-muted">Demo code: <strong className="text-indigo">PITCH-DEMO</strong>. Invite links like <code>/join/ALX-W1</code> skip this step.</p>
          </div>
          <div className="card p-5 mt-4 flex flex-col gap-3">
            <span className="flex items-center gap-2 font-extrabold"><Send size={18} />Request access</span>
            <input className="input" placeholder="Your name" value={req.name} onChange={(e) => setReq({ ...req, name: e.target.value })} />
            <input className="input" type="email" placeholder="Email" value={req.email} onChange={(e) => setReq({ ...req, email: e.target.value })} />
            <input className="input" placeholder="Role you’re working toward" value={req.role} onChange={(e) => setReq({ ...req, role: e.target.value })} />
            <select className="input" value={req.source} onChange={(e) => setReq({ ...req, source: e.target.value })} aria-label="Where did you hear about us?">
              <option value="">Where did you hear about us?</option><option>LinkedIn</option><option>A friend</option><option>A course or bootcamp</option><option>Other</option>
            </select>
            <button onClick={() => setStage('requested')} disabled={!req.email} className="btn-ghost">Request access</button>
          </div>
        </>
      )}
      {stage === 'requested' && (
        <div className="card p-8 flex flex-col items-center text-center gap-3">
          <CheckCircle2 size={40} className="text-ok" />
          <p className="text-[20px] font-extrabold">Request received</p>
          <p className="text-[15px] text-muted">We’ll email {req.email} when the next wave opens. Want to look around now?</p>
          <button onClick={() => nav('/login?demo=1')} className="btn-primary">Open the live demo</button>
        </div>
      )}
      {stage === 'signup' && (
        <>
          <span className="pill bg-ok-soft text-ok">Invite accepted · {code.toUpperCase()}</span>
          <h1 className="mt-3 text-[28px] font-extrabold">Create your account</h1>
          <div className="flex flex-col gap-3 mt-5">
            <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" type="email" placeholder="Email (we’ll send a 6-digit code)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label className="flex gap-3 items-start text-[14.5px] cursor-pointer"><input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo" checked={form.adult} onChange={(e) => setForm({ ...form, adult: e.target.checked })} />I confirm I’m 18 or older.</label>
            <label className="flex gap-3 items-start text-[14.5px] cursor-pointer"><input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />I agree to the <span className="link">Terms</span> and <span className="link">Privacy Policy</span>.</label>
            <button onClick={() => nav('/onboarding', { state: { name: form.name } })} disabled={!form.adult || !form.terms || !form.name} className="btn-primary !min-h-12 mt-1">Continue</button>
            <p className="text-[13px] text-muted">For the demo, no email is sent. You’ll go straight to onboarding.</p>
          </div>
        </>
      )}
    </AuthFrame>
  );
}
