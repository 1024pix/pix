// Usage: node compute-validated-skills-count-for-assessment-campaign-participation
/* eslint-disable no-restricted-syntax */
const targetProfileWithLearningContentRepository = require('../../lib/infrastructure/repositories/target-profile-with-learning-content-repository');
const knowlegeElementRepository = require('../../lib/infrastructure/repositories/knowledge-element-repository');
const { knex } = require('../../db/knex-database-connection');
const _ = require('lodash');
const bluebird = require('bluebird');
const constants = require('../../lib/infrastructure/constants');

let count;
let total;

async function computeValidatedSkillsCount(concurrency) {
  const campaigns = await knex('campaigns')
    .distinct('campaigns.id')
    .select('campaigns.id')
    .where({ type: 'ASSESSMENT' })
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({
      type: 'ASSESSMENT',
      isShared: true,
      validatedSkillsCount: null,
    });
  count = 0;
  total = campaigns.length;
  console.log(`Campagnes à traiter ${total}`);

  await bluebird.map(campaigns, _updateCampaignParticipations, { concurrency });
}

async function _updateCampaignParticipations(campaign) {
  const validatedSkillsByParticipationId = await _validatedSkillsCountByUser(campaign);

  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`UPDATE "campaign-participations"
  SET "validatedSkillsCount" = "participationSkillCounts"."validatedSkillsCount"
  FROM (VALUES ${_toSQLValues(validatedSkillsByParticipationId)}) AS "participationSkillCounts"(id, "validatedSkillsCount")
  WHERE "campaign-participations".id = "participationSkillCounts".id`);

  count++;
  console.log(`${count} / ${total}`);
}

async function _validatedSkillsCountByUser(campaign) {
  const campaignParticipationInfos = await _getSharingDateByUserId(campaign);
  const campaignParticipationInfosChunks = _.chunk(campaignParticipationInfos, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  const targetProfile = await targetProfileWithLearningContentRepository.getByCampaignId({ campaignId: campaign.id });
  let validatedSkillsCountByUser = [];

  await bluebird.mapSeries(campaignParticipationInfosChunks, async (campaignParticipationInfosChunk) => {
    const sharingDateByUserId = {};
    campaignParticipationInfosChunk.forEach(({ userId, sharedAt }) => sharingDateByUserId[userId] = sharedAt);
    const validatedKnowledgeElementByCompetencesByUser = await knowlegeElementRepository.findTargetedGroupedByCompetencesForUsers(sharingDateByUserId, targetProfile);
    validatedSkillsCountByUser = [...validatedSkillsCountByUser, ..._.entries(validatedKnowledgeElementByCompetencesByUser).map(_countValidatedSkills)];
  });

  return validatedSkillsCountByUser.map(([ userId, validatedSkillsCount ]) => {
    const campaignParticipation = campaignParticipationInfos.find((campaignParticipation) => campaignParticipation.userId == userId);
    return [campaignParticipation.id, validatedSkillsCount];
  });

}

async function _getSharingDateByUserId(campaign) {

  return knex('campaign-participations')
    .select(['userId', 'sharedAt', 'id'])
    .where({
      campaignId: campaign.id,
      validatedSkillsCount: null,
      isShared: true,
    });
}

function _countValidatedSkills([userId, validatedKnowledgeElementByCompetence]) {
  const validatedSkillsCount = _.values(validatedKnowledgeElementByCompetence).flatMap((knowledgeElements) => knowledgeElements.filter(({ status }) => status === 'validated')).length;
  return [userId, validatedSkillsCount];
}

function _toSQLValues(validatedSkillsByParticipationId) {
  return validatedSkillsByParticipationId.map(([id, validatedSkillsCount]) => `(${id}, ${validatedSkillsCount})`).join(', ');
}

module.exports = computeValidatedSkillsCount;
let exitCode;
const SUCCESS = 0;
const FAILURE = 1;
const concurrency = parseInt(process.argv[2]);

if (require.main === module) {
  computeValidatedSkillsCount(concurrency)
    .then(handleSuccess)
    .catch(handleError)
    .finally(exit);
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
