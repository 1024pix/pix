import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { PixPlusCertificationCourse } from '../../domain/models/PixPlusCertificationCourse.js';

const getBySessionId = async function (sessionId) {
  const knexConn = DomainTransaction.getConnection();
  const PIX_PLUS_START_DATE = '2025-07-01';

  const certificationCourses = await knexConn('certification-courses').where({ sessionId });

  const certificationCourseIds = certificationCourses.map((course) => course.id);

  const pixPlusCertificationCourses = await knexConn('complementary-certification-courses')
    .select({
      id: 'complementary-certification-courses.id',
      createdAt: 'complementary-certification-courses.createdAt',
    })
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .where('complementary-certification-courses.createdAt', '>=', PIX_PLUS_START_DATE)
    .andWhere('complementary-certifications.key', '!=', ComplementaryCertificationKeys.CLEA)
    .whereIn('certificationCourseId', certificationCourseIds);

  return _toDomain(pixPlusCertificationCourses);
};

const _toDomain = (pixPlusCertificationCourses) => {
  return pixPlusCertificationCourses.map((pixPlusCertificationCourses) => {
    return new PixPlusCertificationCourse(pixPlusCertificationCourses);
  });
};

export { getBySessionId };
