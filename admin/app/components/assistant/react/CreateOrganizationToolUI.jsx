import { useRef, useState } from 'react';

export default function CreateOrganizationToolUI({
  args,
  status,
  result,
  addResult,
  getAccessToken,
  onNavigateToOrganization,
  toolName,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  // Use a ref to guard against double-submit even within the same React batch
  const submittingRef = useRef(false);

  const handleConfirm = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setFetchError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/llm-assistant/tools/${toolName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(args),
      });
      if (!res.ok) {
        setFetchError(`HTTP ${res.status}`);
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }
      const toolResult = await res.json();
      addResult(toolResult);
    } catch (err) {
      setFetchError(String(err));
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    addResult({ error: 'cancelled' });
  };

  // Tool returns { id, name } on success or { error: { ... } } on failure
  const phase =
    result?.id !== undefined
      ? 'success'
      : result?.error !== undefined
        ? 'failure'
        : fetchError !== null
          ? 'fetch-failure'
          : submitting
            ? 'loading'
            : 'pending';

  if (phase === 'pending') {
    const isStreaming = status?.type === 'running';
    return (
      <div className="tool-card tool-card--pending">
        <dl>
          {Object.entries(args ?? {}).map(([field, value]) => (
            <div key={field}>
              <dt>{field}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
        {!isStreaming && (
          <div className="tool-card__actions">
            <button className="btn--primary" onClick={handleConfirm} disabled={submitting}>
              Confirmer
            </button>
            <button className="btn--secondary" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'loading') {
    return <div className="tool-card tool-card--loading">Création en cours...</div>;
  }

  if (phase === 'fetch-failure') {
    return (
      <div className="tool-card tool-card--failure">
        <p className="field-error">{fetchError}</p>
        <div className="tool-card__actions">
          <button className="btn--primary" onClick={handleConfirm}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="tool-card tool-card--success">
        <p>Organisation créée avec succès.</p>
        <div className="tool-card__actions">
          <button className="btn--primary" onClick={() => onNavigateToOrganization(result.id)}>
            Voir l&apos;organisation
          </button>
        </div>
      </div>
    );
  }

  // phase === 'failure'
  const errorMsg = result?.error?.validation
    ? result.error.validation
    : result?.error?.notFound
      ? `Valeur inconnue pour « ${result.error.notFound} ». Valeurs disponibles : ${result.error.availableValues?.join(', ')}`
      : result?.error?.fieldErrors
        ? result.error.fieldErrors.map((e) => e.detail).join(', ')
        : typeof result?.error === 'string'
          ? result.error
          : JSON.stringify(result?.error ?? 'Erreur inconnue');

  return (
    <div className="tool-card tool-card--failure">
      <p className="field-error">{errorMsg}</p>
    </div>
  );
}
