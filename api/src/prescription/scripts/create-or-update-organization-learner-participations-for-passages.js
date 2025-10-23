import { knex } from '../../../db/knex-database-connection.js';
import * as modulesApi from '../../devcomp/application/api/modules-api.js';
import * as recommendedModulesApi from '../../devcomp/application/api/recommended-modules-api.js';
import * as campaignsApi from '../../prescription/campaign/application/api/campaigns-api.js';
import { COMBINED_COURSE_ITEM_TYPES } from '../../quest/domain/models/CombinedCourseItem.js';
import {
  OrganizationLearnerParticipation,
  OrganizationLearnerParticipationTypes,
} from '../../quest/domain/models/OrganizationLearnerParticipation.js';
import CombinedCourseDetailsService from '../../quest/domain/services/combined-course-details-service.js';
import * as campaignRepository from '../../quest/infrastructure/repositories/campaign-repository.js';
import * as combinedCourseParticipationRepository from '../../quest/infrastructure/repositories/combined-course-participation-repository.js';
import * as combinedCourseRepository from '../../quest/infrastructure/repositories/combined-course-repository.js';
import * as eligibilityRepository from '../../quest/infrastructure/repositories/eligibility-repository.js';
import * as moduleRepository from '../../quest/infrastructure/repositories/module-repository.js';
import * as questRepository from '../../quest/infrastructure/repositories/quest-repository.js';
import * as recommendedModulesRepository from '../../quest/infrastructure/repositories/recommended-module-repository.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { injectDependencies } from '../../shared/infrastructure/utils/dependency-injection.js';
import * as organizationLearnerWithParticipationApi from '../organization-learner/application/api/organization-learners-with-participations-api.js';

/*
WARNING CircularDependencies
Add injectDependencies in order to avoid `cannot access repositories before initialization`
*/
const { eligibilityRepository: injectedEligibilityRepository } = injectDependencies(
  { eligibilityRepository },
  { organizationLearnerWithParticipationApi, modulesApi },
);
const { recommendedModulesRepository: injectedRecommendedModulesRepository } = injectDependencies(
  { recommendedModulesRepository },
  { recommendedModulesApi },
);
const { moduleRepository: injectedModuleRepository } = injectDependencies({ moduleRepository }, { modulesApi });
const { campaignRepository: injectedCampaignRepository } = injectDependencies({ campaignRepository }, { campaignsApi });
const { CombinedCourseDetailsService: combinedCourseDetailsService } = injectDependencies(
  { CombinedCourseDetailsService },
  {
    combinedCourseParticipationRepository,
    combinedCourseRepository,
    eligibilityRepository: injectedEligibilityRepository,
    moduleRepository: injectedModuleRepository,
    questRepository,
    recommendedModulesRepository: injectedRecommendedModulesRepository,
    campaignRepository: injectedCampaignRepository,
  },
);

class CreateOrUpdateOrganizationLearnerParticipationsForPassages extends Script {
  constructor() {
    super({
      description: 'Script to add create organization learner participation of type PASSAGES',
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
          'view-active-organization-learners.userId',
          'combined_courses.id as combinedCourseId',
          'combined_course_participations.organizationLearnerId',
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
          const organizationLearnerParticipation = OrganizationLearnerParticipation.buildFromPassage({
            id: undefined,
            organizationLearnerId: organizationLearnerWithoutPassageOnCombinedCourse.organizationLearnerId,
            type: OrganizationLearnerParticipationTypes.PASSAGE,
            createdAt: modulePassage.createdAt,
            status: modulePassage.status,
            updatedAt: modulePassage.updatedAt,
            terminatedAt: modulePassage.terminatedAt,
            moduleId: modulePassage.id,
          });
          const learnerHasOtherPassageWithSameModules = organizationLearnerParticipationToInsert.find(
            (participation) =>
              participation.organizationLearnerId === organizationLearnerParticipation.organizationLearnerId &&
              participation.referenceId === organizationLearnerParticipation.referenceId,
          );
          if (!learnerHasOtherPassageWithSameModules) {
            organizationLearnerParticipationToInsert.push(organizationLearnerParticipation);
          }
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
