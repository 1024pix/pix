import * as certificationPointOfContactRepository from '../../infrastructure/repositories/certification-point-of-contact.repository.js';
import { AllowedCertificationCenterAccessDTO } from './models/AllowedCertificationCenterAccessDTO.js';

/**
 * @module CertificationCenterAccessApi
 */

/**
 * @function
 * @name getCertificationCenterAccess
 *
 * @param {Object} params
 * @param {Number} params.certificationCenterId - The certification center ID to retrieve access information for
 * @returns {Promise<AllowedCertificationCenterAccessDTO>} - Certification center access information
 */
export const getCertificationCenterAccess = async ({
  certificationCenterId,
  dependencies = { certificationPointOfContactRepository },
}) => {
  await dependencies.certificationPointOfContactRepository.getCertificationCenterAccess({
    certificationCenterId,
  });

  return new AllowedCertificationCenterAccessDTO();
};
