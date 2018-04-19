const Correction = require('../../domain/models/Correction');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');

module.exports = {
  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then((challengeDataModel) => {
        return new Correction({
          id: challengeDataModel.id,
          solution: challengeDataModel.solution,
        });
      });
  }
};

