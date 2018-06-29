const _ = require('lodash');

const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const tutorialDatasource = require('../datasources/airtable/tutorial-datasource');
const validatedStatusOfHint = ['Validé', 'pré-validé'];

function _getSkillDataObjects(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function _getTutorialDataObjects(tutorialIds) {
  const tutorialDataObjectPromise = tutorialIds.map(tutorialDatasource.get);
  return Promise.all(tutorialDataObjectPromise);
}

function _selectSkillDataObjectsWithValidatedHint(skillDataObjects) {
  return skillDataObjects.filter((skillDataObject) => validatedStatusOfHint.includes(skillDataObject.hintStatus));
}

function _convertSkillDataObjectsToHints(skillDataObjects) {
  return skillDataObjects.map((skillDataObject) => {
    return new Hint({
      skillName: skillDataObject.name,
      value: skillDataObject.hint
    });
  });
}

module.exports = {

  getByChallengeId(challengeId) {
    let challengeDataObject;
    let hintsForChallenge;
    let skillsForChallenge;
    let tutorialsIds;

    return challengeDatasource.get(challengeId)
      .then((retrievedChallengeDataObject) => {
        challengeDataObject = retrievedChallengeDataObject;
        return retrievedChallengeDataObject;
      })
      .then(_getSkillDataObjects)
      .then((skills) => {
        skillsForChallenge = skills;
        return _selectSkillDataObjectsWithValidatedHint(skillsForChallenge);
      })
      .then(_convertSkillDataObjectsToHints)
      .then((hints) => {
        hintsForChallenge = hints;
        tutorialsIds = _(skillsForChallenge)
          .map((skill) => skill.tutorialIds)
          .filter((tutorialId) => !_.isEmpty(tutorialId))
          .flatten()
          .value();

        return _getTutorialDataObjects(tutorialsIds);
      })
      .then((tutorials) =>{

        return new Correction({
          id: challengeDataObject.id,
          solution: challengeDataObject.solution,
          hints: hintsForChallenge,
          tutorials: tutorials
        });
      });
  }
};

