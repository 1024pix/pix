import { usecases } from '../../domain/usecases/index.js';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import { scenarioSimulatorSerializer } from '../../infrastructure/serializers/jsonapi/scenario-simulator-serializer.js';

async function simulateFlashDeterministicAssessmentScenario(
  request,
  h,
  dependencies = { scenarioSimulatorSerializer }
) {
  const { assessmentId, simulationAnswers } = request.payload;
  const locale = extractLocaleFromRequest(request);

  const result = await usecases.simulateFlashDeterministicAssessmentScenario({
    simulationAnswers,
    assessmentId,
    locale,
  });

  const simulatorResponse = result.map((answer, index) => {
    return {
      ...answer,
      id: answer.challenge.id,
      minimumCapability: answer.challenge.minimumCapability,
      simulationAnswer: simulationAnswers[index],
    };
  });

  return dependencies.scenarioSimulatorSerializer.serialize(simulatorResponse);
}

export const scenarioSimulatorController = { simulateFlashDeterministicAssessmentScenario };
