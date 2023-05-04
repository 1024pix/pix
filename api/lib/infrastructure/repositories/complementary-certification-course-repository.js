import { knex } from '../../../db/knex-database-connection.js';

const getComplementaryCertificationCourseId = async function ({
  certificationCourseId,
  complementaryCertificationKey,
}) {
  const result = await knex
    .from('complementary-certification-courses')
    .select('complementary-certification-courses.id')
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId'
    )
    .where({ certificationCourseId, key: complementaryCertificationKey })
    .first();

  return result?.id;
};

export { getComplementaryCertificationCourseId };
