import {
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING,
} from '../../../shared/constants.js';

/**
 * L'état vu par un parcours d'amélioration ou une nouvelle tentative : les
 * échecs assez anciens sont oubliés pour que les acquis redeviennent posables,
 * les validations restent acquises.
 *
 * @param {KnowledgeState} knowledgeState
 * @param {Date} createdAt date de début du parcours
 * @returns {KnowledgeState}
 */
export function improveKnowledgeState({
  knowledgeState,
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

    return knowledgeState.withoutStaleFailures({ since: createdAt, minimumDelayInDays });
  }
  return knowledgeState;
}
