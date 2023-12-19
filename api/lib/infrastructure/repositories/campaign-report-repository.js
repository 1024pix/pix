import { knex } from '../../../db/knex-database-connection.js';
import { CampaignReport } from '../../domain/read-models/CampaignReport.js';
import { TargetProfileForSpecifier } from '../../../src/prescription/target-profile/domain/read-models/TargetProfileForSpecifier.js';
import { CampaignParticipationStatuses } from '../../domain/models/index.js';
import { NotFoundError } from '../../domain/errors.js';
import _ from 'lodash';
import * as campaignRepository from './campaign-repository.js';

const { SHARED } = CampaignParticipationStatuses;

const get = async function (id) {
  const result = await knex('campaigns')
    .select({
      id: 'campaigns.id',
      name: 'campaigns.name',
      code: 'campaigns.code',
      title: 'campaigns.title',
      idPixLabel: 'campaigns.idPixLabel',
      createdAt: 'campaigns.createdAt',
      customLandingPageText: 'campaigns.customLandingPageText',
      archivedAt: 'campaigns.archivedAt',
      type: 'campaigns.type',
      ownerId: 'users.id',
      ownerLastName: 'users.lastName',
      ownerFirstName: 'users.firstName',
      targetProfileId: 'target-profiles.id',
      targetProfileDescription: 'target-profiles.description',
      targetProfileName: 'target-profiles.name',
      multipleSendings: 'campaigns.multipleSendings',
      areKnowledgeElementsResettable: 'target-profiles.areKnowledgeElementsResettable',
    })
    .select(
      knex.raw('ARRAY_AGG("badges"."id")  AS "badgeIds"'),
      knex.raw('ARRAY_AGG("stages"."id")  AS "stageIds"'),
      knex.raw(
        '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) AS "participationsCount"',
      ),
      knex.raw(
        '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) AS "sharedParticipationsCount"',
      ),
    )
    .join('users', 'users.id', 'campaigns.ownerId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .leftJoin('badges', 'badges.targetProfileId', 'target-profiles.id')
    .leftJoin('stages', 'stages.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', id)
    .groupBy('campaigns.id', 'users.id', 'target-profiles.id')
    .first();

  if (!result) {
    throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
  }

  const campaignReport = new CampaignReport({ ...result, id });

  if (campaignReport.isAssessment) {
    const skills = await campaignRepository.findSkills({ campaignId: id, filterByStatus: 'all' });

    const targetProfile = new TargetProfileForSpecifier({
      id: result.targetProfileId,
      name: result.targetProfileName,
      tubeCount: _.uniqBy(skills, 'tubeId').length,
      thematicResultCount: _.uniq(result.badgeIds).filter((id) => id).length,
      hasStage: result.stageIds.some((stage) => stage),
      description: result.targetProfileDescription,
      areKnowledgeElementsResettable: result.areKnowledgeElementsResettable,
    });

    campaignReport.setTargetProfileInformation(targetProfile);
  }

  return campaignReport;
};

const findMasteryRatesAndValidatedSkillsCount = async function (campaignId) {
  const results = await knex('campaign-participations')
    .select('masteryRate', 'validatedSkillsCount')
    .where('isImproved', false)
    .andWhere('status', SHARED)
    .andWhere('deletedAt', null)
    .andWhere({ campaignId });

  const aggregatedResults = {
    masteryRates: [],
    validatedSkillsCounts: [],
  };

  results.forEach((result) => {
    aggregatedResults.masteryRates.push(Number(result.masteryRate));
    aggregatedResults.validatedSkillsCounts.push(Number(result.validatedSkillsCount));
  });

  return aggregatedResults;
};

export { get, findMasteryRatesAndValidatedSkillsCount };
