import { CertificationCourseRejected } from '../../../../../lib/domain/events/CertificationCourseRejected.js';

export const rejectCertificationCourse = async ({ certificationCourseId, juryId, certificationCourseRepository }) => {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);

  certificationCourse.rejectForFraud();

  await certificationCourseRepository.update(certificationCourse);

  return new CertificationCourseRejected({ certificationCourseId, juryId });
};
