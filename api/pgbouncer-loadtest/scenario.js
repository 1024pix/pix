/* eslint-disable n/no-missing-import, no-undef -- k6 runtime: modules and __ENV are provided by the k6 binary, not resolvable by Node */
import { check, sleep } from 'k6'; // check: assert on a response without stopping the VU; sleep: pause the VU (think-time)
import http from 'k6/http'; // the k6 HTTP client used fory every request in the journey
import { Counter, Rate, Trend } from 'k6/metrics'; // custom-metric constructors: Counter (sum), Rate (% true), Trend (avg/med/p95)

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4200'; // target API root; override per env (e.g. https://api.recette.pix.fr)
const CAMPAIGN_CODE = __ENV.CAMPAIGN_CODE || 'MUVKTG734'; // campaign the journey enrolls into; VUTGBG278 is the heavy 40-challenge one
const SLEEP_MS = Number(__ENV.SLEEP_MS || 200); // think-time between steps in ms; 0 removes pacing to stress the server harder
const MAX_CHALLENGES = Number(__ENV.MAX_CHALLENGES || 50); // safety cap on the answer loop so a broken assessment can't loop forever

const RUN_NAME = __ENV.RUN_NAME;
if (!RUN_NAME) {
  throw new Error('RUN_NAME is required (it names results/<name>-summary.json and tags every metric)');
}

const _host = BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, ''); // strip scheme and path → bare host (e.g. api.recette.pix.fr)
const FWD_PROTO = __ENV.FWD_PROTO || (BASE_URL.startsWith('https') ? 'https' : 'http'); // forwarded scheme, inferred from BASE_URL
const FWD_HOST = __ENV.FWD_HOST || _host.replace(/^api/, 'app'); // forwarded host, api.* → app.* (the front the token is minted for)
const forwardedHeaders = {
  'x-forwarded-proto': FWD_PROTO,
  'x-forwarded-host': FWD_HOST,
}; // spread into every request's headers

const STEP_NAMES = ['token', 'users_me', 'verified_code', 'campaign', 'participation', 'assessment', 'answer'];

const scenarioCompleted = new Rate('scenario_completed'); // % of journeys that ran fully to the end (any step failure → false)
const challengesAnswered = new Trend('challenges_per_scenario'); // distribution of how many challenges each journey answered
const scenarioDuration = new Trend('scenario_duration', true); // wall-clock duration of a full journey (true = render as time)
const stepFailures = new Counter('step_failures'); // running tally of failed steps, tagged by step name + HTTP status

const smokeScenario = {
  campaign_journey: {
    executor: 'per-vu-iterations',
    vus: 1,
    iterations: 1,
    maxDuration: '2m',
  },
};

const STEPS = (__ENV.STEPS || '2,4,6,8,12,16').split(',').map(Number); // journeys/s plateaus, in order
const STEP_RAMP = __ENV.STEP_RAMP || '30s'; // transition between two plateaus (kept short: it is not a measurement window)
const STEP_HOLD = __ENV.STEP_HOLD || '4m'; // how long each plateau is held — this is the measurement window

const rampStages = [];
for (const rate of STEPS) {
  rampStages.push({ target: rate, duration: STEP_RAMP }); // climb to the plateau
  rampStages.push({ target: rate, duration: STEP_HOLD }); // hold it long enough to average over
}

const rampScenario = {
  campaign_journey: {
    executor: 'ramping-arrival-rate',
    startRate: STEPS[0], // start at the first plateau so the run opens flat, with no discontinuity
    timeUnit: '1s', // unit for startRate and every stage target
    preAllocatedVUs: Number(__ENV.PRE_VUS || 200), // VUs ready before the run so allocation lag isn't measured
    maxVUs: Number(__ENV.MAX_VUS || 4000),
    stages: rampStages,
  },
};

const thresholds = {
  http_req_failed: ['rate<0.01'], // fail the run if more than 1% of requests error
  http_req_duration: ['p(95)<2000'], // the actual SLO, aggregated over every step
  dropped_iterations: ['count<10'],
  scenario_completed: ['rate>0.95'],
};
for (const step of STEP_NAMES) {
  thresholds[`http_req_duration{step:${step}}`] = ['p(95)<60000'];
}

export const options = {
  scenarios: __ENV.SMOKE ? smokeScenario : rampScenario, // SMOKE=1 → single end-to-end journey (script validation)
  thresholds,
  tags: { run: RUN_NAME }, // stamped on every metric so external outputs can separate two runs
  discardResponseBodies: true,
};

function jsonApiHeaders(token) {
  return {
    ...forwardedHeaders, // always include the forged x-forwarded-* headers the API requires
    accept: 'application/vnd.api+json', // JSON:API media type the Pix API serves
    'accept-language': 'fr,en;q=0.9', // prefer French responses
    authorization: `Bearer ${token}`, // bearer the access token obtained at step 1
  };
}

/** Asserts a 2xx and records the failure against its step name. Returns whether the step passed. */
function expectOk(response, step) {
  const ok = check(response, { [`${step}: 2xx`]: (r) => r.status >= 200 && r.status < 300 }, { step }); // assert 2xx, tagged by step

  if (!ok) {
    stepFailures.add(1, { step, status: String(response.status) }); // record which step failed and with what status
  }

  return ok;
}

function expectJson(response, step) {
  if (!expectOk(response, step)) return null; // status already recorded as a failure

  try {
    return response.json(); // parse the JSON body for the caller to use
  } catch {
    stepFailures.add(1, { step, status: 'unparsable-body' }); // 2xx but body wasn't JSON → still a failure
    return null; // signal failure to the caller
  }
}

function pause() {
  if (SLEEP_MS <= 0) return; // 0 removes pacing entirely

  sleep((SLEEP_MS / 1000) * (0.5 + Math.random())); // sleep takes seconds
}

export default function () {
  const startedAt = Date.now(); // timestamp used to compute the full-journey duration at the end
  let challenges = 0; // number of challenges answered so far in this journey

  // 1. Anonymous user + access token
  const tokenResponse = http.post(
    `${BASE_URL}/api/token/anonymous`, // endpoint that mints an anonymous access token for a campaign
    { campaign_code: CAMPAIGN_CODE, lang: 'fr' }, // form body: which campaign, which language
    {
      headers: {
        ...forwardedHeaders,
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      }, // form POST headers
      responseType: 'text', // we need the body: it carries the access token
      tags: { step: 'token' }, // tag every metric from this request with step=token
    },
  );
  const tokenBody = expectJson(tokenResponse, 'token'); // validate + parse; null if it failed
  if (!tokenBody) return scenarioCompleted.add(false); // abort the journey and mark it incomplete

  const token = tokenBody.access_token; // extract the bearer token for subsequent requests
  const headers = jsonApiHeaders(token); // build the shared JSON:API headers with that token
  pause(); // think-time before the next step

  // 2. Current user
  const meResponse = http.get(`${BASE_URL}/api/users/me`, {
    headers,
    tags: { step: 'users_me' },
  }); // fetch the (anonymous) user
  if (!expectOk(meResponse, 'users_me')) return scenarioCompleted.add(false); // abort on failure
  pause(); // think-time

  // 3. Verify the campaign code
  const codeResponse = http.get(`${BASE_URL}/api/verified-codes/${CAMPAIGN_CODE}`, {
    headers, // authenticated JSON:API headers
    tags: { step: 'verified_code' }, // tag metrics with step=verified_code
  });
  if (!expectOk(codeResponse, 'verified_code')) return scenarioCompleted.add(false); // abort on failure
  pause(); // think-time

  // 4. Fetch the campaign
  const campaignResponse = http.get(`${BASE_URL}/api/campaigns?filter%5Bcode%5D=${CAMPAIGN_CODE}`, {
    headers, // authenticated JSON:API headers
    responseType: 'text', // we need the body: it carries the campaign id
    tags: { step: 'campaign' }, // tag metrics with step=campaign
  });
  const campaignBody = expectJson(campaignResponse, 'campaign'); // validate + parse
  if (!campaignBody) return scenarioCompleted.add(false); // abort on failure

  const campaignId = campaignBody.data?.id; // pull the campaign id out of the JSON:API payload
  if (!campaignId) {
    stepFailures.add(1, { step: 'campaign', status: 'no-campaign-id' }); // 2xx but no id → treat as a step failure
    return scenarioCompleted.add(false); // abort on failure
  }
  pause(); // think-time

  // 5. Create the participation
  const participationPayload = JSON.stringify({
    data: {
      type: 'campaign-participations', // JSON:API resource type being created
      attributes: {
        'is-shared': false, // participation not yet shared with the org
        'is-reset': false, // not a reset of a previous participation
        'created-at': null, // let the server set timestamps
        'shared-at': null, // idem
        'deleted-at': null, // idem
        'participant-external-id': null, // no external id for anonymous journeys
      },
      relationships: {
        campaign: { data: { type: 'campaigns', id: campaignId } },
      }, // link to the campaign fetched above
    },
  });
  const participationResponse = http.post(`${BASE_URL}/api/campaign-participations`, participationPayload, {
    headers: { ...headers, 'content-type': 'application/vnd.api+json' }, // JSON:API write headers
    responseType: 'text', // we need the body: it carries the assessment link
    tags: { step: 'participation' }, // tag metrics with step=participation
  });
  const participationBody = expectJson(participationResponse, 'participation'); // validate + parse
  if (!participationBody) return scenarioCompleted.add(false); // abort on failure

  // The assessment is only reachable through its related link, e.g. "/api/assessments/100380268"
  const assessmentLink = participationBody.data?.relationships?.assessment?.links?.related; // related link to the assessment
  const assessmentId = assessmentLink?.split('/').pop(); // last path segment of that link is the assessment id
  if (!assessmentId) {
    stepFailures.add(1, {
      step: 'participation',
      status: 'no-assessment-link',
    }); // no link → step failure
    return scenarioCompleted.add(false); // abort on failure
  }
  pause(); // think-time

  // 6 & 7. Answer challenges until the assessment stops handing out a next one
  while (challenges < MAX_CHALLENGES) {
    const assessmentResponse = http.get(`${BASE_URL}/api/assessments/${assessmentId}`, {
      headers, // authenticated JSON:API headers
      responseType: 'text', // we need the body: it carries the next-challenge id
      tags: { step: 'assessment' }, // tag metrics with step=assessment
    });
    const assessmentBody = expectJson(assessmentResponse, 'assessment'); // validate + parse the assessment state
    if (!assessmentBody) return scenarioCompleted.add(false); // abort on failure

    const challengeId = assessmentBody.data?.relationships?.['next-challenge']?.data?.id; // id of the next challenge, if any
    if (!challengeId) break; // no next challenge → the assessment is over, leave the loop
    pause(); // think-time before answering

    const answerPayload = JSON.stringify({
      data: {
        type: 'answers', // JSON:API resource type being created
        attributes: {
          value: '#ABAND#', // sentinel value meaning "abandon/skip" — we don't try to answer correctly
          result: null, // let the server compute the result
          'result-details': null, // idem
          timeout: null, // no timeout reported
          'focused-out': false, // the tab stayed focused
        },
        relationships: {
          assessment: { data: { type: 'assessments', id: assessmentId } }, // link the answer to this assessment
          challenge: { data: { type: 'challenges', id: challengeId } }, // link the answer to the current challenge
        },
      },
    });
    const answerResponse = http.post(`${BASE_URL}/api/answers`, answerPayload, {
      headers: {
        ...headers,
        'content-type': 'application/vnd.api+json',
        'cache-control': 'no-cache',
      }, // JSON:API write, no caching
      tags: { step: 'answer' }, // tag metrics with step=answer
    });
    if (!expectOk(answerResponse, 'answer')) return scenarioCompleted.add(false); // abort on failure

    challenges += 1; // count this answered challenge
    pause(); // think-time before fetching the next assessment state
  }

  if (challenges >= MAX_CHALLENGES) {
    stepFailures.add(1, {
      step: 'assessment',
      status: 'max-challenges-reached',
    }); // hit the cap → flag it (assessment never ended)
  }

  challengesAnswered.add(challenges); // record how many challenges this journey answered
  scenarioDuration.add(Date.now() - startedAt); // record the full-journey wall-clock duration
  scenarioCompleted.add(true); // this journey reached the end without aborting
}

export function handleSummary(data) {
  // Wall-clock bounds of the run, so the Grafana / Datadog window can be selected from the summary
  // instead of being reconstructed by hand afterwards.
  const endedAt = Date.now();
  const durationMs = data.state?.testRunDurationMs ?? null;
  const window = {
    startedAt: durationMs === null ? null : new Date(endedAt - durationMs).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationMs,
  };

  return {
    stdout: textSummary(data, window), // print the compact summary to the terminal
    [`results/${RUN_NAME}-summary.json`]: JSON.stringify(
      {
        runName: RUN_NAME,
        baseUrl: BASE_URL,
        campaignCode: CAMPAIGN_CODE,
        window,
        // Everything needed to replay this exact run. The parameters used to live only in the
        // operator's shell history, which made a series of runs impossible to reproduce.
        config: {
          scenario: __ENV.SMOKE ? 'smoke' : 'ramp',
          steps: STEPS,
          stepRamp: STEP_RAMP,
          stepHold: STEP_HOLD,
          preAllocatedVUs: rampScenario.campaign_journey.preAllocatedVUs,
          maxVUs: rampScenario.campaign_journey.maxVUs,
          sleepMs: SLEEP_MS,
          maxChallenges: MAX_CHALLENGES,
        },
        metrics: data.metrics, // run context + all metrics
      },
      null,
      2, // pretty-print with 2-space indent
    ),
  };
}

/** Minimal terminal summary — avoids pulling k6's remote summary helper at runtime. */
function textSummary(data, window) {
  const lines = [`\n  run: ${RUN_NAME}  →  ${BASE_URL}  (campaign ${CAMPAIGN_CODE})`]; // header line with run context
  lines.push(`  window: ${window.startedAt ?? '?'} → ${window.endedAt}\n`); // the window to select in Grafana

  for (const [name, metric] of Object.entries(data.metrics)) {
    // iterate over every metric k6 collected
    const v = metric.values; // the computed values (avg/med/p95/rate/count… depending on type)
    const label = name.padEnd(38); // pad the metric name so columns line up (sub-metric names are long)

    if (metric.type === 'trend') {
      // `contains: 'time'` marks a duration; anything else (e.g. challenge counts) is a plain number.
      const unit = metric.contains === 'time' ? 'ms' : ''; // append ms only for time-based trends
      const med = v.med ?? v['p(50)']; // median under either key name
      const p95 = v['p(95)'] ?? v.p95; // 95th percentile under either key name
      lines.push(
        `  ${label} avg=${v.avg?.toFixed(1)}${unit}  med=${med?.toFixed(1)}${unit}  p95=${p95?.toFixed(1)}${unit}  max=${v.max?.toFixed(1)}${unit}`, // one line per trend
      );
    } else if (metric.type === 'rate') {
      const total = (v.passes ?? 0) + (v.fails ?? 0); // total samples behind the rate
      lines.push(`  ${label} ${(v.rate * 100).toFixed(2)}%  (${v.passes ?? 0}/${total})`); // percentage + passes/total
    } else if (metric.type === 'counter') {
      lines.push(`  ${label} ${v.count}  (${v.rate?.toFixed(1)}/s)`); // total count + per-second rate
    } else if (metric.type === 'gauge') {
      lines.push(`  ${label} ${v.value}`); // latest gauge value
    }
  }

  // Validity check, spelled out rather than left to be spotted in the metric list above.
  const dropped = data.metrics.dropped_iterations?.values?.count ?? 0;
  if (dropped > 0) {
    const allocated = data.metrics.vus_max?.values?.max ?? '?';
    lines.push(
      `\n  ⚠ dropped_iterations=${dropped} — k6 ran out of VUs: the arrival rate above is the generator's, not the API's.`,
      `    VUs allocated at peak: ${allocated}. Raise PRE_VUS, not MAX_VUS — allocation lag drops iterations well before the ceiling is reached. Then re-run.`,
    );
  }

  return lines.join('\n') + '\n'; // join all lines into the final printed block
}

/* eslint-enable n/no-missing-import, no-undef */
