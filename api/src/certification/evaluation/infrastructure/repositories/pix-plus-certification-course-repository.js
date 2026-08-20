import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { PixPlusCertificationCourse } from '../../domain/models/PixPlusCertificationCourse.js';

export async function getByCertificationCourseId(certificationCourseId) {
  const knexConn = DomainTransaction.getConnection();
  const PIX_PLUS_START_DATE = '2025-07-01';

  const pixPlusCertificationCourse = await knexConn('complementary-certification-courses')
    .select({
      id: 'complementary-certification-courses.id',
    })
    .join(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .where({ certificationCourseId })
    .andWhere('complementary-certifications.key', '!=', ComplementaryCertificationKeys.CLEA)
    .where('complementary-certification-courses.createdAt', '>=', PIX_PLUS_START_DATE)
    .first();

  if (!pixPlusCertificationCourse) {
    return null;
  }

  return _toDomain(pixPlusCertificationCourse);
}

function _toDomain(pixPlusCertificationCourse) {
  return new PixPlusCertificationCourse(pixPlusCertificationCourse);
}
