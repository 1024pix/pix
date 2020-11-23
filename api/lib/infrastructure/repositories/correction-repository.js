const _ = require('lodash');

const Correction = require('../../domain/models/Correction');
const Hint = require('../../domain/models/Hint');
const challengeDatasource = require('../datasources/learning-content/challenge-datasource');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const tutorialRepository = require('./tutorial-repository');
const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];
const { getTranslatedText } = require('../../domain/services/get-translated-text');

module.exports = {

  async getByChallengeId({ challengeId, userId, locale }) {
    const challenge = await challengeDatasource.get(challengeId);
    const skills = await _getSkills(challenge);
    const hints = await _getHints({ skills, locale });

    const tutorials = await _getTutorials({ userId, skills, tutorialIdsProperty: 'tutorialIds', locale });
    const learningMoreTutorials = await _getTutorials({ userId, skills, tutorialIdsProperty: 'learningMoreTutorialIds', locale });

    return new Correction({
      id: challenge.id,
      solution: challenge.solution,
      hints,
      tutorials,
      learningMoreTutorials: learningMoreTutorials,
    });
  },
};

async function _getHints({ skills, locale }) {
  const skillsWithHints = await _filterSkillsWithValidatedHint(skills);
  return _convertSkillsToHints({ skillsWithHints, locale });
}

function _getSkills(challengeDataObject) {
  const skillDataObjectPromises = challengeDataObject.skillIds.map(skillDatasource.get);
  return Promise.all(skillDataObjectPromises);
}

function _filterSkillsWithValidatedHint(skillDataObjects) {
  return skillDataObjects.filter((skillDataObject) => VALIDATED_HINT_STATUSES.includes(skillDataObject.hintStatus));
}

function _convertSkillsToHints({ skillsWithHints, locale }) {
  return skillsWithHints.map((skillsWithHint) => {
    return new Hint({
      skillName: skillsWithHint.name,
      value: getTranslatedText(locale, { frenchText: skillsWithHint.hintFrFr, englishText: skillsWithHint.hintEnUs }),
    });
  });
}

async function _getTutorials({ userId, skills, tutorialIdsProperty, locale }) {
  const tutorialsIds = _(skills)
    .map((skill) => skill[tutorialIdsProperty])
    .filter((tutorialId) => !_.isEmpty(tutorialId))
    .flatten()
    .uniq()
    .value();
  return tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialsIds, userId, locale });
}

