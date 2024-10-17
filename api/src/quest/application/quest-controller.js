import { usecases } from '../../quest/domain/usecases/index.js';

const getQuestResults = async function (request, h, dependencies = {}) {
  const { userId, campaignParticipationId } = request.params;

  const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  const serializedQuestResults = dependencies.BLABLA_SERIALIZER.serialize(questResults);

  return h.response(serializedQuestResults);
};

const questController = {
  getQuestResults,
};

export { questController };
