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

  get coreEligibilityV2() {
    return this.#eligibilitiesV2.find((eligibility) => eligibility.isCore) ?? null;
  }

  get complementaryEligibilitiesV2() {
    return this.#eligibilitiesV2.filter((eligibility) => !eligibility.isCore);
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
  #isV2;

  constructor({ isCertifiable, isV2 }) {
    this.#isCertifiable = isCertifiable;
    this.#isV2 = isV2;
  }

  get isCore() {
    return true;
  }

  get isCertifiable() {
    return this.#isCertifiable;
  }

  toDTO() {
    return {
      certification: this.#certification,
      isCertifiable: this.#isCertifiable,
      isV2: this.#isV2,
    };
  }
}

export class UserComplementaryEligibilityV2 {
  #certification;
  #isCertifiable;
  #isV2 = true;
  #complementaryCertificationBadgeId;
  #complementaryCertificationId;
  #campaignId;
  #badgeKey;
  #why;
  #info;

  constructor({
    certification,
    isCertifiable,
    complementaryCertificationBadgeId,
    complementaryCertificationId,
    campaignId,
    badgeKey,
    why: { isOutdated, isCoreCertifiable },
    info: { hasComplementaryCertificationForThisLevel, versionsBehind },
  }) {
    this.#certification = certification;
    this.#isCertifiable = isCertifiable;
    this.#complementaryCertificationBadgeId = complementaryCertificationBadgeId;
    this.#complementaryCertificationId = complementaryCertificationId;
    this.#campaignId = campaignId;
    this.#badgeKey = badgeKey;
    this.#why = { isOutdated, isCoreCertifiable };
    this.#info = { hasComplementaryCertificationForThisLevel, versionsBehind };
  }

  get complementaryCertificationBadgeId() {
    return this.#complementaryCertificationBadgeId;
  }

  get isOutdated() {
    return this.#why.isOutdated;
  }

  get hasComplementaryCertificationForThisLevel() {
    return this.#info.hasComplementaryCertificationForThisLevel;
  }

  estCertifiable() {
    return this.#isCertifiable;
  }

  estPasCertifiableCarLeBadgeEstPerimé() {
    if (this.#isCertifiable) return false;
    if (!this.#why.isCoreCertifiable) return false;
    return this.#why.isOutdated;
  }

  estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard() {
    if (this.#isCertifiable) return false;
    if (!this.#why.isOutdated) return false;
    if (!this.#why.isCoreCertifiable) return false;
    return this.#info.versionsBehind === 1;
  }

  toDTO() {
    return {
      certification: this.#certification,
      isCertifiable: this.#isCertifiable,
      isV2: this.#isV2,
      complementaryCertificationBadgeId: this.#complementaryCertificationBadgeId,
      complementaryCertificationId: this.#complementaryCertificationId,
      campaignId: this.#campaignId,
      badgeKey: this.#badgeKey,
      why: { isOutdated: this.#why.isOutdated, isCoreCertifiable: this.#why.isCoreCertifiable },
      info: {
        hasComplementaryCertificationForThisLevel: this.#info.hasComplementaryCertificationForThisLevel,
        versionsBehind: this.#info.versionsBehind,
      },
    };
  }
}
