import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { campaignParticipationSerializer } from '../infrastructure/serializers/jsonapi/campaign-participation-serializer.js';
import { sharedProfileForCampaignSerializer } from '../infrastructure/serializers/jsonapi/shared-profile-for-campaign-serializer.js';

const save = async function (request, h, dependencies = { campaignParticipationSerializer }) {
  const userId = request.auth.credentials.userId;
  const campaignParticipation = await dependencies.campaignParticipationSerializer.deserialize(request.payload);

  const { campaignParticipation: campaignParticipationCreated } = await usecases.startCampaignParticipation({
    campaignParticipation,
    userId,
  });

  return h.response(dependencies.campaignParticipationSerializer.serialize(campaignParticipationCreated)).created();
};

const shareCampaignResult = withTransaction(async function (request, _) {
  const userId = request.auth.credentials.userId;
  const campaignParticipationId = request.params.campaignParticipationId;

  await usecases.shareCampaignResult({
    userId,
    campaignParticipationId,
  });

  return null;
});

const getSharedCampaignParticipationProfile = async function (
  request,
  h,
  dependencies = {
    sharedProfileForCampaignSerializer,
  },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const campaignId = request.params.campaignId;
  const locale = getChallengeLocale(request);

  const sharedProfileForCampaign = await usecases.getSharedCampaignParticipationProfile({
    userId: authenticatedUserId,
    campaignId,
    locale,
  });

  return dependencies.sharedProfileForCampaignSerializer.serialize(sharedProfileForCampaign);
};

const learnerParticipationController = {
  save,
  shareCampaignResult,
  getSharedCampaignParticipationProfile,
};

export { learnerParticipationController };
