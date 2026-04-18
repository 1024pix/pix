import { clearLog, startLogging } from '../../domain/services/smart-random-log-service.js';
import { evaluationUsecases } from '../../domain/usecases/index.js';
import * as algorithmSimulatorSerializer from '../../infrastructure/serializers/jsonapi/smart-random-simulator-serializer.js';

const getNextChallenge = async function (request, h, dependencies = { algorithmSimulatorSerializer }) {
  const deserializedPayload = await dependencies.algorithmSimulatorSerializer.deserialize(request.payload);

  try {
    startLogging();
    const response = evaluationUsecases.getNextChallengeForSimulator({ simulationParameters: deserializedPayload });
    clearLog();
    const challenge = response.challenge
      ? {
          id: response.challenge.id,
        }
      : null;
    return {
      challenge,
      smartRandomLog: response.smartRandomLog,
    };
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
