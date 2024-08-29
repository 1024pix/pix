import { LABEL_FOR_CORE } from './UserEligibilityCalculator.js';

export class UserEligibilityList {
  #userId;
  #date;
  #eligibilities;
  #eligibilitiesV2;

  constructor({ userId, date, eligibilities, eligibilitiesV2 }) {
    this.#userId = userId;
    this.#date = date;
    this.#eligibilities = eligibilities;
    this.#eligibilitiesV2 = eligibilitiesV2;
  }

  toDTO() {
    return {
      userId: this.#userId,
      date: this.#date,
      eligibilities: this.#eligibilities.map((eligibility) => eligibility.toDTO()),
      eligibilitiesV2: this.#eligibilitiesV2.map((eligibilityV2) => eligibilityV2.toDTO()),
    };
  }
}

export class UserCoreEligibility {
  #certification = LABEL_FOR_CORE;
  #isCertifiable;

  constructor({ isCertifiable }) {
    this.#isCertifiable = isCertifiable;
  }

  toDTO() {
    return {
      certification: this.#certification,
      isCertifiable: this.#isCertifiable,
    };
  }
}
