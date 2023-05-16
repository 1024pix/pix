import { Serializer } from 'jsonapi-serializer';

function serialize(scenarioSimulator = {}) {
  return new Serializer('scenario-simulator-challenge', {
    attributes: ['minimumCapability', 'reward', 'errorRate', 'estimatedLevel', 'simulationAnswer'],
  }).serialize(scenarioSimulator);
}

export const scenarioSimulatorSerializer = { serialize };
