import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Copy, Link2, Linkedin, Eye } from 'lucide-react';
import { useStore, skillStatus } from '../lib/store.jsx';
import { PageHeader, Toggle, ResultPill, Pill, SectionLabel } from '../components/ui.jsx';

export default function Portfolio() {
  const { state, actions, notify } = useStore();
  const pf = state.portfolio;
  const url = `${window.location.origin}${import.meta.env.MODE === 'single' ? '/#' : ''}/p/${pf.slug}`;
  const graded = state.projects.filter((p) => p.status === 'graded');
  const approved = state.work.stories.filter((s) => s.status === 'approved');
  const demonstrated = state.skills.filter((s) => skillStatus(state, s.id).status === 'demonstrated');
  const [headline, setHeadline] = useState(pf.headline);
  const toggleIn = (key, id) => actions.setPortfolio({ [key]: pf[key].includes(id) ? pf[key].filter((x) => x !== id) : [...pf[key], id] });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Portfolio" sub="A shareable page of your graded work and demonstrated skills. Private until you publish." action={<Link to={`/p/${pf.slug}`} className="btn-ghost"><Eye size={17} />Preview</Link>} />
      <div className={`card px-5 mb-4 ${pf.published ? 'border-indigo border-[1.5px]' : ''}`}>
        <Toggle on={pf.published} onChange={(v) => { actions.setPortfolio({ published: v }); notify(v ? 'Published. Anyone with the link can view it.' : 'Unpublished. The link stops working immediately.'); }} label={pf.published ? 'Published' : 'Private'} sub={pf.published ? 'Anyone with the link can view. Unpublish any time.' : 'Only you can see it. Publish to get a link for employers.'} />
      </div>
      {pf.published && (
        <div className="card p-3 flex flex-wrap items-center gap-2 mb-5 fade-in">
          <Link2 size={18} className="text-muted ml-1" /><span className="flex-1 min-w-0 truncate text-[14px] font-semibold">{url}</span>
          <button onClick={() => { navigator.clipboard?.writeText(url); notify('Link copied.'); }} className="btn-ghost !min-h-10"><Copy size={15} />Copy</button>
          <Link to={`/p/${pf.slug}`} className="btn-primary !min-h-10"><ExternalLink size={15} />Open</Link>
          <Link to="/app/work?tab=documents" className="btn-quiet !min-h-10"><Linkedin size={15} />Draft a LinkedIn post</Link>
        </div>
      )}

      <SectionLabel>Headline</SectionLabel>
      <textarea className="textarea mb-1" rows={3} value={headline} onChange={(e) => setHeadline(e.target.value)} onBlur={() => actions.setPortfolio({ headline })} />

      <SectionLabel>Projects to show</SectionLabel>
      <div className="card divide-y divide-line mb-1">
        {graded.map((p) => (
          <label key={p.id} className="flex gap-3 items-start p-4 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo" checked={pf.projects.includes(p.id)} onChange={() => toggleIn('projects', p.id)} />
            <span className="flex-1 flex flex-col gap-1"><span className="font-bold">{p.title}</span><span className="flex items-center gap-2"><ResultPill result={p.result} />{p.interview === 'done' && <span className="text-[12.5px] text-muted">Interview done</span>}</span></span>
          </label>
        ))}
        {state.projects.filter((p) => p.status !== 'graded').slice(0, 1).map((p) => <div key={p.id} className="flex gap-3 items-start p-4 opacity-55"><input type="checkbox" disabled className="w-5 h-5 mt-0.5" /><span className="flex flex-col"><span className="font-bold">{p.title}</span><span className="text-[12.5px] text-muted">Not graded yet</span></span></div>)}
      </div>
      <div className="card px-4 mb-1"><Toggle on={pf.highlight} onChange={(v) => actions.setPortfolio({ highlight: v })} label="Include interview highlights I choose" sub="A short quote from your defence interview. Full transcripts are never shown." /></div>

      <SectionLabel>Impact at work</SectionLabel>
      <div className="card divide-y divide-line mb-1">
        {approved.map((s) => <label key={s.id} className="flex gap-3 items-start p-4 cursor-pointer"><input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo" checked={pf.stories.includes(s.id)} onChange={() => toggleIn('stories', s.id)} /><span className="flex flex-col gap-0.5"><span className="font-bold">{s.title}</span><span className="text-[13px] text-muted">Approved STAR story · labelled self-reported</span></span></label>)}
        {approved.length === 0 && <p className="p-4 text-[14px] text-muted">Approve a STAR story in Work to show it here.</p>}
      </div>
      <div className="card px-4 mb-1"><Toggle on={pf.redact} onChange={(v) => actions.setPortfolio({ redact: v })} label="Hide company names and figures in stories" sub="Recommended. Your raw work log is never shown." /></div>

      <SectionLabel>Demonstrated skills · added automatically</SectionLabel>
      <div className="flex flex-wrap gap-1.5">{demonstrated.map((s) => <Pill key={s.id} tone="white">{s.name}</Pill>)}</div>
      <p className="text-[13px] text-muted mt-2">Only Demonstrated skills appear, each backed by recall over time, a graded project and an interview. Developing skills are never shown publicly.</p>
      <div className="card p-4 mt-5 border-dashed bg-transparent text-[13px] text-muted">Your public page states that results are AI assessments against stated criteria, not professional qualifications, and that work stories are self-reported.</div>
    </div>
  );
}
