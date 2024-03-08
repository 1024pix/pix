import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import * as algorithmSimulatorSerializer from '../../infrastructure/serializers/jsonapi/smart-random-simulator-serializer.js';

const getNextChallenge = async function (
  request,
  h,
  dependencies = { requestResponseUtils, algorithmSimulatorSerializer },
) {
  const deserializedPayload = await dependencies.algorithmSimulatorSerializer.deserialize(request.payload);

  return evaluationUsecases.getNextChallengeForSimulator({ simulationParameters: deserializedPayload });
};
const smartRandomSimulatorController = { getNextChallenge };
export { smartRandomSimulatorController };
