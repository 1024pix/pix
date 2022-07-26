const _ = require('lodash');
const bluebird = require('bluebird');
const badgeAcquisitionRepository = require('../../infrastructure/repositories/badge-acquisition-repository');
const badgeRepository = require('../../infrastructure/repositories/badge-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const badgeCriteriaService = require('../../domain/services/badge-criteria-service');
const { PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3 } = require('../../domain/models/Badge').keys;

module.exports = {
  async findStillValidBadgeAcquisitions({ userId, domainTransaction }) {
    const highestCertifiableBadgeAcquisitions = await badgeAcquisitionRepository.findCertifiable({
      userId,
      domainTransaction,
    });

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId, domainTransaction });

    const badgeAcquisitions = await bluebird.mapSeries(
      highestCertifiableBadgeAcquisitions,
      async (badgeAcquisition) => {
        const badge = badgeAcquisition.badge;
        const targetProfile = await targetProfileRepository.get(badge.targetProfileId, domainTransaction);
        const isBadgeValid = badgeCriteriaService.areBadgeCriteriaFulfilled({
          knowledgeElements,
          targetProfile,
          badge,
        });
        return isBadgeValid ? badgeAcquisition : null;
      }
    );

    return _.compact(badgeAcquisitions);
  },

  async hasStillValidCleaBadgeAcquisition({ userId }) {
    let cleaBadgeKey = PIX_EMPLOI_CLEA_V1;
    let hasAcquiredCleaBadgeV2, hasAcquiredCleaBadgeV3;
    const hasAcquiredCleaBadgeV1 = await badgeAcquisitionRepository.hasAcquiredBadge({
      badgeKey: PIX_EMPLOI_CLEA_V1,
      userId,
    });

    if (!hasAcquiredCleaBadgeV1) {
      cleaBadgeKey = PIX_EMPLOI_CLEA_V2;
      hasAcquiredCleaBadgeV2 = await badgeAcquisitionRepository.hasAcquiredBadge({
        badgeKey: PIX_EMPLOI_CLEA_V2,
        userId,
      });
    }

    if (!hasAcquiredCleaBadgeV1 && !hasAcquiredCleaBadgeV2) {
      cleaBadgeKey = PIX_EMPLOI_CLEA_V3;
      hasAcquiredCleaBadgeV3 = await badgeAcquisitionRepository.hasAcquiredBadge({
        badgeKey: PIX_EMPLOI_CLEA_V3,
        userId,
      });
      if (!hasAcquiredCleaBadgeV3) return false;
    }

    const badge = await badgeRepository.getByKey(cleaBadgeKey);
    const targetProfile = await targetProfileRepository.get(badge.targetProfileId);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId });

    return badgeCriteriaService.areBadgeCriteriaFulfilled({
      knowledgeElements,
      targetProfile,
      badge,
    });
  },
};
