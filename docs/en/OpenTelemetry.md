# Traces, metrics and logs with OpenTelemetry

The API is instrumented with OpenTelemetry: it produces traces (HTTP requests, SQL queries,
outgoing calls, PgBoss jobs, use cases and repositories through `tracing.spanify`), metrics and
logs, and sends them to an OTLP backend.

The SDK is started by the `tracing.js` preload, already wired into the npm scripts
(`npm run dev`, `npm start`, `npm run start:job`…). What is turned on and off is the **data
export**, driven by the `isOpenTelemetryEnabled` feature toggle — at runtime, without restarting
the API.

## Testing in dev

Start Jaeger, used as the trace backend, and Redis, which stores the feature toggles:

```
docker compose -f compose.yaml -f compose.opentelemetry.yaml up -d jaeger redis
```

In the [`api/.env`](../../api/.env) file, uncomment the `OTEL_EXPORTER_OTLP_ENDPOINT` variable
from the [`api/sample.env`](../../api/sample.env) file:

```
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Start the API, then enable the data export:

```
npm run toggles -- --key isOpenTelemetryEnabled --value true
```

The API does not need to be restarted: it logs `OpenTelemetry data export is now enabled` and the
first data is sent on the next batch (about 5 s for traces, 30 s for metrics).

View the traces on Jaeger http://localhost:16686/, picking the `pix-api` service (or
`pix-api-worker`, `pix-api-maddo`, `pix-api-maddo-worker` depending on the process).

To turn the export off:

```
npm run toggles -- --key isOpenTelemetryEnabled --value false
```

And to check the current value of the toggle:

```
npm run toggles -- --list
```

## Good to know

The toggle is stored in Redis, so its value survives restarts, and the change is propagated to
every subscribed process (web, worker) through the Redis pubsub. Redis is therefore required
locally: without `REDIS_URL`, the feature toggles storage is in-memory and each process holds its
own copy, which the script cannot update.

In dev the default value is `false`, so it has to be enabled explicitly. On review apps it
defaults to `true` (`devDefaultValues.reviewApp`).

When the toggle is `false`, traces, metrics and logs keep being collected: only the export is
turned off, by the exporters themselves (see
`api/src/shared/infrastructure/open-telemetry/gated-exporter.js`). That is what makes switching
without a restart possible. The Hapi instrumentation and the `tracing.spanify` proxies, on the
other hand, are only installed at startup: a process started without the `tracing.js` preload
produces nothing, whatever the toggle says.

Jaeger only stores traces. Since the API also exports metrics and logs, the
[`jaeger.yaml`](../../jaeger.yaml) configuration adds two pipelines that swallow them; without
them every export would answer 404 and fill the API logs with errors. To actually look at metrics
and logs locally, you need a full OTLP backend (an OpenTelemetry collector followed by a
Prometheus and a Loki, for instance) rather than Jaeger alone.
