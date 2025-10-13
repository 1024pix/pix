import { knex } from '../../../db/knex-database-connection.js';
import * as modulesApi from '../../devcomp/application/api/modules-api.js';
import { COMBINED_COURSE_ITEM_TYPES } from '../../quest/domain/models/CombinedCourseItem.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationTypes,
} from '../../quest/domain/models/OrganizationLearnerParticipation.js';
import combinedCourseDetailsService from '../../quest/domain/services/combined-course-details-service.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';

class CreateOrUpdateOrganizationLearnerParticipationsForPassages extends Script {
  constructor() {
    super({
      description: 'Script to add campaignParticipationId unicity constraint on knowledge-element-snapshots',
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
    logger.info(`create-or-update-organization-learner-participations-for-passages | START`);
    logger.info(`create-or-update-organization-learner-participations-for-passages | dryRun ${options.dryRun}`);

    const trx = await knex.transaction();
    try {
      // Delete organization learner passage participations without atttributes
      const organizationLearnerParticipationIds = await trx('organization_learner_participations')
        .select('id')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE })
        .whereNull('referenceId')
        .pluck('id');

      logger.info(
        `create-or-update-organization-learner-participations-for-passages | organizationLearnerParticipationIds to delete : ${organizationLearnerParticipationIds.length}`,
      );
      logger.info(
        `create-or-update-organization-learner-participations-for-passages | organizationLearnerParticipationIds list : ${organizationLearnerParticipationIds}`,
      );

      await trx('organization_learner_passage_participations').del();
      await trx('organization_learner_participations').whereIn('id', organizationLearnerParticipationIds).del();

      // Create organization learner participation passsage with correct value
      const organizationLearnerWithoutPassagesOnCombinedCourse = await trx('combined_course_participations')
        .select(
          'combined_course_participations.organizationLearnerId',
          'view-active-organization-learners.userId',
          'combined_courses.id as combinedCourseId',
        )
        .join('combined_courses', 'combined_courses.questId', 'combined_course_participations.questId')
        .join(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'combined_course_participations.organizationLearnerId',
        )
        .whereNotIn('combined_course_participations.organizationLearnerId', function () {
          this.select('organizationLearnerId')
            .from('organization_learner_participations')
            .where({ type: OrganizationLearnerParticipationTypes.PASSAGE })
            .whereNotNull('referenceId');
        });
      logger.info(
        `create-or-update-organization-learner-participations-for-passages | organizationLearnerWithoutPassagesOnCombinedCourse to process : ${organizationLearnerWithoutPassagesOnCombinedCourse.length}`,
      );
      const organizationLearnerParticipationToInsert = [];

      for (const organizationLearnerWithoutPassageOnCombinedCourse of organizationLearnerWithoutPassagesOnCombinedCourse) {
        // same logic as usecases/update-combined-course.js to get module to synchronize
        const combinedCourseDetails = await combinedCourseDetailsService.getCombinedCourseDetails({
          userId: organizationLearnerWithoutPassageOnCombinedCourse.userId,
          combinedCourseId: organizationLearnerWithoutPassageOnCombinedCourse.combinedCourseId,
        });
        const moduleToSynchronizeIds = combinedCourseDetails.items
          .filter((item) => item.type === COMBINED_COURSE_ITEM_TYPES.MODULE)
          .map((item) => item.id);

        if (!combinedCourseDetails.participation) {
          return null;
        }

        const modulePassages = await modulesApi.getUserModuleStatuses({
          userId: organizationLearnerWithoutPassageOnCombinedCourse.userId,
          moduleIds: moduleToSynchronizeIds,
        });

        for (const modulePassage of modulePassages) {
          organizationLearnerParticipationToInsert.push(
            OrganizationLearnerParticipation.buildFromPassage({
              id: undefined,
              organizationLearnerId: organizationLearnerWithoutPassageOnCombinedCourse.organizationLearnerId,
              type: OrganizationLearnerParticipationTypes.PASSAGE,
              createdAt: modulePassage.createdAt,
              status: modulePassage.status,
              updatedAt: modulePassage.updatedAt,
              terminatedAt: modulePassage.terminatedAt,
              moduleId: modulePassage.id,
            }),
          );
        }
      }
      logger.info(
        `create-or-update-organization-learner-participations-for-passages | organizationLearnerParticipationToInsert to create : ${organizationLearnerParticipationToInsert.length}`,
      );

      if (organizationLearnerParticipationToInsert.length > 0) {
        await knex
          .batchInsert('organization_learner_participations', organizationLearnerParticipationToInsert)
          .transacting(trx);
      }

      if (options.dryRun) {
        logger.info(`create-or-update-organization-learner-participations-for-passages | rollback`);
        await trx.rollback();
      } else {
        logger.info(`create-or-update-organization-learner-participations-for-passages | commit`);
        await trx.commit();
      }
    } catch (err) {
      logger.error(`create-or-update-organization-learner-participations-for-passages | FAIL | Reason : ${err}`);
      await trx.rollback();
    } finally {
      logger.info(`create-or-update-organization-learner-participations-for-passages | END`);
    }
  }
}
await ScriptRunner.execute(import.meta.url, CreateOrUpdateOrganizationLearnerParticipationsForPassages);

export { CreateOrUpdateOrganizationLearnerParticipationsForPassages };
