import { JobGroup } from '../../shared/application/jobs/job-controller.js';
import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { JobClient } from '../../shared/infrastructure/jobs/JobClient.js';
import { usecases } from '../domain/usecases/index.js';

// Définition du script
export class DeleteAndAnonymiseCombinedCoursesScript extends Script {
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

  async handle({ options, logger, dependencies = { usecases, jobClient: JobClient.instance } }) {
    logger.info(
      { event: 'DeleteAndAnonymizeCombinedCoursesScript' },
      `Deletes ${options.combinedCourseIds.length} combined courses and anonymize possible existing participations`,
    );
    await dependencies.jobClient.initialize({
      jobGroups: [JobGroup.DEFAULT, JobGroup.FAST],
    });

    this.onFinished = async () => {
      await dependencies.jobClient.stop();
    };
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      const engineeringUserId = process.env.ENGINEERING_USER_ID;

      try {
        await dependencies.usecases.deleteAndAnonymizeCombinedCourses({
          combinedCourseIds: options.combinedCourseIds,
          userId: engineeringUserId,
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
