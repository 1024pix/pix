const challengeDatasource = require('../datasources/learning-content/challenge-datasource');
const solutionAdapter = require('../adapters/solution-adapter');

module.exports = {

  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then(solutionAdapter.fromChallengeAirtableDataObject);
  },
};
