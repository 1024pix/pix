import { MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING } from '../../../shared/constants.js';

/**
 * L'état vu par un parcours d'amélioration ou une nouvelle tentative : les
 * échecs assez anciens sont oubliés pour que les acquis redeviennent posables,
 * les validations restent acquises.
 *
 * @param {KnowledgeState} knowledgeState
 * @param {Date} createdAt date de début du parcours
 * @returns {KnowledgeState}
 */
const keepKnowledgeElementsValidatedOrAcquiredDuringAssessment = ({ currentUserKnowledgeElements, createdAt }) =>
  currentUserKnowledgeElements.filter(
    (knowledgeElement) => knowledgeElement.isValidated || dayjs(createdAt).isBefore(knowledgeElement.createdAt),
  );

export function improveKnowledgeState({
  knowledgeState,
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

  if (isFromCampaignImprovingOrRetrying || isImproving) {
    const minimumDelayInDays = isFromCampaignImprovingOrRetrying
      ? minimumDelayInDaysBeforeRetrying
      : minimumDelayInDaysBeforeImproving;

    return knowledgeState.withoutStaleFailures({ since: createdAt, minimumDelayInDays });
  }

  return knowledgeState;
}
