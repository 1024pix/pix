/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('../../../src/certification/enrolment/domain/models/Center.js').Center} Center
 */
import bluebird from 'bluebird';

import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../src/shared/infrastructure/constants.js';

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 */
const getCertificationPointOfContact = async function ({
  userId,
  centerRepository,
  certificationPointOfContactRepository,
}) {
  const { authorizedCenterIds, certificationPointOfContactDTO } =
    await certificationPointOfContactRepository.getAuthorizedCenterIds(userId);

  const centerList = await _getCenters({ authorizedCenterIds, centerRepository });

  const allowedCertificationCenterAccesses =
    await certificationPointOfContactRepository.getAllowedCenterAccesses(centerList);

  return certificationPointOfContactRepository.getPointOfContact({
    userId,
    certificationPointOfContactDTO,
    allowedCertificationCenterAccesses,
  });
};

export { getCertificationPointOfContact };

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 * @returns {Array<Center>}
 */
const _getCenters = async ({ authorizedCenterIds = [], centerRepository }) => {
  return bluebird.map(authorizedCenterIds, (id) => centerRepository.getById({ id }), {
    concurrency: CONCURRENCY_HEAVY_OPERATIONS,
  });
};
