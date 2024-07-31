import { Serializer } from 'jsonapi-serializer';

const SERIALIZER_CONFIGURATION = {
  id: 'index',
  attributes: ['simulationReport'],
  transform: (record) => {
    return {
      ...record,
      simulationReport: record.simulationReport.map(_transformSimulationReport),
    };
  },
  simulationReport: {
    attributes: [
      'challengeId',
      'minimumCapability',
      'reward',
      'errorRate',
      'capacity',
      'answerStatus',
      'difficulty',
      'discriminant',
    ],
  },
};

function serialize(scenarioSimulator = {}) {
  return new Serializer('scenario-simulator-batch', SERIALIZER_CONFIGURATION).serialize(scenarioSimulator);
}

export const scenarioSimulatorBatchSerializer = { serialize };

const _transformSimulationReport = (answer) => ({
  ...answer,
  challengeId: answer.challenge.id,
  minimumCapability: answer.challenge.minimumCapability,
  difficulty: answer.challenge.difficulty,
  discriminant: answer.challenge.discriminant,
});
