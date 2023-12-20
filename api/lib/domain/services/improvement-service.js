import dayjs from 'dayjs';
import { constants } from '../constants.js';

function _keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements, assessment, minimumDelayInDays }) {
  const startedDateOfAssessment = assessment.createdAt;

  return currentUserKnowledgeElements.filter((knowledgeElement) => {
    const isNotOldEnoughToBeImproved =
      dayjs(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days', true) < minimumDelayInDays;
    return knowledgeElement.isValidated || isNotOldEnoughToBeImproved;
  });
}

function filterKnowledgeElementsIfImproving({ knowledgeElements, assessment, isRetrying = false }) {
  const minimumDelayInDays = isRetrying
    ? constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING
    : constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;

  if (assessment.isImproving) {
    return _keepKnowledgeElementsRecentOrValidated({
      currentUserKnowledgeElements: knowledgeElements,
      assessment,
      minimumDelayInDays,
    });
  }
  return knowledgeElements;
}

export { filterKnowledgeElementsIfImproving };
