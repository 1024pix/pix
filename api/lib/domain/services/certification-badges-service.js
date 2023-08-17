import bluebird from 'bluebird';
import _ from 'lodash';

import * as badgeForCalculationRepository from '../../infrastructure/repositories/badge-for-calculation-repository.js';
import * as certifiableBadgeAcquisitionRepository from '../../infrastructure/repositories/certifiable-badge-acquisition-repository.js';
import * as knowledgeElementRepository from '../../infrastructure/repositories/knowledge-element-repository.js';

const findStillValidBadgeAcquisitions = async function ({
  userId,
  domainTransaction,
  limitDate = new Date(),
  dependencies = { certifiableBadgeAcquisitionRepository, knowledgeElementRepository, badgeForCalculationRepository },
}) {
  const highestCertifiableBadgeAcquisitions =
    await dependencies.certifiableBadgeAcquisitionRepository.findHighestCertifiable({
      userId,
      domainTransaction,
      limitDate,
    });

  const knowledgeElements = await dependencies.knowledgeElementRepository.findUniqByUserId({
    userId,
    limitDate,
    domainTransaction,
  });

  const badgeAcquisitions = await bluebird.mapSeries(
    highestCertifiableBadgeAcquisitions,
    async (certifiableBadgeAcquisition) => {
      const badgeForCalculation = await dependencies.badgeForCalculationRepository.getByCertifiableBadgeAcquisition({
        certifiableBadgeAcquisition,
      });
      if (!badgeForCalculation) return null;
      const isBadgeValid = badgeForCalculation.shouldBeObtained(knowledgeElements);
      return isBadgeValid ? certifiableBadgeAcquisition : null;
    },
  );

  return _.compact(badgeAcquisitions);
};

export { findStillValidBadgeAcquisitions };
