import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { useStore, DEMO_EMAIL, DEMO_PASSWORD } from '../lib/store.jsx';
import { Logo } from '../components/ui.jsx';

export function AuthFrame({ children, back = '/' }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-indigo text-ivory flex-col justify-between p-12">
        <Link to="/"><Logo variant="gold" className="h-24" /></Link>
        <div>
          <p className="text-[34px] font-extrabold leading-tight">AI creates the challenge.<br /><span className="text-gold">You do the thinking.</span></p>
          <p className="mt-4 text-[16px] text-[#C9CBDA] max-w-md">Practise what you learn, prove what you can do, and record the impact you make at work.</p>
        </div>
        <p className="text-[13px] text-[#9A9DB5]">Private beta · 2026</p>
      </div>
      <div className="flex flex-col p-5 sm:p-10">
        <Link to={back} className="btn-quiet self-start !px-2"><ArrowLeft size={18} />Back</Link>
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-md fade-in">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { actions } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('demo') ? DEMO_EMAIL : '');
  const [pw, setPw] = useState(params.get('demo') ? DEMO_PASSWORD : '');
  const [err, setErr] = useState('');
  const [mode, setMode] = useState('password');
  const [code, setCode] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (actions.login(email, pw)) nav('/app');
    else setErr('That email and password don’t match. Use the demo account shown below.');
  };
  const fill = () => { setEmail(DEMO_EMAIL); setPw(DEMO_PASSWORD); setErr(''); setMode('password'); };

  return (
    <AuthFrame>
      <h1 className="text-[28px] font-extrabold">Welcome back</h1>
      <p className="mt-1 text-[15px] text-muted">Sign in to continue your practice.</p>

      <div className="mt-5 rounded-2xl bg-gold-soft text-gold-ink p-4 flex flex-col gap-2">
        <span className="flex items-center gap-2 font-extrabold text-[14px]"><KeyRound size={16} />Demo account</span>
        <span className="text-[14px]">Email: <strong>{DEMO_EMAIL}</strong></span>
        <span className="text-[14px]">Password: <strong>{DEMO_PASSWORD}</strong></span>
        <button onClick={fill} className="btn-primary !min-h-10 self-start mt-1">Fill demo login</button>
      </div>

      <button onClick={() => { actions.loginDirect(); nav('/app'); }} className="btn w-full mt-5 bg-white border border-line hover:border-indigo">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" /></svg>
        Continue with Google
      </button>
      <div className="flex items-center gap-3 my-4 text-[13px] text-muted"><span className="flex-1 h-px bg-line" />or<span className="flex-1 h-px bg-line" /></div>

      {mode === 'password' && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5"><span className="text-[14px] font-bold">Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label className="flex flex-col gap-1.5"><span className="text-[14px] font-bold">Password</span><input className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
          {err && <p className="text-[14px] text-bad font-semibold" role="alert">{err}</p>}
          <button className="btn-primary !min-h-12 mt-1">Sign in</button>
          <button type="button" onClick={() => setMode('code')} className="btn-quiet"><Mail size={17} />Email me a 6-digit code instead</button>
        </form>
      )}
      {mode === 'code' && (
        <div className="flex flex-col gap-3 fade-in">
          <p className="text-[14px] text-muted">In the live product, sign-in uses Google or a 6-digit code sent to your email (it works inside the installed app on iPhone, unlike magic links). For this demo, the code is <strong className="text-indigo">482 913</strong>.</p>
          <input className="input text-center tracking-[0.4em] text-[22px] font-extrabold" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="••••••" aria-label="6-digit code" />
          <button className="btn-primary !min-h-12" onClick={() => { if (code === '482913') { actions.loginDirect(); nav('/app'); } else setErr('That code isn’t right. Try 482913.'); }}>Verify and sign in</button>
          {err && <p className="text-[14px] text-bad font-semibold">{err}</p>}
          <button onClick={() => setMode('password')} className="btn-quiet">Use password instead</button>
        </div>
      )}
      <p className="mt-6 text-[14px] text-muted">New here? <Link to="/access" className="link text-indigo">Get started</Link></p>
    </AuthFrame>
  );
}
