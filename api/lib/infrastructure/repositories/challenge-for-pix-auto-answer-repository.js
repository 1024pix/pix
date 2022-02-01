const ChallengeForPixAutoAnswer = require('../../domain/read-models/ChallengeForPixAutoAnswer');
const challengeDatasource = require('../datasources/learning-content/challenge-datasource');

module.exports = {
  async get(challengeId) {
    const challenge = await challengeDatasource.get(challengeId);
    return new ChallengeForPixAutoAnswer({
      id: challenge.id,
      solution: challenge.solution,
      type: challenge.type,
      autoReply: challenge.autoReply,
    });
  },
};
