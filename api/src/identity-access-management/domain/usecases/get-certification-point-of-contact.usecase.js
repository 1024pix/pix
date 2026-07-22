/**
 * @typedef {import('../../../certification/enrolment/infrastructure/repositories/center-repository.js')} CenterRepository
 * @typedef {import('../../infrastructure/repositories/certification-point-of-contact.repository.js')} CertificationPointOfContactRepository
 * @typedef {import('../../../certification/enrolment/domain/models/Center.js')} Center
 */
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../shared/constants.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {CenterRepository} params.centerRepository
 * @param {CertificationPointOfContactRepository} params.certificationPointOfContactRepository
 */
const getCertificationPointOfContact = async function ({
  userId,
  centerRepository,
  certificationPointOfContactRepository,
}) {
  const { authorizedCenterIds, certificationPointOfContactDTO } =
    await certificationPointOfContactRepository.getAuthorizedCenterIds(userId);

  const centerList = await _getCenters({ authorizedCenterIds, centerRepository });

  const allowedCertificationCenterAccesses = await certificationPointOfContactRepository.getAllowedCenterAccesses({
    centerList,
  });

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
