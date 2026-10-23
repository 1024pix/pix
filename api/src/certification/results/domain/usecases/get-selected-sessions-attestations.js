import { NotFoundError } from '../../../../shared/domain/errors.js';
import isEmpty from '../../../../shared/infrastructure/utils/is-empty.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { getMultipleFilesAsZip } from '../../../../shared/infrastructure/utils/zip/get-multiple-files-as-zip.js';

/**
 * @param {object} params
 * @param {Array<number>} params.sessionIds
 * @param {object} params.i18n
 * @param {CertificationResultRepository} params.certificateRepository
 * @param {SessionForResultsSharingRepository} params.sharedCertificationCourseRepository
 */
export async function getSelectedSessionsAttestationsZip({
  sessionIds,
  i18n,
  certificateRepository,
  sharedCertificationCourseRepository,
}) {
  const pdfFiles = [];
  for (const sessionId of sessionIds) {
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
            locale: i18n.getLocale(),
          });
        } catch (error) {
          if (!(error instanceof NotFoundError)) {
            throw error;
          }
        }
      })
    ).filter(Boolean);

    if (isEmpty(certificates)) {
      throw new NotFoundError('No certificats found');
    }

    pdfFiles.push(certificates);
  }

  const zipContent = await getMultipleFilesAsZip({ files: pdfFiles });

  return {
    filename: `pix-sessions-attesttions-${Date.now()}.zip`,
    content: zipContent,
  };
}
