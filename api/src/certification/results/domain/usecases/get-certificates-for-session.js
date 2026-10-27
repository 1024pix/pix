import { NotFoundError } from '../../../../shared/domain/errors.js';
import isEmpty from '../../../../shared/infrastructure/utils/is-empty.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { getCertificatesPDF } from '../services/get-certificates-pdf.js';

export async function getCertificatesForSession({
  sessionId,
  isFrenchDomainExtension,
  i18n,
  certificateRepository,
  sharedCertificationCourseRepository,
  dependencies = {
    getCertificatesPDF,
  },
}) {
  const certificationCourses = await sharedCertificationCourseRepository.findCertificationCoursesBySessionId({
    sessionId,
  });

  if (isEmpty(certificationCourses)) {
    throw new NotFoundError();
  }

  const certificates = (
    await PromiseUtils.mapSeries(certificationCourses, async (certificationCourse) => {
      try {
        return await certificateRepository.getCertificate({
          certificationCourseId: certificationCourse.getId(),
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

  const pdf = await dependencies.getCertificatesPDF({
    certificates,
    i18n,
    isFrenchDomainExtension,
  });

  return {
    filename: `session-${sessionId}-pix-certificates.pdf`,
    content: pdf,
  };
}
