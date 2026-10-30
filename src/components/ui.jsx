import { useEffect } from 'react';
import { X } from 'lucide-react';
import logoGold from '../assets/logo-gold.png';
import logoIndigo from '../assets/logo-indigo.png';
import markGold from '../assets/mark-gold.png';
import markIndigo from '../assets/mark-indigo.png';

export const IMG = { logoGold, logoIndigo, markGold, markIndigo };

export const Logo = ({ variant = 'indigo', className = 'h-8' }) => (
  <img src={variant === 'gold' ? logoGold : logoIndigo} alt="The One Percent" className={`${className} w-auto`} />
);
export const Mark = ({ variant = 'indigo', className = 'h-8' }) => (
  <img src={variant === 'gold' ? markGold : markIndigo} alt="" aria-hidden="true" className={`${className} w-auto`} />
);

export function Wordmark({ dark = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <Mark variant={dark ? 'gold' : 'indigo'} className="h-8" />
      <span className={`text-[13px] tracking-[0.16em] font-extrabold ${dark ? 'text-gold' : 'text-indigo'}`}>THE ONE PERCENT</span>
    </span>
  );
}

const STATUS = {
  demonstrated: { label: 'Demonstrated', cls: 'bg-indigo text-ivory border-indigo' },
  developing: { label: 'Developing', cls: 'bg-gold-soft text-gold-ink border-gold-soft' },
  none: { label: 'Not covered', cls: 'bg-white text-muted border-soft border-dashed' },
};
export const StatusPill = ({ status }) => <span className={`pill border-[1.5px] ${STATUS[status].cls}`}>{STATUS[status].label}</span>;

const RESULT = {
  Exceeds: 'bg-indigo text-ivory border-indigo', Meets: 'bg-sand text-indigo border-sand', 'Not yet': 'bg-white text-muted border-soft border-dashed',
  Strong: 'bg-indigo text-ivory border-indigo', Satisfactory: 'bg-sand text-indigo border-sand', Developing: 'bg-gold-soft text-gold-ink border-gold-soft',
};
export const ResultPill = ({ result }) => <span className={`pill border-[1.5px] ${RESULT[result] || RESULT.Meets}`}>{result}</span>;

export const Pill = ({ children, tone = 'sand', className = '' }) => {
  const t = { sand: 'bg-sand text-indigo', gold: 'bg-gold-soft text-gold-ink', indigo: 'bg-indigo text-ivory', white: 'bg-white border border-line text-indigo', ok: 'bg-ok-soft text-ok', bad: 'bg-bad-soft text-bad', outline: 'border border-dashed border-soft text-muted' }[tone];
  return <span className={`pill ${t} ${className}`}>{children}</span>;
};

export function Toggle({ on, onChange, label, sub }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="w-full flex items-center gap-3 text-left py-3 cursor-pointer">
      <span className="flex-1 flex flex-col gap-0.5">
        <span className="text-[15px] font-bold">{label}</span>
        {sub && <span className="text-[13px] text-muted">{sub}</span>}
      </span>
      <span className={`w-12 h-7 rounded-full p-[3px] flex transition-colors ${on ? 'bg-indigo justify-end' : 'bg-[#B9B4A8] justify-start'}`}>
        <span className="w-[22px] h-[22px] rounded-full bg-white" />
      </span>
    </button>
  );
}

export function Segmented({ value, onChange, options, className = '' }) {
  return (
    <div role="tablist" className={`flex gap-1 p-1 rounded-xl bg-sand overflow-x-auto scroll-thin ${className}`}>
      {options.map(([v, l]) => (
        <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange(v)}
          className={`flex-1 whitespace-nowrap min-h-10 px-3 rounded-lg text-[14px] font-bold cursor-pointer transition-colors ${value === v ? 'bg-white shadow-sm' : 'text-muted hover:text-indigo'}`}>{l}</button>
      ))}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const f = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-indigo/50 p-0 sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className={`fade-in bg-ivory w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 sm:p-6`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-[20px] font-extrabold leading-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="btn-quiet !min-h-10 !px-2 -mr-2 -mt-1"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Progress = ({ value, max = 100, className = '', tone = 'indigo' }) => (
  <div className={`h-2.5 rounded-full bg-sand overflow-hidden ${className}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
    <div className={`h-full rounded-full ${tone === 'gold' ? 'bg-gold' : 'bg-indigo'}`} style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%` }} />
  </div>
);

export function PageHeader({ title, sub, action, kicker }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div className="flex flex-col gap-1">
        {kicker && <span className="label">{kicker}</span>}
        <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight">{title}</h1>
        {sub && <p className="text-[15px] text-muted max-w-2xl">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const Empty = ({ icon: Icon, title, body, action }) => (
  <div className="card p-8 flex flex-col items-center text-center gap-3">
    {Icon && <Icon size={32} className="text-soft" />}
    <p className="text-[17px] font-bold">{title}</p>
    {body && <p className="text-[14px] text-muted max-w-sm">{body}</p>}
    {action}
  </div>
);

export const SectionLabel = ({ children, right }) => (
  <div className="flex items-center justify-between gap-3 mt-2 mb-2"><span className="label">{children}</span>{right}</div>
);

export const Spinner = () => <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" aria-hidden="true" />;

export const fmtDate = (iso, opts = { day: 'numeric', month: 'short' }) => new Date(iso).toLocaleDateString('en-GB', opts);
export const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
export function relDay(iso) {
  const d = new Date(iso); const t = new Date(); t.setHours(0, 0, 0, 0); const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const n = Math.round((dd - t) / 864e5);
  if (n === 0) return 'Today'; if (n === -1) return 'Yesterday'; if (n === 1) return 'Tomorrow';
  if (n < 0 && n > -7) return `${-n} days ago`; if (n > 0 && n < 7) return `In ${n} days`;
  return fmtDate(iso);
}
