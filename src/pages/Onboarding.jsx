import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Sparkles, Sun, Moon, Upload as UploadIcon, PenLine, Target, CheckCircle2, Bell, Smartphone } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { extractConcepts, questionsForConcepts } from '../lib/ai.js';
import { Mark, Pill, Spinner, Segmented } from '../components/ui.jsx';

const ROLES = ['Product Manager', 'Product Marketing Manager', 'Product Designer', 'Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Data Analyst', 'Data Scientist', 'Business Development Officer', 'Business Analyst', 'Project Manager', 'Digital Marketer', 'Social Media Manager', 'Content Marketer', 'Cybersecurity Analyst', 'DevOps Engineer', 'QA Engineer', 'Customer Success Manager', 'Technical Writer', 'Sales Executive'];
const ABBR = { pm: 'Product Manager', bdo: 'Business Development Officer', swe: 'Software Engineer', da: 'Data Analyst', ds: 'Data Scientist', smm: 'Social Media Manager', pmm: 'Product Marketing Manager', ba: 'Business Analyst', qa: 'QA Engineer', csm: 'Customer Success Manager', ux: 'Product Designer' };

const TEMPLATES = {
  'Product Manager': [['Discovery and research', 6], ['Prioritisation and roadmapping', 4], ['Metrics and analytics', 8], ['Delivery and execution', 4], ['Stakeholder communication', 4], ['Strategy and vision', 4]],
  'Business Development Officer': [['Digital tools and AI for prospecting', 4], ['Client communication and proposals', 5], ['Sales and negotiation', 6], ['Strategic planning', 4], ['Market research and business intelligence', 5], ['Data analysis and ROI tracking', 4], ['Marketing for business development', 4], ['Networking and partnerships', 4], ['Opportunity identification', 3], ['Project management', 3]],
  'Data Analyst': [['SQL and data access', 6], ['Spreadsheets and data cleaning', 4], ['Statistics', 5], ['Visualisation and dashboards', 5], ['Business questions and metrics', 5], ['Communicating insights', 4]],
  'Software Engineer': [['Programming fundamentals', 6], ['Data structures and algorithms', 5], ['Web and APIs', 5], ['Databases', 4], ['Testing and quality', 4], ['System design', 5], ['Collaboration and code review', 3]],
  'Social Media Manager': [['Platform strategy', 5], ['Content creation', 5], ['Community management', 4], ['Paid social', 4], ['Analytics and reporting', 4], ['Brand voice and campaigns', 4]],
};
const genericAreas = (r) => [[`Core ${r} knowledge`, 6], ['Tools and methods', 5], ['Planning and execution', 5], ['Data and measurement', 4], ['Communication with stakeholders', 4], ['Strategy and growth', 4]];

const FAMILIARITY = ['New to it', 'I know the basics', 'Practising (under 1 year)', 'Experienced (1–3 years)', 'Advanced (3+ years)'];

export default function Onboarding() {
  const nav = useNavigate();
  const loc = useLocation();
  const { actions, state } = useStore();
  const name = (loc.state?.name || 'there').split(' ')[0];
  const [step, setStep] = useState(1);
  const [roleText, setRoleText] = useState('');
  const [suggest, setSuggest] = useState(null);
  const [role, setRole] = useState('');
  const [gen, setGen] = useState(0);
  const [fam, setFam] = useState('');
  const [mode, setMode] = useState('twice');
  const [work, setWork] = useState('');
  const [job, setJob] = useState({ title: '', company: '', kpis: ['', '', ''] });
  const [captureMode, setCaptureMode] = useState('type');
  const [note, setNote] = useState('RICE = Reach × Impact × Confidence ÷ Effort. Use it to compare features fairly instead of going with the loudest voice.\n\nMoSCoW for release scope: must, should, could, won’t.\n\nEvery yes is a no to something else — opportunity cost.\n\nAlso: feed the sourdough starter on Saturday!');
  const [proc, setProc] = useState(-1);
  const [found, setFound] = useState([]);
  const [qs, setQs] = useState([]);
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);

  const matches = roleText.length > 0 ? ROLES.filter((r) => r.toLowerCase().includes(roleText.toLowerCase())).slice(0, 6) : [];

  const chooseRole = () => {
    const t = roleText.trim();
    const ab = ABBR[t.toLowerCase()];
    if (ab) { setSuggest(ab); return; }
    if (t.split(/\s+/).length > 6 || /superhero|wizard|king|queen/i.test(t)) { setSuggest('__invalid'); return; }
    startGen(t.replace(/\b\w/g, (m) => m.toUpperCase()));
  };
  const startGen = (r) => { setRole(r); setSuggest(null); setGen(1); };
  useEffect(() => {
    if (gen > 0 && gen < 5) { const t = setTimeout(() => setGen(gen + 1), 650); return () => clearTimeout(t); }
    return undefined;
  }, [gen]);
  useEffect(() => {
    if (proc >= 0 && proc < 4) { const t = setTimeout(() => setProc(proc + 1), 650); return () => clearTimeout(t); }
    if (proc === 4) {
      const f = extractConcepts(note).map((c, i) => ({ ...c, id: `ob-${i}` }));
      setFound(f); setQs(questionsForConcepts(f, state.questions)); setProc(5);
    }
    return undefined;
  }, [proc, note, state.questions]);

  const areas = TEMPLATES[role] || genericAreas(role);
  const totalSkills = areas.reduce((a, [, n]) => a + n, 0);
  const isKnown = Boolean(TEMPLATES[role]);

  const finish = () => { actions.loginDirect(); nav('/app'); };
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <div className="max-w-xl w-full mx-auto px-5 pt-5 flex items-center gap-3">
        <button onClick={() => (step > 1 ? setStep(step - 1) : nav('/access'))} className="btn-quiet !px-2" aria-label="Back"><ArrowLeft size={20} /></button>
        <div className="flex-1 flex gap-1.5">{[1, 2, 3, 4, 5].map((i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= step ? 'bg-gold' : 'bg-line'}`} />)}</div>
        <span className="text-[13px] font-semibold text-muted">{Math.min(step, 5)} of 5</span>
      </div>
      <div className="flex-1 max-w-xl w-full mx-auto px-5 py-8 fade-in" key={step}>

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div><h1 className="text-[28px] font-extrabold leading-tight">Hi {name}. What role are you working toward?</h1><p className="mt-2 text-[15px] text-muted">Type any role. We’ll build its skill map, from foundation to senior.</p></div>
            {gen === 0 && (
              <>
                <label className="flex items-center gap-2 input"><Search size={18} className="text-muted" /><input autoFocus className="flex-1 outline-none bg-transparent" placeholder="e.g. Product Manager, BDO, Data Analyst" value={roleText} onChange={(e) => { setRoleText(e.target.value); setSuggest(null); }} onKeyDown={(e) => e.key === 'Enter' && roleText && chooseRole()} aria-label="Target role" /></label>
                {matches.length > 0 && !suggest && <div className="flex flex-wrap gap-2">{matches.map((m) => <button key={m} onClick={() => startGen(m)} className="pill bg-white border border-line text-indigo !text-[13.5px] !py-2 cursor-pointer hover:border-indigo">{m}</button>)}</div>}
                {suggest && suggest !== '__invalid' && (
                  <div className="card p-4 flex flex-col gap-3 fade-in"><p className="font-bold">Did you mean <span className="text-gold-ink">{suggest}</span>?</p><div className="flex gap-2"><button onClick={() => startGen(suggest)} className="btn-primary flex-1">Yes</button><button onClick={() => startGen(roleText.toUpperCase())} className="btn-ghost flex-1">No, keep “{roleText}”</button></div></div>
                )}
                {suggest === '__invalid' && <p className="text-[14px] text-bad font-semibold">That doesn’t look like a job role. Try something like “Business Development Officer”.</p>}
                <button disabled={!roleText} onClick={chooseRole} className="btn-primary !min-h-12">Continue</button>
                <p className="text-[13px] text-muted">One role for now. You can change it later and keep your notes.</p>
              </>
            )}
            {gen > 0 && gen < 5 && (
              <div className="card p-6 flex flex-col gap-4">
                <p className="font-extrabold text-[18px]">{isKnown && role === 'Product Manager' ? 'Loading' : 'Building'} the {role} skill map</p>
                {['Understanding the role', 'Finding the skill areas', 'Placing skills from Foundation to Senior', 'Quality check'].map((t, i) => (
                  <div key={t} className={`flex items-center gap-3 text-[15px] font-semibold ${i < gen ? 'text-indigo' : 'text-soft'}`}>{i < gen - 1 ? <CheckCircle2 size={20} className="text-ok" /> : i === gen - 1 ? <Spinner /> : <span className="w-5 h-5 rounded-full border-2 border-line" />}{t}</div>
                ))}
              </div>
            )}
            {gen === 5 && (
              <div className="flex flex-col gap-4 fade-in">
                <div className="bg-indigo text-ivory rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-2"><span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">Your skill map</span><Pill tone={role === 'Product Manager' ? 'gold' : 'white'}>{role === 'Product Manager' ? 'Reviewed' : 'AI-generated'}</Pill></div>
                  <p className="mt-2 text-[22px] font-extrabold">{role}</p>
                  <p className="text-[14px] text-[#C9CBDA]">{areas.length} skill areas · {totalSkills} skills · Foundation to Senior</p>
                </div>
                <div className="card divide-y divide-line">{areas.map(([a, n]) => <div key={a} className="flex items-center justify-between px-4 py-3 text-[14.5px]"><span className="font-semibold">{a}</span><span className="text-muted">{n} skills</span></div>)}</div>
                <p className="text-[13px] text-muted">Only skills that can be tested are included. If the AI missed something you learn, you can add it later.</p>
                <div className="flex gap-2"><button onClick={() => setStep(2)} className="btn-primary flex-1 !min-h-12">Continue as {role}</button><button onClick={() => { setGen(0); setRoleText(''); }} className="btn-ghost">Change</button></div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h1 className="text-[28px] font-extrabold leading-tight">How familiar are you with {role}?</h1>
            <div className="flex flex-col gap-2">{FAMILIARITY.map((f) => <button key={f} onClick={() => setFam(f)} className={`text-left min-h-12 px-4 rounded-xl border-[1.5px] font-semibold cursor-pointer ${fam === f ? 'border-indigo bg-sand' : 'border-line bg-white hover:border-soft'}`}>{f}</button>)}</div>
            <p className="text-[13px] text-muted -mt-3">This only sets where questions start. Your skills are never marked as demonstrated until you show them.</p>
            <button disabled={!fam} onClick={() => setStep(3)} className="btn-primary !min-h-12">Continue</button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div><h1 className="text-[28px] font-extrabold leading-tight">Are you working now?</h1><p className="mt-2 text-[15px] text-muted">Your work becomes evidence. We’ll link what you do to your skills, and suggest ways to use what you learn on the job.</p></div>
            <div className="flex flex-col gap-2">{[['role', `Yes, as or close to a ${role}`], ['switch', `Yes, but I’m switching to ${role}`], ['none', 'Not working right now']].map(([v, l]) => <button key={v} onClick={() => setWork(v)} className={`text-left min-h-12 px-4 rounded-xl border-[1.5px] font-semibold cursor-pointer ${work === v ? 'border-indigo bg-sand' : 'border-line bg-white hover:border-soft'}`}>{l}</button>)}</div>
            {work === 'role' && (
              <div className="card p-4 flex flex-col gap-3 fade-in">
                <div className="grid sm:grid-cols-2 gap-2"><input className="input" placeholder="Job title, e.g. Associate PM" value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} /><input className="input" placeholder="Company" value={job.company} onChange={(e) => setJob({ ...job, company: e.target.value })} /></div>
                <span className="label">Your goals or KPIs this quarter (optional)</span>
                {[0, 1, 2].map((i) => <input key={i} className="input" placeholder={['e.g. Raise onboarding completion from 52% to 65%', 'e.g. Cut failed-payment tickets by 30%', 'Another goal'][i]} value={job.kpis[i]} onChange={(e) => { const k = [...job.kpis]; k[i] = e.target.value; setJob({ ...job, kpis: k }); }} />)}
                <p className="text-[13px] text-muted">Private. Never shown on your portfolio or used to train AI. You can add your job description later.</p>
              </div>
            )}
            {work === 'switch' && (
              <div className="card p-4 flex flex-col gap-3 fade-in">
                <input className="input" placeholder="What do you do now? e.g. Customer support lead at a bank" value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} />
                <p className="text-[14px] text-muted"><strong className="text-indigo">Your current job already counts.</strong> Log your work and we’ll map it to {role} skills as transferable evidence for interviews.</p>
              </div>
            )}
            {work === 'none' && <p className="text-[14px] text-muted card p-4 fade-in">No problem. You’ll start with learning, projects and interviews. Turn on the work log any time from Settings.</p>}
            <button disabled={!work} onClick={() => setStep(4)} className="btn-primary !min-h-12">Continue</button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div><h1 className="text-[28px] font-extrabold leading-tight">When should your practice be ready?</h1><p className="mt-2 text-[15px] text-muted">About five minutes each. Missed sessions never pile up.</p></div>
            <Segmented value={mode} onChange={setMode} options={[['twice', 'Twice a day'], ['once', 'Once a day']]} />
            <div className="card divide-y divide-line">
              <label className="flex items-center justify-between px-4 py-3"><span className="flex items-center gap-2 font-semibold"><Sun size={18} />Morning</span><input type="time" defaultValue="07:30" className="input !w-auto !min-h-10" /></label>
              {mode === 'twice' && <label className="flex items-center justify-between px-4 py-3"><span className="flex items-center gap-2 font-semibold"><Moon size={18} />Evening</span><input type="time" defaultValue="19:30" className="input !w-auto !min-h-10" /></label>}
            </div>
            <p className="text-[13px] text-muted -mt-3">Time zone: Africa/Lagos (detected). Sessions must be at least 6 hours apart.</p>
            <button onClick={() => setStep(5)} className="btn-primary !min-h-12">Continue</button>
          </div>
        )}

        {step === 5 && proc === -1 && (
          <div className="flex flex-col gap-5">
            <div><h1 className="text-[28px] font-extrabold leading-tight">What did you learn recently?</h1><p className="mt-2 text-[15px] text-muted">Add one thing from a course, book or webinar. Your first practice is built from it in seconds.</p></div>
            <Segmented value={captureMode} onChange={setCaptureMode} options={[['type', 'Type a note'], ['upload', 'Upload a file'], ['check', 'Skill check']]} />
            {captureMode === 'type' && <><textarea className="textarea" rows={9} value={note} onChange={(e) => setNote(e.target.value)} aria-label="Your note" placeholder="In your own words: what is it, when is it used, an example." /><button disabled={note.trim().length < 20} onClick={() => setProc(0)} className="btn-primary !min-h-12"><PenLine size={18} />Build my first practice</button></>}
            {captureMode === 'upload' && <div className="card border-dashed border-2 p-8 flex flex-col items-center gap-2 text-center"><UploadIcon size={28} /><p className="font-bold">PDF, PowerPoint or Word · up to 25 MB</p><p className="text-[14px] text-muted">Uploads are private and never used to train AI. Try uploading inside the app: Library → Upload.</p><button onClick={() => setCaptureMode('type')} className="btn-ghost mt-2">Type a note instead</button></div>}
            {captureMode === 'check' && <div className="card p-5 flex flex-col gap-3"><span className="flex items-center gap-2 font-extrabold"><Target size={18} />Already experienced?</span><p className="text-[14.5px] text-muted">Answer questions built from the {role} skill map to prove what you already know. They are labelled “From your role’s skill map”.</p><button onClick={finish} className="btn-primary">Take a skill check in the app</button></div>}
            <button onClick={finish} className="btn-quiet">Skip for now</button>
          </div>
        )}

        {step === 5 && proc >= 0 && proc < 5 && (
          <div className="card p-6 flex flex-col gap-4">
            <p className="font-extrabold text-[20px]">Reading your note</p>
            {['Reading your note', 'Finding concepts', `Linking to ${role} skills`, 'Writing your first questions'].map((t, i) => (
              <div key={t} className={`flex items-center gap-3 text-[15px] font-semibold ${i <= proc ? 'text-indigo' : 'text-soft'}`}>{i < proc ? <CheckCircle2 size={20} className="text-ok" /> : i === proc ? <Spinner /> : <span className="w-5 h-5 rounded-full border-2 border-line" />}{t}</div>
            ))}
          </div>
        )}

        {step === 5 && proc === 5 && qi === 0 && pick === null && score === 0 && (
          <div className="flex flex-col gap-4 fade-in">
            <h1 className="text-[26px] font-extrabold">We found {found.filter((f) => f.scope !== 'out').length} concepts</h1>
            {found.map((c) => (
              <div key={c.id} className={`card p-4 flex flex-col gap-1.5 ${c.scope === 'out' ? 'border-dashed bg-ivory' : ''}`}>
                <div className="flex items-center justify-between gap-2"><p className={`font-bold ${c.scope === 'out' ? 'text-muted' : ''}`}>{c.name}</p>{c.scope === 'out' ? <Pill tone="outline">Out of scope</Pill> : c.scope === 'missing' ? <Pill tone="gold">Not on your map yet</Pill> : <Pill tone="sand">Linked</Pill>}</div>
                <p className="text-[13.5px] text-muted">{c.scope === 'out' ? `Not related to ${role}. It stays in your library but won’t appear in practice.` : c.summary}</p>
              </div>
            ))}
            <button onClick={() => setQi(1)} disabled={qs.length === 0} className="btn-primary !min-h-12">Start my first practice · {qs.length} questions</button>
          </div>
        )}

        {step === 5 && proc === 5 && qi >= 1 && qi <= qs.length && (() => {
          const q = qs[qi - 1];
          return (
            <div className="flex flex-col gap-4 fade-in" key={qi}>
              <div className="flex gap-1.5">{qs.map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i < qi ? 'bg-indigo' : 'bg-line'}`} />)}</div>
              <Pill tone="sand" className="self-start">From your note</Pill>
              <p className="text-[19px] font-extrabold leading-snug">{q.prompt}</p>
              {q.options.map(([id, t]) => {
                const chosen = pick === id; const right = q.correct.includes(id);
                const cls = pick === null ? 'border-line bg-white hover:border-indigo' : right ? 'border-ok bg-ok-soft' : chosen ? 'border-bad bg-bad-soft' : 'border-line bg-white opacity-70';
                return <button key={id} disabled={pick !== null} onClick={() => { setPick(id); if (right) setScore(score + 1); }} className={`text-left p-3.5 rounded-xl border-[1.5px] font-semibold text-[15px] cursor-pointer ${cls}`}>{t}</button>;
              })}
              {pick !== null && <><p className="text-[14px] text-muted">{q.explain}</p><button onClick={() => { setPick(null); setQi(qi + 1); }} className="btn-primary !min-h-12">{qi === qs.length ? 'Finish' : 'Next'}</button></>}
            </div>
          );
        })()}

        {step === 5 && proc === 5 && qi > qs.length && qs.length > 0 && (
          <div className="flex flex-col gap-5 fade-in">
            <div className="bg-indigo text-ivory rounded-2xl p-6 flex flex-col gap-2"><Mark variant="gold" className="h-10 self-start" /><p className="text-[24px] font-extrabold">First practice done · {score} of {qs.length}</p><p className="text-[14.5px] text-[#C9CBDA]">Your skill map just moved: Prioritisation frameworks is now Developing.</p></div>
            <div className="card p-5 flex flex-col gap-3">
              <span className="flex items-center gap-2 font-extrabold"><Bell size={18} />Want tonight’s practice to find you at 19:30?</span>
              {isIOS ? <p className="text-[14px] text-muted"><Smartphone size={15} className="inline mr-1" />On iPhone, add the app to your home screen first (Share → Add to Home Screen), then turn on reminders inside it.</p> : <p className="text-[14px] text-muted">We’ll ask your browser for permission. If push isn’t available, we’ll send reminders by email.</p>}
              <button onClick={() => { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().finally(finish); else finish(); }} className="btn-gold">Turn on reminders</button>
            </div>
            <p className="text-[14px] text-muted text-center">For this demo, you’ll now continue as <strong className="text-indigo">Tolu</strong>, a learner with three weeks of history, so you can see everything the product does.</p>
            <button onClick={finish} className="btn-primary !min-h-12">Enter the demo account</button>
          </div>
        )}
      </div>
    </div>
  );
}
