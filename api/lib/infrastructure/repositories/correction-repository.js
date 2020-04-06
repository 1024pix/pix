const _ = require('lodash');

const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/airtable/challenge-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const tutorialRepository = require('./tutorial-repository');
const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];

module.exports = {

  async getByChallengeId({ challengeId, userId }) {
    const challenge = await challengeDatasource.get(challengeId);
    const skills = await _getSkills(challenge);
    const hints = await _getHints(skills);

    const tutorials = await _getTutorials(userId, skills, 'tutorialIds');
    const learningMoreTutorials = await _getTutorials(userId, skills, 'learningMoreTutorialIds');

    return new Correction({
      id: challenge.id,
      solution: challenge.solution,
      hints,
      tutorials,
      learningMoreTutorials: learningMoreTutorials,
    });
  }
};

async function _getHints(skills) {
  const skillsWithHints = await _filterSkillsWithValidatedHint(skills);
  return _convertSkillsToHints(skillsWithHints);
}

function _getSkills(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function _filterSkillsWithValidatedHint(skillDataObjects) {
  return skillDataObjects.filter((skillDataObject) => VALIDATED_HINT_STATUSES.includes(skillDataObject.hintStatus));
}

function _convertSkillsToHints(skillDataObjects) {
  return skillDataObjects.map((skillDataObject) => {
    return new Hint({
      skillName: skillDataObject.name,
      value: skillDataObject.hint
    });
  });
}

async function _getTutorials(userId, skills, tutorialIdsProperty) {
  const tutorialsIds = _(skills)
    .map((skill) => skill[tutorialIdsProperty])
    .filter((tutorialId) => !_.isEmpty(tutorialId))
    .flatten()
    .uniq()
    .value();
  return tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialsIds, userId });
}

