import _ from 'lodash';

import fp from 'lodash/fp.js';

const { pipe } = fp;
import {
  MAX_LEVEL_TO_BE_AN_EASY_TUBE,
  MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL,
  DEFAULT_LEVEL_FOR_FIRST_CHALLENGE,
} from '../../constants.js';

export { getFilteredSkillsForFirstChallenge, getFilteredSkillsForNextChallenge };

function getFilteredSkillsForFirstChallenge({ knowledgeElements, tubes, targetSkills }) {
  return pipe(
    _getPlayableSkill,
    _getUntestedSkills.bind(null, knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, tubes),
    _removeTimedSkillsIfNeeded.bind(null, true),
    _focusOnDefaultLevel.bind(null),
  )(targetSkills);
}

function getFilteredSkillsForNextChallenge({
  knowledgeElements,
  tubes,
  predictedLevel,
  isLastChallengeTimed,
  targetSkills,
}) {
  return pipe(
    _getPlayableSkill,
    _getUntestedSkills.bind(null, knowledgeElements),
    _keepSkillsFromEasyTubes.bind(null, tubes),
    _removeTimedSkillsIfNeeded.bind(null, isLastChallengeTimed),
    _removeTooDifficultSkills.bind(null, predictedLevel),
  )(targetSkills);
}

function _getUntestedSkills(knowledgeElements, skills) {
  console.info(`On élimine les acquis déjà testés`);
  const result = _.filter(skills, _skillNotAlreadyTested(knowledgeElements));
  console.info(`Il reste ${result.length} acquis`);
  console.info(result);
  return result;
}

function _getPlayableSkill(skills) {
  console.info(`On a ${skills.length} acquis`);
  console.info(skills);
  const result = _.filter(skills, (skill) => skill.isPlayable);
  console.info('On élimine les acquis non jouables (qui ne contiennent pas au moins un challenge)');
  console.info(`Il reste ${result.length} acquis`);
  console.info(result);
  return result;
}

function _getPrioritySkills(tubes) {
  return pipe(_getEasyTubes, _getSkillsFromTubes)(tubes);
}

function _keepSkillsFromEasyTubes(tubes, targetSkills) {
  console.info('On garde si possible les acquis de sujets faciles (niveau <= 3)');
  const skillsFromEasyTubes = _getPrioritySkills(tubes);
  const availableSkillsFromEasyTubes = _.intersectionBy(targetSkills, skillsFromEasyTubes, 'id');
  if (!_.isEmpty(availableSkillsFromEasyTubes)) {
    console.info(
      `Des skills de sujets faciles on été trouvés, on retourne ${availableSkillsFromEasyTubes.length} acquis`,
    );
    console.info(availableSkillsFromEasyTubes);
    return availableSkillsFromEasyTubes;
  }
  console.info('Aucun sujet facile trouvé, on retourne tous les acquis');
  return targetSkills;
}

function _getEasyTubes(tubes) {
  return _.filter(tubes, (tube) => tube.getHardestSkill().difficulty <= MAX_LEVEL_TO_BE_AN_EASY_TUBE);
}

function _getSkillsFromTubes(tubes) {
  return _.flatMap(tubes, (tube) => tube.skills);
}

function _skillNotAlreadyTested(knowledgeElements) {
  return (skill) => {
    const alreadyTestedSkillIds = _.map(knowledgeElements, 'skillId');
    return !alreadyTestedSkillIds.includes(skill.id);
  };
}

function _removeTimedSkillsIfNeeded(isLastChallengeTimed, targetSkills) {
  if (isLastChallengeTimed) {
    console.info('On supprime les acquis dont le prochain challenge est timé');
    const skillsWithoutTimedChallenges = _.filter(targetSkills, (skill) => !skill.timed);
    const result = skillsWithoutTimedChallenges.length > 0 ? skillsWithoutTimedChallenges : targetSkills;
    console.info(`Il reste ${result.length} acquis`);
    console.info(result);
    return result;
  }
  return targetSkills;
}

function _focusOnDefaultLevel(targetSkills) {
  console.info('On se concentre sur les acquis de plus petit niveau');

  if (_.isEmpty(targetSkills)) {
    return targetSkills;
  }

  const remapDifficulty = (difficulty) =>
    difficulty == DEFAULT_LEVEL_FOR_FIRST_CHALLENGE ? Number.MIN_VALUE : difficulty;
  const [, potentialFirstSkills] = _(targetSkills)
    .groupBy('difficulty')
    .entries()
    .minBy(([difficulty, _targetSkills]) => remapDifficulty(parseFloat(difficulty)));

  console.info(`Il reste ${potentialFirstSkills.length} acquis`);

  console.info(potentialFirstSkills.map((skill) => ({ name: skill.name, difficulty: skill.difficulty })));
  return potentialFirstSkills;
}

function _removeTooDifficultSkills(predictedLevel, targetSkills) {
  console.info(`On supprime les acquis trop difficiles pour l'utilisateur (différence de niveau > 2)`);

  const result = _.filter(targetSkills, (skill) => !_isSkillTooHard(skill, predictedLevel));

  console.info(`Il reste ${result.length} acquis`);

  console.info(result);

  return result;
}

function _isSkillTooHard(skill, predictedLevel) {
  return skill.difficulty - predictedLevel > MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL;
}
