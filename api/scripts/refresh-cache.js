import { usecases } from '../src/learning-content/domain/usecases/index.js';
import { Script } from '../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../src/shared/application/scripts/script-runner.js';
import { config } from '../src/shared/config.js';

if (config.environment === 'development' || config.environment === 'test') {
  process.on('uncaughtException', (error) => {
    if (error?.message === 'Connection is closed.') {
      return;
    }
    throw error;
  });
}

export class RefreshCache extends Script {
  constructor() {
    super({
      description: 'This script will refresh API learning content caches with a release fetch from LCMS',
      permanent: true,
      options: {},
    });
  }

  async handle({ logger }) {
    try {
      await usecases.refreshLearningContent();
      logger.info('Learning Content refreshed');
    } catch {
      logger.error('Error while reloading cache');
    }
  }
}

await ScriptRunner.execute(import.meta.url, RefreshCache);
