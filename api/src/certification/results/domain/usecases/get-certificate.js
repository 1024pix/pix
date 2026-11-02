/**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {CertificateRepository} params.certificateRepository
 */
export async function getCertificate({ certificationCourseId, locale, certificateRepository }) {
  const certificate = await certificateRepository.getCertificate({ certificationCourseId, locale });
  if (!certificate) {
    throw new NotFoundError(`There is no certification course with id "${certificationCourseId}"`);
  }
  return certificate;
}
