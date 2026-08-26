/**
 * @typedef {import ('../models/CertifiableBadgeAcquisition.js').CertifiableBadgeAcquisition} CertifiableBadgeAcquisition
 */
import * as certifiableBadgeAcquisitionRepository from '../../../../../src/certification/shared/infrastructure/repositories/certifiable-badge-acquisition-repository.js';
import * as badgeForCalculationRepository from '../../../../shared/infrastructure/repositories/badge-for-calculation-repository.js';
import * as knowledgeStateRepository from '../../../../shared/infrastructure/repositories/knowledge-state-repository.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';

/**
 * @returns {Promise<Array<CertifiableBadgeAcquisition>>}
 */
const findStillValidBadgeAcquisitions = async function ({
  userId,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeStateRepository, badgeForCalculationRepository },
}) {
  return _findBadgeAcquisitions({ userId, limitDate, shouldGetOutdated: false, dependencies });
};

const findLatestBadgeAcquisitions = async function ({
  userId,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeStateRepository, badgeForCalculationRepository },
}) {
  return _findBadgeAcquisitions({ userId, limitDate, shouldGetOutdated: true, dependencies });
};

/**
 * @param {object} params
 * @param {object} params.dependencies
 * @param {certifiableBadgeAcquisitionRepository} params.dependencies.certifiableBadgeAcquisitionRepository
 * @param {knowledgeStateRepository} params.dependencies.knowledgeStateRepository
 * @param {badgeForCalculationRepository} params.dependencies.badgeForCalculationRepository
 *
 * @returns {Array<CertifiableBadgeAcquisition>} acquired complementary certification badges by a user
 */
const _findBadgeAcquisitions = async function ({
  userId,
  limitDate = new Date(),
  shouldGetOutdated = false,
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeStateRepository, badgeForCalculationRepository },
}) {
  const highestCertifiableBadgeAcquisitions =
    await dependencies.certifiableBadgeAcquisitionRepository.findHighestCertifiable({
      userId,
      limitDate,
    });

  const knowledgeState = await dependencies.knowledgeStateRepository.findByUserId({
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
      const isBadgeValid = badgeForCalculation.shouldBeObtained(knowledgeState);
      return isBadgeValid ? certifiableBadgeAcquisition : null;
    },
  );

  return badgeAcquisitions.filter(Boolean);
};

export { findLatestBadgeAcquisitions, findStillValidBadgeAcquisitions };
