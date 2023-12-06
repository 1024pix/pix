import { CertificationCourseUnrejected } from '../../../../../lib/domain/events/CertificationCourseUnrejected.js';

export const unrejectCertificationCourse = async ({ certificationCourseId, juryId, certificationCourseRepository }) => {
  const certificationCourse = await certificationCourseRepository.get(certificationCourseId);

  certificationCourse.unrejectForFraud();

  await certificationCourseRepository.update(certificationCourse);

  return new CertificationCourseUnrejected({ certificationCourseId, juryId });
};
