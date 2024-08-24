import _ from 'lodash';

import {
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY,
  PIX_COUNT_BY_LEVEL,
} from '../../../../shared/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { UserCertificability } from './UserCertificability.js';

export const LABEL_FOR_CORE = 'CORE';

export class UserCertificabilityCalculator {
  #certificability;
  #certificabilityV2;
  #hasCoreBeenCalculated;
  #haveComplementariesBeenCalculated;

  constructor({
    id,
    userId,
    certificability,
    certificabilityV2,
    latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.#certificability = certificability;
    this.#certificabilityV2 = certificabilityV2;
    this.latestKnowledgeElementCreatedAt = latestKnowledgeElementCreatedAt;
    this.latestCertificationDeliveredAt = latestCertificationDeliveredAt;
    this.latestBadgeAcquisitionUpdatedAt = latestBadgeAcquisitionUpdatedAt;
    this.latestComplementaryCertificationBadgeDetachedAt = latestComplementaryCertificationBadgeDetachedAt;
    this.#hasCoreBeenCalculated = false;
    this.#haveComplementariesBeenCalculated = false;
  }

  get draftCertificability() {
    return this.#certificability;
  }

  get draftCertificabilityV2() {
    return this.#certificabilityV2;
  }

  get isCalculating() {
    return !this.#hasCoreBeenCalculated || !this.#haveComplementariesBeenCalculated;
  }

  static buildEmpty({ userId }) {
    return new UserCertificabilityCalculator({
      id: null,
      userId,
      certificability: [],
      certificabilityV2: [],
      latestKnowledgeElementCreatedAt: null,
      latestCertificationDeliveredAt: null,
      latestBadgeAcquisitionUpdatedAt: null,
      latestComplementaryCertificationBadgeDetachedAt: null,
    });
  }

  isUpToDate({
    realLatestKnowledgeElementCreatedAt,
    realLatestCertificationDeliveredAt,
    realLatestBadgeAcquisitionUpdatedAt,
    realLatestComplementaryCertificationBadgeDetachedAt,
  }) {
    const isUpToDate = Boolean(
      this.latestKnowledgeElementCreatedAt?.getTime() === realLatestKnowledgeElementCreatedAt?.getTime() &&
        this.latestCertificationDeliveredAt?.getTime() === realLatestCertificationDeliveredAt?.getTime() &&
        this.latestBadgeAcquisitionUpdatedAt?.getTime() === realLatestBadgeAcquisitionUpdatedAt?.getTime() &&
        this.latestComplementaryCertificationBadgeDetachedAt?.getTime() ===
          realLatestComplementaryCertificationBadgeDetachedAt?.getTime(),
    );
    if (isUpToDate) {
      this.#hasCoreBeenCalculated = true;
      this.#haveComplementariesBeenCalculated = true;
    }
    return isUpToDate;
  }

  reset({
    newLatestKnowledgeElementCreatedAt,
    newLatestCertificationDeliveredAt,
    newLatestBadgeAcquisitionUpdatedAt,
    newLatestComplementaryCertificationBadgeDetachedAt,
  }) {
    this.latestKnowledgeElementCreatedAt = newLatestKnowledgeElementCreatedAt;
    this.latestCertificationDeliveredAt = newLatestCertificationDeliveredAt;
    this.latestBadgeAcquisitionUpdatedAt = newLatestBadgeAcquisitionUpdatedAt;
    this.latestComplementaryCertificationBadgeDetachedAt = newLatestComplementaryCertificationBadgeDetachedAt;
    this.#certificability = [];
    this.#certificabilityV2 = [];
    this.#hasCoreBeenCalculated = false;
    this.#haveComplementariesBeenCalculated = false;
  }

  computeCoreCertificability({ allKnowledgeElements, coreCompetences }) {
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

    if (countAtLeastLevelOneCompetences >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY) {
      this.#certificability.push(buildCoreCertificabilityData());
      this.#certificabilityV2.push(buildCoreCertificabilityData());
    }
  }

  computeComplementaryCertificabilities({
    certifiableBadgeAcquisitions,
    minimumEarnedPixValuesByComplementaryCertificationBadgeId,
    highestPixScoreObtainedInCoreCertification,
  }) {
    this.#haveComplementariesBeenCalculated = true;
    for (const certifiableBadgeAcquisition of certifiableBadgeAcquisitions) {
      this.#computeComplementaryCertificability({
        certifiableBadgeAcquisition,
        minimumEarnedPixValuesByComplementaryCertificationBadgeId,
        highestPixScoreObtainedInCoreCertification,
      });
    }
  }

  buildUserCertificability() {
    if (this.isCalculating) return null;
    return new UserCertificability({
      userId: this.userId,
      certificability: this.#certificability,
      certificabilityV2: this.#certificabilityV2,
    });
  }

  #computeComplementaryCertificability({
    certifiableBadgeAcquisition,
    minimumEarnedPixValuesByComplementaryCertificationBadgeId,
    highestPixScoreObtainedInCoreCertification,
  }) {
    this.#_computeComplementaryCertificabilityV2({ certifiableBadgeAcquisition });
    this.#_computeComplementaryCertificability({
      certifiableBadgeAcquisition,
      minimumEarnedPixValuesByComplementaryCertificationBadgeId,
      highestPixScoreObtainedInCoreCertification,
    });
  }

  #_computeComplementaryCertificabilityV2({ certifiableBadgeAcquisition }) {
    if (certifiableBadgeAcquisition.outdated) {
      return;
    }
    const isCoreCertifiable = this.#certificabilityV2.some(
      (certificabilityData) => certificabilityData.certification === LABEL_FOR_CORE,
    );
    if (isCoreCertifiable) {
      this.#certificabilityV2.push(buildComplementaryCertificabilityData(certifiableBadgeAcquisition));
    }
  }

  #_computeComplementaryCertificability({
    certifiableBadgeAcquisition,
    minimumEarnedPixValuesByComplementaryCertificationBadgeId,
    highestPixScoreObtainedInCoreCertification,
  }) {
    if (certifiableBadgeAcquisition.outdated) {
      return;
    }
    if (certifiableBadgeAcquisition.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA) {
      const isCoreCertifiable = this.#certificability.some(
        (certificabilityData) => certificabilityData.certification === LABEL_FOR_CORE,
      );
      if (isCoreCertifiable) {
        this.#certificability.push(buildComplementaryCertificabilityData(certifiableBadgeAcquisition));
      }
    } else {
      const minimumEarnedPixValueRequiredForComplementaryCertification =
        minimumEarnedPixValuesByComplementaryCertificationBadgeId[
          certifiableBadgeAcquisition.complementaryCertificationBadgeId
        ];
      if (highestPixScoreObtainedInCoreCertification >= minimumEarnedPixValueRequiredForComplementaryCertification)
        this.#certificability.push(buildComplementaryCertificabilityData(certifiableBadgeAcquisition));
    }
  }
}

function buildCoreCertificabilityData() {
  return {
    certification: LABEL_FOR_CORE,
    isCertifiable: true,
  };
}

function buildComplementaryCertificabilityData(certifiableBadgeAcquisition) {
  return {
    certification: certifiableBadgeAcquisition.complementaryCertificationKey,
    isCertifiable: true,
    complementaryCertificationBadgeId: certifiableBadgeAcquisition.complementaryCertificationBadgeId,
    complementaryCertificationId: certifiableBadgeAcquisition.complementaryCertificationId,
    campaignId: certifiableBadgeAcquisition.campaignId,
    badgeKey: certifiableBadgeAcquisition.badgeKey,
  };
}
