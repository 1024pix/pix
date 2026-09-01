import { useEffect, useRef, useState } from 'react';
import Lot from '../domain/lot.js';
import { executer } from '../sandbox/bac-a-sable.js';
import { exporterBilan } from '../documents/exporter-bilan.js';

// Module-level registry: documentId → DocumentDepose
// AssistantApp.jsx registers documents here before the LLM calls run_script
export const documentRegistry = new Map();

function appelStatutDisplay(appel) {
  // Determine display status considering execution results
  if (appel.resultat?.id !== undefined) {
    return { label: 'créée', cls: 'badge--success' };
  }
  // After execution with error (post-approval call with no simulate)
  const isExecFailure =
    appel.verdict === 'pret' &&
    appel.resultat?.error !== undefined &&
    appel.resultat?.wouldCreate === undefined;
  if (isExecFailure) {
    return { label: 'échec', cls: 'badge--error' };
  }
  const verdict = appel.verdict;
  if (verdict === null) return { label: 'en cours…', cls: 'badge--loading' };
  const map = {
    pret: { label: 'prête', cls: 'badge--success' },
    erreur: { label: 'erreur', cls: 'badge--error' },
    doublon: { label: 'doublon', cls: 'badge--warning' },
    exclue: { label: 'exclue', cls: 'badge--neutral' },
  };
  return map[verdict] ?? { label: verdict, cls: 'badge--info' };
}

export default function LotToolUI({ args, addResult, status }) {
  const [lot] = useState(() => new Lot());
  const [tick, setTick] = useState(0);
  const [simError, setSimError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [resultSent, setResultSent] = useState(false);
  const [arrete, setArrete] = useState(false);
  const approveDisabledRef = useRef(false);
  const stopRequestedRef = useRef(false);

  // Force re-render when lot mutates
  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    if (status?.type !== 'running' && status !== 'running') return;

    const document = documentRegistry.get(args.documentId);
    if (!document) {
      setSimError(`Document introuvable : ${args.documentId}`);
      return;
    }
    lot.document = document;

    let cancelled = false;

    async function runSimulation() {
      try {
        await executer({
          script: args.script,
          sheets: document.feuilles,
          onToolCall: async ({ id, name, args: callArgs, ligne }) => {
            const enrichedArgs = { ...callArgs, simulate: true };
            lot.ajouterAppel({ ligneSource: ligne, nom: name, args: enrichedArgs });
            const rang = lot.appels.length;
            if (!cancelled) refresh();

            const res = await fetch('/api/admin/llm-assistant/tools/create_organization', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(enrichedArgs),
            });
            const result = await res.json();

            lot.enregistrerResultatSimulation(rang, result);
            if (!cancelled) refresh();
            return result;
          },
        });
        if (!cancelled) {
          lot.terminerSimulation();
          refresh();
        }
      } catch (err) {
        if (!cancelled) {
          setSimError(err.message ?? String(err));
        }
      }
    }

    runSimulation();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasBlockingIssues = lot.appels.some(
    (a) => a.verdict === 'erreur' || a.verdict === 'doublon',
  );

  const canApprove = lot.etat === 'simule' && !hasBlockingIssues;

  async function runExecution() {
    const aExecuter = lot.appelsAExecuter();
    for (const appel of aExecuter) {
      if (stopRequestedRef.current) {
        setArrete(true);
        setExecuting(false);
        refresh();
        return;
      }
      const { simulate: _simulate, ...realArgs } = appel.args;
      const res = await fetch('/api/admin/llm-assistant/tools/create_organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(realArgs),
      });
      const result = await res.json();
      lot.enregistrerResultatExecution(appel.rang, result);
      refresh();
    }
    setExecuting(false);
    setResultSent(true);
    addResult(lot);
  }

  async function handleApprouver() {
    if (approveDisabledRef.current) return;
    approveDisabledRef.current = true;
    stopRequestedRef.current = false;
    setExecuting(true);

    lot.approuver();
    lot.demarrerExecution();
    refresh();
    await runExecution();
  }

  function handleArreter() {
    stopRequestedRef.current = true;
  }

  async function handleReprendre() {
    stopRequestedRef.current = false;
    setArrete(false);
    setExecuting(true);
    await runExecution();
  }

  function handleAnnuler() {
    addResult({ error: 'cancelled' });
    setResultSent(true);
  }

  function handleExclure(appel) {
    appel.exclure();
    refresh();
  }

  const isSimulationDone = lot.etat !== 'a_simuler';
  const isTermine = lot.etat === 'termine';
  const pretCount = lot.appels.filter((a) => a.verdict === 'pret').length;

  const hasAnyFailure = isTermine && lot.appels.some(
    (a) => a.verdict === 'pret' && a.resultat?.error !== undefined && a.resultat?.id === undefined,
  );

  return (
    <div className="lot-tool-ui">
      {simError && (
        <div className="lot-tool-ui__error" role="alert">
          Erreur de script : {simError}
        </div>
      )}

      {lot.appels.length > 0 && (
        <table className="lot-tool-ui__table">
          <thead>
            <tr>
              <th>Ligne source</th>
              <th>Nom</th>
              <th>Statut</th>
              <th>Détail</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lot.appels.map((appel) => {
              const { label, cls } = appelStatutDisplay(appel);
              const orgId = appel.resultat?.id;
              const detail =
                appel.resultat?.error
                  ? JSON.stringify(appel.resultat.error).slice(0, 80)
                  : appel.resultat?.wouldCreate
                    ? '(simulation ok)'
                    : '';
              return (
                <tr key={appel.rang}>
                  <td>{appel.ligneSource ?? '—'}</td>
                  <td>{appel.nom}</td>
                  <td>
                    <span className={`badge ${cls}`}>{label}</span>
                  </td>
                  <td>
                    {orgId ? (
                      <a href={`/organizations/${orgId}`} target="_blank" rel="noreferrer">
                        Voir
                      </a>
                    ) : (
                      detail
                    )}
                  </td>
                  <td>
                    {(appel.verdict === 'erreur' || appel.verdict === 'doublon') && (
                      <button className="btn--secondary btn--small" onClick={() => handleExclure(appel)}>
                        Exclure
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {lot.document?.plagesVues?.length > 0 && (
        <div className="lot-tool-ui__plages">
          <strong>Lignes lues :</strong>
          <ul>
            {lot.document.plagesVues.map((p, i) => (
              <li key={i}>{p.feuille} L{p.from}–{p.to}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="lot-tool-ui__script">
        <summary>Script</summary>
        <pre>{args.script}</pre>
      </details>

      {hasAnyFailure && (
        <div className="lot-tool-ui__bilan-bandeau" role="alert">
          lot partiellement créé
        </div>
      )}

      {isSimulationDone && !resultSent && (
        <div className="lot-tool-ui__controls">
          {!executing && !isTermine && (
            <>
              <button className="btn--secondary" onClick={handleAnnuler}>
                Annuler
              </button>
              <button
                className="btn--primary"
                onClick={handleApprouver}
                disabled={!canApprove || approveDisabledRef.current}
              >
                Créer les {pretCount} organisations
              </button>
            </>
          )}
          {executing && (
            <button className="btn--secondary" onClick={handleArreter}>
              Arrêter
            </button>
          )}
          {arrete && !executing && (
            <button className="btn--secondary" onClick={handleReprendre}>
              Reprendre
            </button>
          )}
        </div>
      )}

      {isTermine && (
        <div className="lot-tool-ui__controls">
          <button className="btn--secondary" onClick={() => exporterBilan(lot)}>
            Télécharger le bilan
          </button>
        </div>
      )}
    </div>
  );
}
