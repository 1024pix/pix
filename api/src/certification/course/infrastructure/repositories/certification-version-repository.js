import { knex } from '../../../../../db/knex-database-connection.js';

const getByCertificationCourseId = async function ({ certificationCourseId }) {
  const { version } = await knex
    .select('version')
    .from('certification-courses')
    .where({ id: certificationCourseId })
    .first();

  return version;
};

export { getByCertificationCourseId };
