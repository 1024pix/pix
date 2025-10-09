/**
 * @typedef {import('./index.js').CertificationCenterAccessApi} CertificationCenterAccessApi
 */

import { AllowedCertificationCenterAccess } from '../../domain/read-models/AllowedCertificationCenterAccess.js';

/**
 * @function
 * @name getCertificationCenterAccess
 *
 * @param {Object} params
 * @param {Number} params.certificationCenterId
 * @param {CertificationCenterAccessApi} [params.certificationCenterAccessApi]
 * @returns {Promise<AllowedCertificationCenterAccess>}
 */
export const getCertificationCenterAccess = async ({ certificationCenterId, certificationCenterAccessApi }) => {
  await certificationCenterAccessApi.getCertificationCenterAccess({ certificationCenterId });

  return new AllowedCertificationCenterAccess();
};
