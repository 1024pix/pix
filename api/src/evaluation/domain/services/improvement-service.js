import dayjs from 'dayjs';

import {
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING,
} from '../../../shared/constants.js';

function keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements, createdAt, minimumDelayInDays }) {
  const startedDateOfAssessment = createdAt;

  return currentUserKnowledgeElements.filter((knowledgeElement) => {
    const isNotOldEnoughToBeImproved =
      dayjs(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days', true) < minimumDelayInDays;
    return knowledgeElement.isValidated || isNotOldEnoughToBeImproved;
  });
}

export function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isRetrying = false,
  isImproving = false,
  isFromCampaign = false,
  minimumDelayInDaysBeforeRetrying = MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING,
  minimumDelayInDaysBeforeImproving = MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
}) {
  const isFromCampaignImprovingOrRetrying = isFromCampaign && (isImproving || isRetrying);

  if (isFromCampaignImprovingOrRetrying || isImproving) {
    const minimumDelayInDays = isFromCampaignImprovingOrRetrying
      ? minimumDelayInDaysBeforeRetrying
      : minimumDelayInDaysBeforeImproving;

    return keepKnowledgeElementsRecentOrValidated({
      currentUserKnowledgeElements: knowledgeElements,
      createdAt,
      minimumDelayInDays,
    });
  }
  return knowledgeElements;
}
