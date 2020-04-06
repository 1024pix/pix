const _ = require('lodash');

const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const tutorialRepository = require('./tutorial-repository');
const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];

module.exports = {

  getByChallengeId({ challengeId, userId }) {
    let challengeDataObject;
    let hintsForChallenge;
    let skillsForChallenge;

    return challengeDatasource.get(challengeId)
      .then((retrievedChallengeDataObject) => {
        challengeDataObject = retrievedChallengeDataObject;
        return retrievedChallengeDataObject;
      })
      .then(_getSkillDataObjects)
      .then((skills) => {
        skillsForChallenge = skills;
        return _filterSkillDataObjectsWithValidatedHint(skillsForChallenge);
      })
      .then(_convertSkillDataObjectsToHints)
      .then((hints) => {
        hintsForChallenge = hints;
        const tutorialsIds = _(skillsForChallenge)
          .map((skill) => skill.tutorialIds)
          .filter((tutorialId) => !_.isEmpty(tutorialId))
          .flatten()
          .uniq()
          .value();

        const learningMoreTutorialIds = _(skillsForChallenge)
          .map((skill) => skill.learningMoreTutorialIds)
          .filter((tutorialId) => !_.isEmpty(tutorialId))
          .flatten()
          .uniq()
          .value();

        return Promise.all([
          tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialsIds, userId }),
          tutorialRepository.findByRecordIdsForCurrentUser({ ids: learningMoreTutorialIds, userId }),
        ]);
      })
      .then(([tutorials, learningMoreTutorials]) => {

        return new Correction({
          id: challengeDataObject.id,
          solution: challengeDataObject.solution,
          hints: hintsForChallenge,
          tutorials: tutorials,
          learningMoreTutorials: learningMoreTutorials,
        });
      });
  }
};

function _getSkillDataObjects(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function _filterSkillDataObjectsWithValidatedHint(skillDataObjects) {
  return skillDataObjects.filter((skillDataObject) => VALIDATED_HINT_STATUSES.includes(skillDataObject.hintStatus));
}

function _convertSkillDataObjectsToHints(skillDataObjects) {
  return skillDataObjects.map((skillDataObject) => {
    return new Hint({
      skillName: skillDataObject.name,
      value: skillDataObject.hint
    });
  });
}

