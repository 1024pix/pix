import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { config } from '../../shared/config.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../domain/usecases/index.js';

// Définition du script
export class DeleteAndAnonymiseCombinedCoursesScript extends ScriptWithJob {
  constructor() {
    super({
      description: 'Deletes combined courses and anonymize possible existing participations of learners',
      permanent: true,
      options: {
        combinedCourseIds: {
          type: 'string',
          describe: 'a list of comma separated combined course ids',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
        dryRun: {
          type: 'boolean',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger, dependencies = { usecases }, jobClient }) {
    logger.info(
      { event: 'DeleteAndAnonymizeCombinedCoursesScript' },
      `Deletes ${options.combinedCourseIds.length} combined courses and anonymize possible existing participations`,
    );

    await super.handle({ jobClient });

    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      try {
        await dependencies.usecases.deleteAndAnonymizeCombinedCourses({
          combinedCourseIds: options.combinedCourseIds,
          userId: config.infra.engineeringUserId,
        });

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(`ROLLBACK due to dryRun`);
          logger.info(`--dryRun true to persist changes`);
          return;
        }

        logger.info(
          { event: 'DeleteAndAnonymizeCombinedCoursesScript' },
          `COMMIT: Successfully deleted ${options.combinedCourseIds.length} combined courses and anonymized their participations`,
        );
      } catch (error) {
        await knexConn.rollback();
        logger.error({ event: 'DeleteAndAnonymizeCombinedCoursesScript' }, `ROLLBACK: An error has occured, ${error}`);
        throw error;
      }
    });
  }
}
await ScriptRunner.execute(import.meta.url, DeleteAndAnonymiseCombinedCoursesScript);
