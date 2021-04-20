// Usage: node compute-pole-emploi-sendings PIXEMPLOI 10
const campaignRepository = require('../../lib/infrastructure/repositories/campaign-repository');
const campaignParticipationResultRepository = require('../../lib/infrastructure/repositories/campaign-participation-result-repository');
const targetProfileRepository = require('../../lib/infrastructure/repositories/target-profile-repository');
const poleEmploiSendingRepository = require('../../lib/infrastructure/repositories/pole-emploi-sending-repository');
const userRepository = require('../../lib/infrastructure/repositories/user-repository');
const PoleEmploiPayload = require('../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload');
const PoleEmploiSending = require('../../lib/domain/models/PoleEmploiSending');
const { knex } = require('../../db/knex-database-connection');
const bluebird = require('bluebird');
let count;
let total;

async function computePoleEmploiSendings(campaignCode, concurrency) {
  const campaignParticipationsStarted = await knex('campaign-participations')
    .select('campaign-participations.id', 'campaign-participations.createdAt', 'campaign-participations.userId', 'campaign-participations.campaignId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-tags', 'organization-tags.organizationId', 'campaigns.organizationId')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin('pole-emploi-sendings', function() {
      this.on({ 'pole-emploi-sendings.campaignParticipationId': 'campaign-participations.id' })
        .andOnVal('pole-emploi-sendings.type', PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START);
    })
    .where({ 'pole-emploi-sendings.id': null, 'tags.name': 'POLE EMPLOI', 'campaigns.code': campaignCode });
  count = 0;
  total = campaignParticipationsStarted.length;
  console.log(`Participations commencées à traiter : ${total}`);

  await bluebird.map(campaignParticipationsStarted, _computeStartedPoleEmploiSendings, { concurrency });

  const campaignParticipationsCompleted = await knex('campaign-participations')
    .select('campaign-participations.id', 'campaign-participations.createdAt', 'campaign-participations.userId', 'campaign-participations.campaignId', 'assessments.updatedAt as assessmentUpdatedAt')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-tags', 'organization-tags.organizationId', 'campaigns.organizationId')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .leftJoin('pole-emploi-sendings', function() {
      this.on({ 'pole-emploi-sendings.campaignParticipationId': 'campaign-participations.id' })
        .andOnVal('pole-emploi-sendings.type', PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION);
    })
    .where({ 'pole-emploi-sendings.id': null, 'tags.name': 'POLE EMPLOI', 'campaigns.code': campaignCode, 'assessments.state': 'completed' });
  count = 0;
  total = campaignParticipationsCompleted.length;
  console.log(`Participations terminées à traiter : ${total}`);

  await bluebird.map(campaignParticipationsCompleted, _computeCompletedPoleEmploiSendings, { concurrency });

  const campaignParticipationsShared = await knex('campaign-participations')
    .select('campaign-participations.id', 'campaign-participations.createdAt', 'campaign-participations.userId', 'campaign-participations.campaignId', 'campaign-participations.sharedAt')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-tags', 'organization-tags.organizationId', 'campaigns.organizationId')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin('pole-emploi-sendings', function() {
      this.on({ 'pole-emploi-sendings.campaignParticipationId': 'campaign-participations.id' })
        .andOnVal('pole-emploi-sendings.type', PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING);
    })
    .where({ 'pole-emploi-sendings.id': null, 'tags.name': 'POLE EMPLOI', 'campaigns.code': campaignCode })
    .whereNotNull('campaign-participations.sharedAt');
  count = 0;
  total = campaignParticipationsShared.length;
  console.log(`Participations partagées à traiter : ${total}`);

  await bluebird.map(campaignParticipationsShared, _computeSharedPoleEmploiSendings, { concurrency });
}

async function _computeStartedPoleEmploiSendings(participation) {
  const user = await userRepository.get(participation.userId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);

  const payload = PoleEmploiPayload.buildForParticipationStarted({
    user,
    campaign,
    targetProfile,
    participation,
  });

  const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
    campaignParticipationId: participation.id,
    payload: payload.toString(),
    isSuccessful: false,
    responseCode: 'NOT_SENT',
  });

  await poleEmploiSendingRepository.create({ poleEmploiSending });

  count++;
  console.log(`${count} / ${total}`);
}

async function _computeCompletedPoleEmploiSendings(participation) {
  const user = await userRepository.get(participation.userId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
  const assessment = { updatedAt: participation.assessmentUpdatedAt };

  const payload = PoleEmploiPayload.buildForParticipationFinished({
    user,
    campaign,
    targetProfile,
    participation,
    assessment,
  });

  const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
    campaignParticipationId: participation.id,
    payload: payload.toString(),
    isSuccessful: false,
    responseCode: 'NOT_SENT',
  });

  await poleEmploiSendingRepository.create({ poleEmploiSending });

  count++;
  console.log(`${count} / ${total}`);
}

async function _computeSharedPoleEmploiSendings(participation) {
  const user = await userRepository.get(participation.userId);
  const campaign = await campaignRepository.get(participation.campaignId);
  const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
  const participationResult = await campaignParticipationResultRepository.getByParticipationId({ campaignParticipationId: participation.id });

  const payload = PoleEmploiPayload.buildForParticipationShared({
    user,
    campaign,
    targetProfile,
    participation,
    participationResult,
  });

  const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
    campaignParticipationId: participation.id,
    payload: payload.toString(),
    isSuccessful: false,
    responseCode: 'NOT_SENT',
  });

  await poleEmploiSendingRepository.create({ poleEmploiSending });

  count++;
  console.log(`${count} / ${total}`);
}

let exitCode;
const SUCCESS = 0;
const FAILURE = 1;
const campaignCode = process.argv[2];
const concurrency = parseInt(process.argv[3]);

if (require.main === module) {
  computePoleEmploiSendings(campaignCode, concurrency)
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

module.exports = computePoleEmploiSendings;
