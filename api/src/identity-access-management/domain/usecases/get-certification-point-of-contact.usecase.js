/**
 * @typedef {import('../../../certification/enrolment/infrastructure/repositories/center-repository.js').CenterRepository} CenterRepository
 * @typedef {import('../../infrastructure/repositories/certification-point-of-contact-repository.js').CertificationPointOfContactRepository} CertificationPointOfContactRepository
 * @typedef {import('../../../certification/enrolment/domain/models/Center.js').Center} Center
 */
import * as injectedCenterRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import { CONCURRENCY_HEAVY_OPERATIONS } from '../../../shared/infrastructure/constants.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import * as injectedCertificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact.repository.js';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {CenterRepository} params.centerRepository
 * @param {CertificationPointOfContactRepository} params.certificationPointOfContactRepository
 */
const getCertificationPointOfContact = async function ({
  userId,
  centerRepository = injectedCenterRepository,
  certificationPointOfContactRepository = injectedCertificationPointOfContactRepository,
} = {}) {
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
