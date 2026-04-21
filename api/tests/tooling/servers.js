import { createServer } from '../../server.js';
import { createMaddoServer } from '../../server.maddo.js';

let server, serverMaddo;

async function startServer() {
  if (server) return;
  server = await createServer();
  await server.start();
}

async function stopServer() {
  if (!server) return;
  await server.stop();
}

async function startMaddoServer() {
  if (serverMaddo) return;
  serverMaddo = await createMaddoServer();
  await serverMaddo.start();
}

async function stopMaddoServer() {
  if (!serverMaddo) return;
  await serverMaddo.stop();
}

export { server, serverMaddo, startMaddoServer, startServer, stopMaddoServer, stopServer };
