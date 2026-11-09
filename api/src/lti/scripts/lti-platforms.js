import { Script } from '../../../src/shared/application/scripts/script.js';
import { ScriptRunner } from '../../../src/shared/application/scripts/script-runner.js';
import { ltiPlatformRepository } from '../infrastructure/repositories/lti-platform.repository.js';

/**
 * @typedef {{
 *   console: typeof console
 *   logger: import('pino').Logger
 * }} CommandDependencies
 */

export class LtiPlatformsScript extends Script {
  constructor() {
    super({
      description: 'Manage LTI platforms',
      commands: {
        list: {
          description: 'List authorized LTI platforms',
        },
      },
      permanent: true,
    });
  }

  async handle({ command, options, logger }) {
    await this[command ?? 'list'](options, { console, logger });
  }

  /**
   * @param {object} _options
   * @param {CommandDependencies} dependencies
   */
  async list(_options, { console }) {
    const platforms = await ltiPlatformRepository.findAll();

    console.table(platforms);
  }
}

await ScriptRunner.execute(import.meta.url, LtiPlatformsScript);
