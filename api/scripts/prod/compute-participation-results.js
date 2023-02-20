// Usage: node compute-participation-results.js
require('dotenv').config({ path: `${__dirname}/../../.env` });
import knowlegeElementSnapshotRepository from '../../lib/infrastructure/repositories/knowledge-element-snapshot-repository';
import campaignRepository from '../../lib/infrastructure/repositories/campaign-repository';
import ParticipantResultsShared from '../../lib/domain/models/ParticipantResultsShared';
import CampaignParticipationStatuses from '../../lib/domain/models/CampaignParticipationStatuses';
const { SHARED } = CampaignParticipationStatuses;
import { knex, disconnect } from '../../db/knex-database-connection';
import _ from 'lodash';
import bluebird from 'bluebird';
import constants from '../../lib/infrastructure/constants';
import placementProfileService from '../../lib/domain/services/placement-profile-service';
import competenceRepository from '../../lib/infrastructure/repositories/competence-repository';

const concurrency = parseInt(process.argv[2]);
let count;
let total;
let logEnable;

function _log(message) {
  if (logEnable) {
    console.log(message);
  }
}

async function computeParticipantResultsShared(concurrency = 1, log = true) {
  logEnable = log;
  const campaigns = await knex('campaigns')
    .select('campaigns.id')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ status: SHARED, pixScore: null, type: 'ASSESSMENT' })
    .orWhere({ status: SHARED, isCertifiable: null, type: 'PROFILES_COLLECTION' });
  const uniqueCampaigns = _.uniqBy(campaigns, 'id');
  count = 0;
  total = uniqueCampaigns.length;
  _log(`Campagnes à traiter ${total}`);

  await bluebird.map(uniqueCampaigns, _updateCampaignParticipations, { concurrency });
}

async function _updateCampaignParticipations(campaign) {
  const participationResults = await _computeCampaignParticipationResults(campaign);

  const participationResultsWithIsCertifiable = participationResults.filter(
    (participationResult) => !_.isNil(participationResult.isCertifiable)
  );

  if (!_.isEmpty(participationResultsWithIsCertifiable)) {
    // eslint-disable-next-line knex/avoid-injections
    await knex.raw(`UPDATE "campaign-participations"
    SET "validatedSkillsCount" = "participationSkillCounts"."validatedSkillsCount", "masteryRate" = "participationSkillCounts"."masteryRate", "pixScore" = "participationSkillCounts"."pixScore", "isCertifiable" = "participationSkillCounts"."isCertifiable"
    FROM (VALUES ${_toSQLValuesWithIsCertifiable(
      participationResultsWithIsCertifiable
    )}) AS "participationSkillCounts"(id, "validatedSkillsCount", "masteryRate", "pixScore", "isCertifiable")
      WHERE "campaign-participations".id = "participationSkillCounts".id`);
  }

  const participationResultsWithIsCertifiableAsNull = _.difference(
    participationResults,
    participationResultsWithIsCertifiable
  );
  if (!_.isEmpty(participationResultsWithIsCertifiableAsNull)) {
    // eslint-disable-next-line knex/avoid-injections
    await knex.raw(`UPDATE "campaign-participations"
    SET "validatedSkillsCount" = "participationSkillCounts"."validatedSkillsCount", "masteryRate" = "participationSkillCounts"."masteryRate", "pixScore" = "participationSkillCounts"."pixScore"
    FROM (VALUES ${_toSQLValues(
      participationResultsWithIsCertifiableAsNull
    )}) AS "participationSkillCounts"(id, "validatedSkillsCount", "masteryRate", "pixScore")
      WHERE "campaign-participations".id = "participationSkillCounts".id`);
  }
  count++;
  _log(`${count} / ${total}`);
}

async function _computeCampaignParticipationResults(campaign) {
  const competences = await competenceRepository.listPixCompetencesOnly();
  const campaignParticipationInfosChunks = await _getCampaignParticipationChunks(campaign);
  const skillIds = await campaignRepository.findSkillIds({ campaignId: campaign.id });
  const computeResultsWithTargetedSkillIds = _.partial(_computeResults, skillIds, competences);

  const participantsResults = await bluebird.mapSeries(
    campaignParticipationInfosChunks,
    computeResultsWithTargetedSkillIds
  );

  return participantsResults.flat();
}

async function _getCampaignParticipationChunks(campaign) {
  const campaignParticipations = await knex('campaign-participations')
    .select(['userId', 'sharedAt', 'campaign-participations.id'])
    .join('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ campaignId: campaign.id, status: SHARED, pixScore: null, 'campaigns.type': 'ASSESSMENT' })
    .orWhere({ campaignId: campaign.id, status: SHARED, isCertifiable: null, 'campaigns.type': 'PROFILES_COLLECTION' });
  return _.chunk(campaignParticipations, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
}

async function _computeResults(skillIds, competences, campaignParticipations) {
  const knowledgeElementByUser = await _getKnowledgeElementsByUser(campaignParticipations);

  const userIdsAndDates = {};
  campaignParticipations.forEach(({ userId, sharedAt }) => (userIdsAndDates[userId] = sharedAt));
  const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
    userIdsAndDates,
    competences,
    allowExcessPixAndLevels: false,
  });
  return campaignParticipations.map(({ userId, id }) => {
    return new ParticipantResultsShared({
      campaignParticipationId: id,
      knowledgeElements: knowledgeElementByUser[userId],
      skillIds,
      placementProfile: placementProfiles.find((placementProfile) => placementProfile.userId === userId),
    });
  });
}

async function _getKnowledgeElementsByUser(campaignParticipations) {
  const sharingDateByUserId = {};
  campaignParticipations.forEach(({ userId, sharedAt }) => (sharingDateByUserId[userId] = sharedAt));
  const knowledgeElementByUser = await knowlegeElementSnapshotRepository.findByUserIdsAndSnappedAtDates(
    sharingDateByUserId
  );
  return knowledgeElementByUser;
}

function _toSQLValues(participantsResults) {
  return participantsResults
    .map(
      ({ id, validatedSkillsCount, masteryRate, pixScore }) =>
        `(${id}, ${validatedSkillsCount}, ${masteryRate}, ${pixScore})`
    )
    .join(', ');
}

function _toSQLValuesWithIsCertifiable(participantsResults) {
  return participantsResults
    .map(
      ({ id, validatedSkillsCount, masteryRate, pixScore, isCertifiable }) =>
        `(${id}, ${validatedSkillsCount}, ${masteryRate}, ${pixScore}, ${isCertifiable})`
    )
    .join(', ');
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  await computeParticipantResultsShared(concurrency);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default computeParticipantResultsShared;
