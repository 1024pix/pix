import { knex } from '../../../db/knex-database-connection.js';
import { OrganizationLearnerParticipation } from '../../quest/domain/models/OrganizationLearnerParticipation.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';

class CreateOrUpdateOrganizationLearnerParticipationsForCombinedCourses extends Script {
  constructor() {
    super({
      description: 'Script to add combinedCourseId on organization_learner_participations referenceId column',
      permanent: false,
      options: {
        dryRun: {
          type: 'boolean',
          describe: 'execute script without commit',
          demandOption: false,
          default: true,
        },
      },
    });
  }
  async handle({ options, logger }) {
    logger.info(`create-or-update-organization-learner-participations-for-combined-courses | START`);
    logger.info(`create-or-update-organization-learner-participations-for-combined-courses | dryRun ${options.dryRun}`);

    const trx = await knex.transaction();
    try {
      const combinedCourseParticipations = await trx('combined_course_participations');
      logger.info(
        `create-or-update-organization-learner-participations-for-combined-courses | combinedCourseParticipations to process : ${combinedCourseParticipations.length}`,
      );

      for (const combinedCourseParticipation of combinedCourseParticipations) {
        if (combinedCourseParticipation.organizationLearnerParticipationId) {
          await trx('organization_learner_participations')
            .update({
              referenceId: combinedCourseParticipation.combinedCourseId.toString(),
              attributes: null,
            })
            .where({
              id: combinedCourseParticipation.organizationLearnerParticipationId,
            });
        } else {
          const { id: combinedCourseId } = await trx('combined_courses')
            .where('questId', combinedCourseParticipation.questId)
            .first();
          const combinedCourseOrganizationLearnerParticipation =
            OrganizationLearnerParticipation.buildFromCombinedCourseParticipation({
              combinedCourseId,
              organizationLearnerId: combinedCourseParticipation.organizationLearnerId,
              createdAt: combinedCourseParticipation.createdAt,
              updatedAt: combinedCourseParticipation.updatedAt,
              status: combinedCourseParticipation.status,
            });
          const [organizationLearnerParticipation] = await trx('organization_learner_participations')
            .insert(combinedCourseOrganizationLearnerParticipation)
            .returning('id');

          await trx('combined_course_participations')
            .update('organizationLearnerParticipationId', organizationLearnerParticipation.id)
            .where('id', combinedCourseParticipation.id);
        }
      }
      if (options.dryRun) {
        logger.info(`create-or-update-organization-learner-participations-for-combined-courses | rollback`);
        await trx.rollback();
      } else {
        logger.info(`create-or-update-organization-learner-participations-for-combined-courses | commit`);
        await trx.commit();
      }
    } catch (err) {
      logger.error(
        `create-or-update-organization-learner-participations-for-combined-courses | FAIL | Reason : ${err}`,
      );
      await trx.rollback();
    } finally {
      logger.info(`create-or-update-organization-learner-participations-for-combined-courses | END`);
    }
  }
}
await ScriptRunner.execute(import.meta.url, CreateOrUpdateOrganizationLearnerParticipationsForCombinedCourses);

export { CreateOrUpdateOrganizationLearnerParticipationsForCombinedCourses };
