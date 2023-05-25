import { SCENARIO_SIMULATOR_SERIALIZER_CONFIGURATION } from './scenario-simulator-serializer.js';
import { Serializer } from 'jsonapi-serializer';

const SERIALIZER_CONFIGURATION = {
  id: 'index',
  attributes: ['simulationReport'],
  transform: (record) => {
    return {
      ...record,
      simulationReport: record.simulationReport.map(SCENARIO_SIMULATOR_SERIALIZER_CONFIGURATION.transform),
    };
  },
  simulationReport: SCENARIO_SIMULATOR_SERIALIZER_CONFIGURATION,
};

function serialize(scenarioSimulator = {}) {
  return new Serializer('scenario-simulator-batch', SERIALIZER_CONFIGURATION).serialize(scenarioSimulator);
}

export const scenarioSimulatorBatchSerializer = { serialize };
