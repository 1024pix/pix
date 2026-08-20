import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

/**
 * @param {ScoringAndCapacitySimulatorReport} scoringAndCapacitySimulatorReport
 */
export function serialize(scoringAndCapacitySimulatorReport = {}) {
  return new Serializer('scoring-and-capacity-simulator-report', {
    attributes: ['capacity', 'score', 'competences'],
  }).serialize(scoringAndCapacitySimulatorReport);
}
