import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { evaluationUsecases } from '../domain/usecases/index.js';

export class MigrateUsersToKnowledgeStates extends Script {
  constructor() {
    super({
      description:
        'Moves the knowledge of the given users from knowledge elements to knowledge states. The knowledge elements are left untouched.',
      permanent: false,
      options: {
        userIds: {
          type: 'string',
          describe: 'Ids of the users to migrate, separated by commas (ex: "123,456")',
          demandOption: true,
          requiresArg: true,
          coerce: commaSeparatedNumberParser(),
        },
      },
    });
  }

  async handle({ options, logger, migrateUserToKnowledgeStates = evaluationUsecases.migrateUserToKnowledgeStates }) {
    const { userIds } = options;

    for (const userId of userIds) {
      const report = await migrateUserToKnowledgeStates({ userId });

      if (report) {
        logger.info({ userId, ...report }, 'User migrated to knowledge states.');
      } else {
        logger.info({ userId }, 'User already migrated to knowledge states.');
      }
    }
  }
}

await ScriptRunner.execute(import.meta.url, MigrateUsersToKnowledgeStates);
