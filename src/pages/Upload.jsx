import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload as UploadIcon, FileText, CheckCircle2 } from 'lucide-react';
import { useStore, uid, skillById } from '../lib/store.jsx';
import { extractConcepts } from '../lib/ai.js';
import { Pill, Progress, PageHeader } from '../components/ui.jsx';

const CANNED = `Cost of delay: the value lost for each week a feature waits.
The Kano model separates basic, performance and delight features.
Use a Now / Next / Later roadmap to show confidence instead of dates.
Set OKRs each quarter with measurable key results.
Track activation in the first week after sign-up.
Unit economics: compare CAC with lifetime value before scaling.
Course certificate deadline is Friday — remember to submit the form.`;

export default function Upload() {
  const { state, actions } = useStore();
  const nav = useNavigate();
  const ref = useRef();
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [rights, setRights] = useState(false);
  const [stage, setStage] = useState('pick');
  const [p, setP] = useState(0);
  const [found, setFound] = useState([]);

  const choose = (f) => {
    setErr('');
    if (!f) return;
    if (!/\.(pdf|pptx|docx)$/i.test(f.name)) { setErr('Upload a PDF, PowerPoint (.pptx) or Word (.docx) file.'); return; }
    if (f.size > 25 * 1024 * 1024) { setErr('This file is larger than 25 MB. Split it by chapter, or export only the pages you studied.'); return; }
    if (state.uploads.some((u) => u.name === f.name)) { setErr(`You already uploaded ${f.name}. We won’t process it twice.`); return; }
    setFile({ name: f.name, size: `${(f.size / 1024 / 1024).toFixed(1)} MB`, pages: Math.max(4, Math.round(f.size / 180000)) });
  };

  const start = () => {
    setStage('processing'); setP(0);
    [1, 2, 3, 4, 5].forEach((s) => setTimeout(() => setP(s), 650 * s));
    setTimeout(() => {
      const f = extractConcepts(CANNED);
      setFound(f);
      actions.addUpload({ id: uid('u'), name: file.name, pages: file.pages, size: file.size, status: 'ready', concepts: f.filter((c) => c.scope !== 'out').length, createdAt: new Date().toISOString() }, f);
      setStage('done');
    }, 3600);
  };

  const words = ['Uploading', `Extracting text · page 3 of ${file?.pages}`, `Extracting text · page ${file?.pages} of ${file?.pages}`, 'Finding concepts', `Linking to ${state.user.role} skills`, 'Checking scope'];

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/app/library" className="btn-quiet !px-2 mb-3"><ArrowLeft size={18} />Library</Link>
      <PageHeader title="Upload PDF, slides or Word" sub="Up to 25 MB and 100 pages. Uploads are private and never used to train AI." />

      {stage === 'pick' && (
        <div className="flex flex-col gap-4">
          <button onClick={() => ref.current?.click()} className="border-2 border-dashed border-[#B9B4A8] rounded-2xl bg-white p-10 flex flex-col items-center gap-2 text-center cursor-pointer hover:border-indigo">
            <UploadIcon size={32} /><span className="text-[17px] font-bold">Choose a file</span><span className="text-[14px] text-muted">PDF, PPTX or DOCX</span>
          </button>
          <input ref={ref} type="file" accept=".pdf,.pptx,.docx" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
          <button onClick={() => setFile({ name: 'Week4_Roadmaps_and_OKRs.pdf', size: '3.8 MB', pages: 22 })} className="btn-quiet self-start">Or use a demo file: Week4_Roadmaps_and_OKRs.pdf</button>
          {err && <p className="text-[14px] font-semibold text-bad" role="alert">{err}</p>}
          {file && (
            <div className="card p-5 flex flex-col gap-4 fade-in">
              <div className="flex items-center gap-3"><FileText size={22} /><span className="flex-1 flex flex-col"><span className="font-bold break-all">{file.name}</span><span className="text-[13px] text-muted">{file.pages} pages · {file.size}</span></span></div>
              <label className="flex flex-col gap-1.5"><span className="label">What stood out to you? (optional)</span><textarea className="textarea" rows={2} placeholder="Your own words help us write sharper questions." /></label>
              <label className="flex gap-3 items-start text-[14px] cursor-pointer"><input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo" checked={rights} onChange={(e) => setRights(e.target.checked)} />I have the right to use this material for my personal study.</label>
              <button disabled={!rights} onClick={start} className="btn-primary !min-h-12">Upload and find concepts</button>
            </div>
          )}
        </div>
      )}

      {stage === 'processing' && (
        <div className="card p-6 flex flex-col gap-3">
          <p className="font-extrabold text-[18px]">Reading {file.name}</p>
          <Progress value={(p + 1) * 16.6} />
          <p className="text-[14.5px] font-semibold">{words[Math.min(p, 5)]}</p>
          <p className="text-[13px] text-muted">You can leave this screen. We’ll notify you when it’s ready. First practice is built from the first pages while the rest processes.</p>
        </div>
      )}

      {stage === 'done' && (
        <div className="flex flex-col gap-3 fade-in">
          <div className="bg-indigo text-ivory rounded-3xl p-5"><span className="flex items-center gap-2 text-gold font-bold text-[13px] uppercase tracking-[0.08em]"><CheckCircle2 size={16} />Ready</span><p className="text-[22px] font-extrabold mt-1">{found.filter((c) => c.scope !== 'out').length} concepts found in {file.pages} pages</p><p className="text-[14px] text-[#C9CBDA]">5 join practice today; the rest are queued so your reviews aren’t crowded out.</p></div>
          {found.map((c, i) => (
            <div key={c.name} className={`card p-4 flex items-center justify-between gap-3 ${c.scope === 'out' ? 'border-dashed bg-ivory' : ''}`}>
              <span className="flex flex-col"><span className={`font-bold ${c.scope === 'out' ? 'text-muted' : ''}`}>{c.name}</span><span className="text-[12.5px] text-muted">{c.scope === 'out' ? 'Out of scope' : c.scope === 'missing' ? 'Not on your map yet — add it from the Library' : skillById(state, c.skills[0])?.name}</span></span>
              {c.scope !== 'out' && <Pill tone={i < 5 ? 'indigo' : 'gold'}>{i < 5 ? 'In practice' : 'Queued'}</Pill>}
            </div>
          ))}
          <div className="flex gap-3 mt-1"><button onClick={() => nav('/app/library')} className="btn-primary">View in library</button><button onClick={() => { setStage('pick'); setFile(null); setRights(false); }} className="btn-ghost">Upload another</button></div>
        </div>
      )}
    </div>
  );
}
