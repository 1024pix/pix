import { commaSeparatedNumberParser } from '../application/scripts/parsers.js';
import { Script } from '../application/scripts/script.js';
import { ScriptRunner } from '../application/scripts/script-runner.js';
import { DomainTransaction } from '../domain/DomainTransaction.js';
import { sharedUsecases } from '../domain/usecases/index.js';

// Thrown out of the transaction of a dry run to roll it back, carrying the report.
class DryRunRollback extends Error {
  constructor(report) {
    super('Dry run: migration rolled back');
    this.report = report;
  }
}

// Runs the migration, writes included, in a transaction rolled back at the end.
const migrateUserInDryRun = async (userId, migrateUserToKnowledgeStates) => {
  try {
    await DomainTransaction.execute(async () => {
      throw new DryRunRollback(await migrateUserToKnowledgeStates({ userId }));
    });
  } catch (error) {
    if (error instanceof DryRunRollback) return error.report;
    throw error;
  }
};

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
        dryRun: {
          type: 'boolean',
          describe: 'Runs the migration and rolls it back, reporting what it would do (pass --no-dryRun to migrate)',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger, migrateUserToKnowledgeStates = sharedUsecases.migrateUserToKnowledgeStates }) {
    const { userIds, dryRun } = options;
    const reports = [];

    logger.info({ userCount: userIds.length, dryRun }, 'Migrating users to knowledge states.');

    for (const userId of userIds) {
      logger.info({ userId }, 'Migrating user to knowledge states.');
      const startedAt = performance.now();
      const report = dryRun
        ? await migrateUserInDryRun(userId, migrateUserToKnowledgeStates)
        : await migrateUserToKnowledgeStates({ userId });
      const durationMs = Math.round(performance.now() - startedAt);
      reports.push(report);

      if (!report) {
        logger.info({ userId, durationMs }, 'User already migrated to knowledge states.');
      } else if (dryRun) {
        logger.info({ userId, durationMs, ...report }, 'Dry run: user would be migrated to knowledge states.');
      } else {
        logger.info({ userId, durationMs, ...report }, 'User migrated to knowledge states.');
      }
    }

    const migratedCount = reports.filter(Boolean).length;
    logger.info(
      { userCount: userIds.length, migratedCount, alreadyMigratedCount: userIds.length - migratedCount, dryRun },
      dryRun ? 'Dry run: no user migrated to knowledge states.' : 'Users migrated to knowledge states.',
    );
  }
}

await ScriptRunner.execute(import.meta.url, MigrateUsersToKnowledgeStates);
