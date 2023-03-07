const _ = require('lodash');

const Correction = require('../../domain/models/Correction.js');
const Hint = require('../../domain/models/Hint.js');
const { challengeDatasource } = require('../datasources/learning-content/challenge-datasource.js');
const { skillDatasource } = require('../datasources/learning-content/skill-datasource.js');
const tutorialRepository = require('./tutorial-repository.js');
const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];
const { getTranslatedKey } = require('../../domain/services/get-translated-text.js');

module.exports = {
  async getByChallengeId({ challengeId, userId, locale }) {
    const challenge = await challengeDatasource.get(challengeId);
    const skill = await _getSkill(challenge);
    const hint = await _getHint({ skill, locale });

    const tutorials = await _getTutorials({ userId, skill, tutorialIdsProperty: 'tutorialIds', locale });
    const learningMoreTutorials = await _getTutorials({
      userId,
      skill,
      tutorialIdsProperty: 'learningMoreTutorialIds',
      locale,
    });

    return new Correction({
      id: challenge.id,
      solution: challenge.solution,
      solutionToDisplay: challenge.solutionToDisplay,
      hint,
      tutorials,
      learningMoreTutorials: learningMoreTutorials,
    });
  },
};

async function _getHint({ skill, locale }) {
  if (_hasValidatedHint(skill)) {
    return _convertSkillToHint({ skill, locale });
  }
}

function _getSkill(challengeDataObject) {
  return skillDatasource.get(challengeDataObject.skillId);
}

function _hasValidatedHint(skillDataObject) {
  return VALIDATED_HINT_STATUSES.includes(skillDataObject.hintStatus);
}

function _convertSkillToHint({ skill, locale }) {
  return new Hint({
    skillName: skill.name,
    value: getTranslatedKey(skill.hint_i18n, locale),
  });
}

async function _getTutorials({ userId, skill, tutorialIdsProperty, locale }) {
  const tutorialIds = skill[tutorialIdsProperty];
  if (!_.isEmpty(tutorialIds)) {
    const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialIds, userId, locale });
    tutorials.forEach((tutorial) => (tutorial.skillId = skill.id));
    return tutorials;
  }
  return [];
}
