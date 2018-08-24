const faker = require('faker');
const SmartPlacementAnswer = require('../../../lib/domain/models/SmartPlacementAnswer');

module.exports = function buildSmartPlacementAnswer({
  id = faker.random.number(),
  // attributes
  result = SmartPlacementAnswer.ResultType.OK,

  // relationship Ids
  challengeId = faker.random.uuid(),
} = {}) {
  return new SmartPlacementAnswer({
    id,
    result,
    challengeId,
  });
};
