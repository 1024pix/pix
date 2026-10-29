/**
 * @typedef {import ('../../domain/usecases/index.js').CertificateRepository} CertificateRepository
 * @typedef {import('i18n').I18n} I18n
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Certificate } from '../models/v3/Certificate.js';
import { getCertificatesPDF } from '../services/get-certificates-pdf.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {I18n} params.i18n
 * @param {boolean} params.isFrenchDomainExtension
 * @param {CertificateRepository} params.certificateRepository
 */
export async function getCertificatePDF({
  certificationCourseId,
  i18n,
  isFrenchDomainExtension,
  certificateRepository,
  dependencies = {
    getCertificatesPDF,
  },
}) {
  const certificate = await certificateRepository.getCertificate({ certificationCourseId, locale: i18n.getLocale() });
  if (!certificate) {
    throw new NotFoundError(`There is no certificate for certification course "${certificationCourseId}"`);
  }

  const deliveredAtFormatted = new Date(certificate.deliveredAt).toLocaleDateString('en-CA');

  const algorithmEngineVersion =
    certificate instanceof Certificate ? AlgorithmEngineVersion.V3 : AlgorithmEngineVersion.V2;
  const pdf = await dependencies.getCertificatesPDF({
    certificates: [certificate],
    algorithmEngineVersion,
    i18n,
    isFrenchDomainExtension,
  });

  return {
    filename: `certification-pix-${deliveredAtFormatted}.pdf`,
    content: pdf,
  };
}
