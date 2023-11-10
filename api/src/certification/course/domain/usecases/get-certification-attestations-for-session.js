import { NotFoundError } from '../../../../shared/domain/errors.js';
import isEmpty from 'lodash/isEmpty.js';
import compact from 'lodash/compact.js';
import bluebird from 'bluebird';

const getCertificationAttestationsForSession = async function ({
  sessionId,
  certificateRepository,
  certificationCourseRepository,
}) {
  const certificationCourses = await certificationCourseRepository.findCertificationCoursesBySessionId({ sessionId });

  if (isEmpty(certificationCourses)) {
    throw new NotFoundError();
  }

  const certificationAttestations = compact(
    await bluebird.mapSeries(certificationCourses, async (certificationCourse) => {
      try {
        return await certificateRepository.getCertificationAttestation(certificationCourse.getId());
      } catch (error) {
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
    }),
  );

  if (isEmpty(certificationAttestations)) {
    throw new NotFoundError('No certification attestations found');
  }

  return certificationAttestations;
};

export { getCertificationAttestationsForSession };
