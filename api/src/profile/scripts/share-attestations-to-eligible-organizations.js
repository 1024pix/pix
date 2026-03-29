import * as knowledgeElementsApi from '../../evaluation/application/api/knowledge-elements-api.js';
import * as skillsApi from '../../learning-content/application/api/skills-api.js';
import * as campaignsApi from '../../prescription/campaign/application/api/campaigns-api.js';
import * as organizationLearnerWithParticipationApi from '../../prescription/organization-learner/application/api/organization-learners-with-participations-api.js';
import { CampaignParticipationStatuses } from '../../prescription/shared/domain/constants.js';
import * as targetProfilesApi from '../../prescription/target-profile/application/api/target-profile-api.js';
import { DataForQuest } from '../../quest/domain/models/DataForQuest.js';
import { Eligibility } from '../../quest/domain/models/Eligibility.js';
import * as questRepository from '../../quest/infrastructure/repositories/quest-repository.js';
import { find } from '../../quest/infrastructure/repositories/success-repository.js';
import { isoDateParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import * as organizationProfileRewardRepository from '../infrastructure/repositories/organizations-profile-reward-repository.js';

const options = {
  dryRun: {
    type: 'boolean',
    describe: 'Run the script without making any database changes',
    default: true,
  },
  startDate: {
    type: 'string',
    describe: 'Date de début de la période à traiter, jour inclus, format "YYYY-MM-DD", (ex: "2024-01-20")',
    demandOption: false,
    requiresArg: false,
    coerce: isoDateParser(),
  },
  endDate: {
    type: 'string',
    describe: 'Date de fin de la période à traiter, jour inclus, format "YYYY-MM-DD", (ex: "2024-02-27")',
    demandOption: true,
    requiresArg: false,
    coerce: isoDateParser(),
  },
};

export class ShareAttestationsToEligibleOrganizationsScript extends Script {
  constructor() {
    super({
      description: 'Share learner attestations with eligible organizations',
      permanent: false,
      options,
    });
  }

  async handle({ logger, options }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      logger.info(`BEGIN: ShareAttestationsToEligibleOrganizationsScript`);
      const profileRewards = await this.fetchProfileRewardNotShared(options.startDate, options.endDate);

      const quests = await questRepository.findAllWithReward();

      if (quests.length === 0) {
        return;
      }

      logger.info(`${profileRewards.length} profile reward to handle`);
      const eligibilitiesByUserId = {};

      for (const profileReward of profileRewards) {
        logger.info(
          `Parsing profileReward ${profileReward.id} on reward ${profileReward.rewardId} for user ${profileReward.userId}`,
        );

        const desiredQuest = quests.find((quest) => quest.rewardId === profileReward.rewardId);
        if (!desiredQuest) continue;

        if (!eligibilitiesByUserId[profileReward.userId]) {
          const eligibilities = await organizationLearnerWithParticipationApi.find({ userIds: [profileReward.userId] });

          eligibilitiesByUserId[profileReward.userId] = eligibilities.map(
            (organizationLearnersWithParticipations) => new Eligibility(organizationLearnersWithParticipations),
          );
        }

        const dataForQuests = eligibilitiesByUserId[profileReward.userId]
          .map((eligibility) => new DataForQuest({ eligibility }))
          .filter((dataForQuest) => desiredQuest.isEligible(dataForQuest));

        if (dataForQuests.length === 0) {
          continue;
        }

        for (const dataForQuest of dataForQuests) {
          logger.info(`Parsing dataForQuest of profileReward ${profileReward.id}`);

          const campaignParticipationIds = desiredQuest.findCampaignParticipationIdsContributingToQuest(dataForQuest);
          const targetProfileIds =
            desiredQuest.findTargetProfileIdsWithoutCampaignParticipationContributingToQuest(dataForQuest);
          const success = await find({
            userId: profileReward.userId,
            campaignParticipationIds,
            targetProfileIds,
            knowledgeElementsApi,
            skillsApi,
            campaignsApi,
            targetProfilesApi,
          });

          dataForQuest.success = success;
          const userHasSucceedQuest = desiredQuest.isSuccessful(dataForQuest);

          if (userHasSucceedQuest) {
            logger.info(`Quest success found for profileReward ${profileReward.id}`);

            const isParticipationShared = await knexConn('campaign-participations')
              .select('id')
              .where('status', CampaignParticipationStatuses.SHARED)
              .orderBy('createdAt', 'DESC')
              .whereIn('id', campaignParticipationIds)
              .first();

            if (isParticipationShared) {
              logger.info(
                `Inserting organizationProfileReward for ${profileReward.id} on organization ${dataForQuest.organization.id}`,
              );
              await organizationProfileRewardRepository.save({
                organizationId: dataForQuest.organization.id,
                profileRewardId: profileReward.id,
              });
            }
          }
        }
      }

      if (options.dryRun) {
        await knexConn.rollback();
        logger.info(`ROLLBACK: ShareAttestationsToEligibleOrganizationsScript`);
        logger.info(`--dryRun false to persist changes`);
        return;
      }

      logger.info(`COMMIT: ShareAttestationsToEligibleOrganizationsScript`);
    });
  }

  async fetchProfileRewardNotShared(startDate, endDate) {
    const knexConn = DomainTransaction.getConnection();

    const queryBuilder = knexConn('profile-rewards')
      .select('profile-rewards.userId', 'profile-rewards.id', 'profile-rewards.rewardId')
      .leftJoin('organizations-profile-rewards', 'organizations-profile-rewards.profileRewardId', 'profile-rewards.id')
      .whereNull('organizations-profile-rewards.id')
      .orderBy('profile-rewards.id');

    if (startDate) queryBuilder.where('createdAt', '>=', startDate);
    if (endDate) queryBuilder.where('createdAt', '<=', endDate);

    return queryBuilder;
  }
}

await ScriptRunner.execute(import.meta.url, ShareAttestationsToEligibleOrganizationsScript);
