import _ from 'lodash';

import { Correction } from '../../domain/models/Correction.js';
import { Hint } from '../../domain/models/Hint.js';
import { challengeDatasource } from '../datasources/learning-content/challenge-datasource.js';
import { skillDatasource } from '../datasources/learning-content/skill-datasource.js';
import { getTranslatedKey } from '../../domain/services/get-translated-text.js';
import { Challenge } from '../../../src/shared/domain/models/Challenge.js';
import { Answer } from '../../../src/evaluation/domain/models/Answer.js';

const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];

const getByChallengeId = async function ({
  challengeId,
  answerValue,
  userId,
  locale,
  tutorialRepository,
  fromDatasourceObject,
  getCorrection,
} = {}) {
  const challenge = await challengeDatasource.get(challengeId);
  const skill = await _getSkill(challenge);
  const hint = await _getHint({ skill, locale });
  const solution = fromDatasourceObject(challenge);
  let correctionDetails;

  const tutorials = await _getTutorials({
    userId,
    skill,
    tutorialIdsProperty: 'tutorialIds',
    locale,
    tutorialRepository,
  });
  const learningMoreTutorials = await _getTutorials({
    userId,
    skill,
    tutorialIdsProperty: 'learningMoreTutorialIds',
    locale,
    tutorialRepository,
  });

  if (challenge.type === Challenge.Type.QROCM_DEP && answerValue !== Answer.FAKE_VALUE_FOR_SKIPPED_QUESTIONS) {
    correctionDetails = getCorrection({ solution, answerValue });
  }

  return new Correction({
    id: challenge.id,
    solution: challenge.solution,
    solutionToDisplay: challenge.solutionToDisplay,
    hint,
    tutorials,
    learningMoreTutorials: learningMoreTutorials,
    answersEvaluation: correctionDetails?.answersEvaluation || [],
    solutionsWithoutGoodAnswers: correctionDetails?.solutionsWithoutGoodAnswers || [],
  });
};
export { getByChallengeId };

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

async function _getTutorials({ userId, skill, tutorialIdsProperty, locale, tutorialRepository }) {
  const tutorialIds = skill[tutorialIdsProperty];
  if (!_.isEmpty(tutorialIds)) {
    const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialIds, userId, locale });
    tutorials.forEach((tutorial) => (tutorial.skillId = skill.id));
    return tutorials;
  }
  return [];
}
