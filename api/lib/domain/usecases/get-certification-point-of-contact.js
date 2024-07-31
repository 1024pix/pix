/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('../../../src/certification/enrolment/domain/models/Center.js').Center} Center
 */
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../src/shared/infrastructure/constants.js';
import { PromiseUtils } from '../../../src/shared/infrastructure/utils/promise-utils.js';

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
  return PromiseUtils.map(authorizedCenterIds, (id) => centerRepository.getById({ id }), {
    concurrency: CONCURRENCY_HEAVY_OPERATIONS,
  });
};
