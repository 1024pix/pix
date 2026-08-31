import { useEffect } from 'react';

export default function AutoExecToolUI({ toolName, args, addResult, getAccessToken }) {
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/admin/llm-assistant/tools/${toolName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(args),
        });
        if (!cancelled) addResult(await res.json());
      } catch (err) {
        if (!cancelled) addResult({ error: String(err) });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
