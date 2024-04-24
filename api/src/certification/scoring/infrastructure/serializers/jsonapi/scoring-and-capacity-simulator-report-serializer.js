import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

/**
 * @param {ScoringAndCapacitySimulatorReport} scoringAndCapacitySimulatorReport
 */
const serialize = function (scoringAndCapacitySimulatorReport = {}) {
  return new Serializer('scoring-and-capacity-simulator-report', {
    attributes: ['capacity', 'score', 'competences'],
  }).serialize(scoringAndCapacitySimulatorReport);
};

export { serialize };
