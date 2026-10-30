import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as seed from './seed.js';

const KEY = 'top-demo-v2';
export const DEMO_EMAIL = 'demo@theonepercent.app';
export const DEMO_PASSWORD = 'OnePercent2026';

const clone = (x) => JSON.parse(JSON.stringify(x));

export function freshState() {
  return {
    session: { loggedIn: false },
    user: {
      name: 'Tolu Adeyemi', first: 'Tolu', email: DEMO_EMAIL, role: 'Product Manager',
      familiarity: 'Practising (under 1 year)', situation: 'Working in this role', previous: 'Customer support at a commercial bank',
      mode: 'twice', morning: '07:30', evening: '19:30', timezone: 'Africa/Lagos', daysOff: ['Sun'],
      notif: { practice: true, project: true, due: true, grade: true, interview: true, apply: true, worklog: true },
      emailBackup: true, keepAudio: false,
    },
    skills: clone(seed.SKILLS),
    evidence: clone(seed.EVIDENCE),
    flags: [],
    notes: clone(seed.NOTES),
    concepts: clone(seed.CONCEPTS),
    uploads: clone(seed.UPLOADS),
    questions: clone(seed.QUESTIONS),
    projects: clone(seed.PROJECTS),
    interviews: clone(seed.INTERVIEWS),
    disputes: [{ id: 'dp1', target: 'Onboarding funnel · Recommendation', from: 'Not yet', to: 'Not yet', note: 'Second review kept the result: the test plan is still missing.', date: seed.dayISO(-3) }],
    work: {
      profile: clone(seed.WORK_PROFILE), kpis: clone(seed.KPIS), log: clone(seed.WORK_LOG), stories: clone(seed.STORIES),
      implementations: clone(seed.IMPLEMENTATIONS), documents: clone(seed.DOCUMENTS),
    },
    portfolio: clone(seed.PORTFOLIO),
    notifications: clone(seed.NOTIFICATIONS),
    practiceDays: [...seed.PRACTICE_DAYS],
    sessionsToday: { morning: true, evening: false },
    admin: clone(seed.ADMIN),
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage unavailable */ }
  return freshState();
}

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

let idc = 0;
export const uid = (p) => `${p}-${Date.now().toString(36)}-${(idc++).toString(36)}`;

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToast] = useState(null);
  const tRef = useRef();

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const up = useCallback((fn) => setState((s) => { const n = clone(s); fn(n); return n; }), []);

  const actions = useMemo(() => ({
    login(email, pw) {
      const ok = email.trim().toLowerCase() === DEMO_EMAIL && pw === DEMO_PASSWORD;
      if (ok) up((s) => { s.session.loggedIn = true; });
      return ok;
    },
    loginDirect() { up((s) => { s.session.loggedIn = true; }); },
    logout() { up((s) => { s.session.loggedIn = false; }); },
    reset() {
      const f = freshState(); f.session.loggedIn = true; setState(f); notify('Demo data reset. Everything is back to the start.');
    },
    setUser(patch) { up((s) => { Object.assign(s.user, patch); }); },

    // ----- evidence -----
    bumpEvidence(skillIds, dim, level = 'developing') {
      up((s) => {
        skillIds.forEach((id) => {
          const e = s.evidence[id] || (s.evidence[id] = { remember: 'none', apply: 'none', explain: 'none', work: 0 });
          if (dim === 'work') { e.work = (e.work || 0) + 1; return; }
          if (level === 'demonstrated' || e[dim] === 'none') e[dim] = level;
        });
      });
    },

    // ----- practice -----
    recordAnswer(q, result) {
      up((s) => {
        if (q.concept) {
          const c = s.concepts.find((x) => x.id === q.concept);
          if (c) {
            c.asked = (c.asked || 0) + 1; c.last = result;
            c.strength = Math.max(0.05, Math.min(1, (c.strength || 0.3) + (result === 'right' ? 0.15 : result === 'partial' ? 0.03 : -0.2)));
            const days = result === 'right' ? Math.round(2 + c.strength * 8) : result === 'partial' ? 2 : 1;
            c.due = seed.dayISO(days);
            c.skills.forEach((sid) => {
              const e = s.evidence[sid] || (s.evidence[sid] = { remember: 'none', apply: 'none', explain: 'none', work: 0 });
              if (result !== 'wrong' && e.remember === 'none') e.remember = 'developing';
              if (result === 'right' && c.strength >= 0.8 && c.asked >= 5) e.remember = 'demonstrated';
            });
          }
        } else if (q.skill) {
          const e = s.evidence[q.skill];
          if (e && result === 'right' && e.remember === 'none') e.remember = 'developing';
        }
      });
    },
    completeSession(kind) {
      up((s) => {
        if (!s.practiceDays.includes(0)) s.practiceDays.push(0);
        if (kind === 'scheduled') s.sessionsToday.evening = true;
      });
    },
    addDispute(d) { up((s) => { s.disputes.unshift({ id: uid('dp'), date: seed.dayISO(0), ...d }); }); },

    // ----- capture -----
    addNote(note, concepts) {
      up((s) => {
        if (!s.notes.some((n) => n.id === note.id)) s.notes.unshift(note);
        let released = 0;
        concepts.forEach((c) => {
          const status = c.scope === 'out' ? 'out' : (released < 5 ? 'active' : 'queued');
          if (status === 'active') released += 1;
          s.concepts.unshift({
            id: c.id || uid('c'), name: c.name, summary: c.summary, noteId: note.id, passage: c.passage, skills: c.skills || [],
            status, due: seed.dayISO(0), strength: 0.1, asked: 0, last: null, suggestSkill: c.scope === 'missing' ? c.suggestSkill : undefined,
          });
          (c.skills || []).forEach((sid) => { const e = s.evidence[sid]; if (e && e.remember === 'none') e.remember = 'developing'; });
        });
      });
    },
    addQuestions(qs) { up((s) => { s.questions.push(...qs); }); },
    updateNote(id, patch) { up((s) => { const n = s.notes.find((x) => x.id === id); if (n) Object.assign(n, patch); }); },
    deleteNote(id) {
      up((s) => {
        s.notes = s.notes.filter((n) => n.id !== id);
        s.concepts.forEach((c) => { if (c.noteId === id && c.status !== 'out') c.status = 'retired'; });
      });
    },
    updateConcept(id, patch) { up((s) => { const c = s.concepts.find((x) => x.id === id); if (c) Object.assign(c, patch); }); },
    addUpload(u, concepts) {
      up((s) => {
        s.uploads.unshift(u);
        const note = { id: uid('n'), title: u.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '), sourceType: 'Upload', source: u.name, collection: '', createdAt: seed.dayISO(0), body: `Uploaded file · ${u.pages} pages`, uploadId: u.id };
        s.notes.unshift(note);
        concepts.forEach((c, i) => {
          s.concepts.unshift({ id: uid('c'), name: c.name, summary: c.summary, noteId: note.id, passage: c.passage, skills: c.skills || [], status: c.scope === 'out' ? 'out' : (i < 5 ? 'active' : 'queued'), due: seed.dayISO(i < 5 ? 0 : 3), strength: 0.1, asked: 0, last: null });
        });
      });
    },

    // ----- skills -----
    addSkill(skill) {
      up((s) => {
        s.skills.push({ buildsOn: [], addedByUser: true, ...skill });
        s.evidence[skill.id] = { remember: 'none', apply: 'none', explain: 'none', work: 0 };
      });
    },
    flagSkill(skillId, reason, comment) { up((s) => { s.flags.push({ skillId, reason, comment, date: seed.dayISO(0) }); }); },

    // ----- projects -----
    setProject(id, patch) { up((s) => { const p = s.projects.find((x) => x.id === id); if (p) Object.assign(p, patch); }); },
    addProject(p) { up((s) => { s.projects.unshift(p); }); },

    // ----- interviews -----
    addInterview(iv) {
      up((s) => {
        s.interviews.unshift(iv);
        if (iv.projectId) { const p = s.projects.find((x) => x.id === iv.projectId); if (p) p.interview = 'done'; }
        (iv.skills || []).forEach((sid) => {
          const e = s.evidence[sid]; if (!e) return;
          e.explain = iv.understanding === 'Developing' ? (e.explain === 'none' ? 'developing' : e.explain) : 'demonstrated';
        });
        if (iv.storyId) { const st = s.work.stories.find((x) => x.id === iv.storyId); if (st) st.practised = true; }
      });
    },

    // ----- work -----
    addWorkEntry(entry) {
      up((s) => {
        s.work.log.unshift(entry);
        entry.skills.forEach((sid) => { const e = s.evidence[sid]; if (e) e.work = (e.work || 0) + 1; });
      });
    },
    updateWorkEntry(id, patch) { up((s) => { const e = s.work.log.find((x) => x.id === id); if (e) Object.assign(e, patch); }); },
    deleteWorkEntry(id) { up((s) => { s.work.log = s.work.log.filter((x) => x.id !== id); }); },
    addKpi(k) { up((s) => { s.work.kpis.push(k); }); },
    updateKpi(id, patch) { up((s) => { const k = s.work.kpis.find((x) => x.id === id); if (k) Object.assign(k, patch); }); },
    addStory(st) { up((s) => { s.work.stories.unshift(st); }); },
    updateStory(id, patch) { up((s) => { const st = s.work.stories.find((x) => x.id === id); if (st) Object.assign(st, patch); }); },
    deleteStory(id) { up((s) => { s.work.stories = s.work.stories.filter((x) => x.id !== id); }); },
    updateImpl(id, patch) { up((s) => { const m = s.work.implementations.find((x) => x.id === id); if (m) Object.assign(m, patch); }); },
    addImpl(m) { up((s) => { s.work.implementations.unshift(m); }); },
    addDocument(d) { up((s) => { s.work.documents.unshift(d); }); },
    updateProfile(patch) { up((s) => { Object.assign(s.work.profile, patch); }); },

    // ----- portfolio, notifications, admin -----
    setPortfolio(patch) { up((s) => { Object.assign(s.portfolio, patch); }); },
    readNotifications() { up((s) => { s.notifications.forEach((n) => { n.unread = false; }); }); },
    addNotification(n) { up((s) => { s.notifications.unshift({ id: uid('nt'), time: seed.dayISO(0, new Date().getHours(), new Date().getMinutes()), unread: true, ...n }); }); },
    setAdmin(fn) { up((s) => fn(s.admin)); },
  }), [up, notify]);

  const value = useMemo(() => ({ state, actions, notify, toast }), [state, actions, notify, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ---------- derived helpers ----------
export const DIMS = ['remember', 'apply', 'explain'];

export function skillStatus(state, skillId) {
  const e = state.evidence[skillId] || { remember: 'none', apply: 'none', explain: 'none' };
  if (DIMS.every((d) => e[d] === 'demonstrated')) return { status: 'demonstrated' };
  // evidence counts downward (decision 3.10)
  const parent = state.skills.find((s) => (s.buildsOn || []).includes(skillId) && DIMS.every((d) => (state.evidence[s.id] || {})[d] === 'demonstrated'));
  if (parent) return { status: 'demonstrated', via: parent.name };
  if (DIMS.some((d) => e[d] !== 'none')) return { status: 'developing' };
  return { status: 'none' };
}

export function levelSummary(state) {
  return seed.LEVELS.map((lv) => {
    const list = state.skills.filter((s) => s.level === lv && !s.addedByUser);
    const st = list.map((s) => skillStatus(state, s.id).status);
    return { level: lv, total: list.length, demonstrated: st.filter((x) => x === 'demonstrated').length, developing: st.filter((x) => x === 'developing').length };
  });
}

export function nextStep(state) {
  const order = { Foundation: 0, Practitioner: 1, Advanced: 2, Senior: 3 };
  const cands = state.skills.filter((s) => !s.addedByUser && skillStatus(state, s.id).status !== 'demonstrated' && s.level !== 'Senior');
  cands.sort((a, b) => {
    const ea = state.evidence[a.id] || {}, eb = state.evidence[b.id] || {};
    const sa = order[a.level] * 10 - DIMS.filter((d) => ea[d] === 'demonstrated').length * 4 - DIMS.filter((d) => ea[d] === 'developing').length;
    const sb = order[b.level] * 10 - DIMS.filter((d) => eb[d] === 'demonstrated').length * 4 - DIMS.filter((d) => eb[d] === 'developing').length;
    return sa - sb;
  });
  return cands[0];
}

export const areaName = (id) => (seed.AREAS.find((a) => a.id === id) || {}).name || id;
export const skillById = (state, id) => state.skills.find((s) => s.id === id);
export const conceptById = (state, id) => state.concepts.find((c) => c.id === id);
export const kpiById = (state, id) => state.work.kpis.find((k) => k.id === id);
