import { usecases } from '../../quest/domain/usecases/index.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';

// Définition du script
export class DeleteAndAnonymizeOrganizationLearnerParticipationsScript extends ScriptWithJob {
  constructor() {
    super({
      description:
        'Deletes all types of participations (from a combined course, campaign, and passages) for a given organization learner id and combined course id',
      permanent: true,
      options: {
        combinedCourseId: {
          type: 'number',
          describe: 'a single combined course id',
          demandOption: true,
        },
        organizationLearnerId: {
          type: 'number',
          describe: 'a single organization learner id',
          demandOption: true,
        },
        dryRun: {
          type: 'boolean',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger, dependencies = usecases, jobClient }) {
    logger.info(
      { event: 'DeleteAndAnonymizeOrganizationLearnerParticipations' },
      `Deletes and anonymizes all participations linked to combined course ${options.combinedCourseId} for learner ${options.organizationLearnerId}`,
    );

    await super.handle({ jobClient });

    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();

      const engineeringUserId = process.env.ENGINEERING_USER_ID;

      try {
        await dependencies.deleteAndAnonymizeParticipationsForALearnerId({
          combinedCourseId: options.combinedCourseId,
          organizationLearnerId: options.organizationLearnerId,
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
          `COMMIT: Successfully deleted and anonymized all participations linked to combined course ${options.combinedCourseId[0]} for learner ${options.organizationLearnerId[0]}`,
        );
      } catch (error) {
        await knexConn.rollback();
        logger.error({ event: 'DeleteAndAnonymizeCombinedCoursesScript' }, `ROLLBACK: An error has occured, ${error}`);
        throw error;
      }
    });
  }
}
await ScriptRunner.execute(import.meta.url, DeleteAndAnonymizeOrganizationLearnerParticipationsScript);
