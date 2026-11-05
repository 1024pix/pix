/**
 * @typedef {import('../../../../organizational-entities/application/api/certification-center-access-api.js').CertificationCenterAccessApi} CertificationCenterAccessApi
 */

import * as certificationCenterAccessApi from '../../../../organizational-entities/application/api/certification-center-access-api.js';
import { AllowedCertificationCenterAccess } from '../../domain/read-models/AllowedCertificationCenterAccess.js';

/**
 * @function
 * @name getCertificationCenterAccess
 *
 * @param {object} params
 * @param {Number} params.certificationCenterId
 * @param {CertificationCenterAccessApi} [params.dependencies.certificationCenterAccessApi]
 * @returns {Promise<AllowedCertificationCenterAccess>}
 */
export async function getCertificationCenterAccess({
  certificationCenterId,
  dependencies = { certificationCenterAccessApi },
}) {
  const dto = await dependencies.certificationCenterAccessApi.getCertificationCenterAccess({ certificationCenterId });

  return _toDomain(dto);
}

function _toDomain(dto) {
  return new AllowedCertificationCenterAccess(dto);
}
