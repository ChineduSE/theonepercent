import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, Zap, Briefcase, Mic, BarChart3, UserRound, Settings, Bell, MoreHorizontal, Shield, RotateCcw, ListChecks, X, CheckCircle2, Circle, ClipboardList, Lightbulb, FileText } from 'lucide-react';
import { useStore } from '../lib/store.jsx';
import { Wordmark, Mark, Modal, relDay, fmtTime } from './ui.jsx';

const GROUPS = [
  { title: null, items: [{ to: '/app', label: 'Today', icon: Home, match: (p) => p === '/app' }] },
  { title: 'Learn', items: [
    { to: '/app/practice', label: 'Practice', icon: Zap },
    { to: '/app/library', label: 'Library', icon: BookOpen },
  ] },
  { title: 'Apply', items: [
    { to: '/app/projects', label: 'Projects', icon: Briefcase },
    { to: '/app/work', label: 'Work log', icon: ClipboardList, match: (p, t) => p === '/app/work' && (!t || ['log', 'goals', 'context'].includes(t)) },
    { to: '/app/work?tab=apply', label: 'Apply at work', icon: Lightbulb, match: (p, t) => p === '/app/work' && t === 'apply' },
  ] },
  { title: 'Prove', items: [
    { to: '/app/skills', label: 'Skills gap', icon: BarChart3 },
    { to: '/app/interviews', label: 'Interviews', icon: Mic },
    { to: '/app/work?tab=stories', label: 'Stories & documents', icon: FileText, match: (p, t) => p === '/app/work' && ['stories', 'documents'].includes(t) },
    { to: '/app/portfolio', label: 'Portfolio', icon: UserRound },
  ] },
];
const NAV = [...GROUPS.flatMap((g) => g.items), { to: '/app/settings', label: 'Settings', icon: Settings }];
const MOBILE_BAR = [
  { to: '/app', label: 'Today', icon: Home, match: (p) => p === '/app' },
  { to: '/app/practice', label: 'Learn', icon: Zap, match: (p) => p.startsWith('/app/practice') || p.startsWith('/app/library') },
  { to: '/app/work', label: 'Log', icon: ClipboardList, match: (p) => p.startsWith('/app/work') },
  { to: '/app/skills', label: 'Skills', icon: BarChart3, match: (p) => p.startsWith('/app/skills') },
];
const MOBILE = MOBILE_BAR.map((m) => m.to);
const isActive = (item, loc) => {
  const tab = new URLSearchParams(loc.search).get('tab');
  return item.match ? item.match(loc.pathname, tab) : loc.pathname.startsWith(item.to);
};

const TOUR = [
  ['Answer today’s practice session (and dispute a grade)', '/app/practice'],
  ['Add a note and watch concepts and practice appear', '/app/library/new'],
  ['Submit the PayLite roadmap project and see the grade', '/app/projects/p2'],
  ['Defend a project in a voice interview (Chrome mic works)', '/app/interviews'],
  ['Open the skills gap and add a skill the AI missed', '/app/skills'],
  ['Log today’s work and answer the AI’s follow-up', '/app/work'],
  ['Turn work entries into a STAR story', '/app/work?tab=stories'],
  ['See how learning applies to your KPIs', '/app/work?tab=apply'],
  ['Generate a promotion case or CV bullets', '/app/work?tab=documents'],
  ['Publish your portfolio and view the public page', '/app/portfolio'],
];

export default function Shell() {
  const { state, actions, toast } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [bell, setBell] = useState(false);
  const [more, setMore] = useState(false);
  const [tour, setTour] = useState(false);
  const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem('top-tour') || '[]'); } catch { return []; } });
  const unread = state.notifications.filter((n) => n.unread).length;

  const markTour = (i) => { const n = done.includes(i) ? done : [...done, i]; setDone(n); try { localStorage.setItem('top-tour', JSON.stringify(n)); } catch { /* ignore */ } };

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-indigo text-ivory sticky top-0 h-screen p-4 gap-1">
        <Link to="/app" className="px-2 pt-2 pb-5"><Wordmark dark /></Link>
        <div className="flex flex-col gap-0.5 overflow-y-auto scroll-thin -mx-1 px-1">
          {GROUPS.map((g) => (
            <div key={g.title || 'top'} className="flex flex-col gap-0.5 mb-2">
              {g.title && <span className="px-3 pt-2 pb-1 text-[11px] tracking-[0.14em] uppercase font-extrabold text-gold">{g.title}</span>}
              {g.items.map((item) => {
                const on = isActive(item, loc); const Icon = item.icon;
                return (
                  <Link key={item.to} to={item.to} aria-current={on ? 'page' : undefined} className={`flex items-center gap-3 min-h-10 px-3 rounded-xl text-[14.5px] font-semibold transition-colors ${on ? 'bg-indigo-2 text-ivory shadow-[inset_3px_0_0_#C5A253]' : 'text-[#C9CBDA] hover:bg-indigo-2 hover:text-ivory'}`}>
                    <Icon size={18} />{item.label}
                  </Link>
                );
              })}
            </div>
          ))}
          <NavLink to="/app/settings" className={({ isActive: a }) => `flex items-center gap-3 min-h-10 px-3 rounded-xl text-[14.5px] font-semibold ${a ? 'bg-indigo-2 text-ivory' : 'text-[#C9CBDA] hover:bg-indigo-2 hover:text-ivory'}`}><Settings size={18} />Settings</NavLink>
        </div>
        <NavLink to="/app/admin" className={({ isActive }) => `flex items-center gap-3 min-h-11 px-3 rounded-xl text-[14px] font-semibold ${isActive ? 'bg-indigo-2 text-ivory' : 'text-[#9A9DB5] hover:bg-indigo-2 hover:text-ivory'}`}><Shield size={18} />Admin (founder)</NavLink>
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-indigo-3">
          <button onClick={() => setTour(true)} className="flex items-center gap-2 min-h-11 px-3 rounded-xl bg-gold text-indigo font-bold text-[14px] cursor-pointer hover:bg-[#D4B46B]"><ListChecks size={18} />Things to try · {done.length}/{TOUR.length}</button>
          <button onClick={actions.reset} className="flex items-center gap-2 min-h-10 px-3 rounded-xl text-[13px] font-semibold text-[#C9CBDA] hover:bg-indigo-2 cursor-pointer"><RotateCcw size={16} />Reset demo data</button>
          <div className="flex items-center gap-3 px-2 pt-2">
            <span className="w-9 h-9 rounded-full bg-gold text-indigo flex items-center justify-center font-extrabold text-[13px]">TA</span>
            <span className="flex flex-col leading-tight"><span className="text-[14px] font-bold">{state.user.name}</span><span className="text-[12px] text-[#9A9DB5]">Target: {state.user.role}</span></span>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-ivory/95 backdrop-blur border-b border-line">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            <Link to="/app" className="lg:hidden"><Mark className="h-8" /></Link>
            <span className="pill bg-gold-soft text-gold-ink" title="AI responses in this prototype are simulated">Demo · AI simulated</span>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setTour(true)} className="lg:hidden btn-quiet !min-h-10 !px-2.5" aria-label="Things to try"><ListChecks size={20} /></button>
              <div className="relative">
                <button onClick={() => { setBell(!bell); if (!bell) setTimeout(actions.readNotifications, 1500); }} aria-label={`Notifications, ${unread} unread`} className="relative w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center cursor-pointer hover:border-indigo">
                  <Bell size={18} />{unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-bad text-white text-[11px] font-bold flex items-center justify-center">{unread}</span>}
                </button>
                {bell && (
                  <div className="fade-in absolute right-0 mt-2 w-[min(92vw,380px)] card shadow-xl p-2 z-40">
                    <div className="flex items-center justify-between px-2 py-2"><span className="font-extrabold">Notifications</span><button className="btn-quiet !min-h-8 !px-2" onClick={() => setBell(false)} aria-label="Close"><X size={16} /></button></div>
                    {state.notifications.map((n) => (
                      <button key={n.id} onClick={() => { setBell(false); nav(n.to); }} className="w-full text-left flex gap-3 p-3 rounded-xl hover:bg-ivory cursor-pointer">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.unread ? 'bg-gold' : 'bg-transparent'}`} />
                        <span className="flex-1 flex flex-col gap-0.5"><span className="text-[14px] leading-snug">{n.text}</span><span className="text-[12px] text-muted">{n.kind} · {relDay(n.time)}, {fmtTime(n.time)}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-28 lg:pb-12" key={loc.pathname}>
          <div className="fade-in"><Outlet /></div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line flex px-1 pb-[max(10px,env(safe-area-inset-bottom))] pt-1" aria-label="Main">
        {MOBILE_BAR.map((item) => {
          const on = isActive(item, loc); const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} aria-current={on ? 'page' : undefined} className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-13 text-[11px] font-semibold ${on ? 'text-indigo shadow-[inset_0_3px_0_#C5A253]' : 'text-muted'}`}>
              <Icon size={21} />{item.label}
            </Link>
          );
        })}
        <button onClick={() => setMore(true)} className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-13 text-[11px] font-semibold text-muted cursor-pointer"><MoreHorizontal size={21} />More</button>
      </nav>

      <Modal open={more} onClose={() => setMore(false)} title="More">
        <div className="grid grid-cols-2 gap-2">
          {[...NAV.filter((n) => !MOBILE.includes(n.to)), { to: '/app/admin', label: 'Admin', icon: Shield }].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMore(false)} className="card p-4 flex items-center gap-3 font-bold hover:border-indigo"><Icon size={20} />{label}</Link>
          ))}
          <button onClick={() => { setMore(false); actions.reset(); }} className="card p-4 flex items-center gap-3 font-bold hover:border-indigo cursor-pointer col-span-2"><RotateCcw size={18} />Reset demo data</button>
        </div>
      </Modal>

      <Modal open={tour} onClose={() => setTour(false)} title="Things to try">
        <p className="text-[14px] text-muted mb-4">A quick route through the product. Everything is connected: what you do in one place shows up in the others.</p>
        <div className="flex flex-col gap-2">
          {TOUR.map(([t, to], i) => (
            <button key={t} onClick={() => { markTour(i); setTour(false); nav(to); }} className="card p-3.5 flex items-center gap-3 text-left hover:border-indigo cursor-pointer">
              {done.includes(i) ? <CheckCircle2 size={20} className="text-ok shrink-0" /> : <Circle size={20} className="text-soft shrink-0" />}
              <span className="text-[14.5px] font-semibold">{i + 1}. {t}</span>
            </button>
          ))}
        </div>
      </Modal>

      {toast && <div role="status" className="fade-in fixed z-50 bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 max-w-[92vw] bg-indigo text-ivory px-4 py-3 rounded-xl shadow-xl text-[14px] font-semibold">{toast}</div>}
    </div>
  );
}
