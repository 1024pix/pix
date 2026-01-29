import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const save = async function ({
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  acquired,
  source,
}) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('complementary-certification-course-results')
    .insert({ complementaryCertificationBadgeId, acquired, complementaryCertificationCourseId, source })
    .onConflict(['complementaryCertificationCourseId', 'source'])
    .merge();
};

export { save };
