import { useContext, useEffect, useRef, useState } from 'react';
import { EmberContext } from './AssistantApp.jsx';
import Batch from '../domain/lot.js';
import { execute } from '../sandbox/bac-a-sable.js';
import { exportReport } from '../documents/exporter-bilan.js';

// Module-level registry: documentId → DocumentDepose
export const documentRegistry = new Map();

// Module-level registry: documentId → Batch (simulated, pending execution)
export const simulatedBatches = new Map();

function callStatusDisplay(call, t) {
  if (call.result?.id !== undefined) {
    return { label: t('components.assistant.batch-tool.status.created'), cls: 'badge--success' };
  }
  const isExecFailure =
    call.verdict === 'ready' &&
    call.result?.error !== undefined &&
    call.result?.wouldCreate === undefined;
  if (isExecFailure) {
    return { label: t('components.assistant.batch-tool.status.failure'), cls: 'badge--error' };
  }
  if (call.verdict === null) {
    return { label: t('components.assistant.batch-tool.status.in-progress'), cls: 'badge--loading' };
  }
  const map = {
    ready:    { label: t('components.assistant.batch-tool.status.ready'),    cls: 'badge--success' },
    error:    { label: t('components.assistant.batch-tool.status.error'),    cls: 'badge--error' },
    duplicate: { label: t('components.assistant.batch-tool.status.duplicate'), cls: 'badge--warning' },
    excluded: { label: t('components.assistant.batch-tool.status.excluded'), cls: 'badge--neutral' },
  };
  return map[call.verdict] ?? { label: call.verdict, cls: 'badge--info' };
}

// Column config: width + wrap governs all table layout — no CSS nth-child needed.
const BATCH_COLUMNS = [
  { tKey: 'source-row', width: '3rem' },
  { tKey: 'name',       width: '22%',  wrap: true },
  { tKey: 'status',     width: '5rem' },
  { tKey: 'detail',     width: 'auto', wrap: true },
  { tKey: 'actions',    width: '5rem' },
];

function BatchTable({ batch, onExclude }) {
  const { t } = useContext(EmberContext);
  return (
    <table className="lot-tool-ui__table">
      <colgroup>
        {BATCH_COLUMNS.map((col, i) => <col key={i} style={{ width: col.width }} />)}
      </colgroup>
      <thead>
        <tr>
          {BATCH_COLUMNS.map((col, i) => (
            <th key={i}>{t(`components.assistant.batch-tool.columns.${col.tKey}`)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {batch.calls.map((call) => {
          const { label, cls } = callStatusDisplay(call, t);
          const orgId = call.result?.id;
          const detail =
            call.result?.error
              ? JSON.stringify(call.result.error).slice(0, 80)
              : call.result?.wouldCreate
                ? '(simulation ok)'
                : '';
          return (
            <tr key={call.index}>
              <td>{call.sourceRow ?? '—'}</td>
              <td className="col--wrap">{call.args?.name ?? call.name}</td>
              <td>
                <span className={`badge ${cls}`}>{label}</span>
              </td>
              <td className="col--wrap">
                {orgId ? (
                  <a href={`/organizations/${orgId}`} target="_blank" rel="noreferrer">
                    {t('components.assistant.batch-tool.actions.view')}
                  </a>
                ) : (
                  detail
                )}
              </td>
              <td>
                {onExclude && (call.verdict === 'error' || call.verdict === 'duplicate') && (
                  <button className="btn--secondary btn--small" onClick={() => onExclude(call)}>
                    {t('components.assistant.batch-tool.actions.exclude')}
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function buildSimulationSummary(batch, documentId) {
  return {
    documentId,
    simulation: 'complete',
    ready: batch.calls.filter((c) => c.verdict === 'ready').length,
    errors: batch.calls.filter((c) => c.verdict === 'error').length,
    duplicates: batch.calls.filter((c) => c.verdict === 'duplicate').length,
    rows: batch.calls.map((c) => ({
      sourceRow: c.sourceRow,
      name: c.args?.name,
      verdict: c.verdict,
      ...(c.result?.error ? { detail: c.result.error } : {}),
    })),
  };
}

// run_script tool UI — simulation only
export default function LotToolUI({ args, addResult, status }) {
  const { getAccessToken } = useContext(EmberContext);
  const { t } = useContext(EmberContext);
  const [batch] = useState(() => new Batch());
  const [, setTick] = useState(0);
  const [scriptError, setScriptError] = useState(null);

  const refresh = () => setTick((n) => n + 1);
  const isRunning = status?.type === 'running' || status === 'running';

  useEffect(() => {
    if (isRunning) return;
    if (batch.state !== 'pending') return;

    const document = documentRegistry.get(args.documentId) ??
      (documentRegistry.size === 1 ? [...documentRegistry.values()][0] : null);
    if (!document) {
      const msg = `Document not found: ${args.documentId}`;
      setScriptError(msg);
      addResult({ error: msg });
      return;
    }
    batch.document = document;

    let cancelled = false;

    async function runSimulation() {
      try {
        const scriptReturn = await execute({
          script: args.script,
          sheets: Object.values(document.feuilles),
          onToolCall: async ({ name, args: callArgs, ligne }) => {
            const enrichedArgs = { ...callArgs, simulate: true };
            batch.addCall({ sourceRow: ligne, name, args: enrichedArgs });
            const index = batch.calls.length;
            if (!cancelled) refresh();

            let result;
            try {
              const token = await getAccessToken();
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 30_000);
              try {
                const res = await fetch('/api/admin/llm-assistant/tools/create_organization', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(enrichedArgs),
                  signal: controller.signal,
                });
                result = await res.json();
              } finally {
                clearTimeout(timer);
              }
            } catch (err) {
              result = { error: err?.message ?? String(err) };
            }

            batch.recordSimulationResult(index, result);
            if (!cancelled) refresh();
            return result;
          },
        });

        if (!cancelled) {
          if (batch.calls.length === 0) {
            // Script didn't call any tools — pass its return value directly to the LLM.
            if (scriptReturn !== null && scriptReturn !== undefined) {
              addResult(scriptReturn);
            } else {
              addResult({ error: 'Script returned no result and made no tool calls.' });
            }
            return;
          }
          batch.finishSimulation();
          // Store batch so approve_lot tool can execute it
          const docId = args.documentId ?? document.id;
          simulatedBatches.set(docId, batch);
          addResult(buildSimulationSummary(batch, docId));
          refresh();
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err.message ?? String(err);
          setScriptError(msg);
          addResult({ error: `Script execution error: ${msg}` });
        }
      }
    }

    runSimulation();
    return () => { cancelled = true; };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleExclude(call) {
    call.exclude();
    refresh();
  }

  return (
    <div className="lot-tool-ui">
      {scriptError && (
        <div className="lot-tool-ui__error" role="alert">
          {t('components.assistant.batch-tool.errors.script-prefix')} {scriptError}
        </div>
      )}

      {batch.calls.length > 0 && (
        <BatchTable batch={batch} onExclude={handleExclude} />
      )}

      <details className="lot-tool-ui__script">
        <summary>{t('components.assistant.batch-tool.script-label')}</summary>
        <pre>{args.script}</pre>
      </details>
    </div>
  );
}

// approve_lot tool UI — execution
export function ApproveLotToolUI({ args, addResult, status }) {
  const { getAccessToken, t } = useContext(EmberContext);
  const [batch, setBatch] = useState(null);
  const [, setTick] = useState(0);
  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const stopRequestedRef = useRef(false);

  const refresh = () => setTick((n) => n + 1);
  const isRunning = status?.type === 'running' || status === 'running';

  async function runExecution(batchToRun) {
    const activeBatch = batchToRun ?? batch;
    const toExecute = activeBatch.callsToExecute();
    for (const call of toExecute) {
      if (stopRequestedRef.current) {
        setStopped(true);
        setStarted(false);
        refresh();
        return;
      }
      const { simulate: _simulate, ...realArgs } = call.args;
      let result;
      try {
        const token = await getAccessToken();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);
        try {
          const res = await fetch('/api/admin/llm-assistant/tools/create_organization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(realArgs),
            signal: controller.signal,
          });
          result = await res.json();
        } finally {
          clearTimeout(timer);
        }
      } catch (err) {
        result = { error: err?.message ?? String(err) };
      }
      activeBatch.recordExecutionResult(call.index, result);
      refresh();
    }

    setStarted(false);
    setIsDone(true);

    const created = activeBatch.calls.filter((c) => c.result?.id !== undefined);
    const failures = activeBatch.calls.filter(
      (c) => c.verdict === 'ready' && c.result?.error !== undefined && c.result?.id === undefined,
    );
    addResult({
      execution: 'complete',
      created: created.map((c) => ({ sourceRow: c.sourceRow, name: c.args?.name, id: c.result.id })),
      failures: failures.map((c) => ({ sourceRow: c.sourceRow, name: c.args?.name, error: c.result.error })),
    });
    refresh();
  }

  useEffect(() => {
    if (isRunning) return;
    if (started) return;

    // Resolve batch lazily — args.documentId is only complete once streaming ends
    const docId = args?.documentId;
    const resolvedBatch =
      (docId ? simulatedBatches.get(docId) : null) ??
      (simulatedBatches.size === 1 ? [...simulatedBatches.values()][0] : null) ??
      null;

    if (!resolvedBatch) {
      addResult({ error: t('components.assistant.batch-tool.errors.no-simulation') });
      return;
    }

    setBatch(resolvedBatch);

    try {
      resolvedBatch.approve();
    } catch {
      addResult({ error: t('components.assistant.batch-tool.errors.unresolved-errors') });
      return;
    }
    resolvedBatch.startExecution();
    setStarted(true);
    stopRequestedRef.current = false;
    refresh();
    runExecution(resolvedBatch);
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleResume() {
    stopRequestedRef.current = false;
    setStopped(false);
    setStarted(true);
    await runExecution(batch);
  }

  if (!batch) {
    return <div className="lot-tool-ui__loading">{t('components.assistant.batch-tool.preparing')}</div>;
  }

  const hasAnyFailure = isDone && batch.calls.some(
    (c) => c.verdict === 'ready' && c.result?.error !== undefined && c.result?.id === undefined,
  );

  return (
    <div className="lot-tool-ui">
      <BatchTable batch={batch} onExclude={null} />

      {hasAnyFailure && (
        <div className="lot-tool-ui__bilan-bandeau" role="alert">
          {t('components.assistant.batch-tool.errors.partial-creation')}
        </div>
      )}

      <div className="lot-tool-ui__controls">
        {started && (
          <button className="btn--secondary" onClick={() => { stopRequestedRef.current = true; }}>
            {t('components.assistant.batch-tool.actions.stop')}
          </button>
        )}
        {stopped && !started && (
          <button className="btn--secondary" onClick={handleResume}>
            {t('components.assistant.batch-tool.actions.resume')}
          </button>
        )}
        {isDone && (
          <button className="btn--secondary" onClick={() => exportReport(batch)}>
            {t('components.assistant.batch-tool.actions.download')}
          </button>
        )}
      </div>
    </div>
  );
}
