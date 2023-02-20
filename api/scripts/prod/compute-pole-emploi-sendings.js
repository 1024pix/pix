import campaignRepository from '../../lib/infrastructure/repositories/campaign-repository';
import campaignParticipationResultRepository from '../../lib/infrastructure/repositories/campaign-participation-result-repository';
import targetProfileRepository from '../../lib/infrastructure/repositories/target-profile-repository';
import poleEmploiSendingRepository from '../../lib/infrastructure/repositories/pole-emploi-sending-repository';
import userRepository from '../../lib/infrastructure/repositories/user-repository';
import PoleEmploiPayload from '../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload';
import PoleEmploiSending from '../../lib/domain/models/PoleEmploiSending';
import { knex, disconnect } from '../../db/knex-database-connection';
import bluebird from 'bluebird';
let count;
let total;

async function computePoleEmploiSendings(campaignCode, concurrency) {
  const campaignParticipationsStarted = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.createdAt',
      'campaign-participations.userId',
      'campaign-participations.campaignId'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-tags', 'organization-tags.organizationId', 'campaigns.organizationId')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin('pole-emploi-sendings', function () {
      this.on({ 'pole-emploi-sendings.campaignParticipationId': 'campaign-participations.id' }).andOnVal(
        'pole-emploi-sendings.type',
        PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START
      );
    })
    .where({ 'pole-emploi-sendings.id': null, 'tags.name': 'POLE EMPLOI', 'campaigns.code': campaignCode });
  count = 0;
  total = campaignParticipationsStarted.length;
  console.log(`Participations commencées à traiter : ${total}`);

  await bluebird.map(campaignParticipationsStarted, _computeStartedPoleEmploiSendings, { concurrency });

  const campaignParticipationsCompleted = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.createdAt',
      'campaign-participations.userId',
      'campaign-participations.campaignId',
      'assessments.updatedAt as assessmentUpdatedAt'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-tags', 'organization-tags.organizationId', 'campaigns.organizationId')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
    .leftJoin('pole-emploi-sendings', function () {
      this.on({ 'pole-emploi-sendings.campaignParticipationId': 'campaign-participations.id' }).andOnVal(
        'pole-emploi-sendings.type',
        PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION
      );
    })
    .where({
      'pole-emploi-sendings.id': null,
      'tags.name': 'POLE EMPLOI',
      'campaigns.code': campaignCode,
      'assessments.state': 'completed',
    });
  count = 0;
  total = campaignParticipationsCompleted.length;
  console.log(`Participations terminées à traiter : ${total}`);

  await bluebird.map(campaignParticipationsCompleted, _computeCompletedPoleEmploiSendings, { concurrency });

  const campaignParticipationsShared = await knex('campaign-participations')
    .select(
      'campaign-participations.id',
      'campaign-participations.createdAt',
      'campaign-participations.userId',
      'campaign-participations.campaignId',
      'campaign-participations.sharedAt'
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .join('organization-tags', 'organization-tags.organizationId', 'campaigns.organizationId')
    .join('tags', 'tags.id', 'organization-tags.tagId')
    .leftJoin('pole-emploi-sendings', function () {
      this.on({ 'pole-emploi-sendings.campaignParticipationId': 'campaign-participations.id' }).andOnVal(
        'pole-emploi-sendings.type',
        PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING
      );
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
  const participationResult = await campaignParticipationResultRepository.getByParticipationId(participation.id);

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

const campaignCode = process.argv[2];
const concurrency = parseInt(process.argv[3]);

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  await computePoleEmploiSendings(campaignCode, concurrency);
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

export default computePoleEmploiSendings;
