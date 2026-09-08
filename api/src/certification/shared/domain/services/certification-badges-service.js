/**
 * @typedef {import ('../models/CertifiableBadgeAcquisition.js').CertifiableBadgeAcquisition} CertifiableBadgeAcquisition
 */
import * as certifiableBadgeAcquisitionRepository from '../../../../../src/certification/shared/infrastructure/repositories/certifiable-badge-acquisition-repository.js';
import * as badgeForCalculationRepository from '../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';

/**
 * @returns {Promise<Array<CertifiableBadgeAcquisition>>}
 */
export async function findStillValidBadgeAcquisitions({
  userId,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeElementRepository, badgeForCalculationRepository },
}) {
  return _findBadgeAcquisitions({ userId, limitDate, shouldGetOutdated: false, dependencies });
}

export async function findLatestBadgeAcquisitions({
  userId,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeElementRepository, badgeForCalculationRepository },
}) {
  return _findBadgeAcquisitions({ userId, limitDate, shouldGetOutdated: true, dependencies });
}

/**
 * @param {object} params
 * @param {object} params.dependencies
 * @param {certifiableBadgeAcquisitionRepository} params.dependencies.certifiableBadgeAcquisitionRepository
 * @param {knowledgeElementRepository} params.dependencies.knowledgeElementRepository
 * @param {badgeForCalculationRepository} params.dependencies.badgeForCalculationRepository
 *
 * @returns {Array<CertifiableBadgeAcquisition>} acquired complementary certification badges by a user
 */
async function _findBadgeAcquisitions({
  userId,
  limitDate = new Date(),
  shouldGetOutdated = false,
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeElementRepository, badgeForCalculationRepository },
}) {
  const highestCertifiableBadgeAcquisitions =
    await dependencies.certifiableBadgeAcquisitionRepository.findHighestCertifiable({
      userId,
      limitDate,
    });

  const knowledgeElements = await dependencies.knowledgeElementRepository.findUniqByUserId({
    userId,
    limitDate,
  });

  const badgeAcquisitions = await PromiseUtils.mapSeries(
    highestCertifiableBadgeAcquisitions,
    async (certifiableBadgeAcquisition) => {
      if (!shouldGetOutdated && certifiableBadgeAcquisition.isOutdated) {
        return null;
      }

      const badgeForCalculation = await dependencies.badgeForCalculationRepository.getByCertifiableBadgeAcquisition({
        certifiableBadgeAcquisition,
      });
      if (!badgeForCalculation) {
        return null;
      }
      const isBadgeValid = badgeForCalculation.shouldBeObtained(knowledgeElements);
      return isBadgeValid ? certifiableBadgeAcquisition : null;
    },
  );

  return badgeAcquisitions.filter(Boolean);
}
