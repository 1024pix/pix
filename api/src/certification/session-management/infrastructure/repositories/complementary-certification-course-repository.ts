import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

type ComplementaryCertificationCourseRow = {
  id: number;
  certificationCourseId: number;
};

export async function getCertificationCourseId({
  complementaryCertificationCourseId,
}: {
  complementaryCertificationCourseId: number;
}): Promise<number> {
  const knexConn = DomainTransaction.getConnection();

  const complementaryCertificationCourse = await knexConn<ComplementaryCertificationCourseRow>(
    'complementary-certification-courses',
  )
    .select('certificationCourseId')
    .where({ id: complementaryCertificationCourseId })
    .first();

  return complementaryCertificationCourse!.certificationCourseId;
}
