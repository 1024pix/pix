import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

const getByCertificationCourseId = async function ({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const { version } = await knexConn
    .select('version')
    .from('certification-courses')
    .where({ id: certificationCourseId })
    .first();

  return version;
};

export { getByCertificationCourseId };
