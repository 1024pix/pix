import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ComplementaryCertificationCourse } from '../../domain/models/ComplementaryCertificationCourse.js';

export const findByCertificationCourseId = async function ({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('complementary-certification-courses')
    .select({
      complementaryCertificationKey: 'complementary-certifications.key',
    })
    .where({ certificationCourseId })
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .first();

  return result ? new ComplementaryCertificationCourse(result) : null;
};
