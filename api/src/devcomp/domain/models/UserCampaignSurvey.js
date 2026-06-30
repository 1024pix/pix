import { DomainError } from '../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

const SATISFACTION_SCORE_MIN = 1;
const SATISFACTION_SCORE_MAX = 5;

export class UserCampaignSurvey {
  constructor({ userId, campaignId, satisfactionScore }) {
    assertNotNullOrUndefined(userId, 'The userId is required for a UserCampaignSurvey');
    assertNotNullOrUndefined(campaignId, 'The campaignId is required for a UserCampaignSurvey');
    assertNotNullOrUndefined(satisfactionScore, 'The satisfactionScore is required for a UserCampaignSurvey');

    this.#assertSatisfactionScoreIsValid(satisfactionScore);

    this.userId = userId;
    this.campaignId = campaignId;
    this.satisfactionScore = satisfactionScore;
  }

  #assertSatisfactionScoreIsValid(satisfactionScore) {
    if (
      !Number.isInteger(satisfactionScore) ||
      satisfactionScore < SATISFACTION_SCORE_MIN ||
      satisfactionScore > SATISFACTION_SCORE_MAX
    ) {
      throw new DomainError(
        `The satisfactionScore must be an integer between ${SATISFACTION_SCORE_MIN} and ${SATISFACTION_SCORE_MAX}`,
      );
    }
  }
}
