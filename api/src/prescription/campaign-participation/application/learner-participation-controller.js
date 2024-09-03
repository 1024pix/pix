import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { monitoringTools } from '../../../shared/infrastructure/monitoring-tools.js';
import { ApplicationTransaction } from '../../shared/infrastructure/ApplicationTransaction.js';
import { usecases } from '../domain/usecases/index.js';
import * as campaignParticipationSerializer from '../infrastructure/serializers/jsonapi/campaign-participation-serializer.js';

const save = async function (request, h, dependencies = { campaignParticipationSerializer, monitoringTools }) {
  const userId = request.auth.credentials.userId;
  const campaignParticipation = await dependencies.campaignParticipationSerializer.deserialize(request.payload);

  const { campaignParticipation: campaignParticipationCreated } = await DomainTransaction.execute(() => {
    return usecases.startCampaignParticipation({ campaignParticipation, userId });
  });

  return h.response(dependencies.campaignParticipationSerializer.serialize(campaignParticipationCreated)).created();
};

const shareCampaignResult = async function (request, _) {
  const userId = request.auth.credentials.userId;
  const campaignParticipationId = request.params.campaignParticipationId;

  await ApplicationTransaction.execute(async () => {
    await usecases.shareCampaignResult({
      userId,
      campaignParticipationId,
    });
  });

  return null;
};

const beginImprovement = async function (request) {
  const userId = request.auth.credentials.userId;
  const campaignParticipationId = request.params.campaignParticipationId;

  return DomainTransaction.execute(async () => {
    await usecases.beginCampaignParticipationImprovement({
      campaignParticipationId,
      userId,
    });
    return null;
  });
};

const learnerParticipationController = {
  save,
  shareCampaignResult,
  beginImprovement,
};

export { learnerParticipationController };
