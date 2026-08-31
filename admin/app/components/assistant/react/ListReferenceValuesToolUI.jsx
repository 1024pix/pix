import { useEffect, useRef, useState } from 'react';

export default function AutoExecToolUI({ toolName, args, addResult, status, getAccessToken }) {
  const [toolError, setToolError] = useState(null);
  const executedRef = useRef(false);

  useEffect(() => {
    // status.type === 'running' while the LLM is still streaming the tool arguments.
    // Wait until streaming is done before sending the request, otherwise args is empty.
    if (status?.type === 'running') return;
    if (executedRef.current) return;
    executedRef.current = true;

    let cancelled = false;
    async function run() {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/admin/llm-assistant/tools/${toolName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(args),
        });
        const data = await res.json();
        if (!cancelled) {
          addResult(data);
          if (data.error) setToolError(data.error);
        }
      } catch (err) {
        if (!cancelled) {
          addResult({ error: String(err) });
          setToolError(String(err));
        }
      }
    }
    run();
    return () => { cancelled = true; };
  }, [status?.type]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!toolError) return null;
  return <div className="tool-error">Une erreur est survenue lors de l&apos;exécution de l&apos;outil.</div>;
}
