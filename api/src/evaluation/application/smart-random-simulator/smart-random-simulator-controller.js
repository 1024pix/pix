import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import { clearLog, startLogging } from '../../domain/services/smart-random-log-service.js';
import { smartRandomSimulatorSerializer } from '../../infrastructure/serializers/jsonapi/smart-random-simulator-serializer.js';

const getNextChallenge = async function (
  request,
  h,
  dependencies = { algorithmSimulatorSerializer: smartRandomSimulatorSerializer },
) {
  const deserializedPayload = await dependencies.algorithmSimulatorSerializer.deserialize(request.payload);

  try {
    startLogging();
    const response = evaluationUsecases.getNextChallengeForSimulator({ simulationParameters: deserializedPayload });
    clearLog();
    return response;
  } catch (error) {
    clearLog();
    throw error;
  }
};

const getInputValuesForCampaign = async function (request) {
  const campaignId = request.params.campaignId;
  const locale = request.params.locale;
  return evaluationUsecases.getCampaignParametersForSimulator({ campaignId, locale });
};

const smartRandomSimulatorController = { getNextChallenge, getInputValuesForCampaign };
export { smartRandomSimulatorController };
