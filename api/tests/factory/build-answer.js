const faker = require('faker');
const Answer = require('../../lib/domain/models/Answer');
const AnswerStatus = require('../../lib/domain/models/AnswerStatus');

module.exports = function BuildAnswer({
  id = faker.random.uuid(),
  challengeId = faker.random.uuid(),
  result = AnswerStatus.OK,
} = {}) {
  return new Answer({ id, result, challengeId });
};
