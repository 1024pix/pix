const faker = require('faker');

const UserCompetence = require('../../../../lib/domain/models/UserCompetence');
const buildArea = require('./build-area');
const buildChallenge = require('./build-challenge');
const _ = require('lodash');

module.exports = function buildUserCompetence({
  id = faker.random.uuid(),
  index = `${faker.random.number()}.${faker.random.number()}`,
  name = faker.random.word(),
  area = buildArea(),
  pixScore = 42,
  estimatedLevel = 1,
  challenges = [
    buildChallenge(),
    buildChallenge()
  ]
} = {}) {

  const userCompetence = new UserCompetence({
    id,
    index,
    name,
    area,
    pixScore,
    estimatedLevel,
  });
  _.forEach(challenges, (challenge) => {
    userCompetence.addChallenge(challenge);
  });
  return userCompetence;
};
