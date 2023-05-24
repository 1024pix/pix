import { Serializer } from 'jsonapi-serializer';

export const SCENARIO_SIMULATOR_SERIALIZER_CONFIGURATION = {
  transform: ({ simulationAnswer, ...answer }) => ({
    ...answer,
    id: answer.challenge.id,
    minimumCapability: answer.challenge.minimumCapability,
    difficulty: answer.challenge.difficulty,
    discriminant: answer.challenge.discriminant,
    simulationAnswer: simulationAnswer,
  }),
  attributes: ['minimumCapability', 'reward', 'errorRate', 'estimatedLevel', 'answer', 'difficulty', 'discriminant'],
};

function serialize(scenarioSimulator = {}) {
  return new Serializer('scenario-simulator-challenge', SCENARIO_SIMULATOR_SERIALIZER_CONFIGURATION).serialize(
    scenarioSimulator
  );
}

export const scenarioSimulatorSerializer = { serialize };
