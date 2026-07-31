import * as certificationCenterAccessRepository from '../../infrastructure/repositories/certification-center-access.repository.js';
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
  dependencies = { certificationCenterAccessRepository },
}) => {
  const allowedCertificationCenterAccess =
    await dependencies.certificationCenterAccessRepository.getCertificationCenterAccess({
      certificationCenterId,
    });

  return new AllowedCertificationCenterAccessDTO({
    isAccessBlockedCollege: allowedCertificationCenterAccess.isAccessBlockedCollege(),
    isAccessBlockedLycee: allowedCertificationCenterAccess.isAccessBlockedLycee(),
    isAccessBlockedAEFE: allowedCertificationCenterAccess.isAccessBlockedAEFE(),
    isAccessBlockedAgri: allowedCertificationCenterAccess.isAccessBlockedAgri(),
    pixCertifScoBlockedAccessDateCollege: allowedCertificationCenterAccess.pixCertifScoBlockedAccessDateCollege,
    pixCertifScoBlockedAccessDateLycee: allowedCertificationCenterAccess.pixCertifScoBlockedAccessDateLycee,
  });
};
