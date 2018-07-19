const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const solutionAdapter = require('../adapters/solution-adapter');
const _ = require('../../../lib/infrastructure/utils/lodash-utils');

module.exports = {

  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then(solutionAdapter.fromChallengeAirtableDataObject);
  },
};
