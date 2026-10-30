// Simulated AI for the prototype. In production these are LLM pipelines (see PRD §6).
// Every function returns the same shape the real pipeline would.

const K = (re, name, summary, skills) => ({ re, name, summary, skills });

// Concepts the "AI" recognises, mapped to the Product Manager framework.
const DICT = [
  K(/\brice\b/i, 'RICE prioritisation', 'Reach × Impact × Confidence ÷ Effort, to compare items fairly.', ['prio-frameworks']),
  K(/moscow|must[- ]have/i, 'MoSCoW method', 'Must, should, could and won’t have, for scoping a release.', ['prio-frameworks']),
  K(/kano/i, 'Kano model', 'Basic, performance and delight features affect satisfaction differently.', ['prio-frameworks']),
  K(/cost of delay/i, 'Cost of delay', 'The value lost for each week something is not shipped.', ['prio-frameworks']),
  K(/opportunity cost|trade-?off/i, 'Opportunity cost', 'Every yes is a no to the next best option.', ['tradeoffs']),
  K(/roadmap/i, 'Roadmap communication', 'Explaining what is in, out and why for each audience.', ['roadmap-comms']),
  K(/now[, /]+next[, /]+later/i, 'Now / Next / Later roadmap', 'A roadmap format that shows confidence instead of exact dates.', ['roadmap-comms']),
  K(/north star/i, 'North Star metric', 'One metric that captures the core value customers get.', ['north-star']),
  K(/vanity/i, 'Vanity metrics', 'Numbers that can rise while customers get no value.', ['north-star']),
  K(/input metric|leading indicator|metric tree/i, 'Input metrics', 'Levers a team controls that move the outcome metric.', ['input-output']),
  K(/okr|objective/i, 'OKRs', 'Objectives with measurable key results that show progress.', ['input-output', 'north-star']),
  K(/kpi/i, 'KPIs', 'The few numbers that show whether the work is succeeding.', ['north-star']),
  K(/funnel|drop-?off|conversion/i, 'Funnel analysis', 'Finding where and why users drop off between steps.', ['funnel']),
  K(/activation|onboarding/i, 'Activation', 'The moment a new user first gets real value from the product.', ['funnel']),
  K(/retention|churn/i, 'Retention and churn', 'How many users keep coming back, and how many leave.', ['cohorts']),
  K(/cohort/i, 'Cohort analysis', 'Comparing groups of users who started at the same time.', ['cohorts']),
  K(/a\/?b test|split test|experiment/i, 'A/B testing', 'Comparing a control and a treatment group to measure a change.', ['ab-basics', 'experiment-design']),
  K(/hypothes/i, 'Hypothesis statement', 'If we change X for Y users, metric Z will move because…', ['experiment-design']),
  K(/sample size|statistic|significan/i, 'Sample size and significance', 'Planning enough users and time to trust a result.', ['experiment-design']),
  K(/guardrail|counter-?metric/i, 'Guardrail metric', 'A metric watched so a win doesn’t hide damage elsewhere.', ['metric-tradeoffs', 'experiment-design']),
  K(/nps|net promoter/i, 'Net Promoter Score', 'How likely customers are to recommend the product.', ['north-star']),
  K(/jobs? to be done|jtbd/i, 'Jobs to be done', 'The progress someone is trying to make in a situation.', ['jtbd']),
  K(/persona/i, 'User personas', 'A profile of a type of user and their goals.', ['jtbd']),
  K(/interview/i, 'User interviews', 'Learning from real behaviour without leading questions.', ['user-interviews']),
  K(/survey/i, 'Surveys', 'Collecting structured answers from many users at once.', ['research-synthesis']),
  K(/usability|user test/i, 'Usability testing', 'Watching users try tasks to find where they struggle.', ['usability-testing']),
  K(/problem statement|problem framing|discovery/i, 'Problem framing', 'Stating the user problem before choosing a solution.', ['problem-framing']),
  K(/opportunity solution tree/i, 'Opportunity solution trees', 'Mapping outcomes to opportunities and solutions.', ['ost']),
  K(/\bmvp\b|minimum viable/i, 'Minimum viable product', 'The smallest release that tests whether an idea works.', ['mlp']),
  K(/\bmlp\b|minimum lovable/i, 'Minimum lovable product', 'The smallest release customers will actually love.', ['mlp']),
  K(/user stor|as a .* i want/i, 'User stories', 'Describing a need from the user’s point of view.', ['user-stories']),
  K(/acceptance criteria|given .* when .* then/i, 'Acceptance criteria', 'Testable conditions that define when a story is done.', ['user-stories']),
  K(/sprint|backlog|scrum|standup|stand-up/i, 'Sprint planning', 'Choosing and committing to the next set of work.', ['sprint-planning']),
  K(/kanban/i, 'Kanban', 'Visualising work and limiting work in progress.', ['sprint-planning']),
  K(/engineer|developer|technical debt|tech debt/i, 'Working with engineers', 'Sharing context early and negotiating scope openly.', ['eng-collab']),
  K(/feature flag|rollout|rollback|release/i, 'Phased releases', 'Rolling out gradually with flags and rollback criteria.', ['release-planning']),
  K(/stakeholder/i, 'Stakeholder alignment', 'Sharing reasoning so people understand decisions.', ['stakeholder-alignment']),
  K(/raci/i, 'RACI matrix', 'Responsible, Accountable, Consulted, Informed.', ['stakeholder-alignment']),
  K(/power[- –]interest/i, 'Power–interest grid', 'Mapping stakeholders by power and interest.', ['stakeholder-alignment']),
  K(/disagree and commit/i, 'Disagree and commit', 'Argue your case, then support the decision fully.', ['disagreement']),
  K(/\bprd\b|product brief|one-pager/i, 'Product briefs', 'A short document with problem, goal, scope and success measures.', ['product-briefs']),
  K(/executive|leadership update|ceo/i, 'Executive updates', 'Decision needed, options and a recommendation.', ['exec-updates']),
  K(/vision/i, 'Product vision', 'Where the product is going in the next 2–3 years.', ['vision']),
  K(/competitor|competitive/i, 'Competitive analysis', 'Comparing the real alternatives users choose between.', ['competitive']),
  K(/pricing|willingness to pay|monetis|monetiz|subscription/i, 'Pricing and monetisation', 'Choosing how to charge and testing willingness to pay.', ['pricing']),
  K(/ussd/i, 'USSD flows', 'Designing feature-phone menus within session and character limits.', ['ussd-design']),
];

// Related to product work but not on the Product Manager map → "suggest adding as a skill" (decision 2.10)
const MISSING = [
  K(/unit economics|\bcac\b|\bltv\b|lifetime value/i, 'Unit economics', 'What it costs to win a customer compared with what they are worth.', []),
  K(/go[- ]to[- ]market|\bgtm\b|launch plan/i, 'Go-to-market planning', 'How a product reaches and wins its first customers.', []),
  K(/value proposition/i, 'Value proposition', 'Why a customer should choose this over alternatives.', []),
  K(/business model canvas/i, 'Business model canvas', 'A one-page map of how a business creates and captures value.', []),
  K(/\bsql\b|query|dashboard/i, 'SQL for product analysis', 'Querying product data directly to answer questions.', []),
  K(/accessibility|a11y|wcag/i, 'Accessibility', 'Designing so people with disabilities can use the product.', []),
  K(/design thinking|empathy map/i, 'Design thinking', 'Empathise, define, ideate, prototype and test.', []),
  K(/positioning/i, 'Positioning', 'The place a product holds in customers’ minds.', []),
];

const OUT = /sourdough|recipe|bake|baking|cook|football|match day|gym|workout|movie|netflix|grocer|birthday|church|wedding|laundry|haircut/i;

const sentenceSplit = (text) => text.split(/\n+|(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 2);

export function extractConcepts(text) {
  const found = [];
  const seen = new Set();
  const lines = sentenceSplit(text);
  lines.forEach((line) => {
    if (OUT.test(line)) {
      const name = line.replace(/^(also|and|note)[:,]?\s*/i, '').split(/[.!?]/)[0].slice(0, 60);
      found.push({ name: name.charAt(0).toUpperCase() + name.slice(1), summary: 'Not related to your target role.', passage: line, skills: [], scope: 'out' });
      return;
    }
    let matched = false;
    DICT.forEach((d) => {
      if (d.re.test(line) && !seen.has(d.name)) {
        seen.add(d.name); matched = true;
        found.push({ name: d.name, summary: d.summary, passage: line, skills: d.skills, scope: 'in' });
      }
    });
    MISSING.forEach((d) => {
      if (d.re.test(line) && !seen.has(d.name)) {
        seen.add(d.name); matched = true;
        found.push({ name: d.name, summary: d.summary, passage: line, skills: [], scope: 'missing', suggestSkill: d.name });
      }
    });
    if (!matched && line.split(/\s+/).length >= 7 && found.filter((f) => f.scope === 'in').length < 2) {
      // Generic concept from a substantive sentence.
      const words = line.replace(/[^\w\s'’-]/g, '').split(/\s+/).slice(0, 5).join(' ');
      found.push({ name: words.charAt(0).toUpperCase() + words.slice(1), summary: line.length > 110 ? `${line.slice(0, 107)}…` : line, passage: line, skills: ['problem-framing'], scope: 'in', generic: true });
    }
  });
  return found.slice(0, 12);
}

// Questions generated from newly extracted concepts (first practice after a note).
export function questionsForConcepts(concepts, existing) {
  const out = [];
  concepts.filter((c) => c.scope === 'in').slice(0, 3).forEach((c, i) => {
    const pool = existing.filter((q) => q.concept && q.concept !== c.id && q.options).flatMap((q) => q.options.map((o) => o[1]));
    const distractors = ['A way to estimate engineering effort only', 'A metric that measures page views', 'A tool for writing marketing copy', ...pool].slice(i, i + 3);
    out.push({
      id: `gen-${c.id}`, concept: c.id, type: 'mcq', level: 'Foundation', generated: true,
      prompt: `From your note: which statement best describes “${c.name}”?`,
      options: [['a', c.summary], ['b', distractors[0]], ['c', distractors[1]], ['d', distractors[2]]].sort(() => 0.5 - Math.random()),
      correct: ['a'], explain: `Your note says: “${c.passage}”`,
    });
  });
  return out;
}

export function gradeShort(answer, criteria) {
  const a = answer.toLowerCase();
  const res = criteria.map((c) => ({ ...c, met: c.keys.some((k) => a.includes(k)) }));
  const n = res.filter((r) => r.met).length;
  return { result: n === criteria.length ? 'right' : n === 0 ? 'wrong' : 'partial', criteria: res };
}

// ---------- Work log ----------
const WORK_SKILLS = [
  [/rice|prioriti|backlog|ranked/i, 'prio-frameworks'], [/trade-?off|deprioriti|said no/i, 'tradeoffs'],
  [/sprint|planning|standup|stand-up/i, 'sprint-planning'], [/ticket|complaint|feedback|survey|insight|grouped/i, 'research-synthesis'],
  [/interview|spoke to|called|users? (said|told)/i, 'user-interviews'], [/usability|watched|tested with/i, 'usability-testing'],
  [/a\/?b|experiment|test(ed)? (a|the)|hypothes|guardrail/i, 'experiment-design'], [/funnel|drop-?off|conversion|completion/i, 'funnel'],
  [/metric|dashboard|north star|kpi/i, 'north-star'], [/cohort|retention|churn/i, 'cohorts'],
  [/brief|prd|spec|one-pager|documented/i, 'product-briefs'], [/stor(y|ies)|acceptance criteria/i, 'user-stories'],
  [/engineer|developer|backend|frontend|qa\b/i, 'eng-collab'], [/release|rollout|launch(ed)?|shipped/i, 'release-planning'],
  [/stakeholder|compliance|legal|sales|ceo|manager|leadership|head of/i, 'stakeholder-alignment'], [/disagree|pushed back|conflict/i, 'disagreement'],
  [/update to|weekly update|presented/i, 'exec-updates'], [/ussd/i, 'ussd-design'], [/pric/i, 'pricing'], [/competitor/i, 'competitive'],
];

export function analyseWorkEntry(text, kpis) {
  const skills = [...new Set(WORK_SKILLS.filter(([re]) => re.test(text)).map(([, id]) => id))].slice(0, 3);
  const t = text.toLowerCase();
  let kpi = null;
  kpis.forEach((k) => {
    const words = `${k.name} ${k.goal}`.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4);
    if (!kpi && words.some((w) => t.includes(w))) kpi = k.id;
  });
  if (!kpi && /onboard|sign-?up|kyc|verify|verification/.test(t)) kpi = kpis.find((k) => /onboard/i.test(k.name))?.id || null;
  if (!kpi && /ticket|fail|refund|reversal/.test(t)) kpi = kpis.find((k) => /ticket/i.test(k.name))?.id || null;
  if (!kpi && /ussd/.test(t)) kpi = kpis.find((k) => /ussd/i.test(k.name))?.id || null;
  const hasResult = /\d+\s?%|\d+\s?(users|tickets|hours|minutes|days|points)|from .* to |increased|reduced|cut|saved|grew|dropped|rose|approved|agreed|signed off/i.test(text);
  return {
    skills: skills.length ? skills : ['stakeholder-alignment'],
    kpi,
    hasResult,
    followUp: hasResult ? null : 'What changed because of this? A number helps — time saved, a metric that moved, or a decision it unlocked.',
  };
}

export function draftStory(entries, kpi) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const results = sorted.map((e) => e.result).filter(Boolean);
  return {
    situation: kpi ? `The team was working toward “${kpi.goal}”, and progress had stalled.` : `${first.text.split('.')[0]}.`,
    task: kpi ? `I owned moving ${kpi.name.toLowerCase()} in the right direction.` : 'I needed to find a better way to get this done.',
    action: sorted.map((e) => e.text.trim().replace(/[.\s]+$/, '')).join('. ') + '.',
    result: results.length ? results.map((x) => x.trim().replace(/[.\s]+$/, '')).join('. ') + '.' : '[Add the result once you have it.]',
  };
}

const redactText = (t, on) => (on ? t.replace(/PayLite/g, 'a Lagos fintech').replace(/Balogun market/g, 'a large Lagos market').replace(/₦[\d,]+/g, 'a small amount') : t);

export function generateDocument(type, state, opts = {}) {
  const { work, user } = state;
  const r = (t) => redactText(t, opts.redact);
  const approved = work.stories.filter((s) => s.status === 'approved');
  const stories = approved.length ? [...approved, ...work.stories.filter((s) => s.status === 'draft' && !/\[/.test(s.result))].slice(0, 3) : work.stories.filter((s) => s.status === 'draft');
  const trim = (t) => t.trim().replace(/[.\s]+$/, '');
  const wins = work.log.filter((e) => e.result).slice(0, 6);
  const kpiLine = (k) => `${k.name}: ${k.start}${k.unit} → ${k.current}${k.unit} (target ${k.target}${k.unit})`;

  if (type === 'cv') {
    return {
      title: 'CV bullet points',
      body: wins.map((e) => `• ${trim(r(e.text)).split('. ')[0]}, resulting in: ${trim(r(e.result)).charAt(0).toLowerCase() + trim(r(e.result)).slice(1)}.`).join('\n'),
    };
  }
  if (type === 'review') {
    return {
      title: 'Performance review self-assessment',
      body: `Role: ${work.profile.title}, ${r(work.profile.company)}\n\nWHAT I DELIVERED AGAINST MY GOALS\n${work.kpis.map((k) => `• ${kpiLine(k)}`).join('\n')}\n\nHIGHLIGHTS\n${stories.map((s) => `• ${r(s.title)}: ${trim(r(s.result))}.`).join('\n')}\n\nSKILLS I GREW THIS PERIOD\n• Experiment design: from course notes to running a live A/B test with a guardrail.\n• Customer research synthesis: grouped 300 tickets into 6 causes that set the team’s priorities.\n\nWHAT I WANT TO WORK ON NEXT\n• Roadmap communication and executive updates, so I can own a larger area.`,
    };
  }
  if (type === 'promotion') {
    return {
      title: 'Promotion case',
      body: `I am asking to be considered for Product Manager.\n\nI ALREADY WORK AT THE NEXT LEVEL\n${stories.slice(0, 3).map((s) => `• ${r(s.title)}: ${trim(r(s.action).split('. ').slice(0, 2).join('. '))}. Result: ${trim(r(s.result))}.`).join('\n')}\n\nIMPACT ON TEAM GOALS\n${work.kpis.map((k) => `• ${kpiLine(k)}`).join('\n')}\n\nEVIDENCE OF GROWTH\n• Demonstrated skills on The One Percent include problem framing, funnel analysis and customer research synthesis, each backed by a graded project and a voice interview.`,
    };
  }
  if (type === 'interview') {
    return {
      title: 'Interview answers (STAR)',
      body: stories.map((s) => `Q: Tell me about a time you ${s.kpi ? 'moved a key metric' : 'improved how your team worked'}.\n\nSituation: ${r(s.situation)}\nTask: ${r(s.task)}\nAction: ${r(s.action)}\nResult: ${r(s.result)}`).join('\n\n———\n\n'),
    };
  }
  if (type === 'update') {
    const recent = work.log.slice(0, 5);
    return {
      title: 'Monthly update to my manager',
      body: `Hi — here’s my update for this month.\n\nPROGRESS ON GOALS\n${work.kpis.map((k) => `• ${kpiLine(k)}`).join('\n')}\n\nWHAT I DID\n${recent.map((e) => `• ${r(e.text)}${e.result ? ` → ${r(e.result)}` : ''}`).join('\n')}\n\nDECISION I NEED FROM YOU\n• Confirm we judge the deferred-ID test only at its planned end date.\n\n${user.first}`,
    };
  }
  if (type === 'linkedin') {
    const s = stories[0];
    return {
      title: 'LinkedIn post',
      body: `A year ago I was answering payment complaints in customer support. This month I used what I learned about prioritisation to help my team plan faster.\n\n${r(s.situation)}\n\nWhat I did: ${r(s.action)}\n\nThe result: ${r(s.result)}\n\nThe lesson: frameworks don’t make decisions for you — they make the reasoning visible, so the debate is about assumptions, not volume.\n\nI’m building my craft one deliberate practice at a time with @The One Percent.\n\n#ProductManagement #CareerGrowth #Lagos`,
    };
  }
  return { title: 'Document', body: '' };
}

// Implementation layer: suggest applying a recently learned concept to a KPI.
export function suggestImplementation(concept, kpis, profile) {
  const k = kpis[0];
  return {
    id: `im-${Date.now().toString(36)}`, status: 'new', kpi: k?.id, concepts: [concept.id],
    title: `Use “${concept.name}” on ${k ? k.name.toLowerCase() : 'your current goal'}`,
    why: `You just added “${concept.name}” to your notes. At ${profile.company}, your goal is “${k?.goal || 'your top KPI'}”. Here’s one way to apply it this week.`,
    steps: [`Write one sentence on how ${concept.name.toLowerCase()} could move ${k ? k.name.toLowerCase() : 'your goal'}.`, 'Pick the smallest version you can try this week.', 'Share it with one teammate for a gut check.', 'Log what happened in your work log.'],
    impact: 'Turns new learning into evidence of impact at work.',
  };
}

// ---------- Interview scripts ----------
export function interviewScript(kind, ctx) {
  if (kind === 'project') {
    return [
      `Let’s talk about “${ctx.title}”. In one or two sentences, what was the real problem you found?`,
      'You recommended letting users verify ID later. What risk does that create, and how would you contain it?',
      'How would you know the change reduced drop-off, rather than just moving it to the first transfer?',
      'If the test result was flat, what would you do next?',
    ];
  }
  if (kind === 'story') {
    return [
      `Tell me about a time you ${ctx.kpi ? 'moved a metric your team owned' : 'improved how your team worked'}. Use your “${ctx.title}” example.`,
      'What exactly did you do, as opposed to the team?',
      'What was the hardest moment, and how did you handle it?',
      'If you did it again tomorrow, what would you change?',
    ];
  }
  return [
    `Let’s check your understanding of ${ctx.title}. Explain the core idea as if to a new teammate.`,
    'Give me a real example of when you would use it — and when you would not.',
    'What is the most common mistake people make with it?',
    'How would you know you had applied it well?',
  ];
}

export function followUpFor(answer, i, script) {
  const a = answer.toLowerCase();
  if (a.split(/\s+/).length < 8) return 'Can you say a bit more? Walk me through your reasoning.';
  if (i === 1 && /fraud|risk/.test(a)) return `You mentioned risk. ${script[2]}`;
  return script[i + 1];
}

export function scoreInterview(answers) {
  const words = answers.join(' ').split(/\s+/).length;
  const reasoning = /because|so that|which means|therefore|trade-?off|risk|instead/i.test(answers.join(' '));
  const understanding = words > 90 && reasoning ? 'Satisfactory' : words > 50 ? 'Satisfactory' : 'Developing';
  return {
    understanding,
    strongest: answers.find((a) => /because|so|risk|trade/i.test(a)) || answers[0] || '',
    deeper: understanding === 'Developing' ? 'Give one concrete example with a number, then explain why it worked.' : 'Say how you would measure success, and what result would change your mind.',
    communication: words > 140 ? 'Clear structure. Some answers ran long — try ending each with a one-line summary.' : 'Concise. Add a little more structure: answer first, then two reasons.',
  };
}
