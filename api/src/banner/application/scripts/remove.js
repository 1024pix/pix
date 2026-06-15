import { Script } from '../../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../../shared/application/scripts/script-runner.js';
import { informationBannersStorage } from '../../../shared/infrastructure/key-value-storages/index.js';

export class RemoveInformationBanners extends Script {
  constructor() {
    super({
      description: 'Remove information banners data from Redis',
      permanent: true,
      options: {
        target: {
          type: 'string',
          describe: 'application name we want to remove information banners from',
          required: true,
          requiresArg: true,
        },
      },
    });
  }

  async handle({ options }) {
    const { target } = options;

    await informationBannersStorage.delete(target);
  }
}

await ScriptRunner.execute(import.meta.url, RemoveInformationBanners);
