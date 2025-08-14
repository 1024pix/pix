/**
 * @typedef {import('./index.js').CertificationParcoursupRepository} CertificationParcoursupRepository
 * @typedef {import('../read-models/parcoursup/CertificationResult.js').CertificationResult} CertificationResult
 * @typedef {import('../../../../shared/domain/errors.js').NotFoundError} NotFoundError
 */

import * as injectedCertificationParcoursupRepository from '../../infrastructure/repositories/certification-parcoursup-repository.js';
import { MoreThanOneMatchingCertificationError } from '../errors.js';

/**
 * @param {Object} params
 * @param {string} params.ine
 * @param {string} params.organizationUai
 * @param {string} params.lastName
 * @param {string} params.firstName
 * @param {string} params.birthdate - Format YYYY-MM-DD
 * @param {string} params.verificationCode
 * @param {CertificationParcoursupRepository} params.certificationParcoursupRepository
 *
 * @returns {CertificationResult} matching candidate certification result
 * @throws {MoreThanOneMatchingCertificationError} in some cases (INE for example) there might be duplicates
 * @throws {NotFoundError} if no certification exists for this candidate
 **/
export const getCertificationResultForParcoursup = async ({
  ine,
  organizationUai,
  lastName,
  firstName,
  birthdate,
  verificationCode,
  certificationParcoursupRepository = injectedCertificationParcoursupRepository,
} = {}) => {
  let certifications = [];

  if (ine) {
    certifications = await certificationParcoursupRepository.getByINE({ ine });
  } else if (organizationUai) {
    certifications = await certificationParcoursupRepository.getByOrganizationUAI({
      organizationUai,
      lastName,
      firstName,
      birthdate,
    });
  } else if (verificationCode) {
    const upperCasedVerificationCode = verificationCode.toUpperCase();
    certifications = await certificationParcoursupRepository.getByVerificationCode({
      verificationCode: upperCasedVerificationCode,
    });
  }

  if (certifications.length !== 1) {
    throw new MoreThanOneMatchingCertificationError();
  }

  return certifications.shift();
};
