/**
 * @typedef {import('../../domain/usecases/index.js').CertificationRepository} CertificationRepository
 * @typedef {import('../read-models/CertificationResult.js').CertificationResult} CertificationResult
 * @typedef {import('../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */

import { MoreThanOneMatchingCertificationError } from '../errors.js';

/**
 * @param {Object} params
 * @param {string} params.ine
 * @param {string} params.organizationUai
 * @param {string} params.lastName
 * @param {string} params.firstName
 * @param {string} params.birthdate - Format YYYY-MM-DD
 * @param {string} params.verificationCode
 * @param {CertificationRepository} params.certificationRepository
 *
 * @returns {CertificationResult} matching candidate certification result
 * @throws {MoreThanOneMatchingCertificationError} in some cases (INE for example) there might be duplicates
 * @throws {NotFoundError} if no certification exists for this candidate
 **/
export const getCertificationResult = async ({
  ine,
  organizationUai,
  lastName,
  firstName,
  birthdate,
  verificationCode,
  certificationRepository,
}) => {
  let certifications = [];

  if (ine) {
    certifications = await certificationRepository.getByINE({ ine });
  } else if (organizationUai) {
    certifications = await certificationRepository.getByOrganizationUAI({
      organizationUai,
      lastName,
      firstName,
      birthdate,
    });
  } else if (verificationCode) {
    certifications = await certificationRepository.getByVerificationCode({ verificationCode });
  }

  if (certifications.length !== 1) {
    throw new MoreThanOneMatchingCertificationError();
  }

  return certifications.shift();
};
