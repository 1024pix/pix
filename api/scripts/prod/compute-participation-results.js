// Usage: node compute-participation-results.js

require('dotenv').config({ path: `${__dirname}/../../.env` });

const knowlegeElementSnapshotRepository = require('../../lib/infrastructure/repositories/knowledge-element-snapshot-repository');
const skillDatasource = require('../../lib/infrastructure/datasources/learning-content/skill-datasource');
const ParticipantResultsShared = require('../../lib/domain/models/ParticipantResultsShared');
const CampaignParticipationStatuses = require('../../lib/domain/models/CampaignParticipationStatuses');

const { SHARED } = CampaignParticipationStatuses;

const { knex } = require('../../db/knex-database-connection');
const _ = require('lodash');
const bluebird = require('bluebird');
const constants = require('../../lib/infrastructure/constants');

let count;
let total;
let logEnable;
async function computeParticipantResultsShared(concurrency = 1, log = true) {
  logEnable = log;
  const campaigns = await knex('campaigns')
    .distinct('campaigns.id')
    .select('campaigns.id')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ status: SHARED, pixScore: null });
  count = 0;
  total = campaigns.length;
  _log(`Campagnes à traiter ${total}`);

  await bluebird.map(campaigns, _updateCampaignParticipations, { concurrency });
}

async function _updateCampaignParticipations(campaign) {
  const participationResults = await _computeCampaignParticipationResults(campaign);

  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`UPDATE "campaign-participations"
  SET "validatedSkillsCount" = "participationSkillCounts"."validatedSkillsCount", "masteryRate" = "participationSkillCounts"."masteryRate", "pixScore" = "participationSkillCounts"."pixScore"
  FROM (VALUES ${_toSQLValues(
    participationResults
  )}) AS "participationSkillCounts"(id, "validatedSkillsCount", "masteryRate", "pixScore")
  WHERE "campaign-participations".id = "participationSkillCounts".id`);

  count++;
  _log(`${count} / ${total}`);
}

async function _computeCampaignParticipationResults(campaign) {
  const campaignParticipationInfosChunks = await _getCampaignParticipationChunks(campaign);
  const targetedSkillIds = await _fetchTargetedSkillIds(campaign.id);
  const computeResultsWithTargetedSkillIds = _.partial(_computeResults, targetedSkillIds);

  const participantsResults = await bluebird.mapSeries(
    campaignParticipationInfosChunks,
    computeResultsWithTargetedSkillIds
  );

  return participantsResults.flat();
}

async function _getCampaignParticipationChunks(campaign) {
  const campaignParticipations = await knex('campaign-participations').select(['userId', 'sharedAt', 'id']).where({
    campaignId: campaign.id,
    pixScore: null,
    status: SHARED,
  });

  return _.chunk(campaignParticipations, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
}

async function _fetchTargetedSkillIds(campaignId) {
  const skillIds = await knex('campaigns')
    .pluck('skillId')
    .join('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'campaigns.targetProfileId')
    .where('campaigns.id', campaignId);

  const targetedSkillIds = await skillDatasource.findOperativeByRecordIds(skillIds);

  return targetedSkillIds.map(({ id }) => id);
}

async function _computeResults(targetedSkillIds, campaignParticipation) {
  const knowledgeElementByUser = await _getKnowledgeElementsByUser(campaignParticipation);

  return campaignParticipation.map(({ userId, id }) => {
    return new ParticipantResultsShared({
      campaignParticipationId: id,
      knowledgeElements: knowledgeElementByUser[userId],
      targetedSkillIds,
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

module.exports = computeParticipantResultsShared;

let exitCode;
const SUCCESS = 0;
const FAILURE = 1;
const concurrency = parseInt(process.argv[2]);

if (require.main === module) {
  computeParticipantResultsShared(concurrency).then(handleSuccess).catch(handleError).finally(exit);
}

function handleSuccess() {
  exitCode = SUCCESS;
}

function handleError(err) {
  console.error(err);
  exitCode = FAILURE;
}

function exit() {
  console.log('code', exitCode);
  process.exit(exitCode);
}

function _log(message) {
  if (logEnable) {
    console.log(message);
  }
}
