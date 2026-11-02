import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import * as sessionRepository from '../../infrastructure/repositories/session-repository.ts';
import { Certificate } from '../models/v3/Certificate.js';
import { getCertificatesPDF } from './get-certificates-pdf.js';

export async function getSessionCertificatesPDF({
  sessionId,
  isFrenchDomainExtension,
  i18n,
  dependencies = {
    certificateRepository,
    sessionRepository,
    getCertificatesPDF,
  },
}) {
  const session = await dependencies.sessionRepository.get(sessionId);

  if (!session) {
    throw new NotFoundError();
  }

  const locale = i18n.getLocale();
  const certificates = [];

  for (const certificationId of session.certificationIds) {
    const certificate = await dependencies.certificateRepository.getCertificate({
      certificationCourseId: certificationId,
      locale,
    });
    if (certificate) {
      certificates.push(certificate);
    }
  }

  if (!certificates.length) {
    throw new NotFoundError('No certificates found');
  }

  const algorithmEngineVersion =
    certificates[0] instanceof Certificate ? AlgorithmEngineVersion.V3 : AlgorithmEngineVersion.V2;

  const pdf = await dependencies.getCertificatesPDF({
    certificates,
    algorithmEngineVersion,
    i18n,
    isFrenchDomainExtension,
  });

  return {
    filename: i18n.__('certification.certificate.session-pdf-file-name', {
      sessionId,
    }),
    content: pdf,
  };
}
