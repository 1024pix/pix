import compact from 'lodash/compact.js';
import isEmpty from 'lodash/isEmpty.js';

import { NotFoundError } from '../../../../shared/domain/errors.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';

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
    await PromiseUtils.mapSeries(certificationCourses, async (certificationCourse) => {
      try {
        return await certificateRepository.getCertificationAttestation({
          certificationCourseId: certificationCourse.getId(),
        });
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
