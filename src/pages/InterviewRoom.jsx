import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckSquare, ListChecks, Mic, MicOff, Pause, Play, Keyboard, Square, Volume2, VolumeX, Send } from 'lucide-react';
import { useStore, uid, areaName } from '../lib/store.jsx';
import { interviewScript, followUpFor, scoreInterview } from '../lib/ai.js';
import { Toggle, ResultPill, Pill } from '../components/ui.jsx';

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function InterviewRoom() {
  const { kind, id } = useParams();
  const { state, actions } = useStore();
  const nav = useNavigate();
  const ctx = kind === 'project' ? state.projects.find((p) => p.id === id) : kind === 'story' ? state.work.stories.find((s) => s.id === id) : { title: areaName(id), area: id };
  const script = interviewScript(kind, ctx || { title: '' });
  const [stage, setStage] = useState('pre');
  const [consent, setConsent] = useState(false);
  const [keep, setKeep] = useState(state.user.keepAudio);
  const [mic, setMic] = useState('untested');
  const [voice, setVoice] = useState(true);
  const [turns, setTurns] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [textMode, setTextMode] = useState(!SR);
  const [paused, setPaused] = useState(false);
  const [secs, setSecs] = useState(0);
  const [result, setResult] = useState(null);
  const recRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [turns, draft]);
  useEffect(() => {
    if (stage !== 'live' || paused) return undefined;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [stage, paused]);
  useEffect(() => () => { try { recRef.current?.stop(); window.speechSynthesis?.cancel(); } catch { /* ignore */ } }, []);

  const say = (text) => {
    if (!voice || !('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.02; u.lang = 'en-GB'; window.speechSynthesis.speak(u); } catch { /* ignore */ }
  };
  const ask = (text) => { setTurns((t) => [...t, { who: 'ai', text }]); say(text); };

  const testMic = async () => {
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t) => t.stop()); setMic('ok'); }
    catch { setMic('fail'); setTextMode(true); }
  };
  const start = () => { setStage('live'); setTimeout(() => ask(script[0]), 400); };

  const listen = () => {
    if (!SR) { setTextMode(true); return; }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true;
    let finalText = draft ? `${draft} ` : '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        if (e.results[i].isFinal) finalText += `${e.results[i][0].transcript} `; else interim += e.results[i][0].transcript;
      }
      setDraft((finalText + interim).trim());
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  };
  const stopListen = () => { try { recRef.current?.stop(); } catch { /* ignore */ } setListening(false); };

  const send = () => {
    const a = draft.trim(); if (!a) return;
    stopListen();
    const answers = [...turns.filter((t) => t.who === 'me').map((t) => t.text), a];
    setTurns((t) => [...t, { who: 'me', text: a }]); setDraft('');
    if (qIndex + 1 >= script.length) { setTimeout(() => finish(answers), 600); return; }
    const nextQ = followUpFor(a, qIndex, script);
    if (nextQ === script[qIndex + 1] || nextQ.startsWith('You mentioned')) setQIndex(qIndex + 1);
    setTimeout(() => ask(nextQ), 700);
  };

  const finish = (answersIn) => {
    stopListen(); try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    const answers = answersIn || turns.filter((t) => t.who === 'me').map((t) => t.text);
    const s = scoreInterview(answers.length ? answers : ['']);
    const skills = kind === 'project' ? ctx.skills : kind === 'story' ? ctx.skills : state.skills.filter((k) => k.area === id).slice(0, 2).map((k) => k.id);
    const title = kind === 'project' ? `Project defence: ${ctx.title}` : kind === 'story' ? `Behavioural: ${ctx.title}` : `Concept interview: ${ctx.title}`;
    const dur = `${Math.floor(secs / 60)} min ${String(secs % 60).padStart(2, '0')} s`;
    const iv = { id: uid('iv'), type: kind, projectId: kind === 'project' ? id : undefined, storyId: kind === 'story' ? id : undefined, title, date: new Date().toISOString(), duration: dur, skills: kind === 'story' ? [] : skills, ...s, strongest: s.strongest ? `“${s.strongest.slice(0, 220)}${s.strongest.length > 220 ? '…' : ''}”` : '—' };
    if (answers.length) actions.addInterview(iv);
    setResult({ ...iv, answers: answers.length }); setStage('results');
  };

  if (!ctx) return <p>Interview not found. <Link to="/app/interviews" className="link">Back</Link></p>;
  const mm = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  if (stage === 'pre') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <Link to="/app/interviews" className="btn-quiet !px-2 self-start"><ArrowLeft size={18} />Interviews</Link>
        <span className="label">{kind === 'project' ? 'Project defence' : kind === 'story' ? 'Behavioural practice' : 'Concept interview'}</span>
        <h1 className="text-[28px] font-extrabold leading-tight">{kind === 'story' ? 'Tell your story, then defend it' : 'Defend your thinking'}</h1>
        <p className="text-[15.5px] text-muted leading-relaxed">{kind === 'project' ? `The interviewer will ask about “${ctx.title}”, then follow up on your reasoning, assumptions and trade-offs.` : kind === 'story' ? `The interviewer asks a “tell me about a time” question and uses your “${ctx.title}” story to probe what you did. This is practice for real job interviews; it doesn’t change your skill scores.` : `The interviewer will check that you can explain and apply ${ctx.title} concepts in your own words.`}</p>
        <div className="card p-4 flex flex-col gap-3 text-[14.5px]">
          <span className="flex gap-3"><Clock size={18} className="shrink-0" /><span><strong>About {kind === 'story' ? 8 : 12} minutes.</strong> Pause any time.</span></span>
          <span className="flex gap-3"><CheckSquare size={18} className="shrink-0" />Understanding and reasoning are scored. Communication feedback is shown separately.</span>
          <span className="flex gap-3"><ListChecks size={18} className="shrink-0" />A live transcript is shown and saved to your history.</span>
        </div>
        <div className="card p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between"><span className="font-bold">Microphone</span>{mic === 'ok' ? <Pill tone="ok">Working</Pill> : mic === 'fail' ? <Pill tone="bad">Not available · text mode</Pill> : <button onClick={testMic} className="btn-ghost !min-h-9">Test microphone</button>}</div>
          {!SR && <p className="text-[13px] text-muted">Voice answers need Chrome or Edge. In this browser you’ll type your answers — everything else works the same.</p>}
        </div>
        <div className="card px-4"><Toggle on={keep} onChange={setKeep} label="Keep the audio recording" sub={keep ? 'On: audio kept in your history; delete any time' : 'Off: audio deleted once the transcript is made'} /></div>
        <label className="flex gap-3 items-start text-[14.5px] cursor-pointer"><input type="checkbox" className="w-5 h-5 mt-0.5 accent-indigo" checked={consent} onChange={(e) => setConsent(e.target.checked)} />I understand my voice is recorded during the interview and turned into a transcript for assessment.</label>
        <button disabled={!consent} onClick={start} className="btn-primary !min-h-12">{consent ? 'Start interview' : 'Confirm above to start'}</button>
      </div>
    );
  }

  if (stage === 'results') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <span className="label">Interview results · {result.duration}</span>
        <h1 className="text-[26px] font-extrabold leading-tight">{result.title}</h1>
        <div className="bg-indigo text-ivory rounded-3xl p-5 flex flex-col gap-2">
          <span className="text-[12px] tracking-[0.08em] uppercase font-bold text-gold">Understanding and reasoning</span>
          <p className="text-[28px] font-extrabold">{result.answers ? result.understanding : 'Not assessed'}</p>
          <p className="text-[14.5px] text-[#E3E4EE]">{result.answers ? 'Assessed on your reasoning, assumptions and trade-offs, using quotes from your transcript.' : 'The interview ended before you answered. Nothing was recorded.'}</p>
        </div>
        {result.answers > 0 && <>
          <div className="card p-4 flex flex-col gap-2"><span className="label">Where your reasoning was strongest</span><p className="text-[14.5px] border-l-[3px] border-gold pl-3">{result.strongest}</p><span className="label mt-2">Where to go deeper</span><p className="text-[14.5px]">{result.deeper}</p></div>
          <div className="card p-4 flex flex-col gap-1.5"><span className="label">Communication · separate from your score</span><p className="text-[14.5px]">{result.communication}</p></div>
          <div className="card p-4"><span className="label">{kind === 'story' ? 'Story practised' : 'Evidence added'}</span><p className="mt-1 text-[14px]">{kind === 'story' ? 'Marked as practised on your STAR story. Behavioural practice never changes your skill scores.' : `Explain evidence for ${result.skills.map((s) => state.skills.find((k) => k.id === s)?.name).join(' and ')}.`}</p></div>
          <p className="text-[13px] text-muted">{keep ? 'Audio kept · delete any time from Settings.' : 'Audio deleted · transcript kept.'}</p>
        </>}
        <div className="flex flex-wrap gap-3"><button onClick={() => nav('/app/skills')} className="btn-primary">See my skills gap</button><button onClick={() => nav('/app/interviews')} className="btn-ghost">All interviews</button></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto -mx-4 sm:mx-auto">
      <div className="bg-indigo text-ivory rounded-none sm:rounded-3xl min-h-[78vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="flex items-center gap-2 text-[14px] font-bold"><span className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-soft' : 'bg-[#E5484D] pulse-dot'}`} />{paused ? 'Paused' : 'Recording'}</span>
          <span className="flex items-center gap-3 text-[14px] font-bold text-[#C9CBDA]">{mm} / {kind === 'story' ? '08' : '12'}:00
            <button onClick={() => { setVoice(!voice); try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }} aria-label={voice ? 'Mute interviewer voice' : 'Unmute interviewer voice'} className="cursor-pointer">{voice ? <Volume2 size={18} /> : <VolumeX size={18} />}</button></span>
        </div>
        <div className="flex items-center justify-center gap-1.5 h-16 wave" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => <span key={i} className="w-1.5 h-12 rounded-full bg-gold origin-center" style={{ animationDelay: `${(i % 7) * 0.09}s`, animationPlayState: listening && !paused ? 'running' : 'paused', opacity: listening ? 1 : 0.35, transform: listening ? undefined : 'scaleY(0.25)' }} />)}
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-3 flex flex-col gap-3 scroll-thin max-h-[48vh]">
          <span className="text-[12px] tracking-[0.08em] uppercase font-bold text-[#9A9DB5]">Live transcript · question {Math.min(qIndex + 1, script.length)} of {script.length}</span>
          {turns.map((t, i) => (
            <div key={i} className={`max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${t.who === 'ai' ? 'self-start bg-indigo-2' : 'self-end bg-ivory text-indigo'}`}>
              <span className={`block text-[12px] font-extrabold mb-1 ${t.who === 'ai' ? 'text-gold' : 'text-muted'}`}>{t.who === 'ai' ? 'Interviewer' : 'You'}</span>{t.text}
            </div>
          ))}
          {draft && <div className="self-end max-w-[88%] rounded-2xl px-4 py-3 text-[15px] bg-ivory/80 text-indigo italic">{draft}</div>}
          <div ref={endRef} />
        </div>
        <div className="px-5 pb-3">
          {textMode ? (
            <div className="flex gap-2 items-end">
              <textarea className="textarea !bg-indigo !text-ivory !border-indigo-3 placeholder:!text-[#9A9DB5]" rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your answer" aria-label="Your answer" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <button onClick={send} disabled={!draft.trim()} className="btn-gold !min-h-12" aria-label="Send answer"><Send size={18} /></button>
            </div>
          ) : (
            <div className="flex gap-2">
              {!listening ? <button onClick={listen} disabled={paused} className="btn-gold flex-1 !min-h-12"><Mic size={18} />{draft ? 'Keep talking' : 'Tap to answer'}</button> : <button onClick={stopListen} className="btn flex-1 !min-h-12 bg-ivory text-indigo"><MicOff size={18} />Stop</button>}
              <button onClick={send} disabled={!draft.trim()} className="btn !min-h-12 border-[1.5px] border-ivory text-ivory disabled:opacity-40">Send answer</button>
            </div>
          )}
        </div>
        <div className="flex justify-around px-3 pt-2 pb-5 border-t border-indigo-3">
          <button onClick={() => { setPaused(!paused); stopListen(); }} className="flex flex-col items-center gap-1 text-[12.5px] font-bold min-w-20 cursor-pointer"><span className="w-12 h-12 rounded-full border border-indigo-3 flex items-center justify-center">{paused ? <Play size={18} /> : <Pause size={18} />}</span>{paused ? 'Resume' : 'Pause'}</button>
          <button onClick={() => { setTextMode(!textMode); stopListen(); }} className="flex flex-col items-center gap-1 text-[12.5px] font-bold min-w-20 cursor-pointer"><span className="w-12 h-12 rounded-full border border-indigo-3 flex items-center justify-center">{textMode ? <Mic size={18} /> : <Keyboard size={18} />}</span>{textMode ? 'Use voice' : 'Type instead'}</button>
          <button onClick={() => finish()} className="flex flex-col items-center gap-1 text-[12.5px] font-bold min-w-20 cursor-pointer"><span className="w-12 h-12 rounded-full bg-bad flex items-center justify-center"><Square size={16} /></span>End</button>
        </div>
      </div>
      {kind === 'project' && ctx.grade && <p className="text-[13px] text-muted mt-3 px-4 sm:px-0">Interviewing on: {ctx.title} · graded <ResultPill result={ctx.result} /></p>}
    </div>
  );
}
