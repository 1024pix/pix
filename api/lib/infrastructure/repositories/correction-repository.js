const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');

function _convertSkillDataObjectsToHints(skillDataObjects) {
  return skillDataObjects.map((skillDataObject) => {
    return new Hint({
      skillName: skillDataObject.name,
      value: skillDataObject.hint
    });
  });
}

function _getSkillDataObjects(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function _selectSkillDataObjectsWithValidatedHint(skillDataObjects) {
  return skillDataObjects.filter((skillDataObject) => skillDataObject.hintStatus === 'Validé');
}

module.exports = {

  getByChallengeId(challengeId) {
    return challengeDatasource.get(challengeId)
      .then((challengeDataObject) => {

        return _getSkillDataObjects(challengeDataObject)
          .then(_selectSkillDataObjectsWithValidatedHint)
          .then(_convertSkillDataObjectsToHints)
          .then((hints) => {
            return new Correction({
              id: challengeDataObject.id,
              solution: challengeDataObject.solution,
              hints: hints
            });
          });
      });
  }
};

