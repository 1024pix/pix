import { usecases } from '../src/learning-content/domain/usecases/index.js';
import { Script } from '../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../src/shared/application/scripts/script-runner.js';

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
      await usecases.refreshLearningContentCache();
      logger.info('Learning Content refreshed');
    } catch {
      logger.error('Error while reloading cache');
    }
  }

  async onFinished() {
    process.exit(process.exitCode || 0); // eslint-disable-line n/no-process-exit
  }
}

await ScriptRunner.execute(import.meta.url, RefreshCache);
