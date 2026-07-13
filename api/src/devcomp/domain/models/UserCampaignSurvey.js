import { DomainError } from '../../../shared/domain/errors.js';
import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

const SCORE_MIN = 1;
const SCORE_MAX = 5;

export class UserCampaignSurvey {
  constructor({
    userId,
    campaignId,
    satisfactionScore,
    usefulnessScore,
    personalizationScore,
    attractivenessScore,
    comment,
  }) {
    assertNotNullOrUndefined(userId, 'The userId is required for a UserCampaignSurvey');
    assertNotNullOrUndefined(campaignId, 'The campaignId is required for a UserCampaignSurvey');
    assertNotNullOrUndefined(satisfactionScore, 'The satisfactionScore is required for a UserCampaignSurvey');

    this.#assertScoreIsValid(satisfactionScore, 'satisfactionScore');

    if (Number.isInteger(usefulnessScore)) {
      this.#assertScoreIsValid(usefulnessScore, 'usefulnessScore');
    }

    if (Number.isInteger(personalizationScore)) {
      this.#assertScoreIsValid(personalizationScore, 'personalizationScore');
    }

    if (Number.isInteger(attractivenessScore)) {
      this.#assertScoreIsValid(attractivenessScore, 'attractivenessScore');
    }

    this.userId = userId;
    this.campaignId = campaignId;
    this.satisfactionScore = satisfactionScore;
    this.usefulnessScore = usefulnessScore;
    this.personalizationScore = personalizationScore;
    this.attractivenessScore = attractivenessScore;
    this.comment = comment;
  }

  #assertScoreIsValid(score, fieldName) {
    if (!Number.isInteger(score) || score < SCORE_MIN || score > SCORE_MAX) {
      throw new DomainError(`The ${fieldName} must be an integer between ${SCORE_MIN} and ${SCORE_MAX}`);
    }
  }
}
