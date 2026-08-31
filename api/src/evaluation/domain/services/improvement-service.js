import dayjs from 'dayjs';

import { MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING } from '../../../shared/constants.js';

function keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements, createdAt, minimumDelayInDays }) {
  const startedDateOfAssessment = createdAt;

  return currentUserKnowledgeElements.filter((knowledgeElement) => {
    const isNotOldEnoughToBeImproved =
      dayjs(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days', true) < minimumDelayInDays;
    return knowledgeElement.isValidated || isNotOldEnoughToBeImproved;
  });
}

const keepKnowledgeElementsValidatedOrAcquiredDuringAssessment = ({ currentUserKnowledgeElements, createdAt }) =>
  currentUserKnowledgeElements.filter(
    (knowledgeElement) => knowledgeElement.isValidated || dayjs(createdAt).isBefore(knowledgeElement.createdAt),
  );

export function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isRetrying = false,
  isImproving = false,
  isFromCampaign = false,
  minimumDelayInDaysBeforeImproving = MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
}) {
  if (isFromCampaign && (isImproving || isRetrying)) {
    return keepKnowledgeElementsValidatedOrAcquiredDuringAssessment({
      currentUserKnowledgeElements: knowledgeElements,
      createdAt,
    });
  }

  if (isImproving) {
    return keepKnowledgeElementsRecentOrValidated({
      currentUserKnowledgeElements: knowledgeElements,
      createdAt,
      minimumDelayInDays: minimumDelayInDaysBeforeImproving,
    });
  }

  return knowledgeElements;
}
