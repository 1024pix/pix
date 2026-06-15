import { Script } from '../../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../../shared/application/scripts/script-runner.js';
import { informationBannersStorage } from '../../../shared/infrastructure/key-value-storages/index.js';

export class AddInformationBanners extends Script {
  constructor() {
    super({
      description: 'Add information banners data to Redis',
      permanent: true,
      options: {
        target: {
          type: 'string',
          describe: 'application name we want to add information banners to',
          required: true,
          requiresArg: true,
        },
        severity: {
          type: 'string',
          describe: 'severity of the message',
          choices: ['error', 'warning', 'information'],
          required: true,
          requiresArg: true,
        },
        message_fr: {
          type: 'string',
          describe: 'message content in French',
          required: true,
          requiresArg: true,
        },
        message_en: {
          type: 'string',
          describe: 'message content in English',
          required: true,
          requiresArg: true,
        },
      },
    });
  }

  async handle({ options }) {
    const { target, severity, message_fr, message_en } = options;
    const banners = (await informationBannersStorage.get(target)) ?? [];

    banners.push({ severity, message: `[fr]${message_fr}[/fr][en]${message_en}[/en]` });

    await informationBannersStorage.save({ key: target, value: banners });
  }
}

await ScriptRunner.execute(import.meta.url, AddInformationBanners);
