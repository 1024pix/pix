const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');

function _convertSkillDataModelsToHints(skillDataModels) {
  return skillDataModels.map((skillDataModel) => {
    return new Hint({
      skillName: skillDataModel.name,
      value: skillDataModel.hint
    });
  });
}

function _getSkillDataModels(challengeDataModel) {
  const skillDataModelPromises = challengeDataModel.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataModelPromises);
}

function _selectSkillDataModelsWithValidatedHint(skillDataModels) {
  return skillDataModels.filter((skillDataModel) => skillDataModel.hintStatus === 'Validé');
}

module.exports = {

  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then((challengeDataModel) => {

        return _getSkillDataModels(challengeDataModel)
          .then(_selectSkillDataModelsWithValidatedHint)
          .then(_convertSkillDataModelsToHints)
          .then((hints) => {
            return new Correction({
              id: challengeDataModel.id,
              solution: challengeDataModel.solution,
              hints: hints
            });
          });
      });
  }
};

