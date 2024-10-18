import * as requestResponseUtils from '../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as questResultSerializer from '../infrastructure/serializers/quest-result-serializer.js';

const getQuestResults = async function (request, h, dependencies = { questResultSerializer, requestResponseUtils }) {
  const { campaignParticipationId } = request.params;
  const userId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);

  const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  const serializedQuestResults = dependencies.questResultSerializer.serialize(questResults);

  return h.response(serializedQuestResults);
};

const questController = {
  getQuestResults,
};

export { questController };
