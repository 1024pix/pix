export class DataForQuest {
  #success;
  #eligibility;

  constructor({ eligibility, success = null }) {
    this.#success = success;
    this.#eligibility = eligibility;
  }

  get eligibility() {
    return Object.freeze(this.#eligibility);
  }

  get success() {
    return Object.freeze(this.#success);
  }

  set success(value) {
    this.#success = value;
  }

  /*
   * Eligibility
   */

  get organizationLearner() {
    return this.#eligibility.organizationLearner;
  }

  get organization() {
    return this.#eligibility.organization;
  }

  get campaignParticipations() {
    return this.#eligibility.campaignParticipations;
  }

  get passages() {
    return this.#eligibility.passages;
  }

  buildDataForQuestScopedByCampaignParticipationId({ campaignParticipationId }) {
    const eligibility = this.#eligibility.buildEligibilityScopedByCampaignParticipationId({ campaignParticipationId });
    return new DataForQuest({ eligibility, success: this.#success });
  }

  hasCampaignParticipation(campaignParticipationId) {
    return this.#eligibility.hasCampaignParticipation(campaignParticipationId);
  }

  /*
   * Success
   */

  getMasteryPercentageForSkills(skillIds) {
    return this.#success.getMasteryPercentageForSkills(skillIds);
  }

  getMasteryPercentageForCappedTubes(cappedTubes) {
    return this.#success.getMasteryPercentageForCappedTubes(cappedTubes);
  }
}
