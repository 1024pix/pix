/**
 * @typedef {import ('../../../../../lib/domain/models/CertifiableBadgeAcquisition.js').CertifiableBadgeAcquisition} CertifiableBadgeAcquisition
 */
import bluebird from 'bluebird';
import _ from 'lodash';

import * as badgeForCalculationRepository from '../../../../../lib/infrastructure/repositories/badge-for-calculation-repository.js';
import * as certifiableBadgeAcquisitionRepository from '../../../../../lib/infrastructure/repositories/certifiable-badge-acquisition-repository.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';

const findStillValidBadgeAcquisitions = async function ({
  userId,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeElementRepository, badgeForCalculationRepository },
}) {
  return _findBadgeAcquisitions({ userId, limitDate, shouldGetOutdated: false, dependencies });
};

const findLatestBadgeAcquisitions = async function ({
  userId,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeElementRepository, badgeForCalculationRepository },
}) {
  return _findBadgeAcquisitions({ userId, limitDate, shouldGetOutdated: true, dependencies });
};

/**
 * @param {Object} params
 * @param {Object} params.dependencies
 * @param {certifiableBadgeAcquisitionRepository} params.dependencies.certifiableBadgeAcquisitionRepository
 * @param {knowledgeElementRepository} params.dependencies.knowledgeElementRepository
 * @param {badgeForCalculationRepository} params.dependencies.badgeForCalculationRepository
 *
 * @returns {Array<CertifiableBadgeAcquisition>} acquired complementary certification badges by a user
 */
const _findBadgeAcquisitions = async function ({
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

  const badgeAcquisitions = await bluebird.mapSeries(
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

  return _.compact(badgeAcquisitions);
};

export { findLatestBadgeAcquisitions, findStillValidBadgeAcquisitions };
