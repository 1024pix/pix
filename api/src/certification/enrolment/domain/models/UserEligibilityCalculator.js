import _ from 'lodash';

import {
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY,
  PIX_COUNT_BY_LEVEL,
} from '../../../../shared/domain/constants.js';
import { UserComplementaryEligibilityV2, UserCoreEligibility, UserEligibilityList } from './UserEligibilityList.js';

export const LABEL_FOR_CORE = 'CORE';

export class UserEligibilityCalculator {
  #eligibilities;
  #eligibilitiesV2;
  #hasCoreBeenCalculated;
  #haveComplementariesBeenCalculated;

  constructor({ userId, date, eligibilities, eligibilitiesV2 }) {
    this.userId = userId;
    this.date = date;
    this.#eligibilities = eligibilities ?? [];
    this.#eligibilitiesV2 = eligibilitiesV2 ?? [];
    this.#hasCoreBeenCalculated = false;
    this.#haveComplementariesBeenCalculated = false;
  }

  computeCoreEligibility({ allKnowledgeElements, coreCompetences }) {
    this.#hasCoreBeenCalculated = true;
    const knowledgeElementsGroupedByCompetence = _.groupBy(allKnowledgeElements, 'competenceId');
    let countAtLeastLevelOneCompetences = 0;
    for (const competence of coreCompetences) {
      const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetence[competence.id];
      const totalEarnedPix = _.sumBy(knowledgeElementsForCompetence, 'earnedPix');
      const level = Math.floor(totalEarnedPix / PIX_COUNT_BY_LEVEL);
      if (level >= MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY) {
        ++countAtLeastLevelOneCompetences;
      }
      if (countAtLeastLevelOneCompetences >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY) {
        break;
      }
    }

    const isCertifiable = countAtLeastLevelOneCompetences >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
    this.#eligibilities.push(buildCoreEligibility({ isCertifiable, isV2: false }));
    this.#eligibilitiesV2.push(buildCoreEligibility({ isCertifiable, isV2: true }));
  }

  computeComplementaryEligibilities({
    certifiableBadgeAcquisitions,
    complementaryCertificationCourseWithResults,
    howManyVersionsBehindByComplementaryCertificationBadgeId,
  }) {
    this.#haveComplementariesBeenCalculated = true;
    for (const certifiableBadgeAcquisition of certifiableBadgeAcquisitions) {
      this.#computeComplementaryEligibility({
        certifiableBadgeAcquisition,
        complementaryCertificationCourseWithResults,
        howManyVersionsBehindByComplementaryCertificationBadgeId,
      });
    }
  }

  #computeComplementaryEligibility({
    certifiableBadgeAcquisition,
    complementaryCertificationCourseWithResults,
    howManyVersionsBehindByComplementaryCertificationBadgeId,
  }) {
    const hasComplementaryCertificationForThisLevel = complementaryCertificationCourseWithResults.some(
      (complementaryCertificationCourseWithResult) =>
        complementaryCertificationCourseWithResult.complementaryCertificationBadgeId ===
          certifiableBadgeAcquisition.complementaryCertificationBadgeId &&
        complementaryCertificationCourseWithResult.isAcquiredExpectedLevelByPixSource(),
    );
    const versionsBehind =
      howManyVersionsBehindByComplementaryCertificationBadgeId[
        certifiableBadgeAcquisition.complementaryCertificationBadgeId
      ];
    const info = { hasComplementaryCertificationForThisLevel, versionsBehind };
    this.#_computeComplementaryEligibilityV2({ certifiableBadgeAcquisition, info });
  }

  #_computeComplementaryEligibilityV2({ certifiableBadgeAcquisition, info }) {
    const isOutdated = certifiableBadgeAcquisition.isOutdated;
    const isCoreCertifiable = this.#eligibilitiesV2.some(
      (eligibility) => eligibility.isCore && eligibility.isCertifiable,
    );
    const isCertifiable = !isOutdated && isCoreCertifiable;
    this.#eligibilitiesV2.push(
      buildComplementaryEligibilityV2({
        certifiableBadgeAcquisition,
        isCertifiable,
        why: { isOutdated, isCoreCertifiable },
        info,
      }),
    );
  }

  buildUserEligibilityList() {
    if (!this.#hasCoreBeenCalculated || !this.#haveComplementariesBeenCalculated)
      throw new Error('Cannot produce final UserEligibilityList before computing them.');
    return new UserEligibilityList({
      userId: this.userId,
      date: this.date,
      eligibilities: this.#eligibilities,
      eligibilitiesV2: this.#eligibilitiesV2,
    });
  }

  toDTO() {
    return {
      userId: this.userId,
      date: this.date,
      eligibilities: this.#eligibilities.map((eligibility) => eligibility.toDTO()),
      eligibilitiesV2: this.#eligibilitiesV2.map((eligibilityV2) => eligibilityV2.toDTO()),
    };
  }
}

function buildCoreEligibility({ isCertifiable, isV2 }) {
  return new UserCoreEligibility({ isCertifiable, isV2 });
}

function buildComplementaryEligibilityV2({
  certifiableBadgeAcquisition,
  isCertifiable,
  why: { isOutdated, isCoreCertifiable },
  info: { hasComplementaryCertificationForThisLevel, versionsBehind },
}) {
  return new UserComplementaryEligibilityV2({
    certification: certifiableBadgeAcquisition.complementaryCertificationKey,
    isCertifiable,
    complementaryCertificationBadgeId: certifiableBadgeAcquisition.complementaryCertificationBadgeId,
    complementaryCertificationId: certifiableBadgeAcquisition.complementaryCertificationId,
    campaignId: certifiableBadgeAcquisition.campaignId,
    badgeKey: certifiableBadgeAcquisition.badgeKey,
    why: { isOutdated, isCoreCertifiable },
    info: { hasComplementaryCertificationForThisLevel, versionsBehind },
  });
}
