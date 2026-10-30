// All demo data is fictional. Dates are generated relative to "today" so the demo always feels current.
const DAY = 864e5;
export const dayISO = (offset = 0, hour = 9, min = 0) => {
  const t = new Date(Date.now() + offset * DAY);
  t.setHours(hour, min, 0, 0);
  return t.toISOString();
};

export const LEVELS = ['Foundation', 'Practitioner', 'Advanced', 'Senior'];

// ---------- Skill framework: Product Manager (shared, AI-generated then reviewed) ----------
export const AREAS = [
  { id: 'disc', name: 'Discovery and research' },
  { id: 'prio', name: 'Prioritisation and roadmapping' },
  { id: 'metr', name: 'Metrics and analytics' },
  { id: 'deliv', name: 'Delivery and execution' },
  { id: 'stake', name: 'Stakeholder communication' },
  { id: 'strat', name: 'Strategy and vision' },
];

const S = (id, area, name, level, desc, extra = {}) => ({ id, area, name, level, desc, buildsOn: [], ...extra });

export const SKILLS = [
  S('problem-framing', 'disc', 'Problem framing', 'Foundation', 'States the user problem, who has it and why it matters before jumping to solutions.'),
  S('jtbd', 'disc', 'Jobs to be done', 'Foundation', 'Describes the progress a user is trying to make in a situation, separate from who they are.'),
  S('user-interviews', 'disc', 'User interviews', 'Practitioner', 'Runs interviews that uncover real behaviour, avoiding leading questions.', { buildsOn: ['problem-framing'] }),
  S('research-synthesis', 'disc', 'Customer research synthesis', 'Practitioner', 'Turns tickets, interviews and data into clear, prioritised insights.', { buildsOn: ['user-interviews'] }),
  S('usability-testing', 'disc', 'Usability testing', 'Practitioner', 'Plans tests with 5–8 users, defines tasks and success measures.'),
  S('ost', 'disc', 'Opportunity solution trees', 'Advanced', 'Maps outcomes to opportunities and solutions to choose what to explore.', { buildsOn: ['research-synthesis', 'problem-framing'] }),

  S('prio-frameworks', 'prio', 'Prioritisation frameworks', 'Practitioner', 'Applies RICE, MoSCoW or cost of delay consistently, with stated assumptions.'),
  S('tradeoffs', 'prio', 'Trade-off decisions', 'Practitioner', 'Names what is dropped, the cost of dropping it and how to reduce that cost.', { buildsOn: ['prio-frameworks'] }),
  S('roadmap-comms', 'prio', 'Roadmap communication', 'Advanced', 'Explains a roadmap so each audience understands what is in, out and why.', { buildsOn: ['tradeoffs'] }),
  S('multi-team-roadmap', 'prio', 'Multi-team roadmap strategy', 'Senior', 'Aligns several teams’ roadmaps to one strategy and resolves conflicts between them.', { buildsOn: ['roadmap-comms'] }),

  S('north-star', 'metr', 'North Star metric', 'Foundation', 'Chooses one metric that reflects the value customers get, and avoids vanity metrics.'),
  S('ab-basics', 'metr', 'A/B testing basics', 'Foundation', 'Explains control and treatment groups and why randomisation matters.'),
  S('funnel', 'metr', 'Funnel analysis', 'Practitioner', 'Finds where and why users drop off and separates hesitation from failure.', { buildsOn: ['north-star'] }),
  S('experiment-design', 'metr', 'Experiment design', 'Practitioner', 'Designs tests with a hypothesis, the right metric, a control and enough users and time.', { buildsOn: ['ab-basics'] }),
  S('input-output', 'metr', 'Input vs output metrics', 'Practitioner', 'Links controllable input metrics to business outcomes in a metric tree.', { buildsOn: ['north-star'] }),
  S('cohorts', 'metr', 'Cohort analysis', 'Practitioner', 'Compares behaviour of user groups over time to read retention correctly.'),
  S('metric-tradeoffs', 'metr', 'Metric trade-offs', 'Advanced', 'Balances competing metrics with guardrails and counter-metrics.', { buildsOn: ['experiment-design', 'input-output'] }),
  S('analytics-strategy', 'metr', 'Analytics strategy', 'Senior', 'Sets what a product organisation measures, how and why.', { buildsOn: ['metric-tradeoffs'] }),

  S('user-stories', 'deliv', 'User stories and acceptance criteria', 'Foundation', 'Writes testable stories that state user value and done-criteria.'),
  S('eng-collab', 'deliv', 'Working with engineers', 'Foundation', 'Shares context early, respects estimates and negotiates scope openly.'),
  S('sprint-planning', 'deliv', 'Sprint and backlog management', 'Foundation', 'Keeps a groomed backlog and runs focused planning sessions.'),
  S('release-planning', 'deliv', 'Release planning', 'Advanced', 'Plans phased rollouts with feature flags, risks and rollback criteria.', { buildsOn: ['sprint-planning'] }),

  S('stakeholder-alignment', 'stake', 'Stakeholder alignment', 'Foundation', 'Shares reasoning openly so stakeholders understand why decisions were made.'),
  S('product-briefs', 'stake', 'Writing product briefs', 'Foundation', 'Writes one-page briefs with problem, goal, scope and success measures.'),
  S('disagreement', 'stake', 'Managing disagreement', 'Practitioner', 'Disagrees and commits, and escalates with options rather than complaints.', { buildsOn: ['stakeholder-alignment'] }),
  S('exec-updates', 'stake', 'Executive updates', 'Senior', 'Gives leadership crisp updates: decision needed, options, recommendation.'),

  S('mlp', 'strat', 'Minimum lovable product', 'Practitioner', 'Scopes the smallest release users will actually love, not just tolerate.'),
  S('competitive', 'strat', 'Competitive analysis', 'Advanced', 'Compares alternatives users really choose between, including doing nothing.'),
  S('pricing', 'strat', 'Pricing and monetisation', 'Advanced', 'Chooses pricing models and tests willingness to pay.'),
  S('vision', 'strat', 'Product vision', 'Advanced', 'Writes a vision that guides decisions for the next 2–3 years.', { buildsOn: ['mlp'] }),

  // Learner-added skill (decision 2.11)
  S('ussd-design', 'strat', 'USSD product design', 'Practitioner', 'Designs feature-phone USSD flows within session and character limits.', { addedByUser: true }),
];

// Evidence per skill: remember / apply / explain are assessed; work is self-reported "Used at work" count.
// values: 'none' | 'developing' | 'demonstrated'
const E = (r, a, x, work = 0, via) => ({ remember: r, apply: a, explain: x, work, via });
export const EVIDENCE = {
  'problem-framing': E('demonstrated', 'demonstrated', 'demonstrated', 2),
  jtbd: E('developing', 'none', 'none', 0),
  'user-interviews': E('demonstrated', 'developing', 'none', 1),
  'research-synthesis': E('demonstrated', 'demonstrated', 'demonstrated', 3),
  'usability-testing': E('developing', 'none', 'none'),
  ost: E('none', 'none', 'none'),
  'prio-frameworks': E('demonstrated', 'developing', 'developing', 4),
  tradeoffs: E('developing', 'developing', 'none', 2),
  'roadmap-comms': E('none', 'none', 'none'),
  'multi-team-roadmap': E('none', 'none', 'none'),
  'north-star': E('demonstrated', 'developing', 'none', 1),
  'ab-basics': E('demonstrated', 'demonstrated', 'demonstrated', 0, 'experiment-design-partial'),
  funnel: E('demonstrated', 'demonstrated', 'demonstrated', 3),
  'experiment-design': E('demonstrated', 'developing', 'developing', 1),
  'input-output': E('none', 'none', 'none'),
  cohorts: E('developing', 'none', 'none'),
  'metric-tradeoffs': E('none', 'none', 'none'),
  'analytics-strategy': E('none', 'none', 'none'),
  'user-stories': E('demonstrated', 'demonstrated', 'demonstrated', 2),
  'eng-collab': E('demonstrated', 'demonstrated', 'demonstrated', 5),
  'sprint-planning': E('demonstrated', 'developing', 'none', 4),
  'release-planning': E('none', 'none', 'none'),
  'stakeholder-alignment': E('demonstrated', 'developing', 'developing', 3),
  'product-briefs': E('demonstrated', 'demonstrated', 'demonstrated', 1),
  disagreement: E('developing', 'none', 'none', 1),
  'exec-updates': E('none', 'none', 'none'),
  mlp: E('developing', 'none', 'none'),
  competitive: E('none', 'none', 'none'),
  pricing: E('none', 'none', 'none'),
  vision: E('none', 'none', 'none'),
  'ussd-design': E('developing', 'none', 'none', 2),
};

// ---------- Notes ----------
export const NOTES = [
  {
    id: 'n1', title: 'PM Fundamentals — week 3: stakeholders', sourceType: 'Course', source: 'Product School · PM Fundamentals', collection: 'PM Fundamentals', createdAt: dayISO(-1, 21),
    body: 'Power–interest grid: map stakeholders by power and interest. Manage closely the high-power, high-interest group.\n\nRACI: Responsible, Accountable, Consulted, Informed. Only one Accountable per decision.\n\nDisagree and commit: argue your case, then fully support the decision once it is made.\n\nShare your prioritisation scores openly so stakeholders can see why their item lost.',
  },
  {
    id: 'n2', title: 'Prioritisation: RICE, MoSCoW, opportunity cost', sourceType: 'Course', source: 'Product School · PM Fundamentals', collection: 'PM Fundamentals', createdAt: dayISO(-6, 20),
    body: 'RICE = Reach × Impact × Confidence ÷ Effort. Use it to compare features fairly instead of going with the loudest voice.\n\nMoSCoW for release scope: must, should, could, won’t.\n\nEvery yes is a no to something else (opportunity cost).\n\nAlso: feed the sourdough starter on Saturday!',
  },
  {
    id: 'n3', title: 'Jobs to be done — switch interviews', sourceType: 'Article', source: 'JTBD.info', collection: '', createdAt: dayISO(-9, 22),
    body: 'Personas describe who the user is; jobs describe the progress they are trying to make in a situation.\n\nSwitch interviews: ask about the moment someone switched products — first thought, passive looking, active looking, decision.\n\nTwo very different people can hire a product for the same job.',
  },
  {
    id: 'n4', title: 'North Star and input metrics', sourceType: 'Webinar', source: 'Product analytics webinar', collection: '', createdAt: dayISO(-11, 19),
    body: 'A North Star metric measures the core value customers get, e.g. weekly bills paid successfully.\n\nVanity metrics (total sign-ups, page views) can rise while customers get no value.\n\nInput metrics are the levers a team controls that move the North Star.',
  },
  {
    id: 'n5', title: 'Experiment design basics', sourceType: 'Course', source: 'Reforge-style experimentation module', collection: '', createdAt: dayISO(-13, 20),
    body: 'Every test needs a hypothesis: if we change X for Y users, metric Z will move because…\n\nRandomise into control and treatment groups. Decide the sample size and duration before you start.\n\nAdd a guardrail metric so a win on one metric doesn’t hide damage elsewhere.',
  },
  {
    id: 'n6', title: 'Inspired, ch. 4–5: discovery and MLP', sourceType: 'Book', source: 'Inspired · Marty Cagan', collection: 'Inspired', createdAt: dayISO(-18, 21),
    body: 'Discovery decides what to build; delivery builds it well.\n\nFour risks to test early: value, usability, feasibility, viability.\n\nMLP: the minimum lovable product — the smallest release customers will actually love.\n\nTest with 5 to 8 real users before committing a sprint.',
  },
  {
    id: 'n7', title: 'Designing USSD flows for feature phones', sourceType: 'Tutorial', source: 'Africa’s Talking dev tutorial', collection: '', createdAt: dayISO(-15, 18),
    body: 'USSD sessions time out after about 180 seconds, so keep flows under 5 screens.\n\nEach screen is limited to about 160 characters — number the options and keep labels short.\n\nConfirm amounts before final submission; users cannot go back easily.',
  },
];

// ---------- Concepts (unit of practice) ----------
const C = (id, name, summary, noteId, passage, skills, mem = {}, extra = {}) => ({
  id, name, summary, noteId, passage, skills, status: 'active',
  due: dayISO(mem.due ?? 1), strength: mem.strength ?? 0.5, asked: mem.asked ?? 3, last: mem.last ?? 'right',
  ...extra,
});
export const CONCEPTS = [
  C('c-pi-grid', 'Power–interest grid', 'Map stakeholders by power and interest; manage the high-high group closely.', 'n1', 'Power–interest grid: map stakeholders by power and interest.', ['stakeholder-alignment'], { due: 0, asked: 0, last: null, strength: 0.1 }),
  C('c-raci', 'RACI matrix', 'Responsible, Accountable, Consulted, Informed — only one Accountable per decision.', 'n1', 'RACI: Responsible, Accountable, Consulted, Informed.', ['stakeholder-alignment', 'eng-collab'], { due: 0, asked: 0, last: null, strength: 0.1 }),
  C('c-disagree', 'Disagree and commit', 'Argue your case, then fully support the decision once it is made.', 'n1', 'Disagree and commit: argue your case, then fully support the decision once it is made.', ['disagreement'], { due: 0, asked: 0, last: null, strength: 0.1 }),
  C('c-rice', 'RICE prioritisation', 'Reach × Impact × Confidence ÷ Effort, to compare features fairly.', 'n2', 'RICE = Reach × Impact × Confidence ÷ Effort.', ['prio-frameworks'], { due: 0, asked: 6, last: 'right', strength: 0.8 }),
  C('c-moscow', 'MoSCoW method', 'Must, should, could and won’t have, for scoping a release.', 'n2', 'MoSCoW for release scope: must, should, could, won’t.', ['prio-frameworks'], { due: 2, asked: 4, last: 'right', strength: 0.7 }),
  C('c-oppcost', 'Opportunity cost', 'Every yes is a no to the next best option.', 'n2', 'Every yes is a no to something else (opportunity cost).', ['tradeoffs'], { due: 0, asked: 3, last: 'wrong', strength: 0.35 }),
  C('c-sourdough', 'Feeding the sourdough starter', 'Feed the starter on Saturday.', 'n2', 'Also: feed the sourdough starter on Saturday!', [], {}, { status: 'out' }),
  C('c-jtbd', 'Jobs to be done', 'Jobs describe the progress someone is trying to make in a situation.', 'n3', 'jobs describe the progress they are trying to make in a situation.', ['jtbd'], { due: 0, asked: 3, last: 'wrong', strength: 0.3 }),
  C('c-switch', 'Switch interviews', 'Interview people about the moment they switched products.', 'n3', 'Switch interviews: ask about the moment someone switched products.', ['user-interviews', 'jtbd'], { due: 3, asked: 2, last: 'right', strength: 0.55 }),
  C('c-northstar', 'North Star metric', 'One metric that captures the core value customers get.', 'n4', 'A North Star metric measures the core value customers get.', ['north-star'], { due: 1, asked: 7, last: 'right', strength: 0.85 }),
  C('c-vanity', 'Vanity metrics', 'Numbers that can rise while customers get no value.', 'n4', 'Vanity metrics (total sign-ups, page views) can rise while customers get no value.', ['north-star'], { due: 0, asked: 5, last: 'partial', strength: 0.5 }),
  C('c-input', 'Input metrics', 'Levers a team controls that move the North Star.', 'n4', 'Input metrics are the levers a team controls that move the North Star.', ['input-output'], { due: 0, asked: 1, last: 'wrong', strength: 0.2 }),
  C('c-hypothesis', 'Hypothesis statement', 'If we change X for Y users, metric Z will move because…', 'n5', 'Every test needs a hypothesis: if we change X for Y users, metric Z will move because…', ['experiment-design'], { due: 1, asked: 4, last: 'right', strength: 0.7 }),
  C('c-control', 'Control vs treatment', 'Randomise users into a control group and a treatment group.', 'n5', 'Randomise into control and treatment groups.', ['ab-basics', 'experiment-design'], { due: 4, asked: 5, last: 'right', strength: 0.8 }),
  C('c-sample', 'Sample size and duration', 'Decide how many users and how long before the test starts.', 'n5', 'Decide the sample size and duration before you start.', ['experiment-design'], { due: 0, asked: 2, last: 'wrong', strength: 0.25 }),
  C('c-guardrail', 'Guardrail metric', 'A metric watched so a win doesn’t hide damage elsewhere.', 'n5', 'Add a guardrail metric so a win on one metric doesn’t hide damage elsewhere.', ['experiment-design', 'metric-tradeoffs'], { due: 2, asked: 2, last: 'right', strength: 0.5 }),
  C('c-discovery', 'Discovery vs delivery', 'Discovery decides what to build; delivery builds it well.', 'n6', 'Discovery decides what to build; delivery builds it well.', ['problem-framing'], { due: 6, asked: 6, last: 'right', strength: 0.9 }),
  C('c-four-risks', 'Four product risks', 'Value, usability, feasibility and viability.', 'n6', 'Four risks to test early: value, usability, feasibility, viability.', ['problem-framing', 'usability-testing'], { due: 3, asked: 4, last: 'right', strength: 0.7 }),
  C('c-mlp', 'Minimum lovable product', 'The smallest release customers will actually love.', 'n6', 'MLP: the minimum lovable product — the smallest release customers will actually love.', ['mlp'], { due: 1, asked: 2, last: 'partial', strength: 0.45 }),
  C('c-5users', 'Testing with 5–8 users', 'Five to eight users reveal most usability problems.', 'n6', 'Test with 5 to 8 real users before committing a sprint.', ['usability-testing'], { due: 5, asked: 3, last: 'right', strength: 0.6 }),
  C('c-ussd-timeout', 'USSD session limits', 'Sessions time out after ~180 seconds; keep flows under 5 screens.', 'n7', 'USSD sessions time out after about 180 seconds, so keep flows under 5 screens.', ['ussd-design'], { due: 1, asked: 3, last: 'right', strength: 0.6 }),
  C('c-ussd-chars', 'USSD screen limits', 'About 160 characters per screen; number options, short labels.', 'n7', 'Each screen is limited to about 160 characters.', ['ussd-design'], { due: 2, asked: 2, last: 'right', strength: 0.55 }),
  C('c-queued-1', 'Cost of delay', 'The value lost for each week a feature is not shipped.', 'n2', 'Queued from your uploaded slides.', ['prio-frameworks'], { due: 3, asked: 0, last: null, strength: 0.1 }, { status: 'queued' }),
  C('c-queued-2', 'Kano model', 'Basic, performance and delight features affect satisfaction differently.', 'n2', 'Queued from your uploaded slides.', ['prio-frameworks'], { due: 4, asked: 0, last: null, strength: 0.1 }, { status: 'queued' }),
];

export const UPLOADS = [
  { id: 'u1', name: 'Week2_Prioritisation.pdf', pages: 18, size: '2.4 MB', status: 'ready', concepts: 9, createdAt: dayISO(-6, 20) },
  { id: 'u2', name: 'Analytics_Webinar_Slides.pptx', pages: 50, size: '11.2 MB', status: 'processing', progress: 62, createdAt: dayISO(0, 8) },
  { id: 'u3', name: 'Scanned_Handout.pdf', pages: 6, size: '4.0 MB', status: 'attention', note: '3 of 6 pages are images only.', createdAt: dayISO(-3, 17) },
];

// ---------- Question bank (generated by AI from concepts; simulated) ----------
export const QUESTIONS = [
  { id: 'q1', concept: 'c-rice', type: 'scenario', level: 'Practitioner', prompt: 'Your highest-RICE item has a Confidence of only 30% because it rests on one customer interview. The second item scores lower but has strong data. What is your best move?', options: [['a', 'Ship the highest score. The formula already accounts for confidence.'], ['b', 'Ship the second item now, and run a cheap test to raise confidence in the first.'], ['c', 'Drop the first item. Low confidence means low value.'], ['d', 'Ask the CEO to decide.']], correct: ['b'], explain: 'RICE helps you compare, but a 30% confidence score is a signal to learn more cheaply before betting the sprint. Ship the well-evidenced item and design a small test for the uncertain one.' },
  { id: 'q2', concept: 'c-oppcost', type: 'mcq', level: 'Practitioner', prompt: 'Your team agrees to build a referral programme this quarter. What is the opportunity cost of that decision?', options: [['a', 'The engineering hours the referral programme takes'], ['b', 'The value of the best alternative the team could have built instead'], ['c', 'The marketing budget for the referral launch'], ['d', 'Any bugs the referral programme introduces']], correct: ['b'], explain: 'Opportunity cost is the value of the next best option you gave up — for example, the failed-payment fix that now waits a quarter. The hours spent are the cost, not the opportunity cost.' },
  { id: 'q3', concept: 'c-jtbd', type: 'mcq', level: 'Foundation', prompt: 'Which statement best separates a job to be done from a persona?', options: [['a', 'A persona describes who the user is; a job describes the progress they are trying to make'], ['b', 'They are the same idea with different names'], ['c', 'A job is a feature list; a persona is a list of pain points'], ['d', 'Personas are for marketing; jobs are for engineering']], correct: ['a'], explain: 'Personas answer who. Jobs answer what progress someone is trying to make in a situation. Two very different people can hire a product for the same job.' },
  { id: 'q4', concept: 'c-vanity', type: 'short', level: 'Foundation', prompt: 'In one or two sentences: how is a North Star metric different from a vanity metric?', criteria: [{ text: 'Says a North Star reflects the value customers get', keys: ['value', 'customer', 'core', 'benefit'] }, { text: 'Explains that a vanity metric can rise without real value', keys: ['without', 'no value', 'look good', 'misleading', 'rise', 'grow', 'doesn'] }], model: 'A North Star captures the value customers actually get (e.g. bills paid successfully). A vanity metric, like total sign-ups, can keep rising even when customers get no value.', explain: 'Strong answers name both sides: what the North Star captures, and why a vanity metric misleads.' },
  { id: 'q5', concept: 'c-input', type: 'multi', level: 'Practitioner', prompt: 'PayLite’s North Star is “bills paid successfully per week”. Which of these are input metrics the team can directly influence?', options: [['a', 'Onboarding completion rate'], ['b', 'Payment success rate'], ['c', 'Company valuation'], ['d', 'Repeat payments within 30 days'], ['e', 'Number of app store reviews']], correct: ['a', 'b', 'd'], explain: 'Onboarding completion, payment success and repeat payments are levers that drive successful weekly payments. Valuation is an outcome far downstream, and review count is a vanity number.' },
  { id: 'q6', concept: 'c-sample', type: 'scenario', level: 'Practitioner', prompt: 'Two days into an A/B test of a simpler KYC step, the treatment group converts 12% better. Your manager wants to ship it today. What do you say?', options: [['a', 'Ship it — 12% is a big win.'], ['b', 'Wait until the planned sample size and duration are reached, and check the guardrail metric.'], ['c', 'Restart the test with more users.'], ['d', 'Stop the test; early results are always wrong.']], correct: ['b'], explain: 'Early results swing a lot. Decide sample size and duration before starting and stick to them, then check guardrails such as fraud rate before shipping.' },
  { id: 'q7', concept: 'c-pi-grid', type: 'mcq', level: 'Foundation', prompt: 'On a power–interest grid, how should you treat the head of compliance, who has high power but low day-to-day interest in your feature?', options: [['a', 'Manage closely with weekly meetings'], ['b', 'Keep satisfied: brief them at key points and before risky decisions'], ['c', 'Keep informed with the monthly newsletter'], ['d', 'Monitor only']], correct: ['b'], explain: 'High power, low interest is “keep satisfied”: they rarely need detail, but they can block you, so involve them before decisions that touch their area.' },
  { id: 'q8', concept: 'c-raci', type: 'mcq', level: 'Foundation', prompt: 'In a RACI chart, how many people should be Accountable for a single decision?', options: [['a', 'Exactly one'], ['b', 'One per team involved'], ['c', 'Everyone who is Responsible'], ['d', 'It depends on the decision']], correct: ['a'], explain: 'One Accountable person per decision. Several people can be Responsible for the work, but accountability that is shared is accountability nobody owns.' },
  { id: 'q9', concept: 'c-disagree', type: 'scenario', level: 'Practitioner', prompt: 'You argued against launching USSD before the app redesign, but leadership chose USSD first. What does “disagree and commit” look like now?', options: [['a', 'Keep raising the objection in every meeting until they change course'], ['b', 'Support the USSD launch fully and share the risks you see in writing once'], ['c', 'Work slowly on USSD to prove your point'], ['d', 'Escalate to the board']], correct: ['b'], explain: 'You made your case. Now commit fully, and record the risks once so they can be revisited with data — not repeated as resistance.' },
  { id: 'q10', concept: 'c-mlp', type: 'short', level: 'Practitioner', prompt: 'What makes a minimum lovable product different from a minimum viable product? Answer in one or two sentences.', criteria: [{ text: 'Says an MLP is still the smallest possible release', keys: ['small', 'minimum', 'least', 'scope'] }, { text: 'Explains it must be loved or delightful, not merely usable', keys: ['love', 'delight', 'enjoy', 'emotion', 'want'] }], model: 'Both are the smallest release you can ship, but an MLP must make customers love it, not just tolerate it.', explain: 'An MVP proves something works; an MLP proves people want to come back to it.' },
  { id: 'q11', concept: 'c-ussd-timeout', type: 'mcq', level: 'Practitioner', prompt: 'A USSD bill payment flow has 7 screens and many users drop at screen 6. What is the most likely cause?', options: [['a', 'Users don’t trust USSD'], ['b', 'The session times out before they finish'], ['c', 'The amount is too high'], ['d', 'The network is always down at screen 6']], correct: ['b'], explain: 'USSD sessions time out after about 180 seconds. Seven screens is too many; aim for five or fewer.' },
  { id: 'q12', concept: 'c-hypothesis', type: 'mcq', level: 'Practitioner', prompt: 'Which is the best-formed hypothesis?', options: [['a', 'The new onboarding will be better.'], ['b', 'If we let new users verify ID after their first bill payment, onboarding completion will rise by 8 points because ID upload is where users hesitate.'], ['c', 'Users want a simpler app.'], ['d', 'We will test the new onboarding with 50% of users.']], correct: ['b'], explain: 'A strong hypothesis names the change, the audience, the metric and the expected movement, and gives the reason.' },
  // Skill-check questions (from the role's skill map, not from notes) — decision 3.11
  { id: 'sk1', concept: null, skill: 'cohorts', fromMap: true, type: 'mcq', level: 'Practitioner', prompt: 'Retention looks flat overall, but January sign-ups retain 40% at week 4 while March sign-ups retain 25%. What does this tell you?', options: [['a', 'Retention is stable'], ['b', 'Newer cohorts are retaining worse; the overall number hides it'], ['c', 'March users are less valuable'], ['d', 'You need more data before saying anything']], correct: ['b'], explain: 'Blended averages hide changes between cohorts. A falling week-4 retention for newer cohorts is an early warning.' },
  { id: 'sk2', concept: null, skill: 'roadmap-comms', fromMap: true, type: 'mcq', level: 'Advanced', prompt: 'Sales keeps promising customers items that are only “being explored” on your roadmap. What is the best fix?', options: [['a', 'Hide the roadmap from sales'], ['b', 'Use Now / Next / Later with clear confidence labels, and brief sales on what they may promise'], ['c', 'Add exact dates to everything'], ['d', 'Ask sales to stop talking about the product']], correct: ['b'], explain: 'Roadmaps should communicate confidence, not dates for everything. Labelling what is committed versus exploratory stops over-promising.' },
];

// ---------- Projects ----------
export const PROJECTS = [
  {
    id: 'p1', status: 'offered', area: 'metr', level: 'Practitioner', hours: 'About 2 hours', submission: 'document',
    title: 'Choose a North Star and three input metrics for a ride-hailing app',
    unlockReason: 'You practised 6 concepts in Metrics and analytics.',
    scenario: 'GoRide is a Lagos ride-hailing startup. Leadership reports “total downloads” every week, but drivers are leaving and repeat rides are falling.',
    ask: 'Recommend one North Star and the input metrics that move it. Explain why downloads is the wrong number.',
    deliverables: ['A North Star metric with a one-paragraph justification', 'Three input metrics, each with the team that owns it', 'A short note to leadership explaining why “total downloads” misleads'],
    rubric: [
      { name: 'North Star choice', weight: '40%', meets: 'Reflects value riders and drivers both get.', exceeds: 'Explains how it resists gaming.' },
      { name: 'Input metrics', weight: '35%', meets: 'Each is controllable and linked to the North Star.', exceeds: 'Shows the metric tree and a guardrail.' },
      { name: 'Leadership note', weight: '25%', meets: 'Clear and respectful.', exceeds: 'Proposes a transition plan for reporting.' },
    ],
    concepts: ['c-northstar', 'c-vanity', 'c-input'], skills: ['north-star', 'input-output'],
  },
  {
    id: 'p2', status: 'in_progress', area: 'prio', level: 'Practitioner', hours: 'About 3 hours', submission: 'document', due: dayISO(4, 23, 59), progress: 40, draftFile: 'PayLite_Q1_Roadmap_v2.pdf',
    title: 'Prioritise the Q1 roadmap for PayLite',
    scenario: 'PayLite is a Lagos bill-payment app with 80,000 monthly users. The team can ship about 6 items next quarter. Sales wants USSD payments, support wants clearer failed-payment messages, and the CEO wants a referral programme.',
    ask: 'Make your recommendation. Explain the trade-off.',
    deliverables: ['A scored list of the 9 candidate items using RICE, with your assumptions stated', 'A recommended Q1 roadmap of up to 6 items', 'A one-page note to the CEO explaining what you left out and why'],
    rubric: [
      { name: 'Sound prioritisation', weight: '40%', meets: 'Applies RICE consistently with stated assumptions.', exceeds: 'Tests how the ranking changes if key assumptions are wrong.' },
      { name: 'Trade-off reasoning', weight: '35%', meets: 'Names what is dropped and the cost of dropping it.', exceeds: 'Proposes a way to reduce that cost, such as a cheap test.' },
      { name: 'Stakeholder communication', weight: '25%', meets: 'The CEO note is clear and respectful of each request.', exceeds: 'Anticipates objections and answers them in advance.' },
    ],
    concepts: ['c-rice', 'c-oppcost', 'c-moscow', 'c-pi-grid'], skills: ['prio-frameworks', 'tradeoffs', 'stakeholder-alignment'],
  },
  {
    id: 'p3', status: 'graded', area: 'metr', level: 'Practitioner', submission: 'document', gradedAt: dayISO(-4, 15), attempts: 1, result: 'Meets', interview: 'available',
    title: 'Diagnose the drop-off in a fintech onboarding funnel',
    scenario: 'A savings app loses 38% of new users between “Create account” and “Verify ID”. Leadership thinks the verification vendor is failing.',
    ask: 'Find where and why users drop off, and recommend a fix you can test.',
    deliverables: ['A funnel diagnosis using the data provided', 'A recommendation with its trade-off', 'How you would test the recommendation'],
    rubric: [
      { name: 'Problem diagnosis', weight: '40%', meets: 'Identifies the biggest drop and a likely cause.', exceeds: 'Separates hesitation from failure.' },
      { name: 'Use of data', weight: '35%', meets: 'Supports the diagnosis with the funnel data.', exceeds: 'Segments by device or channel.' },
      { name: 'Recommendation and trade-off', weight: '25%', meets: 'Recommends a fix, names the trade-off and how to test it.', exceeds: 'Includes guardrails and rollback criteria.' },
    ],
    grade: [
      { name: 'Problem diagnosis', result: 'Exceeds', reason: 'You isolated the ID upload step (a 38% drop) and separated users who abandoned from users who failed verification. That split is what a strong diagnosis needs.', quote: 'Most users who leave at ID upload never attempt it. This is hesitation, not failure.' },
      { name: 'Use of data', result: 'Meets', reason: 'You used the step-by-step numbers correctly. To exceed, compare drop-off across device types, which the dataset included.', quote: 'Step 3 to 4 loses 38% of users, the largest single drop.' },
      { name: 'Recommendation and trade-off', result: 'Not yet', reason: 'Letting users verify ID later is a reasonable fix, and you named the fraud-risk trade-off. The criterion also asks how you would test it, which is missing.', quote: 'Let users explore the app first and verify ID before their first transfer.' },
    ],
    summary: 'Your approach is sound. You found the right drop-off point and backed it with data. Your recommendation needs to say how you would test the fix before rolling it out.',
    nextStep: 'Add a short test plan: which metric would prove the simpler ID step works, and what result would make you roll it back?',
    concepts: ['c-northstar', 'c-hypothesis', 'c-control'], skills: ['funnel', 'problem-framing', 'experiment-design'],
  },
  {
    id: 'p4', status: 'graded', area: 'deliv', level: 'Foundation', submission: 'document', gradedAt: dayISO(-15, 15), attempts: 1, result: 'Exceeds', interview: 'done', inPortfolio: true,
    title: 'Write user stories for a savings goal feature',
    scenario: 'A neobank wants users to set savings goals with automatic weekly transfers.',
    ask: 'Write the stories engineering needs to start, and defend your scope cuts.',
    deliverables: ['8–10 user stories with acceptance criteria', 'A release-1 scope with what you cut and why'],
    rubric: [
      { name: 'Clear user value', weight: '35%', meets: 'Each story states who benefits and why.', exceeds: 'Stories trace back to one user problem.' },
      { name: 'Testable acceptance criteria', weight: '40%', meets: 'Criteria are specific and testable.', exceeds: 'Covers edge cases like failed transfers.' },
      { name: 'Scope and sequencing', weight: '25%', meets: 'Release 1 is coherent.', exceeds: 'Explains sequencing by risk.' },
    ],
    grade: [
      { name: 'Clear user value', result: 'Exceeds', reason: 'Every story traced back to the “saving feels hard to keep up” problem.', quote: 'As a salary earner, I want transfers on payday so saving happens before I spend.' },
      { name: 'Testable acceptance criteria', result: 'Exceeds', reason: 'You covered failed transfers and insufficient balance, which most submissions miss.', quote: 'Given my balance is below the transfer amount, the transfer is skipped and I am notified.' },
      { name: 'Scope and sequencing', result: 'Meets', reason: 'Release 1 is coherent; the sequencing rationale could name risks more explicitly.', quote: 'Goal sharing moves to release 2.' },
    ],
    summary: 'Excellent, user-centred stories with unusually strong edge-case coverage.',
    nextStep: 'Next time, state the main risk each release reduces.',
    concepts: ['c-mlp'], skills: ['user-stories', 'eng-collab'],
  },
];

// ---------- Interviews ----------
export const INTERVIEWS = [
  { id: 'iv1', type: 'project', projectId: 'p4', title: 'Savings goals: project defence', date: dayISO(-14, 19), duration: '11 min 05 s', understanding: 'Strong',
    strongest: '“I cut goal sharing because nobody saves more just because a friend can see the goal — the job is discipline, not status.”',
    deeper: 'Name the risk each release reduces.', communication: 'Clear and well-structured. You answered first, then gave reasons.' },
];

// ---------- WORK: role context, KPIs, log, STAR, implementation ----------
export const WORK_PROFILE = {
  title: 'Associate Product Manager',
  company: 'PayLite',
  companyDesc: 'Lagos-based bill-payment app (airtime, electricity, TV) with about 80,000 monthly users, on Android and USSD.',
  team: 'Payments squad · 5 engineers, 1 designer',
  started: 'November 2025',
  previous: 'Customer support lead at a commercial bank (3 years)',
  reviewName: 'Q4 performance review',
  reviewDate: dayISO(42),
  jd: 'Own the onboarding and payment-success experience. Turn customer insight into prioritised improvements. Work with engineering and design to ship weekly. Report impact on activation and support volume.',
};

export const KPIS = [
  { id: 'k1', name: 'Onboarding completion', goal: 'Raise onboarding completion from 52% to 65% by 31 Dec', start: 52, target: 65, current: 58, unit: '%', direction: 'up', due: 'End of Q4' },
  { id: 'k2', name: 'Failed-payment support tickets', goal: 'Cut failed-payment tickets by 30% (1,240 → 870 a month)', start: 1240, target: 870, current: 1020, unit: '/month', direction: 'down', due: 'End of Q4' },
  { id: 'k3', name: 'USSD beta adoption', goal: 'Get the USSD bill-payment beta to 5,000 active users', start: 0, target: 5000, current: 1800, unit: ' users', direction: 'up', due: 'End of Q1' },
];

const W = (id, daysAgo, text, skills, kpi, result, extra = {}) => ({ id, date: dayISO(-daysAgo, 18, 30), text, skills, kpi, result, ...extra });
export const WORK_LOG = [
  W('w1', 1, 'Ran sprint planning for the payments squad. Used RICE scores to cut the backlog from 14 items to 6; the team agreed in 30 minutes instead of the usual 2 hours.', ['prio-frameworks', 'sprint-planning'], null, 'Planning time cut from 2 hours to 30 minutes.', { project: 'Sprint 22', learnedLink: 'c-rice' }),
  W('w2', 1, 'Reviewed 300 failed-payment tickets from last month and grouped them into 6 causes. 41% were “debited but not credited” for electricity tokens.', ['research-synthesis'], 'k2', null, { followUp: 'What changed because of this analysis? For example, did it change what the team is fixing first?' }),
  W('w3', 2, 'Wrote the brief for clearer failed-payment messages: tell users when the money will be reversed and give a reference number.', ['product-briefs'], 'k2', 'Brief approved by engineering lead; build starts next sprint.'),
  W('w4', 4, 'Watched 6 users try the new onboarding flow. 4 of 6 stopped at the ID upload screen to look for their NIN slip.', ['usability-testing', 'problem-framing'], 'k1', '4 of 6 users hesitated at ID upload — confirmed the drop-off cause.', { learnedLink: 'c-5users' }),
  W('w5', 5, 'Proposed letting users pay their first bill before uploading ID (capped at ₦5,000). Compliance agreed to a 4-week test.', ['stakeholder-alignment', 'experiment-design'], 'k1', 'Got compliance sign-off for a 4-week test.', { learnedLink: 'c-hypothesis' }),
  W('w6', 7, 'Set up the A/B test for deferred ID verification: 50/50 split, 3-week duration, fraud rate as the guardrail.', ['experiment-design', 'ab-basics'], 'k1', 'Test live for 9,000 new users.', { learnedLink: 'c-guardrail' }),
  W('w7', 8, 'Redesigned the USSD bill flow from 7 screens to 4 after sessions kept timing out.', ['ussd-design'], 'k3', 'USSD completion rose from 61% to 78% in the first week.', { learnedLink: 'c-ussd-timeout' }),
  W('w8', 10, 'Disagreed with the CEO on launching referrals before fixing payment failures. Shared the ticket data, then committed to the referral plan for Q1.', ['disagreement', 'stakeholder-alignment'], null, 'Payment-failure fix kept in Q4; referrals scheduled for Q1.'),
  W('w9', 12, 'Onboarding completion moved from 55% to 58% after removing two optional profile fields.', ['funnel'], 'k1', 'Completion +3 points (55% → 58%).'),
  W('w10', 14, 'Paired with the backend engineer to trace why electricity tokens fail after debit. Wrote acceptance criteria for automatic reversal within 24 hours.', ['eng-collab', 'user-stories'], 'k2', 'Auto-reversal shipped; tickets for that cause down 22% in a week.'),
  W('w11', 16, 'Onboarded 400 market traders to the USSD beta through 3 cooperative leaders in Balogun market.', ['ussd-design', 'stakeholder-alignment'], 'k3', '400 new USSD users in 5 days.'),
  W('w12', 19, 'Weekly update to the head of product: one decision needed, two options, my recommendation.', ['exec-updates'], null, 'Decision made in the meeting instead of a follow-up week later.'),
];

export const STORIES = [
  {
    id: 's1', status: 'approved', title: 'Cutting planning time with RICE', entries: ['w1'], skills: ['prio-frameworks', 'sprint-planning'], kpi: null,
    situation: 'Sprint planning for the payments squad routinely took two hours, and the backlog had grown to 14 competing items.',
    task: 'I needed the team to agree on priorities quickly and fairly.',
    action: 'I scored every item with RICE before the meeting and shared the scores and assumptions openly, so debate focused on the assumptions, not opinions.',
    result: 'The team agreed on 6 items in 30 minutes instead of 2 hours, and the RICE sheet became our standard planning input.',
  },
  {
    id: 's2', status: 'draft', title: 'Reducing failed-payment tickets', entries: ['w2', 'w3', 'w10'], skills: ['research-synthesis', 'product-briefs', 'eng-collab'], kpi: 'k2',
    situation: 'Failed-payment tickets were running at 1,240 a month and overwhelming support.',
    task: 'I owned reducing these tickets by 30% this quarter.',
    action: 'I grouped 300 tickets into 6 causes, found 41% were “debited but not credited” electricity tokens, wrote a brief for clearer failure messages, and paired with engineering on automatic reversal within 24 hours.',
    result: 'Tickets for the top cause dropped 22% in the first week. [Add the monthly ticket total once this month closes.]',
  },
  {
    id: 's3', status: 'suggested', title: 'Finding the real onboarding blocker', entries: ['w4', 'w5', 'w6'], skills: ['usability-testing', 'stakeholder-alignment', 'experiment-design'], kpi: 'k1',
    situation: 'Onboarding completion was stuck at 52%, and leadership blamed the ID verification vendor.',
    task: 'I needed to find the real cause and get approval to test a fix.',
    action: 'I watched 6 users onboard (4 stopped at ID upload to find their NIN slip), proposed paying the first bill before ID upload with a ₦5,000 cap, won compliance sign-off, and set up a 50/50 A/B test with fraud rate as the guardrail.',
    result: '[Add the test result when it finishes in 2 weeks.]',
  },
];

export const IMPLEMENTATIONS = [
  {
    id: 'im1', status: 'new', kpi: 'k1', concepts: ['c-sample', 'c-guardrail'], title: 'Decide your stopping rule before the deferred-ID test ends',
    why: 'You learned that early A/B results swing and that tests need a planned sample size. Your deferred-ID test is live and your manager will be tempted to call it early.',
    steps: ['Write down now: the sample size and end date (3 weeks, about 9,000 users).', 'Agree with your manager that the decision is made only at the end date.', 'Pre-agree the guardrail threshold: if fraud rate rises above 0.4%, the test stops.', 'Share this as a 3-line note in the squad channel.'],
    impact: 'Protects your onboarding completion KPI from a false win that might reverse later.',
  },
  {
    id: 'im2', status: 'planned', kpi: 'k2', concepts: ['c-jtbd', 'c-switch'], title: 'Interview 5 users who stopped paying electricity bills on PayLite',
    why: 'You learned switch interviews in your JTBD notes. Some users who raise failed-payment tickets leave for a competitor — you don’t yet know what job they hire the competitor for.',
    steps: ['Pull 20 users with a failed electricity payment who haven’t paid since.', 'Book 5 short calls with an airtime credit as thanks.', 'Ask about the moment they switched: first thought, looking, deciding.', 'Log the top 3 jobs in your work log.'],
    impact: 'Could reveal fixes that reduce tickets and churn together.',
  },
  {
    id: 'im3', status: 'tried', kpi: 'k3', concepts: ['c-ussd-timeout', 'c-ussd-chars'], title: 'Cut the USSD bill flow to 5 screens or fewer',
    why: 'You learned that USSD sessions time out after about 180 seconds. The 7-screen flow was losing users at screen 6.',
    steps: ['Merge biller selection and account entry.', 'Number options and shorten labels below 160 characters.', 'Confirm the amount once, on the last screen.'],
    impact: 'Higher USSD completion moves your beta adoption KPI.',
    outcome: 'Done — 7 screens to 4. Completion rose from 61% to 78% (logged on your work log).', outcomeEntry: 'w7',
  },
  {
    id: 'im4', status: 'new', kpi: 'k1', concepts: ['c-input', 'c-northstar'], title: 'Build a metric tree for onboarding completion',
    why: 'You’re working on input metrics, and your onboarding KPI is an output. A metric tree shows your team which lever to pull next.',
    steps: ['Put “onboarding completion” at the top.', 'Break it into step conversion: sign-up → phone verified → first bill → ID uploaded.', 'Mark which team owns each step.', 'Pick the one input metric your squad will move next sprint.'],
    impact: 'Makes your weekly update show exactly which input you moved.',
  },
];

export const DOCUMENTS = [
  { id: 'd1', type: 'cv', title: 'CV bullet points', createdAt: dayISO(-9, 20) },
];

export const NOTIFICATIONS = [
  { id: 'nt1', time: dayISO(0, 19, 30), text: 'Your five-minute practice is ready.', kind: 'Practice', to: '/app/practice', unread: true },
  { id: 'nt2', time: dayISO(0, 18, 0), text: 'Apply what you learned: decide your stopping rule before the deferred-ID test ends.', kind: 'Apply', to: '/app/work?tab=apply', unread: true },
  { id: 'nt3', time: dayISO(-1, 9, 0), text: 'New project: choose a North Star and three input metrics for a ride-hailing app.', kind: 'Project', to: '/app/projects', unread: true },
  { id: 'nt4', time: dayISO(-2, 18, 0), text: 'We drafted a STAR story from 3 work entries: “Finding the real onboarding blocker”.', kind: 'Work', to: '/app/work?tab=stories', unread: false },
  { id: 'nt5', time: dayISO(-4, 15, 5), text: 'Your grade is ready: Meets. See the reasoning for each criterion.', kind: 'Grade', to: '/app/projects/p3', unread: false },
];

export const PORTFOLIO = {
  published: false,
  slug: 'tolu-adeyemi',
  headline: 'Associate PM at a Lagos fintech, formerly customer support. I turn customer pain into shipped fixes — and I practise every day.',
  projects: ['p4', 'p3'],
  stories: ['s1'],
  highlight: true,
  redact: true,
};

export const PRACTICE_DAYS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13]; // days ago with a completed session

export const ADMIN = {
  roles: [
    { name: 'Product Manager', learners: 312, status: 'Reviewed', version: 3, flags: 2 },
    { name: 'Frontend Engineer', learners: 188, status: 'Reviewed', version: 2, flags: 0 },
    { name: 'Data Analyst', learners: 141, status: 'AI-generated', version: 1, flags: 5 },
    { name: 'Business Development Officer', learners: 37, status: 'AI-generated', version: 1, flags: 1 },
    { name: 'Product Marketing Manager', learners: 29, status: 'AI-generated', version: 1, flags: 0 },
    { name: 'Social Media Manager', learners: 18, status: 'AI-generated', version: 1, flags: 3 },
  ],
  flags: [
    { role: 'Data Analyst', skill: 'Cold outreach', count: 14, pct: '10%', reason: 'Not part of this role' },
    { role: 'Social Media Manager', skill: 'Brand identity design', count: 4, pct: '22%', reason: 'Wrong level' },
    { role: 'Product Manager', skill: 'Kanban metrics', count: 3, pct: '1%', reason: 'Duplicate of another skill' },
  ],
  suggestions: [{ role: 'Product Manager', skill: 'USSD product design', learners: 6, note: 'Added by 6 learners in Nigeria' }],
  invites: [
    { code: 'ALX-W1', label: 'ALX cohort · wave 1', used: 47, max: 50, active: true },
    { code: 'PM-COMMUNITY', label: 'Lagos PM community', used: 31, max: 40, active: true },
    { code: 'PITCH-DEMO', label: 'Pitch judges', used: 3, max: 100, active: true },
  ],
  requests: [
    { name: 'Ifeoma N.', role: 'Data Analyst', source: 'LinkedIn', date: dayISO(-1) },
    { name: 'Kunle A.', role: 'Business Development Officer', source: 'Friend', date: dayISO(-2) },
  ],
};
