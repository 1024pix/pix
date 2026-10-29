import { NotFoundError } from '../../../../shared/domain/errors.js';
import isEmpty from '../../../../shared/infrastructure/utils/is-empty.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import * as sharedCertificationCourseRepository from '../../../shared/infrastructure/repositories/certification-course-repository.js';
import * as certificateRepository from '../../infrastructure/repositories/certificate-repository.js';
import { Certificate } from '../models/v3/Certificate.js';
import { getCertificatesPDF } from './get-certificates-pdf.js';

export async function getCertificatesForSession({
  sessionId,
  isFrenchDomainExtension,
  i18n,
  dependencies = {
    certificateRepository,
    sharedCertificationCourseRepository,
    getCertificatesPDF,
  },
}) {
  const certificationCourses =
    await dependencies.sharedCertificationCourseRepository.findCertificationCoursesBySessionId({
      sessionId,
    });

  if (isEmpty(certificationCourses)) {
    throw new NotFoundError();
  }

  const locale = i18n.getLocale();

  const certificates = (
    await PromiseUtils.mapSeries(certificationCourses, async (certificationCourse) => {
      try {
        return await dependencies.certificateRepository.getCertificate({
          certificationCourseId: certificationCourse.getId(),
          locale,
        });
      } catch (error) {
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
    })
  ).filter(Boolean);

  if (isEmpty(certificates)) {
    throw new NotFoundError('No certificate found');
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
    filename: `session-${sessionId}-pix-certificates.pdf`,
    content: pdf,
  };
}
