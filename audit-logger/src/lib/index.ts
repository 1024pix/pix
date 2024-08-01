import { config } from './config.js';
import { logger } from './infrastructure/logger.js';
import { HapiServer } from './server.js';

process.on('SIGTERM', (): void => {
  _exitOnSignal('SIGTERM').then(
    () => {},
    () => {},
  );
});
process.on('SIGINT', () => {
  _exitOnSignal('SIGINT').then(
    () => {},
    () => {},
  );
});

const hapiServer: HapiServer = await HapiServer.createServer();

try {
  await hapiServer.start();
  logger.info(`Server started on http://localhost:${config.port}`);
} catch (error: unknown) {
  logger.error(`Error when launching server : `);
  logger.error(error);
  await hapiServer.stop();
}
async function _exitOnSignal(signal: string): Promise<void> {
  logger.info(`Received signal: ${signal}.`);
  await hapiServer.stop({ timeout: 30000 });
}
