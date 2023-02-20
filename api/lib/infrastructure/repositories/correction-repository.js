import _ from 'lodash';
import Correction from '../../domain/models/Correction';
import Hint from '../../domain/models/Hint';
import challengeDatasource from '../datasources/learning-content/challenge-datasource';
import skillDatasource from '../datasources/learning-content/skill-datasource';
import tutorialRepository from './tutorial-repository';
const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];
import { getTranslatedKey } from '../../domain/services/get-translated-text';

export default {
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
