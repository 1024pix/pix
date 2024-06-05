import { usecases as devcompUsecases } from '../../../src/devcomp/domain/usecases/index.js';
import * as trainingSerializer from '../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';
import { extractLocaleFromRequest } from '../../../src/shared/infrastructure/utils/request-response-utils.js';

const findTrainings = async function (request, h, dependencies = { trainingSerializer }) {
  const { userId } = request.auth.credentials;
  const { id: campaignParticipationId } = request.params;
  const locale = extractLocaleFromRequest(request);

  const trainings = await devcompUsecases.findCampaignParticipationTrainings({
    userId,
    campaignParticipationId,
    locale,
  });
  return dependencies.trainingSerializer.serialize(trainings);
};

const campaignParticipationController = {
  findTrainings,
};

export { campaignParticipationController };
