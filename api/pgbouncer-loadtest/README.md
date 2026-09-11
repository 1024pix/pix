# pgbouncer load test

k6 load test replaying a full user journey against the Pix API, to measure behaviour
under connection-pooler pressure.

It is a spike, not part of the repo. The k6 scripts carry a `/* eslint-disable */` header so `npm run lint`
in `api/` stays green without touching shared config.

## Scenario

One iteration = one anonymous user doing a whole campaign:

1. `POST /api/token/anonymous` — creates an anonymous user, returns an access token
2. `GET /api/users/me`
3. `GET /api/verified-codes/{code}`
4. `GET /api/campaigns?filter[code]={code}` → campaign id
5. `POST /api/campaign-participations` → assessment id (from the `related` link)
6. `GET /api/assessments/{id}` → next challenge id
7. `POST /api/answers` with `#ABAND#` — then back to 6, until `next-challenge` is `null`

Every challenge is **abandoned** (`#ABAND#`). This skips only the answer validator
(`Examiner.js`, pure in-memory CPU); persisting the answer, computing knowledge elements
and SMART_RANDOM's next-challenge pick all still hit the database, so the load is
representative for a pooler test.

Measured against campaign `MUVKTG734`: **40 challenges, 86 HTTP requests per scenario.**

## Running

```sh
# validate the script end-to-end (single iteration, ~7s)
SMOKE=1 k6 run scenario.js

# full ramp (~7.5 min)
RUN_NAME=pgbouncer-on k6 run scenario.js
```

### Environment variables

| Variable         | Default                 | Notes                                             |
| ---------------- | ----------------------- | ------------------------------------------------- |
| `BASE_URL`       | `http://localhost:4200` | No trailing slash; `/api/...` is appended         |
| `CAMPAIGN_CODE`  | `MUVKTG734`             | Must exist in the target environment              |
| `RUN_NAME`       | `run`                   | Names the output file — set it per run to compare |
| `SLEEP_MS`       | `200`                   | Pause between requests                            |
| `MAX_CHALLENGES` | `50`                    | Runaway guard on the challenge loop               |
| `SMOKE`          | unset                   | `1` → single iteration instead of the ramp        |

### ⚠️ `localhost:4200` is the Ember dev server, not the API

Port 4200 is `mon-pix` (`ember serve --proxy http://localhost:3000`). It is fine for
validating the script, but **do not benchmark through it** — that single-threaded Node
proxy saturates long before the API does, so you would be measuring the proxy.

For any real measurement point `BASE_URL` at the API directly:

```sh
BASE_URL=http://localhost:3000 RUN_NAME=direct k6 run scenario.js
```

Routes carry the `/api` prefix natively, so the paths are identical either way.

## Load profile

`ramping-arrival-rate` — an **open** model: new scenarios start at the configured rate
regardless of how slow the API becomes, so queueing collapse is visible. A closed model
(fixed VUs) would hide it by simply slowing down.

```
startRate 1/s → 2/s (1m) → 5/s (2m) → 10/s (2m) → 20/s (2m) → 0 (30s)
```

At the 20/s peak that is roughly **1720 req/s** and, at `SLEEP_MS=200`, about **400
concurrent VUs** (20s per scenario × 20/s). `maxVUs` is 2000 to keep headroom: exhausting
the VU pool produces `dropped_iterations`, which looks like an API limit but is really a
load-generator limit. **Check `dropped_iterations` is 0 before trusting any result.**

Thresholds are report-only (no `abortOnFail`) — breaching them at the top stage is the
result you are looking for, not a reason to throw away the ramp-down data.

## Results

Each run writes `results/<RUN_NAME>-summary.json`. Set `RUN_NAME` per run to compare,
e.g. `pgbouncer-on` vs `pgbouncer-off`.

Requests are tagged by step (`token`, `users_me`, `verified_code`, `campaign`,
`participation`, `assessment`, `answer`), so per-endpoint p95 is available — which is how
you tell "the pooler is saturated" from "one endpoint has a slow query".

Custom metrics: `scenario_completed` (rate), `challenges_per_scenario` (trend),
`scenario_duration` (trend), `step_failures` (counter, tagged by step and status).
