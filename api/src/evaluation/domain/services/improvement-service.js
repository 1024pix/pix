import dayjs from 'dayjs';

import { constants } from '../../../shared/constants.js';

function keepKnowledgeElementsRecentOrValidated({ currentUserKnowledgeElements, createdAt, minimumDelayInDays }) {
  const startedDateOfAssessment = createdAt;

  return currentUserKnowledgeElements.filter((knowledgeElement) => {
    const isNotOldEnoughToBeImproved =
      dayjs(startedDateOfAssessment).diff(knowledgeElement.createdAt, 'days', true) < minimumDelayInDays;
    return knowledgeElement.isValidated || isNotOldEnoughToBeImproved;
  });
}

function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isRetrying = false,
  isImproving = false,
  isFromCampaign = false,
}) {
  const isFromCampaignImprovingOrRetrying = isFromCampaign && (isImproving || isRetrying);
  if (isFromCampaignImprovingOrRetrying || isImproving) {
    const minimumDelayInDays = isFromCampaignImprovingOrRetrying
      ? constants.MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING
      : constants.MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING;

    return keepKnowledgeElementsRecentOrValidated({
      currentUserKnowledgeElements: knowledgeElements,
      createdAt,
      minimumDelayInDays,
    });
  }
  return knowledgeElements;
}

export { filterKnowledgeElements };
