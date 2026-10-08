import dayjs from 'dayjs';

import { MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING } from '../../../shared/constants.js';

const readAnswers = ({ answeredSkills, targetSkills }) => ({
  skillById: new Map(targetSkills.map((skill) => [skill.id, skill])),
  answeredSkillIds: new Set(answeredSkills.map(({ skill }) => skill.id)),
  failedSkills: answeredSkills.filter(({ isOk }) => !isOk).map(({ skill }) => skill),
});

const isKnowledgeElementPresentInAnswers = (knowledgeElement, { skillById, answeredSkillIds, failedSkills }) => {
  if (knowledgeElement.assessmentId) {
    return true;
  }

  const skill = skillById.get(knowledgeElement.skillId);

  if (skill === undefined || answeredSkillIds.has(skill.id)) {
    return true;
  }
  return failedSkills.some(
    (failedSkill) => failedSkill.tubeId === skill.tubeId && skill.difficulty > failedSkill.difficulty,
  );
};

const keepKnowledgeElementsAssessedWhileImproving = ({
  knowledgeElements,
  assessmentCreatedAt,
  minimumDelayInDays,
  answeredSkills,
  targetSkills,
}) => {
  const startedAt = dayjs(assessmentCreatedAt);
  const answers = answeredSkills ? readAnswers({ answeredSkills, targetSkills }) : null;

  const isTooRecentToBeImproved = (knowledgeElement) =>
    startedAt.diff(knowledgeElement.createdAt, 'days', true) < minimumDelayInDays;

  const hasBeenCreatedByCurrentAssessment = (knowledgeElement) =>
    answers === null || isKnowledgeElementPresentInAnswers(knowledgeElement, answers);

  const isStillAssessed = (knowledgeElement) => {
    if (knowledgeElement.isValidated) {
      return true;
    }
    if (startedAt.isBefore(knowledgeElement.createdAt)) {
      return hasBeenCreatedByCurrentAssessment(knowledgeElement);
    }
    return isTooRecentToBeImproved(knowledgeElement);
  };

  return knowledgeElements.filter(isStillAssessed);
};

/**
 * @param {Object} params
 * @param {KnowledgeElement[]} params.knowledgeElements
 * @param {Date} params.createdAt start of the assessment
 * @param {{ skill: Skill, isOk: boolean }[]} [params.answeredSkills] the skills the assessment answered so far,
 * with the result; when given, a failure dated after the start and without assessment id counts as assessed
 * only if it comes from them
 * @param {Skill[]} [params.targetSkills] required with `answeredSkills`
 */
export function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isRetrying = false,
  isImproving = false,
  isFromCampaign = false,
  minimumDelayInDaysBeforeImproving = MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  answeredSkills,
  targetSkills = [],
}) {
  if (isFromCampaign && (isImproving || isRetrying)) {
    return keepKnowledgeElementsAssessedWhileImproving({
      knowledgeElements,
      assessmentCreatedAt: createdAt,
      minimumDelayInDays: 0,
      answeredSkills,
      targetSkills,
    });
  }

  if (isImproving) {
    return keepKnowledgeElementsAssessedWhileImproving({
      knowledgeElements,
      assessmentCreatedAt: createdAt,
      minimumDelayInDays: minimumDelayInDaysBeforeImproving,
      answeredSkills,
      targetSkills,
    });
  }

  return knowledgeElements;
}
