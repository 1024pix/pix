/* eslint-disable n/no-missing-import, no-undef -- k6 runtime: modules and __ENV are provided by the k6 binary, not resolvable by Node */
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4200';
const CAMPAIGN_CODE = __ENV.CAMPAIGN_CODE || 'MUVKTG734';
const RUN_NAME = __ENV.RUN_NAME || 'run';
const SLEEP_MS = Number(__ENV.SLEEP_MS || 200);
const MAX_CHALLENGES = Number(__ENV.MAX_CHALLENGES || 50);

// Custom metrics
const scenarioCompleted = new Rate('scenario_completed');
const challengesAnswered = new Trend('challenges_per_scenario');
const scenarioDuration = new Trend('scenario_duration', true);
const stepFailures = new Counter('step_failures');

// SMOKE=1 runs a single journey end-to-end — use it to validate the script before a real ramp.
const smokeScenario = {
  campaign_journey: { executor: 'per-vu-iterations', vus: 1, iterations: 1, maxDuration: '2m' },
};

// STEADY=1 holds a low, constant arrival rate to measure PgBouncer's *pure overhead* in a
// non-saturated regime. Keep the load well under the knee (small RATE, short iterations via
// MAX_CHALLENGES=5 / SLEEP_MS=0) so no queueing masks the few-ms per-query cost. The signal is
// the delta of avg/med http_req_waiting between toggle 0 (direct) and toggle 100 (pooled).
// Verify dropped_iterations stays at 0 — otherwise the run is saturated and invalid.
const steadyScenario = {
  campaign_journey: {
    executor: 'constant-arrival-rate',
    rate: Number(__ENV.RATE || 4),
    timeUnit: '1s',
    duration: __ENV.DURATION || '3m',
    preAllocatedVUs: Number(__ENV.PRE_VUS || 50),
    maxVUs: Number(__ENV.MAX_VUS || 200),
  },
};

// The default ramp pushes to saturation to find the knee / connection-exhaustion regime.
const rampScenario = {
  campaign_journey: {
    executor: 'ramping-arrival-rate',
    startRate: 1,
    timeUnit: '1s',
    // A scenario is ~86 requests and runs ~20s, so the 20/s peak needs ~400 concurrent VUs.
    // maxVUs is set well above that: running out shows up as dropped_iterations, which
    // masquerades as an API limit when it is really a load-generator limit.
    preAllocatedVUs: 200,
    maxVUs: 2000,
    stages: [
      { target: 2, duration: '1m' },
      { target: 5, duration: '2m' },
      { target: 10, duration: '2m' },
      { target: 20, duration: '2m' },
      { target: 0, duration: '30s' },
    ],
  },
};

function selectScenario() {
  if (__ENV.SMOKE) return smokeScenario;
  if (__ENV.STEADY) return steadyScenario;
  return rampScenario;
}

export const options = {
  scenarios: selectScenario(),
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
    scenario_completed: ['rate>0.95'],
  },
};

function jsonApiHeaders(token) {
  return {
    accept: 'application/vnd.api+json',
    'accept-language': 'fr,en;q=0.9',
    authorization: `Bearer ${token}`,
  };
}

/**
 * Validates a response and records the failure against its step name.
 * Returns the parsed body, or null when the step failed (caller aborts the iteration).
 */
function expectOk(response, step) {
  const ok = check(response, { [`${step}: 2xx`]: (r) => r.status >= 200 && r.status < 300 }, { step });

  if (!ok) {
    stepFailures.add(1, { step, status: String(response.status) });
    return null;
  }

  try {
    return response.json();
  } catch {
    stepFailures.add(1, { step, status: 'unparsable-body' });
    return null;
  }
}

function pause() {
  if (SLEEP_MS > 0) sleep(SLEEP_MS / 1000);
}

export default function () {
  const startedAt = Date.now();
  let challenges = 0;

  // 1. Anonymous user + access token
  const tokenResponse = http.post(
    `${BASE_URL}/api/token/anonymous`,
    { campaign_code: CAMPAIGN_CODE, lang: 'fr' },
    {
      headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      tags: { step: 'token' },
    },
  );
  const tokenBody = expectOk(tokenResponse, 'token');
  if (!tokenBody) return scenarioCompleted.add(false);

  const token = tokenBody.access_token;
  const headers = jsonApiHeaders(token);
  pause();

  // 2. Current user
  const meResponse = http.get(`${BASE_URL}/api/users/me`, { headers, tags: { step: 'users_me' } });
  if (!expectOk(meResponse, 'users_me')) return scenarioCompleted.add(false);
  pause();

  // 3. Verify the campaign code
  const codeResponse = http.get(`${BASE_URL}/api/verified-codes/${CAMPAIGN_CODE}`, {
    headers,
    tags: { step: 'verified_code' },
  });
  if (!expectOk(codeResponse, 'verified_code')) return scenarioCompleted.add(false);
  pause();

  // 4. Fetch the campaign
  const campaignResponse = http.get(`${BASE_URL}/api/campaigns?filter%5Bcode%5D=${CAMPAIGN_CODE}`, {
    headers,
    tags: { step: 'campaign' },
  });
  const campaignBody = expectOk(campaignResponse, 'campaign');
  if (!campaignBody) return scenarioCompleted.add(false);

  const campaignId = campaignBody.data?.id;
  if (!campaignId) {
    stepFailures.add(1, { step: 'campaign', status: 'no-campaign-id' });
    return scenarioCompleted.add(false);
  }
  pause();

  // 5. Create the participation
  const participationPayload = JSON.stringify({
    data: {
      type: 'campaign-participations',
      attributes: {
        'is-shared': false,
        'is-reset': false,
        'created-at': null,
        'shared-at': null,
        'deleted-at': null,
        'participant-external-id': null,
      },
      relationships: { campaign: { data: { type: 'campaigns', id: campaignId } } },
    },
  });
  const participationResponse = http.post(`${BASE_URL}/api/campaign-participations`, participationPayload, {
    headers: { ...headers, 'content-type': 'application/vnd.api+json' },
    tags: { step: 'participation' },
  });
  const participationBody = expectOk(participationResponse, 'participation');
  if (!participationBody) return scenarioCompleted.add(false);

  // The assessment is only reachable through its related link, e.g. "/api/assessments/100380268"
  const assessmentLink = participationBody.data?.relationships?.assessment?.links?.related;
  const assessmentId = assessmentLink?.split('/').pop();
  if (!assessmentId) {
    stepFailures.add(1, { step: 'participation', status: 'no-assessment-link' });
    return scenarioCompleted.add(false);
  }
  pause();

  // 6 & 7. Answer challenges until the assessment stops handing out a next one
  while (challenges < MAX_CHALLENGES) {
    const assessmentResponse = http.get(`${BASE_URL}/api/assessments/${assessmentId}`, {
      headers,
      tags: { step: 'assessment' },
    });
    const assessmentBody = expectOk(assessmentResponse, 'assessment');
    if (!assessmentBody) return scenarioCompleted.add(false);

    const challengeId = assessmentBody.data?.relationships?.['next-challenge']?.data?.id;
    if (!challengeId) break; // assessment is over
    pause();

    const answerPayload = JSON.stringify({
      data: {
        type: 'answers',
        attributes: {
          value: '#ABAND#',
          result: null,
          'result-details': null,
          timeout: null,
          'focused-out': false,
        },
        relationships: {
          assessment: { data: { type: 'assessments', id: assessmentId } },
          challenge: { data: { type: 'challenges', id: challengeId } },
        },
      },
    });
    const answerResponse = http.post(`${BASE_URL}/api/answers`, answerPayload, {
      headers: { ...headers, 'content-type': 'application/vnd.api+json', 'cache-control': 'no-cache' },
      tags: { step: 'answer' },
    });
    if (!expectOk(answerResponse, 'answer')) return scenarioCompleted.add(false);

    challenges += 1;
    pause();
  }

  if (challenges >= MAX_CHALLENGES) {
    stepFailures.add(1, { step: 'assessment', status: 'max-challenges-reached' });
  }

  challengesAnswered.add(challenges);
  scenarioDuration.add(Date.now() - startedAt);
  scenarioCompleted.add(true);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data),
    [`results/${RUN_NAME}-summary.json`]: JSON.stringify(
      { runName: RUN_NAME, baseUrl: BASE_URL, campaignCode: CAMPAIGN_CODE, metrics: data.metrics },
      null,
      2,
    ),
  };
}

/** Minimal terminal summary — avoids pulling k6's remote summary helper at runtime. */
function textSummary(data) {
  const lines = [`\n  run: ${RUN_NAME}  →  ${BASE_URL}  (campaign ${CAMPAIGN_CODE})\n`];

  for (const [name, metric] of Object.entries(data.metrics)) {
    const v = metric.values;
    const label = name.padEnd(28);

    if (metric.type === 'trend') {
      // `contains: 'time'` marks a duration; anything else (e.g. challenge counts) is a plain number.
      const unit = metric.contains === 'time' ? 'ms' : '';
      const med = v.med ?? v['p(50)'];
      const p95 = v['p(95)'] ?? v.p95;
      lines.push(
        `  ${label} avg=${v.avg?.toFixed(1)}${unit}  med=${med?.toFixed(1)}${unit}  p95=${p95?.toFixed(1)}${unit}  max=${v.max?.toFixed(1)}${unit}`,
      );
    } else if (metric.type === 'rate') {
      const total = (v.passes ?? 0) + (v.fails ?? 0);
      lines.push(`  ${label} ${(v.rate * 100).toFixed(2)}%  (${v.passes ?? 0}/${total})`);
    } else if (metric.type === 'counter') {
      lines.push(`  ${label} ${v.count}  (${v.rate?.toFixed(1)}/s)`);
    } else if (metric.type === 'gauge') {
      lines.push(`  ${label} ${v.value}`);
    }
  }

  return lines.join('\n') + '\n';
}

/* eslint-enable n/no-missing-import, no-undef */
