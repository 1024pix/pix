import { createInterface } from 'node:readline/promises';

const USAGE = `Client de test en ligne de commande pour la route de conversation de l'assistant.
Garde l'historique entre les tours, pour exercer la route sans le front de Pix Admin.

  node api/scripts/chat-with-llm-assistant.js
  node api/scripts/chat-with-llm-assistant.js --raw    affiche le flux brut
  node api/scripts/chat-with-llm-assistant.js --help

Variables d'environnement, toutes facultatives :
  API_URL          defaut http://localhost:3000
  ADMIN_ORIGIN     defaut http://localhost:4202, l'origine de Pix Admin
  ADMIN_EMAIL      defaut superadmin@example.net
  ADMIN_PASSWORD   defaut pix123
  TOKEN            jeton deja obtenu, court-circuite l'authentification`;

const API = process.env.API_URL ?? 'http://localhost:3000';
const EMAIL = process.env.ADMIN_EMAIL ?? 'superadmin@example.net';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'pix123';
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? 'http://localhost:4202';
const RAW = process.argv.includes('--raw');

const { protocol, host } = new URL(ADMIN_ORIGIN);
const forwardedHeaders = { 'x-forwarded-proto': protocol.slice(0, -1), 'x-forwarded-host': host };

async function getToken() {
  if (process.env.TOKEN) return process.env.TOKEN;
  const body = new URLSearchParams({ grant_type: 'password', username: EMAIL, password: PASSWORD });
  const res = await fetch(`${API}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...forwardedHeaders },
    body,
  });
  if (!res.ok) throw new Error(`/api/token a répondu ${res.status} : ${await res.text()}`);
  return (await res.json()).access_token;
}
function extractText(event) {
  if (typeof event !== 'object' || event === null) return '';
  if (event.type === 'text-delta') return event.delta ?? event.textDelta ?? '';
  if (event.type === 'text' && typeof event.text === 'string') return event.text;
  return '';
}

async function sendTurn(token, messages) {
  const res = await fetch(`${API}/api/admin/llm-assistant/conversations/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...forwardedHeaders },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    console.error(`\n[${res.status}] ${await res.text()}`);
    return null;
  }
  if (!res.body) {
    console.error('\n[réponse sans corps]');
    return null;
  }

  let buffer = '';
  let answer = '';
  for await (const chunk of res.body) {
    buffer += Buffer.from(chunk).toString('utf8');
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (RAW) {
        if (line.trim()) console.log(line);
        continue;
      }
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') continue;
      try {
        const text = extractText(JSON.parse(payload));
        if (text) {
          process.stdout.write(text);
          answer += text;
        }
      } catch {
        continue;
      }
    }
  }
  return answer;
}

async function chat() {
  const token = await getToken();
  console.log(`Connecté à ${API}${RAW ? ' (flux brut)' : ''}. Ctrl-D pour quitter.\n`);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const messages = [];

  while (true) {
    const line = await rl.question('> ').catch(() => null);
    if (line === null) break;
    if (!line.trim()) continue;

    messages.push({ role: 'user', content: line });
    process.stdout.write('\n');
    const answer = await sendTurn(token, messages);
    process.stdout.write('\n\n');

    if (answer) messages.push({ role: 'assistant', content: answer });
    else messages.pop();
  }

  rl.close();
}

if (process.argv.includes('--help')) {
  console.log(USAGE);
} else {
  await chat();
}
